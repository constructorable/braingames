/* =========================================
   Reaktions-Ketten Spiel
   Tippe die Symbole in der Reihenfolge ihres Erscheinens
   ========================================= */

// Schwierigkeitsstufen
const DIFFICULTY = {
    easy: { 
        name: 'Leicht', 
        spawnInterval: 1500,    // Zeit zwischen Spawns
        symbolLifetime: 3000,   // Wie lange Symbol sichtbar
        maxSymbols: 4,          // Max gleichzeitig sichtbar
        shrinkWarning: true     // Schrumpf-Warnung
    },
    medium: { 
        name: 'Mittel', 
        spawnInterval: 1200, 
        symbolLifetime: 2500,
        maxSymbols: 5,
        shrinkWarning: true
    },
    hard: { 
        name: 'Schwer', 
        spawnInterval: 900, 
        symbolLifetime: 2000,
        maxSymbols: 6,
        shrinkWarning: false
    }
};

// Verfügbare Symbole (Font Awesome Icons)
const SYMBOLS = [
    { icon: 'fa-star', color: '#fbbf24' },
    { icon: 'fa-heart', color: '#ef4444' },
    { icon: 'fa-bolt', color: '#3b82f6' },
    { icon: 'fa-moon', color: '#8b5cf6' },
    { icon: 'fa-sun', color: '#f97316' },
    { icon: 'fa-gem', color: '#06b6d4' },
    { icon: 'fa-crown', color: '#eab308' },
    { icon: 'fa-fire', color: '#dc2626' },
    { icon: 'fa-leaf', color: '#22c55e' },
    { icon: 'fa-snowflake', color: '#0ea5e9' },
    { icon: 'fa-music', color: '#ec4899' },
    { icon: 'fa-cloud', color: '#6366f1' }
];

// Spielzustand
let state = {
    difficulty: 'easy',
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    activeSymbols: [],      // { id, icon, color, x, y, order, element, timeout }
    nextOrder: 1,           // Nächste erwartete Reihenfolge
    spawnCounter: 0,        // ID-Zähler
    spawnTimer: null,
    isPlaying: false,
    isPaused: false,
    startTime: null,
    elapsed: 0,
    gameTimer: null
};

/**
 * Initialisiert das Reaktions-Ketten Modul
 */
export function init() {
    renderScreen();
    setupEventListeners();
}

/**
 * Rendert den Spielbildschirm
 */
