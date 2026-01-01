/* =========================================
   Rechenfolge Spiel
   Merke dir die Ergebnisse der Aufgaben
   ========================================= */

import * as UI from './ui.js';

// Spielkonfiguration pro Level
const LEVEL_CONFIG = {
    1:  { count: 2, maxNum: 9,  operations: ['+'], displayTime: 2500, inputTime: 15 },
    2:  { count: 2, maxNum: 10, operations: ['+', '-'], displayTime: 2300, inputTime: 15 },
    3:  { count: 3, maxNum: 12, operations: ['+', '-'], displayTime: 2200, inputTime: 18 },
    4:  { count: 3, maxNum: 15, operations: ['+', '-'], displayTime: 2000, inputTime: 18 },
    5:  { count: 3, maxNum: 12, operations: ['+', '-', '*'], displayTime: 2500, inputTime: 20 },
    6:  { count: 4, maxNum: 15, operations: ['+', '-', '*'], displayTime: 2300, inputTime: 22 },
    7:  { count: 4, maxNum: 20, operations: ['+', '-', '*'], displayTime: 2100, inputTime: 24 },
    8:  { count: 5, maxNum: 15, operations: ['+', '-', '*'], displayTime: 2000, inputTime: 28 },
    9:  { count: 5, maxNum: 20, operations: ['+', '-', '*'], displayTime: 1800, inputTime: 30 },
    10: { count: 6, maxNum: 25, operations: ['+', '-', '*'], displayTime: 1600, inputTime: 35 }
};

// Spielzustand
let state = {
    equations: [],      // { equation: '5 + 3', result: 8 }
    userInput: [],      // Eingegebene Ergebnisse
    currentInputIndex: 0,
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
        equations: [],
        userInput: [],
        currentInputIndex: 0,
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
    state.currentInputIndex = 0;
    state.isInputPhase = false;
    
    generateEquations();
    renderGameArea();
    showEquations();
}

/**
 * Generiert Rechenaufgaben
 */
function generateEquations() {
    const config = LEVEL_CONFIG[state.level];
    const count = config.count + Math.floor((state.round - 1) / 3);
    
    state.equations = [];
    
    for (let i = 0; i < count; i++) {
        const equation = generateSingleEquation(config);
        state.equations.push(equation);
    }
}

/**
 * Generiert eine einzelne Rechenaufgabe
 */
function generateSingleEquation(config) {
    const operation = config.operations[Math.floor(Math.random() * config.operations.length)];
    let a, b, result, equation;
    
    switch (operation) {
        case '+':
            a = Math.floor(Math.random() * config.maxNum) + 1;
            b = Math.floor(Math.random() * config.maxNum) + 1;
            result = a + b;
            equation = `${a} + ${b}`;
            break;
            
        case '-':
            // Sicherstellen dass Ergebnis positiv ist
            a = Math.floor(Math.random() * config.maxNum) + 1;
            b = Math.floor(Math.random() * a) + 1;
            result = a - b;
            equation = `${a} - ${b}`;
            break;
            
        case '*':
            // Kleinere Zahlen für Multiplikation
            a = Math.floor(Math.random() * Math.min(10, config.maxNum)) + 1;
            b = Math.floor(Math.random() * Math.min(10, config.maxNum)) + 1;
            result = a * b;
            equation = `${a} × ${b}`;
            break;
            
        default:
            a = Math.floor(Math.random() * config.maxNum) + 1;
            b = Math.floor(Math.random() * config.maxNum) + 1;
            result = a + b;
            equation = `${a} + ${b}`;
    }
    
    return { equation, result };
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    UI.setGameContent(`
        <div class="math-container">
            <div class="math-status" id="math-status">Merke dir die Ergebnisse...</div>
            <div class="math-display" id="math-display"></div>
            <div class="math-progress">
                Aufgabe <span id="math-current">1</span> / <span id="math-total">${state.equations.length}</span>
            </div>
        </div>
    `);
    
    addMathStyles();
    
    UI.setInputArea('');
    
    UI.updateGameDisplay({
        level: state.level,
        score: state.score,
        time: null
    });
}

