/* =========================================
   Muster-Memory Spiel
   Merke dir die aufleuchtenden Felder
   ========================================= */

import * as UI from './ui.js';

// Spielkonfiguration pro Level
const LEVEL_CONFIG = {
    1:  { gridSize: 3, cellCount: 3, flashTime: 800, showAll: true, inputTime: 10 },
    2:  { gridSize: 3, cellCount: 4, flashTime: 700, showAll: true, inputTime: 10 },
    3:  { gridSize: 4, cellCount: 4, flashTime: 650, showAll: true, inputTime: 12 },
    4:  { gridSize: 4, cellCount: 5, flashTime: 600, showAll: true, inputTime: 12 },
    5:  { gridSize: 4, cellCount: 6, flashTime: 550, showAll: false, inputTime: 15 },
    6:  { gridSize: 5, cellCount: 6, flashTime: 500, showAll: false, inputTime: 15 },
    7:  { gridSize: 5, cellCount: 7, flashTime: 450, showAll: false, inputTime: 18 },
    8:  { gridSize: 5, cellCount: 8, flashTime: 400, showAll: false, inputTime: 18 },
    9:  { gridSize: 6, cellCount: 9, flashTime: 350, showAll: false, inputTime: 20 },
    10: { gridSize: 6, cellCount: 10, flashTime: 300, showAll: false, inputTime: 20 }
};

// Spielzustand
let state = {
    pattern: [],        // Indizes der markierten Zellen
    userInput: [],      // Vom Nutzer ausgewählte Zellen
    gridSize: 3,
    level: 1,
    mode: 'endless',
    score: 0,
    round: 1,
    isInputPhase: false,
    timer: null,
    timeLeft: 0,
    callbacks: null
};

/**
 * Startet das Spiel
 */
export function start(config, callbacks) {
    state = {
        pattern: [],
        userInput: [],
        gridSize: 3,
        level: config.level,
        mode: config.mode,
        score: 0,
        round: 1,
        isInputPhase: false,
        timer: null,
        timeLeft: 0,
        callbacks
    };
    
    UI.showTimer(config.mode === 'timed');
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.userInput = [];
    state.isInputPhase = false;
    
    generatePattern();
    renderGameArea();
    showPattern();
}

/**
 * Generiert ein neues Muster
 */
function generatePattern() {
    const config = LEVEL_CONFIG[state.level];
    state.gridSize = config.gridSize;
    
    // Anzahl der Zellen steigt mit Runden
    const cellCount = config.cellCount + Math.floor((state.round - 1) / 3);
    const totalCells = state.gridSize * state.gridSize;
    
    // Zufällige eindeutige Positionen wählen
    const positions = [];
    while (positions.length < Math.min(cellCount, totalCells - 1)) {
        const pos = Math.floor(Math.random() * totalCells);
        if (!positions.includes(pos)) {
            positions.push(pos);
        }
    }
    
    state.pattern = positions;
}

/**
 * Rendert den Spielbereich mit Grid
 */
function renderGameArea() {
    const config = LEVEL_CONFIG[state.level];
    
    UI.setGameContent(`
        <div class="pattern-container">
            <div class="pattern-status" id="pattern-status">Merke dir das Muster...</div>
            <div class="pattern-grid" id="pattern-grid" 
                 style="grid-template-columns: repeat(${state.gridSize}, 1fr)">
            </div>
            <div class="pattern-progress">
                <span id="pattern-count">0</span> / <span id="pattern-total">${state.pattern.length}</span>
            </div>
        </div>
    `);
    
    // Grid-Zellen erstellen
    const grid = document.getElementById('pattern-grid');
    const totalCells = state.gridSize * state.gridSize;
    
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('button');
        cell.className = 'pattern-cell';
        cell.dataset.index = i;
        cell.disabled = true;
        grid.appendChild(cell);
    }
    
    addPatternStyles();
    
    UI.setInputArea('');
    
    UI.updateGameDisplay({
        level: state.level,
        score: state.score,
        time: null
    });
    
    setupPatternListeners();
}

