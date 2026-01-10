/* =========================================
   Mind Maze – Das Gedächtnis-Labyrinth
   Ein Multi-Layer Gehirntraining-Erlebnis
   
   Konzept: Der Spieler muss sich einen Pfad durch
   ein Labyrinth merken, während gleichzeitig
   Symbole auf dem Weg erscheinen, die später
   abgefragt werden.
   
   Trainiert: Räumliches Denken, Kurzzeitgedächtnis,
   Mustererkennung, geteilte Aufmerksamkeit
   ========================================= */

// Schwierigkeitsstufen
const DIFFICULTY = {
    easy: {
        name: 'Anfänger',
        gridSize: 4,
        pathLength: 5,
        symbolCount: 2,
        showTime: 3000,
        pathShowTime: 600,
        lives: 3,
        symbolQuestions: 1
    },
    medium: {
        name: 'Fortgeschritten',
        gridSize: 5,
        pathLength: 7,
        symbolCount: 3,
        showTime: 2500,
        pathShowTime: 500,
        lives: 3,
        symbolQuestions: 2
    },
    hard: {
        name: 'Meister',
        gridSize: 6,
        pathLength: 10,
        symbolCount: 4,
        showTime: 2000,
        pathShowTime: 400,
        lives: 2,
        symbolQuestions: 3
    },
    insane: {
        name: 'Legende',
        gridSize: 7,
        pathLength: 14,
        symbolCount: 5,
        showTime: 1500,
        pathShowTime: 300,
        lives: 1,
        symbolQuestions: 4
    }
};

// Symbole für das Spiel
const MAZE_SYMBOLS = [
    { icon: 'fa-star', color: '#fbbf24', name: 'Stern' },
    { icon: 'fa-heart', color: '#ef4444', name: 'Herz' },
    { icon: 'fa-bolt', color: '#3b82f6', name: 'Blitz' },
    { icon: 'fa-moon', color: '#8b5cf6', name: 'Mond' },
    { icon: 'fa-sun', color: '#f97316', name: 'Sonne' },
    { icon: 'fa-gem', color: '#06b6d4', name: 'Diamant' },
    { icon: 'fa-crown', color: '#eab308', name: 'Krone' },
    { icon: 'fa-clover', color: '#22c55e', name: 'Kleeblatt' },
    { icon: 'fa-bell', color: '#f43f5e', name: 'Glocke' },
    { icon: 'fa-cloud', color: '#6366f1', name: 'Wolke' }
];

// Spielzustand
let state = {
    difficulty: 'easy',
    gridSize: 4,
    path: [],               // Der korrekte Pfad [{row, col, symbol?}]
    pathSymbols: [],        // Symbole auf dem Pfad
    userPath: [],           // Vom Spieler eingegebener Pfad
    currentStep: 0,
    phase: 'menu',          // menu, showPath, inputPath, symbolQuestion, result
    score: 0,
    round: 1,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    totalSymbolsCorrect: 0,
    totalPathsCorrect: 0,
    currentQuestion: null,
    questionsAsked: 0,
    startTime: null,
    isAnimating: false
};

/**
 * Initialisiert Mind Maze
 */
export function init() {
    renderScreen();
    setupEventListeners();
}

/**
 * Rendert den Hauptbildschirm
 */
