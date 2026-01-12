/* =========================================
   Sudoku Spiel
   Klassisches 9x9 Sudoku mit 10 Schwierigkeitsstufen
   ========================================= */

/* -----------------------------------------
   KONFIGURATION - Hier Werte anpassen!
   ----------------------------------------- */

// ÄNDERUNG: 10 Schwierigkeitsstufen
const LEVEL_SETTINGS = {
    // remove: Anzahl entfernter Zellen (mehr = schwieriger)
    // hints: Anzahl verfügbarer Hinweise
    
    1:  { name: 'Level 1',  remove: 25, hints: 10 },
    2:  { name: 'Level 2',  remove: 30, hints: 8 },
    3:  { name: 'Level 3',  remove: 35, hints: 6 },
    4:  { name: 'Level 4',  remove: 38, hints: 5 },
    5:  { name: 'Level 5',  remove: 42, hints: 4 },
    6:  { name: 'Level 6',  remove: 46, hints: 3 },
    7:  { name: 'Level 7',  remove: 50, hints: 2 },
    8:  { name: 'Level 8',  remove: 53, hints: 2 },
    9:  { name: 'Level 9',  remove: 56, hints: 1 },
    10: { name: 'Level 10', remove: 60, hints: 0 }
};

/* -----------------------------------------
   ENDE KONFIGURATION
   ----------------------------------------- */

// Spielzustand
let state = {
    solution: [],
    puzzle: [],
    userGrid: [],
    initial: [],
    selectedCell: null,
    difficulty: 1,
    hints: 10,
    errors: 0,
    startTime: null,
    timer: null,
    elapsed: 0,
    isComplete: false,
    showErrors: false  // NEU: Fehleranzeige an/aus
};

/**
 * Initialisiert das Sudoku-Modul
 */
export function init() {
    renderSudokuScreen();
    setupEventListeners();
}

/**
 * Rendert den Sudoku-Bildschirm
 */