/**
 * Fügt Pattern-spezifische Styles hinzu
 */
function addPatternStyles() {
    if (document.getElementById('pattern-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pattern-styles';
    style.textContent = `
        .pattern-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
            width: 100%;
        }
        .pattern-status {
            font-size: var(--font-size-lg);
            font-weight: 600;
            color: var(--color-text-light);
            min-height: 2rem;
            text-align: center;
        }
        .pattern-grid {
            display: grid;
            gap: 8px;
            width: 100%;
            max-width: 300px;
        }
        .pattern-cell {
            aspect-ratio: 1;
            background-color: var(--color-border);
            border-radius: var(--radius-md);
            border: none;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .pattern-cell:disabled {
            cursor: not-allowed;
        }
        .pattern-cell:not(:disabled):active {
            transform: scale(0.95);
        }
        .pattern-cell.highlighted {
            background-color: var(--color-primary);
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
        }
        .pattern-cell.selected {
            background-color: var(--color-primary-light);
        }
        .pattern-cell.correct {
            background-color: var(--color-success);
        }
        .pattern-cell.wrong {
            background-color: var(--color-error);
        }
        .pattern-progress {
            font-size: var(--font-size-lg);
            color: var(--color-text-muted);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Zeigt das Muster an
 */
async function showPattern() {
    const config = LEVEL_CONFIG[state.level];
    const statusEl = document.getElementById('pattern-status');
    
    statusEl.textContent = 'Merke dir das Muster...';
    await delay(800);
    
    if (config.showAll) {
        // Alle Zellen gleichzeitig anzeigen
        state.pattern.forEach(index => {
            const cell = document.querySelector(`.pattern-cell[data-index="${index}"]`);
            if (cell) cell.classList.add('highlighted');
        });
        
        await delay(config.flashTime * state.pattern.length * 0.5);
        
        // Alle wieder ausblenden
        document.querySelectorAll('.pattern-cell.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
    } else {
        // Zellen nacheinander anzeigen
        for (const index of state.pattern) {
            const cell = document.querySelector(`.pattern-cell[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('highlighted');
                await delay(config.flashTime);
                cell.classList.remove('highlighted');
                await delay(150);
            }
        }
    }
    
    // Eingabephase starten
    startInputPhase();
}

/**
 * Startet die Eingabephase
 */
function startInputPhase() {
    state.isInputPhase = true;
    state.userInput = [];
    
    const statusEl = document.getElementById('pattern-status');
    statusEl.textContent = 'Tippe die Felder an!';
    
    updateProgress();
    enablePatternCells(true);
    
    if (state.mode === 'timed') {
        const config = LEVEL_CONFIG[state.level];
        state.timeLeft = config.inputTime + state.pattern.length;
        startTimer();
    }
}

/**
 * Setzt Event-Listener für Pattern-Zellen
 */
function setupPatternListeners() {
    const grid = document.getElementById('pattern-grid');
    
    grid.addEventListener('click', (e) => {
        const cell = e.target.closest('.pattern-cell');
        if (!cell || cell.disabled || !state.isInputPhase) return;
        
        handleCellInput(parseInt(cell.dataset.index));
    });
}

/**
 * Behandelt Zelleneingabe
 */
async function handleCellInput(index) {
    if (!state.isInputPhase) return;
    if (state.userInput.includes(index)) return; // Bereits ausgewählt
    
    const cell = document.querySelector(`.pattern-cell[data-index="${index}"]`);
    
    // Visuelles Feedback
    cell.classList.add('selected');
    state.userInput.push(index);
    updateProgress();
    
    // Prüfen ob alle gefunden
    if (state.userInput.length === state.pattern.length) {
        state.isInputPhase = false;
        stopTimer();
        await checkAnswer();
    }
}

