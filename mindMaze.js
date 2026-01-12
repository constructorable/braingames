/* =========================================
   Mind Maze – Das Gedächtnis-Labyrinth
   Ein Multi-Layer Gehirntraining-Erlebnis
   ========================================= */

/* -----------------------------------------
   KONFIGURATION - Hier Werte anpassen!
   ----------------------------------------- */

// ÄNDERUNG: 10 Schwierigkeitsstufen statt 4
const LEVEL_SETTINGS = {
    // gridSize: Größe des Gitters (z.B. 4 = 4x4)
    // pathLength: Länge des zu merkenden Pfades
    // symbolCount: Anzahl Symbole auf dem Pfad
    // showTime: Zeit in ms wie lange Pfad komplett sichtbar bleibt
    // pathShowTime: Zeit in ms pro Pfadschritt-Animation
    // lives: Anzahl Leben
    // symbolQuestions: Anzahl Symbol-Fragen nach Pfad

    1:  { gridSize: 3, pathLength: 4,  symbolCount: 1, showTime: 4000, pathShowTime: 800, lives: 3, symbolQuestions: 1 },
    2:  { gridSize: 3, pathLength: 5,  symbolCount: 1, showTime: 3500, pathShowTime: 700, lives: 3, symbolQuestions: 1 },
    3:  { gridSize: 4, pathLength: 5,  symbolCount: 2, showTime: 3500, pathShowTime: 650, lives: 3, symbolQuestions: 1 },
    4:  { gridSize: 4, pathLength: 6,  symbolCount: 2, showTime: 3000, pathShowTime: 600, lives: 3, symbolQuestions: 2 },
    5:  { gridSize: 4, pathLength: 7,  symbolCount: 3, showTime: 3000, pathShowTime: 550, lives: 3, symbolQuestions: 2 },
    6:  { gridSize: 5, pathLength: 8,  symbolCount: 3, showTime: 2500, pathShowTime: 500, lives: 3, symbolQuestions: 2 },
    7:  { gridSize: 5, pathLength: 9,  symbolCount: 4, showTime: 2500, pathShowTime: 450, lives: 2, symbolQuestions: 3 },
    8:  { gridSize: 5, pathLength: 10, symbolCount: 4, showTime: 2000, pathShowTime: 400, lives: 2, symbolQuestions: 3 },
    9:  { gridSize: 6, pathLength: 12, symbolCount: 5, showTime: 2000, pathShowTime: 350, lives: 2, symbolQuestions: 4 },
    10: { gridSize: 6, pathLength: 14, symbolCount: 5, showTime: 1500, pathShowTime: 300, lives: 1, symbolQuestions: 4 }
};

// Punkteberechnung
const SCORE_CONFIG = {
    pointsPerPathStep: 10,
    comboMultiplier: 5,
    symbolBonus: 20,
    roundBonus: 10
};