function renderScreen() {
    const app = document.getElementById('app');
    
    if (document.getElementById('mindmaze-screen')) return;
    
    const screen = document.createElement('section');
    screen.id = 'mindmaze-screen';
    screen.className = 'screen';
    
    screen.innerHTML = `
        <div class="maze-container">
            <!-- Menü -->
            <div id="maze-menu" class="maze-menu">
                <div class="maze-header">
                    <div class="maze-logo">
                        <i class="fas fa-brain"></i>
                        <div class="maze-logo-pulse"></div>
                    </div>
                    <h2>Mind Maze</h2>
                    <p class="maze-tagline">Das Gedächtnis-Labyrinth</p>
                </div>
                
                <div class="maze-description">
                    <div class="desc-item">
                        <i class="fas fa-route"></i>
                        <span>Merke dir den Pfad durch das Labyrinth</span>
                    </div>
                    <div class="desc-item">
                        <i class="fas fa-icons"></i>
                        <span>Beachte die Symbole auf dem Weg</span>
                    </div>
                    <div class="desc-item">
                        <i class="fas fa-question-circle"></i>
                        <span>Beantworte Fragen zu den Symbolen</span>
                    </div>
                    <div class="desc-item">
                        <i class="fas fa-trophy"></i>
                        <span>Meistere immer längere Pfade</span>
                    </div>
                </div>
                
                <div class="maze-difficulty-select">
                    <button class="maze-diff-btn" data-difficulty="easy">
                        <div class="diff-icon"><i class="fas fa-seedling"></i></div>
                        <div class="diff-info">
                            <span class="diff-name">Anfänger</span>
                            <span class="diff-desc">4×4 Gitter • Kurze Pfade</span>
                        </div>
                    </button>
                    <button class="maze-diff-btn" data-difficulty="medium">
                        <div class="diff-icon"><i class="fas fa-fire"></i></div>
                        <div class="diff-info">
                            <span class="diff-name">Fortgeschritten</span>
                            <span class="diff-desc">5×5 Gitter • Mehr Symbole</span>
                        </div>
                    </button>
                    <button class="maze-diff-btn" data-difficulty="hard">
                        <div class="diff-icon"><i class="fas fa-dragon"></i></div>
                        <div class="diff-info">
                            <span class="diff-name">Meister</span>
                            <span class="diff-desc">6×6 Gitter • Schnell & Komplex</span>
                        </div>
                    </button>
                    <button class="maze-diff-btn" data-difficulty="insane">
                        <div class="diff-icon"><i class="fas fa-skull-crossbones"></i></div>
                        <div class="diff-info">
                            <span class="diff-name">Legende</span>
                            <span class="diff-desc">7×7 Gitter • Nur für Genies</span>
                        </div>
                    </button>
                </div>
            </div>
            
            <!-- Spielbereich -->
            <div id="maze-game" class="maze-game hidden">
                <div class="maze-stats-bar">
                    <div class="maze-stat">
                        <i class="fas fa-star"></i>
                        <span id="maze-score">0</span>
                    </div>
                    <div class="maze-stat">
                        <i class="fas fa-layer-group"></i>
                        <span>Runde <span id="maze-round">1</span></span>
                    </div>
                    <div class="maze-stat lives" id="maze-lives-container">
                        <!-- Herzen werden dynamisch generiert -->
                    </div>
                </div>
                
                <div class="maze-phase-indicator" id="maze-phase">
                    <i class="fas fa-eye"></i>
                    <span>Merke dir den Pfad!</span>
                </div>
                
                <div class="maze-grid-container">
                    <div id="maze-grid" class="maze-grid">
                        <!-- Grid wird dynamisch generiert -->
                    </div>
                </div>
                
                <div class="maze-combo" id="maze-combo-display">
                    <span id="maze-combo">0</span>× Combo
                </div>
            </div>
            
            <!-- Symbol-Frage -->
            <div id="maze-question" class="maze-question hidden">
                <div class="question-content">
                    <div class="question-header">
                        <i class="fas fa-question-circle"></i>
                        <h3>Symbol-Frage</h3>
                    </div>
                    <p id="question-text" class="question-text"></p>
                    <div id="question-options" class="question-options">
                        <!-- Optionen werden dynamisch generiert -->
                    </div>
                </div>
            </div>
            
            <!-- Runden-Ergebnis -->
            <div id="maze-round-result" class="maze-round-result hidden">
                <div class="round-result-content">
                    <div class="result-icon" id="round-result-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 id="round-result-title">Perfekt!</h3>
                    <p id="round-result-text">Du hast diese Runde gemeistert!</p>
                    <div class="round-points" id="round-points">+100</div>
                </div>
            </div>
            
            <!-- Game Over -->
            <div id="maze-gameover" class="maze-gameover hidden">
                <div class="gameover-content">
                    <div class="gameover-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h2>Spiel beendet!</h2>
                    
                    <div class="gameover-stats-grid">
                        <div class="go-stat">
                            <i class="fas fa-star"></i>
                            <span class="go-stat-value" id="final-maze-score">0</span>
                            <span class="go-stat-label">Punkte</span>
                        </div>
                        <div class="go-stat">
                            <i class="fas fa-route"></i>
                            <span class="go-stat-value" id="final-paths">0</span>
                            <span class="go-stat-label">Pfade</span>
                        </div>
                        <div class="go-stat">
                            <i class="fas fa-icons"></i>
                            <span class="go-stat-value" id="final-symbols">0</span>
                            <span class="go-stat-label">Symbole</span>
                        </div>
                        <div class="go-stat">
                            <i class="fas fa-fire-alt"></i>
                            <span class="go-stat-value" id="final-max-combo">0×</span>
                            <span class="go-stat-label">Max Combo</span>
                        </div>
                    </div>
                    
                    <div class="gameover-actions">
                        <button id="btn-maze-retry" class="btn-primary btn-large">
                            <i class="fas fa-redo"></i>
                            Nochmal spielen
                        </button>
                        <button id="btn-maze-menu" class="btn-secondary">
                            <i class="fas fa-home"></i>
                            Zurück zum Menü
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
 * Fügt die CSS-Styles hinzu
 */
function addStyles() {
    if (document.getElementById('mindmaze-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mindmaze-styles';
    style.textContent = `
        /* ===== Mind Maze Styles ===== */
        
        .maze-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            position: relative;
        }
        
        /* === Menü === */
        .maze-menu {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
            padding: var(--spacing-md);
            overflow-y: auto;
        }
        
        .maze-menu.hidden { display: none; }
        
        .maze-header {
            text-align: center;
            position: relative;
        }
        
        .maze-logo {
            width: 90px;
            height: 90px;
            margin: 0 auto var(--spacing-md);
            background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4);
            animation: logoFloat 3s ease-in-out infinite;
        }
        
        @keyframes logoFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        
        .maze-logo i {
            font-size: 2.5rem;
            color: white;
            z-index: 1;
        }
        
        .maze-logo-pulse {
            position: absolute;
            inset: -4px;
            border-radius: 28px;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            opacity: 0.4;
            animation: logoPulse 2s ease-in-out infinite;
        }
        
        @keyframes logoPulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.1); opacity: 0.2; }
        }
        
        .maze-header h2 {
            font-size: var(--font-size-2xl);
            font-weight: 800;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .maze-tagline {
            color: var(--color-text-light);
            font-size: var(--font-size-sm);
        }
        
        .maze-description {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            padding: var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 340px;
            border: 1px solid var(--color-border);
        }
        
        .desc-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: var(--font-size-sm);
            color: var(--color-text-light);
        }
        
        .desc-item i {
            width: 24px;
            text-align: center;
            color: #8b5cf6;
        }
        
        .maze-difficulty-select {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            width: 100%;
            max-width: 340px;
        }
        
        .maze-diff-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-md) var(--spacing-lg);
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-lg);
            text-align: left;
            transition: all 0.2s ease;
        }
        
        .maze-diff-btn:active {
            transform: scale(0.98);
            border-color: #8b5cf6;
            background: rgba(139, 92, 246, 0.1);
        }
        
        .diff-icon {
            width: 44px;
            height: 44px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--font-size-xl);
        }
        
        .maze-diff-btn[data-difficulty="easy"] .diff-icon {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
        }
        .maze-diff-btn[data-difficulty="medium"] .diff-icon {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }
        .maze-diff-btn[data-difficulty="hard"] .diff-icon {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }
        .maze-diff-btn[data-difficulty="insane"] .diff-icon {
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            color: white;
        }
        
        .diff-info {
            display: flex;
            flex-direction: column;
        }
        
        .diff-name {
            font-size: var(--font-size-base);
            font-weight: 700;
        }
        
        .diff-desc {
            font-size: var(--font-size-xs);
            color: var(--color-text-muted);
        }
        
        /* === Spielbereich === */
        .maze-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
            padding: var(--spacing-sm);
            gap: var(--spacing-sm);
        }
        
        .maze-game.hidden { display: none; }
        
        .maze-stats-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
        }
        
        .maze-stat {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-weight: 600;
            font-size: var(--font-size-sm);
        }
        
        .maze-stat i { color: #8b5cf6; }
        .maze-stat.lives i { color: #ef4444; }
        .maze-stat.lives .lost { opacity: 0.2; }
        
        .maze-phase-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) var(--spacing-lg);
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border-radius: var(--radius-full);
            font-weight: 600;
            font-size: var(--font-size-sm);
            animation: phaseGlow 2s ease-in-out infinite;
        }
        
        @keyframes phaseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
            50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); }
        }
        
        .maze-grid-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: var(--spacing-sm);
        }
        
        .maze-grid {
            display: grid;
            gap: 4px;
            background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
            padding: 8px;
            border-radius: var(--radius-lg);
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .maze-cell {
            width: 100%;
            aspect-ratio: 1;
            background: var(--color-bg-card);
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .maze-cell:active {
            transform: scale(0.95);
        }
        
        .maze-cell.path-show {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
            animation: cellPulse 0.5s ease;
        }
        
        .maze-cell.path-correct {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
        }
        
        .maze-cell.path-wrong {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            animation: cellShake 0.4s ease;
        }
        
        .maze-cell.start-cell {
            border: 3px solid #22c55e;
        }
        
        .maze-cell.start-cell::after {
            content: 'START';
            position: absolute;
            font-size: 0.5rem;
            font-weight: 700;
            color: #22c55e;
            bottom: 2px;
        }
        
        .maze-cell .cell-symbol {
            font-size: 1.2rem;
            color: white;
            animation: symbolAppear 0.3s ease;
        }
        
        @keyframes cellPulse {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        @keyframes cellShake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-4px); }
            40%, 80% { transform: translateX(4px); }
        }
        
        @keyframes symbolAppear {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        
        .maze-combo {
            font-size: var(--font-size-lg);
            font-weight: 700;
            color: #f59e0b;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
        }
        
        .maze-combo.visible {
            opacity: 1;
            transform: scale(1);
        }
        
        /* === Symbol-Frage === */
        .maze-question {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.98);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-lg);
            animation: fadeIn 0.3s ease;
        }
        
        .maze-question.hidden { display: none; }
        
        .question-content {
            text-align: center;
            max-width: 350px;
        }
        
        .question-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
        }
        
        .question-header i {
            font-size: 2.5rem;
            color: #8b5cf6;
        }
        
        .question-header h3 {
            font-size: var(--font-size-xl);
            font-weight: 700;
        }
        
        .question-text {
            font-size: var(--font-size-lg);
            color: var(--color-text);
            margin-bottom: var(--spacing-xl);
            line-height: 1.5;
        }
        
        .question-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
        }
        
        .question-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-lg);
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .question-option:active {
            transform: scale(0.95);
        }
        
        .question-option i {
            font-size: 2rem;
        }
        
        .question-option span {
            font-size: var(--font-size-sm);
            font-weight: 600;
        }
        
        .question-option.correct {
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
        }
        
        .question-option.wrong {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }
        
        /* === Runden-Ergebnis === */
        .maze-round-result {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.98);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        .maze-round-result.hidden { display: none; }
        
        .round-result-content {
            text-align: center;
        }
        
        .round-result-content .result-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto var(--spacing-md);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
        }
        
        .result-icon.success {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
        }
        
        .result-icon.fail {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }
        
        .round-result-content h3 {
            font-size: var(--font-size-xl);
            margin-bottom: var(--spacing-xs);
        }
        
        .round-result-content p {
            color: var(--color-text-light);
            margin-bottom: var(--spacing-md);
        }
        
        .round-points {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            color: #22c55e;
            animation: pointsBounce 0.5s ease;
        }
        
        @keyframes pointsBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        
        /* === Game Over === */
        .maze-gameover {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-lg);
        }
        
        .maze-gameover.hidden { display: none; }
        
        .maze-gameover .gameover-content {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
        }
        
        .maze-gameover .gameover-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }
        
        .maze-gameover .gameover-icon i {
            font-size: 3rem;
            color: white;
        }
        
        .gameover-stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
            width: 100%;
            max-width: 280px;
        }
        
        .go-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-md);
        }
        
        .go-stat i {
            font-size: var(--font-size-lg);
            color: #8b5cf6;
        }
        
        .go-stat-value {
            font-size: var(--font-size-xl);
            font-weight: 700;
            color: var(--color-text);
        }
        
        .go-stat-label {
            font-size: var(--font-size-xs);
            color: var(--color-text-muted);
            text-transform: uppercase;
        }
        
        .maze-gameover .gameover-actions {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            width: 100%;
            max-width: 250px;
        }
        
        .maze-gameover .gameover-actions button {
            width: 100%;
        }
        
        /* === Animationen === */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Event Listener Setup
 */