/**
 * Prüft die Antwort
 */
async function checkAnswer() {
    enablePatternCells(false);
    
    // Prüfen ob alle richtigen Zellen ausgewählt wurden
    const correctCount = state.userInput.filter(index => state.pattern.includes(index)).length;
    const isCorrect = correctCount === state.pattern.length && state.userInput.length === state.pattern.length;
    
    // Visuelles Feedback
    state.userInput.forEach(index => {
        const cell = document.querySelector(`.pattern-cell[data-index="${index}"]`);
        if (state.pattern.includes(index)) {
            cell.classList.remove('selected');
            cell.classList.add('correct');
        } else {
            cell.classList.remove('selected');
            cell.classList.add('wrong');
        }
    });
    
    // Fehlende markieren
    state.pattern.forEach(index => {
        if (!state.userInput.includes(index)) {
            const cell = document.querySelector(`.pattern-cell[data-index="${index}"]`);
            cell.classList.add('highlighted');
        }
    });
    
    await delay(1000);
    
    if (isCorrect) {
        await handleCorrect();
    } else {
        await handleWrong(correctCount);
    }
}

/**
 * Aktualisiert Fortschrittsanzeige
 */
function updateProgress() {
    const countEl = document.getElementById('pattern-count');
    if (countEl) {
        countEl.textContent = state.userInput.length;
    }
}

/**
 * Aktiviert/Deaktiviert Pattern-Zellen
 */
function enablePatternCells(enabled) {
    document.querySelectorAll('.pattern-cell').forEach(cell => {
        cell.disabled = !enabled;
    });
}

/**
 * Behandelt richtige Antwort
 */
async function handleCorrect() {
    const basePoints = state.pattern.length * 12;
    const levelBonus = state.level * 6;
    const gridBonus = state.gridSize * 3;
    const roundPoints = basePoints + levelBonus + gridBonus;
    
    state.score += roundPoints;
    
    await UI.showFeedback('success', `+${roundPoints} Punkte!`, 1000);
    
    UI.updateGameDisplay({ score: state.score });
    
    state.round++;
    startRound();
}

/**
 * Behandelt falsche Antwort
 */
async function handleWrong(correctCount) {
    if (state.mode === 'relaxed') {
        // Teilpunkte im entspannten Modus
        const partialPoints = correctCount * 5;
        state.score += partialPoints;
        
        await UI.showFeedback('error', `${correctCount}/${state.pattern.length} richtig (+${partialPoints})`, 2000);
        
        UI.updateGameDisplay({ score: state.score });
        
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', `Nur ${correctCount}/${state.pattern.length} richtig!`, 2000);
        endGame();
    }
}

/**
 * Startet den Timer
 */
function startTimer() {
    UI.updateGameDisplay({ time: state.timeLeft });
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        UI.updateGameDisplay({ time: state.timeLeft });
        
        if (state.timeLeft <= 0) {
            stopTimer();
            handleTimeout();
        }
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
 * Behandelt Zeitüberschreitung
 */
async function handleTimeout() {
    state.isInputPhase = false;
    enablePatternCells(false);
    
    // Richtige Zellen markieren
    state.pattern.forEach(index => {
        const cell = document.querySelector(`.pattern-cell[data-index="${index}"]`);
        cell.classList.add('highlighted');
    });
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', 'Zeit abgelaufen!', 1500);
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', 'Zeit abgelaufen!', 1500);
        endGame();
    }
}

/**
 * Beendet das Spiel
 */
function endGame() {
    stopTimer();
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'pattern',
            score: state.score,
            level: state.level,
            mode: state.mode,
            round: state.round - 1
        });
    }
}

/**
 * Stoppt das Spiel vorzeitig
 */
export function stop() {
    stopTimer();
    state.isInputPhase = false;
}

/**
 * Hilfsfunktion: Verzögerung
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