/* -----------------------------------------
   ENDE KONFIGURATION
   ----------------------------------------- */

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
    difficulty: 1,
    gridSize: 3,
    path: [],
    pathSymbols: [],
    userPath: [],
    currentStep: 0,
    phase: 'menu',
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
    
    // ÄNDERUNG: Neues Layout mit Level-Grid
    screen.innerHTML = `
        <div class="maze-container">
            <!-- Menü -->
            <div id="maze-menu" class="maze-menu">
                <div class="maze-header">
                    <div class="maze-logo">
                        <i class="fas fa-brain"></i>
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
                </div>
                
                <div class="maze-level-section">
                    <h3>Schwierigkeitsstufe wählen</h3>
                    <div class="maze-level-grid">
                        ${Array.from({length: 10}, (_, i) => `
                            <button class="maze-level-btn" data-level="${i + 1}">${i + 1}</button>
                        `).join('')}
                    </div>
                </div>
                
                <button id="btn-maze-start" class="btn-primary btn-large">
                    <i class="fas fa-play"></i>
                    Spiel starten
                </button>
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
                    </div>
                </div>
                
                <div class="maze-phase-indicator" id="maze-phase">
                    <i class="fas fa-eye"></i>
                    <span>Merke dir den Pfad!</span>
                </div>
                
                <div class="maze-grid-container">
                    <div id="maze-grid" class="maze-grid">
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
 * Fügt die CSS-Styles hinzu - ÄNDERUNG: Kontrastreiche Farben und maximale Spielfläche
 */
function addStyles() {
    if (document.getElementById('mindmaze-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mindmaze-styles';
    style.textContent = `
        /* ===== Mind Maze Styles - Kontrastreich ===== */
        
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
        }
        
        .maze-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto var(--spacing-md);
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 30px rgba(124, 58, 237, 0.5);
        }
        
        .maze-logo i {
            font-size: 2.2rem;
            color: white;
        }
        
        .maze-header h2 {
            font-size: var(--font-size-2xl);
            font-weight: 800;
            color: var(--color-text);
            margin-bottom: var(--spacing-xs);
        }
        
        .maze-tagline {
            color: var(--color-text-light);
            font-size: var(--font-size-sm);
            font-weight: 500;
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
            color: var(--color-text);
            font-weight: 500;
        }
        
        .desc-item i {
            width: 24px;
            text-align: center;
            color: #7c3aed;
            font-size: var(--font-size-base);
        }
        
        /* ÄNDERUNG: Level-Auswahl Grid */
        .maze-level-section {
            width: 100%;
            max-width: 340px;
            text-align: center;
        }
        
        .maze-level-section h3 {
            font-size: var(--font-size-base);
            font-weight: 600;
            margin-bottom: var(--spacing-md);
            color: var(--color-text);
        }
        
        .maze-level-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: var(--spacing-sm);
        }
        
        .maze-level-btn {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--font-size-lg);
            font-weight: 700;
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text);
            transition: all 0.2s ease;
        }
        
        .maze-level-btn:hover {
            border-color: #7c3aed;
        }
        
        .maze-level-btn.selected {
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            border-color: transparent;
            color: white;
            box-shadow: 0 4px 20px rgba(124, 58, 237, 0.5);
            transform: scale(1.05);
        }
        
        .maze-level-btn:active {
            transform: scale(0.95);
        }
        
        #btn-maze-start {
            width: 100%;
            max-width: 340px;
        }
        
        /* === Spielbereich - ÄNDERUNG: Maximale Größe === */
        .maze-game {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: var(--spacing-xs);
            gap: var(--spacing-xs);
        }
        
        .maze-game.hidden { display: none; }
        
        .maze-stats-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
            flex-shrink: 0;
        }
        
        /* ÄNDERUNG: Kontrastreiche Stats */
        .maze-stat {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-weight: 700;
            font-size: var(--font-size-sm);
            color: var(--color-text);
        }
        
        .maze-stat i { 
            color: #7c3aed;
            font-size: var(--font-size-base);
        }
        
        .maze-stat.lives i { 
            color: #dc2626;
        }
        
        .maze-stat.lives .lost { 
            opacity: 0.25;
        }
        
        /* ÄNDERUNG: Auffälligerer Phase-Indicator */
        .maze-phase-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) var(--spacing-lg);
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            color: white;
            border-radius: var(--radius-full);
            font-weight: 700;
            font-size: var(--font-size-sm);
            box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
            flex-shrink: 0;
            align-self: center;
        }
        
        /* ÄNDERUNG: Grid-Container maximiert */
        .maze-grid-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 0;
            padding: var(--spacing-xs);
        }
        
        /* ÄNDERUNG: Kontrastreiches Grid */
        .maze-grid {
            display: grid;
            gap: 6px;
            background: #1e1b4b;
            padding: 10px;
            border-radius: var(--radius-lg);
            box-shadow: inset 0 4px 15px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.2);
            width: 100%;
            max-width: min(95vw, 400px);
            aspect-ratio: 1;
        }
        
        /* ÄNDERUNG: Kontrastreiche Zellen */
        .maze-cell {
            background: #e2e8f0;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
            position: relative;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border: 2px solid transparent;
        }
        
        .maze-cell:active {
            transform: scale(0.92);
        }
        
        /* ÄNDERUNG: Sehr auffälliger Pfad */
        .maze-cell.path-show {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            box-shadow: 0 0 25px rgba(251, 191, 36, 0.8), inset 0 2px 10px rgba(255,255,255,0.3);
            border-color: #fef3c7;
            animation: cellPulse 0.4s ease;
        }
        
        /* ÄNDERUNG: Korrekt = Grün sehr sichtbar */
        .maze-cell.path-correct {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.7);
            border-color: #bbf7d0;
        }
        
        /* ÄNDERUNG: Falsch = Rot sehr sichtbar */
        .maze-cell.path-wrong {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.7);
            border-color: #fecaca;
            animation: cellShake 0.4s ease;
        }
        
        /* ÄNDERUNG: Start-Zelle deutlich markiert */
        .maze-cell.start-cell {
            border: 3px solid #22c55e;
            background: #dcfce7;
        }
        
        .maze-cell.start-cell::after {
            content: 'START';
            position: absolute;
            font-size: 0.5rem;
            font-weight: 800;
            color: #16a34a;
            bottom: 2px;
            letter-spacing: 0.5px;
        }
        
        .maze-cell .cell-symbol {
            font-size: 1.4rem;
            color: white;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            animation: symbolAppear 0.3s ease;
        }
        
        @keyframes cellPulse {
            0% { transform: scale(0.85); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
        }
        
        @keyframes cellShake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        
        @keyframes symbolAppear {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        
        /* ÄNDERUNG: Auffälligeres Combo-Display */
        .maze-combo {
            font-size: var(--font-size-lg);
            font-weight: 800;
            color: #f59e0b;
            text-align: center;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
            flex-shrink: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .maze-combo.visible {
            opacity: 1;
            transform: scale(1);
        }
        
        /* === Symbol-Frage - ÄNDERUNG: Kontrastreich === */
        .maze-question {
            position: absolute;
            inset: 0;
            background: var(--color-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-lg);
            animation: fadeIn 0.3s ease;
            z-index: 10;
        }
        
        .maze-question.hidden { display: none; }
        
        .question-content {
            text-align: center;
            max-width: 350px;
            width: 100%;
        }
        
        .question-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
        }
        
        .question-header i {
            font-size: 3rem;
            color: #7c3aed;
        }
        
        .question-header h3 {
            font-size: var(--font-size-xl);
            font-weight: 800;
            color: var(--color-text);
        }
        
        .question-text {
            font-size: var(--font-size-lg);
            color: var(--color-text);
            margin-bottom: var(--spacing-xl);
            line-height: 1.5;
            font-weight: 600;
        }
        
        .question-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
        }
        
        /* ÄNDERUNG: Kontrastreiche Options-Buttons */
        .question-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-lg);
            background: var(--color-bg-card);
            border: 3px solid var(--color-border);
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .question-option:active {
            transform: scale(0.95);
        }
        
        .question-option i {
            font-size: 2.5rem;
        }
        
        .question-option span {
            font-size: var(--font-size-base);
            font-weight: 700;
            color: var(--color-text);
        }
        
        .question-option.correct {
            border-color: #22c55e;
            background: #dcfce7;
        }
        
        .question-option.wrong {
            border-color: #ef4444;
            background: #fee2e2;
        }
        
        /* === Runden-Ergebnis === */
        .maze-round-result {
            position: absolute;
            inset: 0;
            background: var(--color-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
            z-index: 10;
        }
        
        .maze-round-result.hidden { display: none; }
        
        .round-result-content {
            text-align: center;
        }
        
        .round-result-content .result-icon {
            width: 90px;
            height: 90px;
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
            box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
        }
        
        .result-icon.fail {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
        }
        
        .round-result-content h3 {
            font-size: var(--font-size-xl);
            font-weight: 800;
            color: var(--color-text);
            margin-bottom: var(--spacing-xs);
        }
        
        .round-result-content p {
            color: var(--color-text-light);
            font-weight: 500;
            margin-bottom: var(--spacing-md);
        }
        
        .round-points {
            font-size: var(--font-size-2xl);
            font-weight: 800;
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
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 40px rgba(124, 58, 237, 0.4);
        }
        
        .maze-gameover .gameover-icon i {
            font-size: 3rem;
            color: white;
        }
        
        .maze-gameover h2 {
            font-size: var(--font-size-2xl);
            font-weight: 800;
            color: var(--color-text);
        }
        
        .gameover-stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
            width: 100%;
            max-width: 300px;
        }
        
        .go-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
        }
        
        .go-stat i {
            font-size: var(--font-size-lg);
            color: #7c3aed;
        }
        
        .go-stat-value {
            font-size: var(--font-size-xl);
            font-weight: 800;
            color: var(--color-text);
        }
        
        .go-stat-label {
            font-size: var(--font-size-xs);
            color: var(--color-text-light);
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .maze-gameover .gameover-actions {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            width: 100%;
            max-width: 280px;
        }
        
        .maze-gameover .gameover-actions button {
            width: 100%;
        }
        
        /* === Animationen === */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* === Dark Mode Anpassungen === */
        [data-theme="dark"] .maze-grid {
            background: #0f0a1e;
            box-shadow: inset 0 4px 15px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3);
        }
        
        [data-theme="dark"] .maze-cell {
            background: #374151;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        [data-theme="dark"] .maze-cell.start-cell {
            background: #064e3b;
        }
        
        [data-theme="dark"] .question-option {
            background: var(--color-bg-card);
        }
        
        [data-theme="dark"] .question-option.correct {
            background: #064e3b;
            border-color: #22c55e;
        }
        
        [data-theme="dark"] .question-option.wrong {
            background: #7f1d1d;
            border-color: #ef4444;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Event Listener Setup
 */
function setupEventListeners() {
    // ÄNDERUNG: Level-Buttons statt Difficulty-Buttons
    document.querySelectorAll('.maze-level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.maze-level-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.difficulty = parseInt(btn.dataset.level);
        });
    });
    
    // Standard: Level 1 ausgewählt
    const firstLevelBtn = document.querySelector('.maze-level-btn[data-level="1"]');
    if (firstLevelBtn) {
        firstLevelBtn.classList.add('selected');
        state.difficulty = 1;
    }
    
    // NEU: Start-Button
    document.getElementById('btn-maze-start').addEventListener('click', () => {
        startGame(state.difficulty);
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
 * @param {number} difficulty - Level 1-10
 */
function startGame(difficulty) {
    const config = LEVEL_SETTINGS[difficulty];
    
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
 * Rendert das Grid - ÄNDERUNG: Maximale Größe
 */
function renderGrid() {
    const grid = document.getElementById('maze-grid');
    const container = document.querySelector('.maze-grid-container');
    
    // Berechne maximale Zellgröße basierend auf verfügbarem Platz
    const containerWidth = container.offsetWidth - 20;
    const containerHeight = container.offsetHeight - 20;
    const maxGridSize = Math.min(containerWidth, containerHeight, 400);
    const cellSize = Math.floor((maxGridSize - 20 - (state.gridSize - 1) * 6) / state.gridSize);
    
    grid.style.gridTemplateColumns = `repeat(${state.gridSize}, ${cellSize}px)`;
    grid.style.width = 'auto';
    grid.style.maxWidth = `${maxGridSize}px`;
    grid.innerHTML = '';
    
    for (let row = 0; row < state.gridSize; row++) {
        for (let col = 0; col < state.gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            grid.appendChild(cell);
        }
    }
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    const config = LEVEL_SETTINGS[state.difficulty];
    
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
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
    ];
    
    const neighbors = [];
    
    for (const dir of directions) {
        const newRow = row + dir.row;
        const newCol = col + dir.col;
        
        if (newRow < 0 || newRow >= state.gridSize) continue;
        if (newCol < 0 || newCol >= state.gridSize) continue;
        
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
    const config = LEVEL_SETTINGS[state.difficulty];
    const symbolCount = config.symbolCount + Math.floor((state.round - 1) / 3);
    
    const availablePositions = state.path.slice(1, -1);
    const shuffled = [...availablePositions].sort(() => Math.random() - 0.5);
    const symbolPositions = shuffled.slice(0, Math.min(symbolCount, shuffled.length));
    
    state.pathSymbols = [];
    const usedSymbols = new Set();
    
    symbolPositions.forEach((pos) => {
        let symbolIndex;
        do {
            symbolIndex = Math.floor(Math.random() * MAZE_SYMBOLS.length);
        } while (usedSymbols.has(symbolIndex) && usedSymbols.size < MAZE_SYMBOLS.length);
        
        usedSymbols.add(symbolIndex);
        const symbol = MAZE_SYMBOLS[symbolIndex];
        
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
    const config = LEVEL_SETTINGS[state.difficulty];
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
    
    // Pfad ausblenden
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
            cell.classList.add('path-wrong');
            setTimeout(() => cell.classList.remove('path-wrong'), 400);
            return;
        }
    } else {
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
            
            if (state.pathSymbols.length > 0) {
                askSymbolQuestion();
            } else {
                roundComplete(true);
            }
        }
    } else {
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
    const config = LEVEL_SETTINGS[state.difficulty];
    
    if (state.questionsAsked >= config.symbolQuestions || state.questionsAsked >= state.pathSymbols.length) {
        roundComplete(true);
        return;
    }
    
    state.phase = 'symbolQuestion';
    
    const symbolData = state.pathSymbols[state.questionsAsked];
    
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
    
    const otherSymbols = MAZE_SYMBOLS.filter(s => s.icon !== correctSymbol.icon);
    const shuffled = otherSymbols.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
        options.push({ ...shuffled[i], correct: false, text: shuffled[i].name });
    }
    
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
    
    option.classList.add(isCorrect ? 'correct' : 'wrong');
    
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
    
    const config = LEVEL_SETTINGS[state.difficulty];
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
    const basePoints = state.path.length * SCORE_CONFIG.pointsPerPathStep;
    const comboBonus = state.combo * SCORE_CONFIG.comboMultiplier;
    const symbolBonus = state.totalSymbolsCorrect * SCORE_CONFIG.symbolBonus;
    const roundBonus = state.round * SCORE_CONFIG.roundBonus;
    const totalPoints = success ? basePoints + comboBonus + symbolBonus + roundBonus : 0;
    
    state.score += totalPoints;
    
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
    
    const config = LEVEL_SETTINGS[state.difficulty];
    const livesContainer = document.getElementById('maze-lives-container');
    livesContainer.innerHTML = '';
    for (let i = 0; i < config.lives; i++) {
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