function renderSudokuScreen() {
    const app = document.getElementById('app');
    
    if (document.getElementById('sudoku-screen')) return;
    
    const sudokuScreen = document.createElement('section');
    sudokuScreen.id = 'sudoku-screen';
    sudokuScreen.className = 'screen';
    
    // ÄNDERUNG: Neues Layout mit Level-Grid
    sudokuScreen.innerHTML = `
        <div class="sudoku-container">
            <!-- Schwierigkeitsauswahl -->
            <div id="sudoku-menu" class="sudoku-menu">
                <div class="sudoku-header">
                    <div class="sudoku-logo">
                        <i class="fas fa-table-cells"></i>
                    </div>
                    <h2>Sudoku</h2>
                    <p>Klassisches Zahlenrätsel</p>
                </div>
                
                <div class="sudoku-level-section">
                    <h3>Schwierigkeitsstufe wählen</h3>
                    <div class="sudoku-level-grid">
                        ${Array.from({length: 10}, (_, i) => `
                            <button class="sudoku-level-btn" data-level="${i + 1}">${i + 1}</button>
                        `).join('')}
                    </div>
                    <div class="sudoku-level-info">
                        <span id="sudoku-level-cells">25 leere Felder</span>
                        <span id="sudoku-level-hints">10 Hinweise</span>
                    </div>
                </div>
                
                <button id="btn-sudoku-start" class="btn-primary btn-large">
                    <i class="fas fa-play"></i>
                    Spiel starten
                </button>
            </div>
            
            <!-- Spielbereich -->
            <div id="sudoku-game" class="sudoku-game hidden">
                <div class="sudoku-stats">
                    <div class="sudoku-stat">
                        <i class="fas fa-clock"></i>
                        <span id="sudoku-timer">00:00</span>
                    </div>
                    <div class="sudoku-stat">
                        <i class="fas fa-layer-group"></i>
                        <span>Level <span id="sudoku-level-display">1</span></span>
                    </div>
                    <div class="sudoku-stat">
                        <i class="fas fa-lightbulb"></i>
                        <span id="sudoku-hints">10</span>
                    </div>
                </div>
                
                <div id="sudoku-board" class="sudoku-board">
                    <!-- 9x9 Grid wird dynamisch generiert -->
                </div>
                
                <div class="sudoku-numpad">
                    <button class="sudoku-num-btn" data-num="1">1</button>
                    <button class="sudoku-num-btn" data-num="2">2</button>
                    <button class="sudoku-num-btn" data-num="3">3</button>
                    <button class="sudoku-num-btn" data-num="4">4</button>
                    <button class="sudoku-num-btn" data-num="5">5</button>
                    <button class="sudoku-num-btn" data-num="6">6</button>
                    <button class="sudoku-num-btn" data-num="7">7</button>
                    <button class="sudoku-num-btn" data-num="8">8</button>
                    <button class="sudoku-num-btn" data-num="9">9</button>
                </div>
                
                <div class="sudoku-actions">
                    <button id="btn-sudoku-hint" class="sudoku-action-btn">
                        <i class="fas fa-lightbulb"></i>
                        Hinweis
                    </button>
                    <button id="btn-sudoku-erase" class="sudoku-action-btn">
                        <i class="fas fa-eraser"></i>
                        Löschen
                    </button>
                    <button id="btn-sudoku-check" class="sudoku-action-btn" title="Fehler anzeigen">
                        <i class="fas fa-eye"></i>
                        Prüfen
                    </button>
                    <button id="btn-sudoku-new" class="sudoku-action-btn">
                        <i class="fas fa-redo"></i>
                        Neu
                    </button>
                </div>
            </div>
            
            <!-- Gewonnen-Anzeige -->
            <div id="sudoku-complete" class="sudoku-complete hidden">
                <div class="complete-content">
                    <div class="complete-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h2>Geschafft!</h2>
                    <div class="complete-stats">
                        <div class="complete-stat">
                            <span class="stat-label">Zeit</span>
                            <span class="stat-value" id="complete-time">00:00</span>
                        </div>
                        <div class="complete-stat">
                            <span class="stat-label">Level</span>
                            <span class="stat-value" id="complete-level">1</span>
                        </div>
                        <div class="complete-stat">
                            <span class="stat-label">Hinweise</span>
                            <span class="stat-value" id="complete-hints-used">0</span>
                        </div>
                    </div>
                    <button id="btn-sudoku-menu" class="btn-primary btn-large">
                        <i class="fas fa-home"></i>
                        Neues Spiel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const loadingOverlay = document.getElementById('loading-overlay');
    app.insertBefore(sudokuScreen, loadingOverlay);
    
    addSudokuStyles();
}

/**
 * Fügt Sudoku-spezifische Styles hinzu
 */
function addSudokuStyles() {
    if (document.getElementById('sudoku-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'sudoku-styles';
    style.textContent = `
        /* Sudoku Container */
        .sudoku-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
        
        /* Menü */
        .sudoku-menu {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xl);
            padding: var(--spacing-lg);
        }
        
        .sudoku-header {
            text-align: center;
        }
        
        .sudoku-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto var(--spacing-md);
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            border-radius: var(--radius-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }
        
        .sudoku-logo i {
            font-size: var(--font-size-4xl);
            color: white;
        }
        
        .sudoku-header h2 {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            margin-bottom: var(--spacing-xs);
            color: var(--color-text);
        }
        
        .sudoku-header p {
            color: var(--color-text-light);
            font-weight: 500;
        }
        
        /* ÄNDERUNG: Level-Auswahl */
        .sudoku-level-section {
            width: 100%;
            max-width: 320px;
            text-align: center;
        }
        
        .sudoku-level-section h3 {
            font-size: var(--font-size-base);
            font-weight: 600;
            margin-bottom: var(--spacing-md);
            color: var(--color-text);
        }
        
        .sudoku-level-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-md);
        }
        
        .sudoku-level-btn {
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
        
        .sudoku-level-btn:hover {
            border-color: #6366f1;
        }
        
        .sudoku-level-btn.selected {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            border-color: transparent;
            color: white;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5);
            transform: scale(1.05);
        }
        
        .sudoku-level-btn:active {
            transform: scale(0.95);
        }
        
        .sudoku-level-info {
            display: flex;
            justify-content: center;
            gap: var(--spacing-lg);
            font-size: var(--font-size-sm);
            color: var(--color-text-light);
            font-weight: 500;
        }
        
        .sudoku-level-info span {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }
        
        #btn-sudoku-start {
            width: 100%;
            max-width: 320px;
        }
        
        /* Spielbereich */
        .sudoku-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-sm);
        }
        
        .sudoku-game.hidden {
            display: none;
        }
        
        .sudoku-stats {
            display: flex;
            justify-content: center;
            gap: var(--spacing-xl);
            width: 100%;
        }
        
        .sudoku-stat {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: var(--font-size-base);
            font-weight: 700;
            color: var(--color-text);
        }
        
        .sudoku-stat i {
            color: #6366f1;
        }
        
        /* Sudoku Board */
        .sudoku-board {
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            gap: 1px;
            background-color: #1e1b4b;
            border: 3px solid #1e1b4b;
            border-radius: var(--radius-md);
            width: 100%;
            max-width: 360px;
            aspect-ratio: 1;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        
        .sudoku-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--color-bg-card);
            font-size: var(--font-size-xl);
            font-weight: 700;
            cursor: pointer;
            transition: background-color 0.15s;
            user-select: none;
            -webkit-user-select: none;
            color: var(--color-text);
        }
        
        .sudoku-cell:active {
            background-color: var(--color-border);
        }
        
        .sudoku-cell.selected {
            background-color: #c7d2fe;
        }
        
        .sudoku-cell.highlighted {
            background-color: #e0e7ff;
        }
        
        /* ÄNDERUNG: Initiale Zellen dunkler */
        .sudoku-cell.initial {
            color: #1e1b4b;
            font-weight: 800;
            background-color: #f1f5f9;
        }
        
        /* ÄNDERUNG: User-Input ohne Farbmarkierung */
        .sudoku-cell.user-input {
            color: #4f46e5;
        }
        
        /* ÄNDERUNG: Fehler nur bei aktivierter Prüfung */
        .sudoku-cell.error-visible {
            color: #dc2626;
            background-color: #fee2e2;
        }
        
        /* Hinweis bleibt sichtbar */
        .sudoku-cell.hint {
            color: #16a34a;
            animation: hintPulse 0.5s ease;
        }
        
        @keyframes hintPulse {
            0%, 100% { background-color: var(--color-bg-card); }
            50% { background-color: #dcfce7; }
        }
        
        /* 3x3 Block-Grenzen */
        .sudoku-cell:nth-child(3n) { border-right: 2px solid #1e1b4b; }
        .sudoku-cell:nth-child(9n) { border-right: none; }
        .sudoku-cell:nth-child(n+19):nth-child(-n+27),
        .sudoku-cell:nth-child(n+46):nth-child(-n+54) {
            border-bottom: 2px solid #1e1b4b;
        }
        
        /* Numpad */
        .sudoku-numpad {
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            gap: var(--spacing-xs);
            width: 100%;
            max-width: 360px;
        }
        
        .sudoku-num-btn {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--font-size-xl);
            font-weight: 700;
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text);
            transition: all 0.15s;
        }
        
        .sudoku-num-btn:active {
            background: #6366f1;
            border-color: #6366f1;
            color: white;
            transform: scale(0.95);
        }
        
        .sudoku-num-btn.completed {
            opacity: 0.3;
            pointer-events: none;
        }
        
        /* Aktionen */
        .sudoku-actions {
            display: flex;
            gap: var(--spacing-sm);
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .sudoku-action-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-md);
            font-size: var(--font-size-sm);
            font-weight: 600;
            color: var(--color-text);
            transition: all 0.15s;
        }
        
        .sudoku-action-btn:active {
            background: var(--color-border);
            transform: scale(0.95);
        }
        
        .sudoku-action-btn:disabled {
            opacity: 0.4;
            pointer-events: none;
        }
        
        /* NEU: Prüfen-Button aktiv */
        .sudoku-action-btn.check-active {
            background: #fef3c7;
            border-color: #f59e0b;
            color: #92400e;
        }
        
        .sudoku-action-btn.check-active i {
            color: #f59e0b;
        }
        
        /* Gewonnen */
        .sudoku-complete {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-xl);
            text-align: center;
        }
        
        .sudoku-complete.hidden {
            display: none;
        }
        
        .complete-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xl);
        }
        
        .complete-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 30px rgba(251, 191, 36, 0.4);
            animation: bounce 1s ease infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .complete-icon i {
            font-size: 3rem;
            color: white;
        }
        
        .complete-content h2 {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            color: var(--color-text);
        }
        
        .complete-stats {
            display: flex;
            gap: var(--spacing-lg);
        }
        
        .complete-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-md);
            background: var(--color-bg-card);
            border-radius: var(--radius-md);
            min-width: 80px;
        }
        
        .complete-stat .stat-label {
            font-size: var(--font-size-xs);
            color: var(--color-text-muted);
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .complete-stat .stat-value {
            font-size: var(--font-size-lg);
            font-weight: 700;
            color: #6366f1;
        }
        
        /* Dark Mode */
        [data-theme="dark"] .sudoku-board {
            background-color: #0f0a1e;
            border-color: #0f0a1e;
        }
        
        [data-theme="dark"] .sudoku-cell.initial {
            background-color: #1e1b4b;
            color: #e2e8f0;
        }
        
        [data-theme="dark"] .sudoku-cell.selected {
            background-color: #4338ca;
        }
        
        [data-theme="dark"] .sudoku-cell.highlighted {
            background-color: #3730a3;
        }
        
        [data-theme="dark"] .sudoku-cell.error-visible {
            background-color: #7f1d1d;
            color: #fca5a5;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener
 */
function setupEventListeners() {
    // ÄNDERUNG: Level-Buttons
    document.querySelectorAll('.sudoku-level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sudoku-level-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.difficulty = parseInt(btn.dataset.level);
            updateLevelInfo();
        });
    });
    
    // Standard: Level 1 ausgewählt
    const firstLevelBtn = document.querySelector('.sudoku-level-btn[data-level="1"]');
    if (firstLevelBtn) {
        firstLevelBtn.classList.add('selected');
        state.difficulty = 1;
        updateLevelInfo();
    }
    
    // NEU: Start-Button
    document.getElementById('btn-sudoku-start').addEventListener('click', () => {
        startGame(state.difficulty);
    });
    
    // Numpad
    document.querySelector('.sudoku-numpad').addEventListener('click', (e) => {
        const btn = e.target.closest('.sudoku-num-btn');
        if (btn && !btn.classList.contains('completed')) {
            enterNumber(parseInt(btn.dataset.num));
        }
    });
    
    // Aktionen
    document.getElementById('btn-sudoku-hint').addEventListener('click', useHint);
    document.getElementById('btn-sudoku-erase').addEventListener('click', eraseCell);
    document.getElementById('btn-sudoku-check').addEventListener('click', toggleErrorCheck);
    document.getElementById('btn-sudoku-new').addEventListener('click', showMenu);
    document.getElementById('btn-sudoku-menu').addEventListener('click', showMenu);
    
    // Keyboard-Support
    document.addEventListener('keydown', handleKeyboard);
}