function setupEventListeners() {
    // Schwierigkeitsauswahl
    document.querySelectorAll('.maze-diff-btn').forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
    });
    
    // Grid Klicks
    document.getElementById('maze-grid').addEventListener('click', handleGridClick);
    
    // Frage-Optionen
    document.getElementById('question-options').addEventListener('click', handleQuestionClick);
    
    // Game Over Buttons
    document.getElementById('btn-maze-retry').addEventListener('click', () => startGame(state.difficulty));
    document.getElementById('btn-maze-menu').addEventListener('click', showMenu);
}

/**
 * Zeigt das Menü
 */
function showMenu() {
    state.phase = 'menu';
    
    document.getElementById('maze-menu').classList.remove('hidden');
    document.getElementById('maze-game').classList.add('hidden');
    document.getElementById('maze-question').classList.add('hidden');
    document.getElementById('maze-round-result').classList.add('hidden');
    document.getElementById('maze-gameover').classList.add('hidden');
}

/**
 * Startet ein neues Spiel
 */
function startGame(difficulty) {
    const config = DIFFICULTY[difficulty];
    
    state = {
        difficulty,
        gridSize: config.gridSize,
        path: [],
        pathSymbols: [],
        userPath: [],
        currentStep: 0,
        phase: 'showPath',
        score: 0,
        round: 1,
        lives: config.lives,
        combo: 0,
        maxCombo: 0,
        totalSymbolsCorrect: 0,
        totalPathsCorrect: 0,
        currentQuestion: null,
        questionsAsked: 0,
        startTime: Date.now(),
        isAnimating: false
    };
    
    // UI vorbereiten
    document.getElementById('maze-menu').classList.add('hidden');
    document.getElementById('maze-game').classList.remove('hidden');
    document.getElementById('maze-question').classList.add('hidden');
    document.getElementById('maze-round-result').classList.add('hidden');
    document.getElementById('maze-gameover').classList.add('hidden');
    
    renderGrid();
    updateUI();
    startRound();
}