function renderScreen() {
    const app = document.getElementById('app');
    
    if (document.getElementById('chain-screen')) return;
    
    const screen = document.createElement('section');
    screen.id = 'chain-screen';
    screen.className = 'screen';
    
    screen.innerHTML = `
        <div class="chain-container">
            <!-- Menü -->
            <div id="chain-menu" class="chain-menu">
                <div class="chain-header">
                    <div class="chain-logo">
                        <i class="fas fa-link"></i>
                    </div>
                    <h2>Reaktions-Ketten</h2>
                    <p>Tippe die Symbole in der Reihenfolge ihres Erscheinens!</p>
                </div>
                
                <div class="chain-rules">
                    <div class="rule">
                        <i class="fas fa-hand-pointer"></i>
                        <span>Tippe Symbole in der richtigen Reihenfolge</span>
                    </div>
                    <div class="rule">
                        <i class="fas fa-clock"></i>
                        <span>Symbole verschwinden nach kurzer Zeit</span>
                    </div>
                    <div class="rule">
                        <i class="fas fa-fire-alt"></i>
                        <span>Baue Combos für Extrapunkte</span>
                    </div>
                </div>
                
                <div class="difficulty-buttons">
                    <button class="difficulty-btn" data-difficulty="easy">
                        <i class="fas fa-feather"></i>
                        <span>Leicht</span>
                        <small>Langsam • Mehr Zeit</small>
                    </button>
                    <button class="difficulty-btn" data-difficulty="medium">
                        <i class="fas fa-fire"></i>
                        <span>Mittel</span>
                        <small>Schneller • Weniger Zeit</small>
                    </button>
                    <button class="difficulty-btn" data-difficulty="hard">
                        <i class="fas fa-meteor"></i>
                        <span>Schwer</span>
                        <small>Rasant • Keine Gnade</small>
                    </button>
                </div>
            </div>
            
            <!-- Spielbereich -->
            <div id="chain-game" class="chain-game hidden">
                <div class="chain-stats">
                    <div class="chain-stat">
                        <i class="fas fa-star"></i>
                        <span id="chain-score">0</span>
                    </div>
                    <div class="chain-stat combo">
                        <i class="fas fa-fire-alt"></i>
                        <span id="chain-combo">0x</span>
                    </div>
                    <div class="chain-stat lives">
                        <span id="chain-lives">
                            <i class="fas fa-heart"></i>
                            <i class="fas fa-heart"></i>
                            <i class="fas fa-heart"></i>
                        </span>
                    </div>
                </div>
                
                <div id="chain-arena" class="chain-arena">
                    <!-- Symbole erscheinen hier -->
                    <div class="arena-hint" id="arena-hint">
                        <i class="fas fa-hand-pointer"></i>
                        <span>Tippe das erste Symbol!</span>
                    </div>
                </div>
                
                <div class="chain-order-display">
                    <span>Nächste: </span>
                    <span id="chain-next-order" class="next-order">1</span>
                </div>
            </div>
            
            <!-- Game Over -->
            <div id="chain-gameover" class="chain-gameover hidden">
                <div class="gameover-content">
                    <div class="gameover-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h2>Spiel beendet!</h2>
                    
                    <div class="gameover-stats">
                        <div class="gameover-stat">
                            <span class="stat-value" id="final-score">0</span>
                            <span class="stat-label">Punkte</span>
                        </div>
                        <div class="gameover-stat">
                            <span class="stat-value" id="final-combo">0x</span>
                            <span class="stat-label">Max Combo</span>
                        </div>
                        <div class="gameover-stat">
                            <span class="stat-value" id="final-time">0:00</span>
                            <span class="stat-label">Zeit</span>
                        </div>
                    </div>
                    
                    <div class="gameover-actions">
                        <button id="btn-chain-retry" class="btn-primary">
                            <i class="fas fa-redo"></i>
                            Nochmal
                        </button>
                        <button id="btn-chain-menu" class="btn-secondary">
                            <i class="fas fa-home"></i>
                            Menü
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const loadingOverlay = document.getElementById('loading-overlay');
    app.insertBefore(screen, loadingOverlay);
    
    addStyles();
}

/**
 * Fügt CSS-Styles hinzu
 */
function addStyles() {
    if (document.getElementById('chain-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'chain-styles';
    style.textContent = `
        .chain-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
        
        /* Menü */
        .chain-menu {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xl);
            padding: var(--spacing-lg);
        }
        
        .chain-menu.hidden { display: none; }
        
        .chain-header {
            text-align: center;
        }
        
        .chain-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto var(--spacing-md);
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border-radius: var(--radius-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-lg);
        }
        
        .chain-logo i {
            font-size: var(--font-size-4xl);
            color: white;
        }
        
        .chain-header h2 {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            margin-bottom: var(--spacing-xs);
        }
        
        .chain-header p {
            color: var(--color-text-light);
            font-size: var(--font-size-sm);
        }
        
        .chain-rules {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            padding: var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 320px;
        }
        
        .rule {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: var(--font-size-sm);
            color: var(--color-text-light);
        }
        
        .rule i {
            color: var(--color-primary);
            width: 20px;
            text-align: center;
        }
        
        .difficulty-buttons {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            width: 100%;
            max-width: 320px;
        }
        
        .chain-menu .difficulty-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-lg);
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-lg);
            text-align: left;
            transition: all var(--transition-fast);
        }
        
        .chain-menu .difficulty-btn:active {
            transform: scale(0.98);
            border-color: var(--color-primary);
        }
        
        .chain-menu .difficulty-btn i {
            font-size: var(--font-size-2xl);
            width: 40px;
            text-align: center;
        }
        
        .chain-menu .difficulty-btn[data-difficulty="easy"] i { color: #22c55e; }
        .chain-menu .difficulty-btn[data-difficulty="medium"] i { color: #f59e0b; }
        .chain-menu .difficulty-btn[data-difficulty="hard"] i { color: #ef4444; }
        
        .chain-menu .difficulty-btn span {
            font-size: var(--font-size-lg);
            font-weight: 600;
            display: block;
        }
        
        .chain-menu .difficulty-btn small {
            font-size: var(--font-size-sm);
            color: var(--color-text-light);
            font-weight: 400;
        }
        
        /* Spielbereich */
        .chain-game {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: var(--spacing-sm);
        }
        
        .chain-game.hidden { display: none; }
        
        .chain-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-lg);
            margin-bottom: var(--spacing-sm);
        }
        
        .chain-stat {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--font-size-lg);
            font-weight: 700;
        }
        
        .chain-stat i { color: var(--color-primary); }
        .chain-stat.combo i { color: #f59e0b; }
        .chain-stat.lives i { color: #ef4444; }
        .chain-stat.lives .fa-heart.lost { opacity: 0.2; }
        
        /* Arena */
        .chain-arena {
            flex: 1;
            position: relative;
            background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-card) 100%);
            border-radius: var(--radius-xl);
            border: 2px dashed var(--color-border);
            overflow: hidden;
            min-height: 350px;
        }
        
        .arena-hint {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-sm);
            color: var(--color-text-muted);
            font-size: var(--font-size-sm);
            opacity: 0.7;
            pointer-events: none;
        }
        
        .arena-hint i {
            font-size: var(--font-size-3xl);
            animation: bounce 2s infinite;
        }
        
        .arena-hint.hidden { display: none; }
        
        /* Symbole */
        .chain-symbol {
            position: absolute;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-full);
            cursor: pointer;
            transition: transform 0.15s ease;
            animation: symbolSpawn 0.3s ease-out;
            box-shadow: var(--shadow-lg);
        }
        
        .chain-symbol::before {
            content: attr(data-order);
            position: absolute;
            top: -8px;
            right: -8px;
            width: 24px;
            height: 24px;
            background: var(--color-text);
            color: white;
            border-radius: var(--radius-full);
            font-size: var(--font-size-xs);
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .chain-symbol i {
            font-size: 1.8rem;
            color: white;
        }
        
        .chain-symbol:active {
            transform: scale(0.9);
        }
        
        .chain-symbol.correct {
            animation: symbolCorrect 0.4s ease-out forwards;
        }
        
        .chain-symbol.wrong {
            animation: symbolWrong 0.5s ease-out forwards;
        }
        
        .chain-symbol.expired {
            animation: symbolExpire 0.3s ease-out forwards;
        }
        
        .chain-symbol.shrinking {
            animation: symbolShrink 1s linear forwards;
        }
        
        @keyframes symbolSpawn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes symbolCorrect {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.8; }
            100% { transform: scale(0); opacity: 0; }
        }
        
        @keyframes symbolWrong {
            0%, 20%, 40%, 60%, 80% { transform: translateX(-5px); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(5px); }
            100% { transform: translateX(0); opacity: 0.5; }
        }
        
        @keyframes symbolExpire {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
        }
        
        @keyframes symbolShrink {
            0% { transform: scale(1); }
            100% { transform: scale(0.5); }
        }
        
        /* Nächste Anzeige */
        .chain-order-display {
            text-align: center;
            padding: var(--spacing-md);
            font-size: var(--font-size-base);
            color: var(--color-text-light);
        }
        
        .next-order {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: var(--color-primary);
            color: white;
            border-radius: var(--radius-full);
            font-weight: 700;
            margin-left: var(--spacing-xs);
        }
        
        /* Game Over */
        .chain-gameover {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-xl);
        }
        
        .chain-gameover.hidden { display: none; }
        
        .gameover-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xl);
            text-align: center;
        }
        
        .gameover-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-lg);
        }
        
        .gameover-icon i {
            font-size: 3rem;
            color: white;
        }
        
        .gameover-stats {
            display: flex;
            gap: var(--spacing-lg);
        }
        
        .gameover-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-md);
            min-width: 80px;
        }
        
        .gameover-stat .stat-value {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            color: var(--color-primary);
        }
        
        .gameover-stat .stat-label {
            font-size: var(--font-size-xs);
            color: var(--color-text-muted);
            text-transform: uppercase;
        }
        
        .gameover-actions {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            width: 100%;
            max-width: 250px;
        }
        
        .gameover-actions button {
            width: 100%;
        }
        
        /* Combo-Animation */
        .combo-popup {
            position: absolute;
            font-size: var(--font-size-2xl);
            font-weight: 700;
            color: #f59e0b;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            pointer-events: none;
            animation: comboPopup 0.8s ease-out forwards;
        }
        
        @keyframes comboPopup {
            0% { transform: scale(0.5) translateY(0); opacity: 1; }
            100% { transform: scale(1.2) translateY(-50px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener
 */
function setupEventListeners() {
    // Schwierigkeit wählen
    document.querySelectorAll('#chain-menu .difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            startGame(btn.dataset.difficulty);
        });
    });
    
    // Arena Klicks
    document.getElementById('chain-arena').addEventListener('click', handleArenaClick);
    
    // Game Over Buttons
    document.getElementById('btn-chain-retry').addEventListener('click', () => {
        startGame(state.difficulty);
    });
    
    document.getElementById('btn-chain-menu').addEventListener('click', showMenu);
}