/**
 * Aktualisiert Level-Info Anzeige
 */
function updateLevelInfo() {
    const config = LEVEL_SETTINGS[state.difficulty];
    document.getElementById('sudoku-level-cells').textContent = `${config.remove} leere Felder`;
    document.getElementById('sudoku-level-hints').textContent = `${config.hints} Hinweise`;
}

/**
 * Zeigt das Menü
 */
function showMenu() {
    stopTimer();
    state.showErrors = false;
    
    document.getElementById('sudoku-menu').classList.remove('hidden');
    document.getElementById('sudoku-game').classList.add('hidden');
    document.getElementById('sudoku-complete').classList.add('hidden');
}

/**
 * Startet ein neues Spiel
 * @param {number} difficulty - Level 1-10
 */
function startGame(difficulty) {
    const config = LEVEL_SETTINGS[difficulty];
    
    state.difficulty = difficulty;
    state.hints = config.hints;
    state.hintsUsed = 0;
    state.errors = 0;
    state.elapsed = 0;
    state.isComplete = false;
    state.selectedCell = null;
    state.showErrors = false;
    
    // Puzzle generieren
    generatePuzzle();
    
    // UI aktualisieren
    document.getElementById('sudoku-menu').classList.add('hidden');
    document.getElementById('sudoku-game').classList.remove('hidden');
    document.getElementById('sudoku-complete').classList.add('hidden');
    
    document.getElementById('sudoku-hints').textContent = state.hints;
    document.getElementById('sudoku-level-display').textContent = difficulty;
    
    // Prüfen-Button zurücksetzen
    document.getElementById('btn-sudoku-check').classList.remove('check-active');
    
    // Hint-Button aktualisieren
    document.getElementById('btn-sudoku-hint').disabled = state.hints === 0;
    
    renderBoard();
    startTimer();
}