/**
 * Rendert das Grid
 */
function renderGrid() {
    const grid = document.getElementById('maze-grid');
    const cellSize = Math.min(50, (window.innerWidth - 60) / state.gridSize);
    
    grid.style.gridTemplateColumns = `repeat(${state.gridSize}, ${cellSize}px)`;
    grid.innerHTML = '';
    
    for (let row = 0; row < state.gridSize; row++) {
        for (let col = 0; col < state.gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.width = `${cellSize}px`;
            grid.appendChild(cell);
        }
    }
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    const config = DIFFICULTY[state.difficulty];
    
    // Pfadlänge steigt mit den Runden
    const pathLength = config.pathLength + Math.floor((state.round - 1) / 2);
    
    // Pfad generieren
    generatePath(pathLength);
    
    // Symbole auf dem Pfad platzieren
    placeSymbols();
    
    // UI aktualisieren
    updatePhaseIndicator('Merke dir den Pfad!', 'fa-eye');
    clearGridHighlights();
    
    state.userPath = [];
    state.currentStep = 0;
    state.questionsAsked = 0;
    state.phase = 'showPath';
    
    // Pfad animiert zeigen
    setTimeout(() => showPath(), 500);
}

/**
 * Generiert einen zufälligen Pfad
 */
function generatePath(length) {
    state.path = [];
    
    // Startposition
    const startRow = Math.floor(Math.random() * state.gridSize);
    const startCol = Math.floor(Math.random() * state.gridSize);
    
    state.path.push({ row: startRow, col: startCol, symbol: null });
    
    // Pfad erweitern
    while (state.path.length < length) {
        const last = state.path[state.path.length - 1];
        const neighbors = getValidNeighbors(last.row, last.col);
        
        if (neighbors.length === 0) {
            // Sackgasse - neu starten
            state.path = [];
            const newStartRow = Math.floor(Math.random() * state.gridSize);
            const newStartCol = Math.floor(Math.random() * state.gridSize);
            state.path.push({ row: newStartRow, col: newStartCol, symbol: null });
            continue;
        }
        
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        state.path.push({ row: next.row, col: next.col, symbol: null });
    }
}