/**
 * Zeigt das Menü
 */
function showMenu() {
    stopGame();
    
    document.getElementById('chain-menu').classList.remove('hidden');
    document.getElementById('chain-game').classList.add('hidden');
    document.getElementById('chain-gameover').classList.add('hidden');
}

/**
 * Startet ein neues Spiel
 */
function startGame(difficulty) {
    state = {
        difficulty,
        score: 0,
        combo: 0,
        maxCombo: 0,
        lives: 3,
        activeSymbols: [],
        nextOrder: 1,
        spawnCounter: 0,
        spawnTimer: null,
        isPlaying: true,
        isPaused: false,
        startTime: Date.now(),
        elapsed: 0,
        gameTimer: null
    };
    
    // UI aktualisieren
    document.getElementById('chain-menu').classList.add('hidden');
    document.getElementById('chain-game').classList.remove('hidden');
    document.getElementById('chain-gameover').classList.add('hidden');
    
    updateUI();
    clearArena();
    
    document.getElementById('arena-hint').classList.remove('hidden');
    
    // Spawn starten
    const config = DIFFICULTY[difficulty];
    state.spawnTimer = setInterval(() => spawnSymbol(), config.spawnInterval);
    
    // Erstes Symbol sofort
    setTimeout(() => spawnSymbol(), 500);
}