/**
 * Generiert ein neues Sudoku-Puzzle
 */
function generatePuzzle() {
    state.solution = Array(9).fill(null).map(() => Array(9).fill(0));
    
    solveSudoku(state.solution);
    
    state.puzzle = state.solution.map(row => [...row]);
    state.userGrid = state.solution.map(row => [...row]);
    state.initial = Array(9).fill(null).map(() => Array(9).fill(false));
    
    const config = LEVEL_SETTINGS[state.difficulty];
    const toRemove = config.remove;
    let removed = 0;
    
    while (removed < toRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (state.puzzle[row][col] !== 0) {
            state.puzzle[row][col] = 0;
            state.userGrid[row][col] = 0;
            removed++;
        }
    }
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            state.initial[row][col] = state.puzzle[row][col] !== 0;
        }
    }
}

/**
 * Löst ein Sudoku mit Backtracking
 */
function solveSudoku(grid) {
    const empty = findEmptyCell(grid);
    if (!empty) return true;
    
    const [row, col] = empty;
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    for (const num of numbers) {
        if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (solveSudoku(grid)) {
                return true;
            }
            
            grid[row][col] = 0;
        }
    }
    
    return false;
}

/**
 * Findet eine leere Zelle
 */
function findEmptyCell(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

/**
 * Prüft ob eine Zahl an einer Position gültig ist
 */
function isValidPlacement(grid, row, col, num) {
    if (grid[row].includes(num)) return false;
    
    for (let r = 0; r < 9; r++) {
        if (grid[r][col] === num) return false;
    }
    
    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;
    
    for (let r = blockRow; r < blockRow + 3; r++) {
        for (let c = blockCol; c < blockCol + 3; c++) {
            if (grid[r][c] === num) return false;
        }
    }
    
    return true;
}

/**
 * Mischt ein Array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Rendert das Spielbrett
 */
function renderBoard() {
    const board = document.getElementById('sudoku-board');
    board.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const value = state.userGrid[row][col];
            
            if (value !== 0) {
                cell.textContent = value;
            }
            
            if (state.initial[row][col]) {
                cell.classList.add('initial');
            } else if (value !== 0) {
                cell.classList.add('user-input');
                // ÄNDERUNG: Fehler nur anzeigen wenn showErrors aktiv
                if (state.showErrors && value !== state.solution[row][col]) {
                    cell.classList.add('error-visible');
                }
            }
            
            cell.addEventListener('click', () => selectCell(row, col));
            
            board.appendChild(cell);
        }
    }
    
    updateCompletedNumbers();
}