/**
 * Holt gültige Nachbarzellen
 */
function getValidNeighbors(row, col) {
    const directions = [
        { row: -1, col: 0 },  // oben
        { row: 1, col: 0 },   // unten
        { row: 0, col: -1 },  // links
        { row: 0, col: 1 }    // rechts
    ];
    
    const neighbors = [];
    
    for (const dir of directions) {
        const newRow = row + dir.row;
        const newCol = col + dir.col;
        
        // Im Grid?
        if (newRow < 0 || newRow >= state.gridSize) continue;
        if (newCol < 0 || newCol >= state.gridSize) continue;
        
        // Schon im Pfad?
        const alreadyInPath = state.path.some(p => p.row === newRow && p.col === newCol);
        if (alreadyInPath) continue;
        
        neighbors.push({ row: newRow, col: newCol });
    }
    
    return neighbors;
}

/**
 * Platziert Symbole auf dem Pfad
 */
function placeSymbols() {
    const config = DIFFICULTY[state.difficulty];
    const symbolCount = config.symbolCount + Math.floor((state.round - 1) / 3);
    
    // Zufällige Positionen auf dem Pfad (nicht Start/Ende)
    const availablePositions = state.path.slice(1, -1);
    const shuffled = [...availablePositions].sort(() => Math.random() - 0.5);
    const symbolPositions = shuffled.slice(0, Math.min(symbolCount, shuffled.length));
    
    // Zufällige Symbole zuweisen
    state.pathSymbols = [];
    const usedSymbols = new Set();
    
    symbolPositions.forEach((pos, index) => {
        let symbolIndex;
        do {
            symbolIndex = Math.floor(Math.random() * MAZE_SYMBOLS.length);
        } while (usedSymbols.has(symbolIndex) && usedSymbols.size < MAZE_SYMBOLS.length);
        
        usedSymbols.add(symbolIndex);
        const symbol = MAZE_SYMBOLS[symbolIndex];
        
        // Symbol im Pfad speichern
        const pathIndex = state.path.findIndex(p => p.row === pos.row && p.col === pos.col);
        if (pathIndex !== -1) {
            state.path[pathIndex].symbol = symbol;
            state.pathSymbols.push({
                position: pathIndex,
                symbol,
                row: pos.row,
                col: pos.col
            });
        }
    });
}

