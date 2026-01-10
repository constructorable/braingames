/* =========================================
   Sudoku Spiel
   Klassisches 9x9 Sudoku mit 3 Schwierigkeitsstufen
   ========================================= */

// Schwierigkeitsstufen (Anzahl entfernter Zellen)
const DIFFICULTY = {
    easy: { name: 'Leicht', remove: 35, hints: 5 },
    medium: { name: 'Mittel', remove: 45, hints: 3 },
    hard: { name: 'Schwer', remove: 55, hints: 1 }
};

// Spielzustand
let state = {
    solution: [],       // Komplette Lösung
    puzzle: [],         // Aktuelles Puzzle (mit Lücken)
    userGrid: [],       // Nutzereingaben
    initial: [],        // Ursprüngliche vorgegebene Zellen
    selectedCell: null, // { row, col }
    difficulty: 'easy',
    hints: 5,
    errors: 0,
    startTime: null,
    timer: null,
    elapsed: 0,
    isComplete: false
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
    
    // Prüfen ob Sudoku-Screen bereits existiert
    if (document.getElementById('sudoku-screen')) return;
    
    const sudokuScreen = document.createElement('section');
    sudokuScreen.id = 'sudoku-screen';
    sudokuScreen.className = 'screen';
    
    sudokuScreen.innerHTML = `
        <div class="sudoku-container">
            <!-- Schwierigkeitsauswahl -->
            <div id="sudoku-menu" class="sudoku-menu">
                <div class="sudoku-header">
                    <div class="sudoku-logo">
                        <i class="fas fa-table-cells"></i>
                    </div>
                    <h2>Sudoku</h2>
                    <p>Wähle deine Schwierigkeit</p>
                </div>
                
                <div class="difficulty-buttons">
                    <button class="difficulty-btn" data-difficulty="easy">
                        <i class="fas fa-seedling"></i>
                        <span>Leicht</span>
                        <small>35 leere Felder • 5 Hinweise</small>
                    </button>
                    <button class="difficulty-btn" data-difficulty="medium">
                        <i class="fas fa-fire"></i>
                        <span>Mittel</span>
                        <small>45 leere Felder • 3 Hinweise</small>
                    </button>
                    <button class="difficulty-btn" data-difficulty="hard">
                        <i class="fas fa-skull"></i>
                        <span>Schwer</span>
                        <small>55 leere Felder • 1 Hinweis</small>
                    </button>
                </div>
            </div>
            
            <!-- Spielbereich -->
            <div id="sudoku-game" class="sudoku-game hidden">
                <div class="sudoku-stats">
                    <div class="sudoku-stat">
                        <i class="fas fa-clock"></i>
                        <span id="sudoku-timer">00:00</span>
                    </div>
                    <div class="sudoku-stat">
                        <i class="fas fa-lightbulb"></i>
                        <span id="sudoku-hints">5</span>
                    </div>
                    <div class="sudoku-stat">
                        <i class="fas fa-times-circle"></i>
                        <span id="sudoku-errors">0</span>
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
                            <span class="stat-label">Fehler</span>
                            <span class="stat-value" id="complete-errors">0</span>
                        </div>
                        <div class="complete-stat">
                            <span class="stat-label">Schwierigkeit</span>
                            <span class="stat-value" id="complete-difficulty">Leicht</span>
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
    
    // Vor dem Loading-Overlay einfügen
    const loadingOverlay = document.getElementById('loading-overlay');
    app.insertBefore(sudokuScreen, loadingOverlay);
    
    // Sudoku-Styles hinzufügen
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
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            border-radius: var(--radius-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-lg);
        }
        
        .sudoku-logo i {
            font-size: var(--font-size-4xl);
            color: white;
        }
        
        .sudoku-header h2 {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            margin-bottom: var(--spacing-xs);
        }
        
        .sudoku-header p {
            color: var(--color-text-light);
        }
        
        .difficulty-buttons {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            width: 100%;
            max-width: 320px;
        }
        
        .difficulty-btn {
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
        
        .difficulty-btn:active {
            transform: scale(0.98);
            border-color: var(--color-primary);
        }
        
        .difficulty-btn i {
            font-size: var(--font-size-2xl);
            width: 40px;
            text-align: center;
        }
        
        .difficulty-btn[data-difficulty="easy"] i { color: #22c55e; }
        .difficulty-btn[data-difficulty="medium"] i { color: #f59e0b; }
        .difficulty-btn[data-difficulty="hard"] i { color: #ef4444; }
        
        .difficulty-btn span {
            font-size: var(--font-size-lg);
            font-weight: 600;
            display: block;
        }
        
        .difficulty-btn small {
            font-size: var(--font-size-sm);
            color: var(--color-text-light);
            font-weight: 400;
        }
        
        /* Spielbereich */
        .sudoku-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
            padding: var(--spacing-md);
        }
        
        .sudoku-game.hidden {
            display: none;
        }
        
        .sudoku-stats {
            display: flex;
            justify-content: center;
            gap: var(--spacing-xl);
        }
        
        .sudoku-stat {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: var(--font-size-base);
            font-weight: 600;
            color: var(--color-text-light);
        }
        
        .sudoku-stat i {
            color: var(--color-primary);
        }
        
        /* Sudoku Board */
        .sudoku-board {
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            gap: 1px;
            background-color: var(--color-text);
            border: 3px solid var(--color-text);
            border-radius: var(--radius-md);
            width: 100%;
            max-width: 360px;
            aspect-ratio: 1;
        }
        
        .sudoku-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--color-bg-card);
            font-size: var(--font-size-xl);
            font-weight: 600;
            cursor: pointer;
            transition: background-color var(--transition-fast);
            user-select: none;
            -webkit-user-select: none;
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
        
        .sudoku-cell.initial {
            color: var(--color-text);
            font-weight: 700;
        }
        
        .sudoku-cell.user-input {
            color: var(--color-primary);
        }
        
        .sudoku-cell.error {
            color: var(--color-error);
            background-color: #fecaca;
        }
        
        .sudoku-cell.hint {
            color: var(--color-success);
            animation: hintPulse 0.5s ease;
        }
        
        @keyframes hintPulse {
            0%, 100% { background-color: var(--color-bg-card); }
            50% { background-color: #bbf7d0; }
        }
        
        /* 3x3 Block-Grenzen */
        .sudoku-cell:nth-child(3n) { border-right: 2px solid var(--color-text); }
        .sudoku-cell:nth-child(9n) { border-right: none; }
        .sudoku-cell:nth-child(n+19):nth-child(-n+27),
        .sudoku-cell:nth-child(n+46):nth-child(-n+54) {
            border-bottom: 2px solid var(--color-text);
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
            font-weight: 600;
            background: var(--color-bg-card);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-sm);
            transition: all var(--transition-fast);
        }
        
        .sudoku-num-btn:active {
            background: var(--color-primary);
            color: white;
            transform: scale(0.95);
        }
        
        .sudoku-num-btn.completed {
            opacity: 0.4;
            pointer-events: none;
        }
        
        /* Aktionen */
        .sudoku-actions {
            display: flex;
            gap: var(--spacing-md);
        }
        
        .sudoku-action-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-md);
            font-size: var(--font-size-sm);
            font-weight: 600;
            transition: all var(--transition-fast);
        }
        
        .sudoku-action-btn:active {
            background: var(--color-border);
        }
        
        .sudoku-action-btn:disabled {
            opacity: 0.4;
            pointer-events: none;
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
            box-shadow: var(--shadow-lg);
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
        }
        
        .complete-stat .stat-value {
            font-size: var(--font-size-lg);
            font-weight: 700;
            color: var(--color-primary);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener
 */
function setupEventListeners() {
    // Schwierigkeitsauswahl
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            startGame(btn.dataset.difficulty);
        });
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
    document.getElementById('btn-sudoku-new').addEventListener('click', showMenu);
    document.getElementById('btn-sudoku-menu').addEventListener('click', showMenu);
    
    // Keyboard-Support
    document.addEventListener('keydown', handleKeyboard);
}

/**
 * Zeigt das Menü
 */
function showMenu() {
    stopTimer();
    
    document.getElementById('sudoku-menu').classList.remove('hidden');
    document.getElementById('sudoku-game').classList.add('hidden');
    document.getElementById('sudoku-complete').classList.add('hidden');
}

/**
 * Startet ein neues Spiel
 */
function startGame(difficulty) {
    state.difficulty = difficulty;
    state.hints = DIFFICULTY[difficulty].hints;
    state.errors = 0;
    state.elapsed = 0;
    state.isComplete = false;
    state.selectedCell = null;
    
    // Puzzle generieren
    generatePuzzle();
    
    // UI aktualisieren
    document.getElementById('sudoku-menu').classList.add('hidden');
    document.getElementById('sudoku-game').classList.remove('hidden');
    document.getElementById('sudoku-complete').classList.add('hidden');
    
    document.getElementById('sudoku-hints').textContent = state.hints;
    document.getElementById('sudoku-errors').textContent = state.errors;
    
    renderBoard();
    startTimer();
}

/**
 * Generiert ein neues Sudoku-Puzzle
 */
function generatePuzzle() {
    // Leeres 9x9 Grid erstellen
    state.solution = Array(9).fill(null).map(() => Array(9).fill(0));
    
    // Lösung generieren
    solveSudoku(state.solution);
    
    // Puzzle erstellen (Kopie der Lösung)
    state.puzzle = state.solution.map(row => [...row]);
    state.userGrid = state.solution.map(row => [...row]);
    state.initial = Array(9).fill(null).map(() => Array(9).fill(false));
    
    // Zellen entfernen basierend auf Schwierigkeit
    const toRemove = DIFFICULTY[state.difficulty].remove;
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
    
    // Markiere initiale Zellen
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
    // Zeile prüfen
    if (grid[row].includes(num)) return false;
    
    // Spalte prüfen
    for (let r = 0; r < 9; r++) {
        if (grid[r][col] === num) return false;
    }
    
    // 3x3 Block prüfen
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
    
    // Alle Markierungen entfernen
    document.querySelectorAll('.sudoku-cell').forEach(cell => {
        cell.classList.remove('selected', 'highlighted');
    });
    
    // Ausgewählte Zelle markieren
    const selectedEl = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );
    selectedEl.classList.add('selected');
    
    // Gleiche Zahlen hervorheben
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
    
    // Initiale Zellen können nicht geändert werden
    if (state.initial[row][col]) return;
    
    // Zahl eintragen
    state.userGrid[row][col] = num;
    
    // Zelle aktualisieren
    const cell = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );
    cell.textContent = num;
    cell.classList.add('user-input');
    cell.classList.remove('error', 'hint');
    
    // Prüfen ob korrekt
    if (num !== state.solution[row][col]) {
        cell.classList.add('error');
        state.errors++;
        document.getElementById('sudoku-errors').textContent = state.errors;
    }
    
    // Hervorhebungen aktualisieren
    selectCell(row, col);
    updateCompletedNumbers();
    
    // Prüfen ob fertig
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
    cell.classList.remove('user-input', 'error', 'hint');
    
    updateCompletedNumbers();
}

/**
 * Verwendet einen Hinweis
 */
function useHint() {
    if (state.hints <= 0 || state.isComplete) return;
    
    // Finde eine leere oder falsche Zelle
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
    
    // Zufällige Zelle wählen
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;
    
    // Lösung eintragen
    state.userGrid[row][col] = state.solution[row][col];
    state.hints--;
    
    document.getElementById('sudoku-hints').textContent = state.hints;
    
    if (state.hints === 0) {
        document.getElementById('btn-sudoku-hint').disabled = true;
    }
    
    // Zelle aktualisieren
    const cell = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );
    cell.textContent = state.solution[row][col];
    cell.classList.remove('error');
    cell.classList.add('user-input', 'hint');
    
    // Auswählen
    selectCell(row, col);
    updateCompletedNumbers();
    
    // Prüfen ob fertig
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
    
    // Puzzle gelöst!
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
    document.getElementById('complete-errors').textContent = state.errors;
    document.getElementById('complete-difficulty').textContent = DIFFICULTY[state.difficulty].name;
    
    // Ergebnis speichern (falls Storage-Modul verfügbar)
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
        
        const currentBest = data.bestTimes[state.difficulty] || Infinity;
        if (state.elapsed < currentBest) {
            data.bestTimes[state.difficulty] = state.elapsed;
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
    // Nur wenn Sudoku-Screen aktiv
    const sudokuScreen = document.getElementById('sudoku-screen');
    if (!sudokuScreen || !sudokuScreen.classList.contains('active')) return;
    
    if (!state.selectedCell || state.isComplete) return;
    
    const { row, col } = state.selectedCell;
    
    // Zahlen 1-9
    if (e.key >= '1' && e.key <= '9') {
        enterNumber(parseInt(e.key));
    }
    
    // Löschen
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        eraseCell();
    }
    
    // Navigation
    if (e.key === 'ArrowUp' && row > 0) selectCell(row - 1, col);
    if (e.key === 'ArrowDown' && row < 8) selectCell(row + 1, col);
    if (e.key === 'ArrowLeft' && col > 0) selectCell(row, col - 1);
    if (e.key === 'ArrowRight' && col < 8) selectCell(row, col + 1);
}

/**
 * Zeigt den Sudoku-Screen
 */
export function show() {
    // Alle anderen Screens ausblenden
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Sudoku-Screen einblenden
    const sudokuScreen = document.getElementById('sudoku-screen');
    sudokuScreen.classList.add('active');
    
    // Header aktualisieren
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