/**
 * Wählt eine Zelle aus
 */
function selectCell(row, col) {
    if (state.isComplete) return;
    
    state.selectedCell = { row, col };
    
    document.querySelectorAll('.sudoku-cell').forEach(cell => {
        cell.classList.remove('selected', 'highlighted');
    });
    
    const selectedEl = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );
    selectedEl.classList.add('selected');
    
    const value = state.userGrid[row][col];
    if (value !== 0) {
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            if (state.userGrid[r][c] === value) {
                cell.classList.add('highlighted');
            }
        });
    }
}

/**
 * Gibt eine Zahl ein
 */
function enterNumber(num) {
    if (!state.selectedCell || state.isComplete) return;
    
    const { row, col } = state.selectedCell;
    
    if (state.initial[row][col]) return;
    
    state.userGrid[row][col] = num;
    
    const cell = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );
    cell.textContent = num;
    cell.classList.add('user-input');
    cell.classList.remove('error-visible', 'hint');
    
    // ÄNDERUNG: Fehler nur zählen, aber nicht anzeigen (außer showErrors aktiv)
    if (num !== state.solution[row][col]) {
        state.errors++;
        if (state.showErrors) {
            cell.classList.add('error-visible');
        }
    }
    
    selectCell(row, col);
    updateCompletedNumbers();
    
    checkCompletion();
}