/**
 * Stoppt das Spiel
 */
function stopGame() {
    state.isPlaying = false;
    
    if (state.spawnTimer) {
        clearInterval(state.spawnTimer);
        state.spawnTimer = null;
    }
    
    // Alle Symbol-Timeouts löschen
    state.activeSymbols.forEach(sym => {
        if (sym.timeout) clearTimeout(sym.timeout);
        if (sym.shrinkTimeout) clearTimeout(sym.shrinkTimeout);
    });
    
    state.activeSymbols = [];
}

/**
 * Spawnt ein neues Symbol
 */
function spawnSymbol() {
    if (!state.isPlaying) return;
    
    const config = DIFFICULTY[state.difficulty];
    
    // Max Symbole erreicht?
    if (state.activeSymbols.length >= config.maxSymbols) return;
    
    // Hinweis ausblenden
    document.getElementById('arena-hint').classList.add('hidden');
    
    // Zufälliges Symbol wählen
    const symbolData = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    
    // Zufällige Position (mit Abstand zum Rand)
    const arena = document.getElementById('chain-arena');
    const padding = 40;
    const maxX = arena.offsetWidth - 60 - padding;
    const maxY = arena.offsetHeight - 60 - padding;
    
    let x, y, attempts = 0;
    
    // Position finden die nicht mit anderen kollidiert
    do {
        x = padding + Math.random() * maxX;
        y = padding + Math.random() * maxY;
        attempts++;
    } while (isOverlapping(x, y) && attempts < 20);
    
    // Symbol erstellen
    state.spawnCounter++;
    const order = state.spawnCounter;
    
    const element = document.createElement('div');
    element.className = 'chain-symbol';
    element.dataset.order = order;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.backgroundColor = symbolData.color;
    element.innerHTML = `<i class="fas ${symbolData.icon}"></i>`;
    
    arena.appendChild(element);
    
    // Symbol-Objekt
    const symbol = {
        id: order,
        icon: symbolData.icon,
        color: symbolData.color,
        x, y,
        order,
        element,
        timeout: null,
        shrinkTimeout: null
    };
    
    // Schrumpf-Warnung (vor Ablauf)
    if (config.shrinkWarning) {
        symbol.shrinkTimeout = setTimeout(() => {
            if (element.parentNode) {
                element.classList.add('shrinking');
            }
        }, config.symbolLifetime - 1000);
    }
    
    // Ablauf-Timer
    symbol.timeout = setTimeout(() => {
        handleSymbolExpire(symbol);
    }, config.symbolLifetime);
    
    state.activeSymbols.push(symbol);
}