/**
 * Zeigt den Pfad animiert
 */
async function showPath() {
    const config = DIFFICULTY[state.difficulty];
    state.isAnimating = true;
    
    // Start markieren
    const startCell = getCell(state.path[0].row, state.path[0].col);
    startCell.classList.add('start-cell');
    
    // Pfad Schritt für Schritt zeigen
    for (let i = 0; i < state.path.length; i++) {
        const step = state.path[i];
        const cell = getCell(step.row, step.col);
        
        cell.classList.add('path-show');
        
        // Symbol anzeigen falls vorhanden
        if (step.symbol) {
            cell.innerHTML = `<i class="fas ${step.symbol.icon} cell-symbol" style="color: ${step.symbol.color}"></i>`;
        }
        
        await delay(config.pathShowTime);
    }
    
    // Kurz warten, dann alles ausblenden
    await delay(config.showTime);
    
    // Pfad ausblenden, Symbole merken
    for (const step of state.path) {
        const cell = getCell(step.row, step.col);
        cell.classList.remove('path-show');
        cell.innerHTML = '';
    }
    
    state.isAnimating = false;
    state.phase = 'inputPath';
    updatePhaseIndicator('Gib den Pfad ein!', 'fa-hand-pointer');
}

/**
 * Behandelt Grid-Klicks
 */
async function handleGridClick(e) {
    if (state.phase !== 'inputPath' || state.isAnimating) return;
    
    const cell = e.target.closest('.maze-cell');
    if (!cell) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Erste Eingabe muss der Start sein
    if (state.currentStep === 0) {
        if (row !== state.path[0].row || col !== state.path[0].col) {
            // Falscher Start
            cell.classList.add('path-wrong');
            setTimeout(() => cell.classList.remove('path-wrong'), 400);
            return;
        }
    } else {
        // Muss Nachbar des letzten Schritts sein
        const last = state.userPath[state.userPath.length - 1];
        const isNeighbor = (
            (Math.abs(row - last.row) === 1 && col === last.col) ||
            (Math.abs(col - last.col) === 1 && row === last.row)
        );
        
        if (!isNeighbor) return;
    }
    
    // Prüfen ob korrekt
    const expected = state.path[state.currentStep];
    const isCorrect = row === expected.row && col === expected.col;
    
    if (isCorrect) {
        // Korrekt!
        cell.classList.add('path-correct');
        state.userPath.push({ row, col });
        state.currentStep++;
        state.combo++;
        
        if (state.combo > state.maxCombo) {
            state.maxCombo = state.combo;
        }
        
        updateComboDisplay();
        
        // Pfad komplett?
        if (state.currentStep >= state.path.length) {
            state.totalPathsCorrect++;
            await delay(300);
            
            // Symbol-Fragen stellen
            if (state.pathSymbols.length > 0) {
                askSymbolQuestion();
            } else {
                roundComplete(true);
            }
        }
    } else {
        // Falsch!
        cell.classList.add('path-wrong');
        state.combo = 0;
        updateComboDisplay();
        
        await delay(400);
        cell.classList.remove('path-wrong');
        
        loseLife();
    }
}