/**
 * Löscht eine Zelle
 */
function eraseCell() {
    if (!state.selectedCell || state.isComplete) return;
    
    const { row, col } = state.selectedCell;
    
    if (state.initial[row][col]) return;
    
    state.userGrid[row][col] = 0;
    
    const cell = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );
    cell.textContent = '';
    cell.classList.remove('user-input', 'error-visible', 'hint');
    
    updateCompletedNumbers();
}

/**
 * NEU: Fehlerprüfung an/aus schalten
 */
function toggleErrorCheck() {
    state.showErrors = !state.showErrors;
    
    const checkBtn = document.getElementById('btn-sudoku-check');
    checkBtn.classList.toggle('check-active', state.showErrors);
    
    // Board neu rendern mit/ohne Fehleranzeige
    updateErrorDisplay();
}

/**
 * NEU: Aktualisiert Fehleranzeige
 */
function updateErrorDisplay() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.querySelector(
                `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
            );
            
            if (!state.initial[row][col] && state.userGrid[row][col] !== 0) {
                const isWrong = state.userGrid[row][col] !== state.solution[row][col];
                
                if (state.showErrors && isWrong) {
                    cell.classList.add('error-visible');
                } else {
                    cell.classList.remove('error-visible');
                }
            }
        }
    }
}

/**
 * Verwendet einen Hinweis
 */
function useHint() {
    if (state.hints <= 0 || state.isComplete) return;
    
    const emptyCells = [];
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (!state.initial[row][col] && 
                state.userGrid[row][col] !== state.solution[row][col]) {
                emptyCells.push({ row, col });
            }
        }
    }
    
    if (emptyCells.length === 0) return;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;
    
    state.userGrid[row][col] = state.solution[row][col];
    state.hints--;
    state.hintsUsed = (state.hintsUsed || 0) + 1;
    
    document.getElementById('sudoku-hints').textContent = state.hints;
    
    if (state.hints === 0) {
        document.getElementById('btn-sudoku-hint').disabled = true;
    }
    
    const cell = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );
    cell.textContent = state.solution[row][col];
    cell.classList.remove('error-visible');
    cell.classList.add('user-input', 'hint');
    
    selectCell(row, col);
    updateCompletedNumbers();
    
    checkCompletion();
}

/**
 * Aktualisiert die Anzeige vollständiger Zahlen
 */
function updateCompletedNumbers() {
    const counts = Array(10).fill(0);
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const num = state.userGrid[row][col];
            if (num !== 0 && num === state.solution[row][col]) {
                counts[num]++;
            }
        }
    }
    
    document.querySelectorAll('.sudoku-num-btn').forEach(btn => {
        const num = parseInt(btn.dataset.num);
        btn.classList.toggle('completed', counts[num] >= 9);
    });
}

/**
 * Prüft ob das Puzzle gelöst ist
 */
function checkCompletion() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (state.userGrid[row][col] !== state.solution[row][col]) {
                return;
            }
        }
    }
    
    state.isComplete = true;
    stopTimer();
    showCompletion();
}

/**
 * Zeigt den Gewonnen-Screen
 */
function showCompletion() {
    document.getElementById('sudoku-game').classList.add('hidden');
    document.getElementById('sudoku-complete').classList.remove('hidden');
    
    document.getElementById('complete-time').textContent = formatTime(state.elapsed);
    document.getElementById('complete-level').textContent = state.difficulty;
    document.getElementById('complete-hints-used').textContent = state.hintsUsed || 0;
    
    saveSudokuResult();
}

/**
 * Speichert das Sudoku-Ergebnis
 */
function saveSudokuResult() {
    try {
        const key = 'brainfit_sudoku';
        const stored = localStorage.getItem(key);
        const data = stored ? JSON.parse(stored) : { games: 0, bestTimes: {} };
        
        data.games++;
        
        const levelKey = `level_${state.difficulty}`;
        const currentBest = data.bestTimes[levelKey] || Infinity;
        if (state.elapsed < currentBest) {
            data.bestTimes[levelKey] = state.elapsed;
        }
        
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.log('Sudoku-Ergebnis konnte nicht gespeichert werden');
    }
}

/**
 * Startet den Timer
 */
function startTimer() {
    state.startTime = Date.now();
    
    state.timer = setInterval(() => {
        state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        document.getElementById('sudoku-timer').textContent = formatTime(state.elapsed);
    }, 1000);
}

/**
 * Stoppt den Timer
 */
function stopTimer() {
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
}

/**
 * Formatiert Zeit in mm:ss
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Keyboard-Handler
 */
function handleKeyboard(e) {
    const sudokuScreen = document.getElementById('sudoku-screen');
    if (!sudokuScreen || !sudokuScreen.classList.contains('active')) return;
    
    if (!state.selectedCell || state.isComplete) return;
    
    const { row, col } = state.selectedCell;
    
    if (e.key >= '1' && e.key <= '9') {
        enterNumber(parseInt(e.key));
    }
    
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        eraseCell();
    }
    
    if (e.key === 'ArrowUp' && row > 0) selectCell(row - 1, col);
    if (e.key === 'ArrowDown' && row < 8) selectCell(row + 1, col);
    if (e.key === 'ArrowLeft' && col > 0) selectCell(row, col - 1);
    if (e.key === 'ArrowRight' && col < 8) selectCell(row, col + 1);
}

/**
 * Zeigt den Sudoku-Screen
 */
export function show() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const sudokuScreen = document.getElementById('sudoku-screen');
    sudokuScreen.classList.add('active');
    
    document.getElementById('header-title').textContent = 'Sudoku';
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-stats').classList.add('hidden');
}

/**
 * Versteckt den Sudoku-Screen
 */
export function hide() {
    stopTimer();
    const sudokuScreen = document.getElementById('sudoku-screen');
    if (sudokuScreen) {
        sudokuScreen.classList.remove('active');
    }
}