/**
 * Prüft ob Position mit anderen Symbolen überlappt
 */
function isOverlapping(x, y) {
    const minDistance = 70;
    
    return state.activeSymbols.some(sym => {
        const dx = sym.x - x;
        const dy = sym.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
    });
}

/**
 * Behandelt Klicks in der Arena
 */
function handleArenaClick(e) {
    if (!state.isPlaying) return;
    
    const symbol = e.target.closest('.chain-symbol');
    if (!symbol) return;
    
    const order = parseInt(symbol.dataset.order);
    
    // Richtiges Symbol?
    if (order === state.nextOrder) {
        handleCorrectTap(symbol, order);
    } else {
        handleWrongTap(symbol);
    }
}

/**
 * Behandelt korrekten Tap
 */
function handleCorrectTap(element, order) {
    // Symbol aus Liste entfernen
    const index = state.activeSymbols.findIndex(s => s.order === order);
    if (index !== -1) {
        const sym = state.activeSymbols[index];
        if (sym.timeout) clearTimeout(sym.timeout);
        if (sym.shrinkTimeout) clearTimeout(sym.shrinkTimeout);
        state.activeSymbols.splice(index, 1);
    }
    
    // Animation
    element.classList.add('correct');
    setTimeout(() => element.remove(), 400);
    
    // Combo erhöhen
    state.combo++;
    if (state.combo > state.maxCombo) {
        state.maxCombo = state.combo;
    }
    
    // Punkte berechnen
    const basePoints = 10;
    const comboBonus = Math.floor(state.combo / 3) * 5;
    const difficultyMultiplier = state.difficulty === 'hard' ? 2 : state.difficulty === 'medium' ? 1.5 : 1;
    const points = Math.floor((basePoints + comboBonus) * difficultyMultiplier);
    
    state.score += points;
    state.nextOrder++;
    
    // Combo-Popup
    if (state.combo >= 3 && state.combo % 3 === 0) {
        showComboPopup(element, state.combo);
    }
    
    updateUI();
}

/**
 * Zeigt Combo-Popup
 */