/**
 * Stellt eine Symbol-Frage
 */
function askSymbolQuestion() {
    const config = DIFFICULTY[state.difficulty];
    
    if (state.questionsAsked >= config.symbolQuestions || state.questionsAsked >= state.pathSymbols.length) {
        roundComplete(true);
        return;
    }
    
    state.phase = 'symbolQuestion';
    
    // Zufälliges Symbol auswählen
    const symbolData = state.pathSymbols[state.questionsAsked];
    
    // Frage generieren
    const questionTypes = [
        {
            text: `Welches Symbol war auf Position ${symbolData.position + 1} des Pfades?`,
            answer: symbolData.symbol,
            type: 'which'
        },
        {
            text: `War ein ${symbolData.symbol.name} auf dem Pfad?`,
            answer: symbolData.symbol,
            type: 'yesno'
        }
    ];
    
    const question = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    // Optionen generieren
    let options;
    if (question.type === 'which') {
        options = generateSymbolOptions(symbolData.symbol);
    } else {
        options = [
            { text: 'Ja', correct: true, icon: 'fa-check', color: '#22c55e' },
            { text: 'Nein', correct: false, icon: 'fa-times', color: '#ef4444' }
        ];
    }
    
    state.currentQuestion = { ...question, options, correctSymbol: symbolData.symbol };
    
    // UI aktualisieren
    document.getElementById('question-text').textContent = question.text;
    
    const optionsContainer = document.getElementById('question-options');
    optionsContainer.innerHTML = options.map((opt, i) => `
        <button class="question-option" data-index="${i}">
            <i class="fas ${opt.icon}" style="color: ${opt.color}"></i>
            <span>${opt.text}</span>
        </button>
    `).join('');
    
    document.getElementById('maze-game').classList.add('hidden');
    document.getElementById('maze-question').classList.remove('hidden');
}

/**
 * Generiert Symbol-Optionen
 */
function generateSymbolOptions(correctSymbol) {
    const options = [{ ...correctSymbol, correct: true, text: correctSymbol.name }];
    
    // 3 falsche Optionen
    const otherSymbols = MAZE_SYMBOLS.filter(s => s.icon !== correctSymbol.icon);
    const shuffled = otherSymbols.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
        options.push({ ...shuffled[i], correct: false, text: shuffled[i].name });
    }
    
    // Mischen
    return options.sort(() => Math.random() - 0.5);
}

/**
 * Behandelt Antwort-Klicks
 */
async function handleQuestionClick(e) {
    if (state.phase !== 'symbolQuestion') return;
    
    const option = e.target.closest('.question-option');
    if (!option) return;
    
    const index = parseInt(option.dataset.index);
    const selectedOption = state.currentQuestion.options[index];
    const isCorrect = selectedOption.correct;
    
    // Visuelles Feedback
    option.classList.add(isCorrect ? 'correct' : 'wrong');
    
    // Richtige Antwort markieren falls falsch
    if (!isCorrect) {
        const correctIndex = state.currentQuestion.options.findIndex(o => o.correct);
        document.querySelectorAll('.question-option')[correctIndex].classList.add('correct');
        loseLife();
    } else {
        state.totalSymbolsCorrect++;
        state.combo++;
        if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    }
    
    await delay(1000);
    
    state.questionsAsked++;
    
    // Mehr Fragen?
    const config = DIFFICULTY[state.difficulty];
    if (state.questionsAsked < config.symbolQuestions && state.questionsAsked < state.pathSymbols.length && state.lives > 0) {
        document.getElementById('maze-question').classList.add('hidden');
        document.getElementById('maze-game').classList.remove('hidden');
        askSymbolQuestion();
    } else {
        document.getElementById('maze-question').classList.add('hidden');
        roundComplete(state.lives > 0);
    }
}

/**
 * Runde abgeschlossen
 */