/**
 * Fügt Math-spezifische Styles hinzu
 */
function addMathStyles() {
    if (document.getElementById('math-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'math-styles';
    style.textContent = `
        .math-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xl);
            width: 100%;
            text-align: center;
        }
        .math-status {
            font-size: var(--font-size-lg);
            font-weight: 600;
            color: var(--color-text-light);
        }
        .math-display {
            min-height: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-md);
        }
        .math-equation {
            font-size: var(--font-size-3xl);
            font-weight: 700;
            color: var(--color-text);
        }
        .math-result {
            font-size: var(--font-size-4xl);
            font-weight: 700;
            color: var(--color-primary);
        }
        .math-result-hint {
            font-size: var(--font-size-sm);
            color: var(--color-text-muted);
        }
        .math-progress {
            font-size: var(--font-size-base);
            color: var(--color-text-muted);
        }
        .math-input-display {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 50px;
            font-size: var(--font-size-2xl);
            font-weight: 600;
        }
        .results-summary {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: var(--spacing-sm);
            margin: var(--spacing-md) 0;
        }
        .result-box {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-bg-card);
            border-radius: var(--radius-md);
            font-size: var(--font-size-lg);
            font-weight: 600;
            box-shadow: var(--shadow-sm);
        }
        .result-box.active {
            border: 2px solid var(--color-primary);
        }
        .result-box.filled {
            background: var(--color-primary-light);
            color: white;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Zeigt die Aufgaben nacheinander an
 */
async function showEquations() {
    const config = LEVEL_CONFIG[state.level];
    const displayEl = document.getElementById('math-display');
    
    await delay(500);
    
    for (let i = 0; i < state.equations.length; i++) {
        const eq = state.equations[i];
        
        // Fortschritt aktualisieren
        document.getElementById('math-current').textContent = i + 1;
        
        // Aufgabe anzeigen
        displayEl.innerHTML = `
            <div class="math-equation">${eq.equation}</div>
            <div class="math-result">= ${eq.result}</div>
        `;
        
        await delay(config.displayTime);
        
        // Kurze Pause zwischen Aufgaben
        if (i < state.equations.length - 1) {
            displayEl.innerHTML = '';
            await delay(400);
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
    state.userInput = new Array(state.equations.length).fill(null);
    state.currentInputIndex = 0;
    
    const statusEl = document.getElementById('math-status');
    statusEl.textContent = 'Gib die Ergebnisse ein!';
    
    renderInputPhase();
    
    if (state.mode === 'timed') {
        const config = LEVEL_CONFIG[state.level];
        state.timeLeft = config.inputTime + state.equations.length * 3;
        startTimer();
    }
}

/**
 * Rendert die Eingabephase
 */
function renderInputPhase() {
    const displayEl = document.getElementById('math-display');
    
    displayEl.innerHTML = `
        <div class="results-summary">
            ${state.equations.map((_, i) => `
                <div class="result-box ${i === state.currentInputIndex ? 'active' : ''} ${state.userInput[i] !== null ? 'filled' : ''}" data-index="${i}">
                    ${state.userInput[i] !== null ? state.userInput[i] : '?'}
                </div>
            `).join('')}
        </div>
        <div class="math-result-hint">
            Ergebnis ${state.currentInputIndex + 1} von ${state.equations.length}
        </div>
    `;
    
    UI.setInputArea(`
        <div class="math-input-display">
            <span id="math-input-value"></span>
            <span class="input-cursor"></span>
        </div>
        <div class="numpad">
            <button class="numpad-btn" data-num="1">1</button>
            <button class="numpad-btn" data-num="2">2</button>
            <button class="numpad-btn" data-num="3">3</button>
            <button class="numpad-btn" data-num="4">4</button>
            <button class="numpad-btn" data-num="5">5</button>
            <button class="numpad-btn" data-num="6">6</button>
            <button class="numpad-btn" data-num="7">7</button>
            <button class="numpad-btn" data-num="8">8</button>
            <button class="numpad-btn" data-num="9">9</button>
            <button class="numpad-btn delete" data-action="delete">
                <i class="fas fa-backspace"></i>
            </button>
            <button class="numpad-btn" data-num="0">0</button>
            <button class="numpad-btn submit" data-action="next">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `);
    
    setupInputListeners();
}

/**
 * Setzt Event-Listener für Numpad
 */
function setupInputListeners() {
    const numpad = document.querySelector('.numpad');
    if (!numpad) return;
    
    numpad.addEventListener('click', (e) => {
        if (!state.isInputPhase) return;
        
        const btn = e.target.closest('.numpad-btn');
        if (!btn) return;
        
        const num = btn.dataset.num;
        const action = btn.dataset.action;
        
        if (num !== undefined) {
            addDigit(num);
        } else if (action === 'delete') {
            removeDigit();
        } else if (action === 'next') {
            confirmCurrentInput();
        }
    });
}

// Temporäre Eingabe für aktuelle Zahl
let currentInput = '';

/**
 * Fügt eine Ziffer hinzu
 */
function addDigit(digit) {
    if (currentInput.length >= 4) return;
    
    currentInput += digit;
    updateInputDisplay();
}

/**
 * Entfernt letzte Ziffer
 */
function removeDigit() {
    if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        updateInputDisplay();
    }
}

/**
 * Aktualisiert Eingabe-Anzeige
 */
function updateInputDisplay() {
    const displayEl = document.getElementById('math-input-value');
    if (displayEl) {
        displayEl.textContent = currentInput;
    }
}

/**
 * Bestätigt aktuelle Eingabe und geht zur nächsten
 */
function confirmCurrentInput() {
    if (currentInput === '') return;
    
    state.userInput[state.currentInputIndex] = parseInt(currentInput);
    currentInput = '';
    
    // Zur nächsten Eingabe oder fertig
    if (state.currentInputIndex < state.equations.length - 1) {
        state.currentInputIndex++;
        renderInputPhase();
    } else {
        // Alle eingegeben
        state.isInputPhase = false;
        stopTimer();
        checkAllAnswers();
    }
}

/**
 * Prüft alle Antworten
 */
async function checkAllAnswers() {
    let correctCount = 0;
    
    for (let i = 0; i < state.equations.length; i++) {
        if (state.userInput[i] === state.equations[i].result) {
            correctCount++;
        }
    }
    
    const allCorrect = correctCount === state.equations.length;
    
    if (allCorrect) {
        await handleCorrect();
    } else {
        await handleWrong(correctCount);
    }
}

/**
 * Behandelt richtige Antwort
 */
async function handleCorrect() {
    const basePoints = state.equations.length * 15;
    const levelBonus = state.level * 8;
    const roundPoints = basePoints + levelBonus;
    
    state.score += roundPoints;
    
    await UI.showFeedback('success', `Alle richtig! +${roundPoints}`, 1200);
    
    UI.updateGameDisplay({ score: state.score });
    
    state.round++;
    startRound();
}

/**
 * Behandelt falsche Antwort
 */
async function handleWrong(correctCount) {
    // Zeige korrekte Ergebnisse
    const correctResults = state.equations.map(eq => eq.result).join(', ');
    
    if (state.mode === 'relaxed') {
        const partialPoints = correctCount * 8;
        state.score += partialPoints;
        
        await UI.showFeedback('error', `${correctCount}/${state.equations.length} richtig (+${partialPoints})`, 2000);
        
        UI.updateGameDisplay({ score: state.score });
        
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', `Richtig: ${correctResults}`, 2500);
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
    
    const correctResults = state.equations.map(eq => eq.result).join(', ');
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', `Zeit abgelaufen! Richtig: ${correctResults}`, 2000);
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', `Zeit abgelaufen!`, 1500);
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
            game: 'math',
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
    currentInput = '';
}

/**
 * Hilfsfunktion: Verzögerung
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