function showComboPopup(element, combo) {
    const popup = document.createElement('div');
    popup.className = 'combo-popup';
    popup.textContent = `${combo}x COMBO!`;
    popup.style.left = element.style.left;
    popup.style.top = element.style.top;
    
    document.getElementById('chain-arena').appendChild(popup);
    
    setTimeout(() => popup.remove(), 800);
}

/**
 * Behandelt falschen Tap
 */
function handleWrongTap(element) {
    // Animation
    element.classList.add('wrong');
    setTimeout(() => element.classList.remove('wrong'), 500);
    
    // Leben verlieren
    loseLife();
}

/**
 * Behandelt abgelaufenes Symbol
 */
function handleSymbolExpire(symbol) {
    if (!state.isPlaying) return;
    
    // Aus Liste entfernen
    const index = state.activeSymbols.findIndex(s => s.id === symbol.id);
    if (index !== -1) {
        state.activeSymbols.splice(index, 1);
    }
    
    // Nur Leben verlieren wenn es das nächste erwartete war
    if (symbol.order === state.nextOrder) {
        symbol.element.classList.add('expired');
        setTimeout(() => symbol.element.remove(), 300);
        
        loseLife();
        state.nextOrder++;
        updateUI();
    } else {
        // Einfach entfernen ohne Strafe
        symbol.element.classList.add('expired');
        setTimeout(() => symbol.element.remove(), 300);
    }
}

/**
 * Verliert ein Leben
 */
function loseLife() {
    state.lives--;
    state.combo = 0; // Combo zurücksetzen
    
    updateUI();
    
    if (state.lives <= 0) {
        gameOver();
    }
}

/**
 * Spiel beenden
 */
function gameOver() {
    stopGame();
    
    state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    
    // UI
    document.getElementById('chain-game').classList.add('hidden');
    document.getElementById('chain-gameover').classList.remove('hidden');
    
    document.getElementById('final-score').textContent = state.score;
    document.getElementById('final-combo').textContent = `${state.maxCombo}x`;
    document.getElementById('final-time').textContent = formatTime(state.elapsed);
    
    // Ergebnis speichern
    saveResult();
}

/**
 * Speichert das Ergebnis
 */
function saveResult() {
    try {
        const key = 'brainfit_chain';
        const stored = localStorage.getItem(key);
        const data = stored ? JSON.parse(stored) : { games: 0, highscore: 0, bestCombo: 0 };
        
        data.games++;
        if (state.score > data.highscore) {
            data.highscore = state.score;
        }
        if (state.maxCombo > data.bestCombo) {
            data.bestCombo = state.maxCombo;
        }
        
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.log('Ergebnis konnte nicht gespeichert werden');
    }
}

/**
 * Aktualisiert die UI
 */
function updateUI() {
    document.getElementById('chain-score').textContent = state.score;
    document.getElementById('chain-combo').textContent = `${state.combo}x`;
    document.getElementById('chain-next-order').textContent = state.nextOrder;
    
    // Leben anzeigen
    const livesContainer = document.getElementById('chain-lives');
    livesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const heart = document.createElement('i');
        heart.className = `fas fa-heart${i >= state.lives ? ' lost' : ''}`;
        livesContainer.appendChild(heart);
    }
}

/**
 * Leert die Arena
 */
function clearArena() {
    const arena = document.getElementById('chain-arena');
    arena.querySelectorAll('.chain-symbol, .combo-popup').forEach(el => el.remove());
}

/**
 * Formatiert Zeit
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Zeigt den Screen
 */
export function show() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const screen = document.getElementById('chain-screen');
    screen.classList.add('active');
    
    document.getElementById('header-title').textContent = 'Reaktions-Ketten';
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-stats').classList.add('hidden');
}

/**
 * Versteckt den Screen
 */
export function hide() {
    stopGame();
    const screen = document.getElementById('chain-screen');
    if (screen) {
        screen.classList.remove('active');
    }
}