async function roundComplete(success) {
    // Punkte berechnen
    const basePoints = state.path.length * 10;
    const comboBonus = state.combo * 5;
    const symbolBonus = state.totalSymbolsCorrect * 20;
    const roundBonus = state.round * 10;
    const totalPoints = success ? basePoints + comboBonus + symbolBonus + roundBonus : 0;
    
    state.score += totalPoints;
    
    // Ergebnis zeigen
    const resultIcon = document.getElementById('round-result-icon');
    resultIcon.className = `result-icon ${success ? 'success' : 'fail'}`;
    resultIcon.innerHTML = `<i class="fas ${success ? 'fa-check-circle' : 'fa-times-circle'}"></i>`;
    
    document.getElementById('round-result-title').textContent = success ? 'Perfekt!' : 'Nicht ganz...';
    document.getElementById('round-result-text').textContent = success 
        ? `Runde ${state.round} gemeistert!` 
        : 'Versuche es nochmal!';
    document.getElementById('round-points').textContent = `+${totalPoints}`;
    document.getElementById('round-points').style.color = success ? '#22c55e' : '#ef4444';
    
    document.getElementById('maze-game').classList.add('hidden');
    document.getElementById('maze-round-result').classList.remove('hidden');
    
    await delay(2000);
    
    document.getElementById('maze-round-result').classList.add('hidden');
    
    if (state.lives <= 0) {
        gameOver();
    } else {
        state.round++;
        document.getElementById('maze-game').classList.remove('hidden');
        updateUI();
        startRound();
    }
}

/**
 * Leben verlieren
 */
function loseLife() {
    state.lives--;
    state.combo = 0;
    updateUI();
    
    if (state.lives <= 0) {
        state.phase = 'gameover';
    }
}

/**
 * Spiel beenden
 */
function gameOver() {
    document.getElementById('maze-game').classList.add('hidden');
    document.getElementById('maze-question').classList.add('hidden');
    document.getElementById('maze-round-result').classList.add('hidden');
    document.getElementById('maze-gameover').classList.remove('hidden');
    
    document.getElementById('final-maze-score').textContent = state.score;
    document.getElementById('final-paths').textContent = state.totalPathsCorrect;
    document.getElementById('final-symbols').textContent = state.totalSymbolsCorrect;
    document.getElementById('final-max-combo').textContent = `${state.maxCombo}×`;
    
    saveResult();
}

/**
 * Speichert das Ergebnis
 */
function saveResult() {
    try {
        const key = 'brainfit_mindmaze';
        const stored = localStorage.getItem(key);
        const data = stored ? JSON.parse(stored) : { highscore: 0, bestRound: 0 };
        
        if (state.score > data.highscore) data.highscore = state.score;
        if (state.round > data.bestRound) data.bestRound = state.round;
        
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.log('Speichern fehlgeschlagen');
    }
}

/**
 * Hilfsfunktionen
 */
function getCell(row, col) {
    return document.querySelector(`.maze-cell[data-row="${row}"][data-col="${col}"]`);
}

function clearGridHighlights() {
    document.querySelectorAll('.maze-cell').forEach(cell => {
        cell.className = 'maze-cell';
        cell.innerHTML = '';
    });
}

function updateUI() {
    document.getElementById('maze-score').textContent = state.score;
    document.getElementById('maze-round').textContent = state.round;
    
    // Leben
    const livesContainer = document.getElementById('maze-lives-container');
    const maxLives = DIFFICULTY[state.difficulty].lives;
    livesContainer.innerHTML = '';
    for (let i = 0; i < maxLives; i++) {
        const heart = document.createElement('i');
        heart.className = `fas fa-heart${i >= state.lives ? ' lost' : ''}`;
        livesContainer.appendChild(heart);
    }
}

function updatePhaseIndicator(text, icon) {
    const indicator = document.getElementById('maze-phase');
    indicator.innerHTML = `<i class="fas ${icon}"></i><span>${text}</span>`;
}

function updateComboDisplay() {
    const display = document.getElementById('maze-combo-display');
    document.getElementById('maze-combo').textContent = state.combo;
    display.classList.toggle('visible', state.combo >= 3);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Screen anzeigen
 */
export function show() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('mindmaze-screen').classList.add('active');
    document.getElementById('header-title').textContent = 'Mind Maze';
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-stats').classList.add('hidden');
}

/**
 * Screen verstecken
 */
export function hide() {
    state.phase = 'menu';
    const screen = document.getElementById('mindmaze-screen');
    if (screen) screen.classList.remove('active');
}