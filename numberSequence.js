/* =========================================
   Zahlenfolge Spiel
   Merke dir die angezeigte Zahlenreihe
   ========================================= */

import * as UI from './ui.js';

// Spielkonfiguration pro Level
const LEVEL_CONFIG = {
    1:  { length: 3, displayTime: 1200, inputTime: 15 },
    2:  { length: 4, displayTime: 1100, inputTime: 15 },
    3:  { length: 5, displayTime: 1000, inputTime: 14 },
    4:  { length: 5, displayTime: 900,  inputTime: 13 },
    5:  { length: 6, displayTime: 850,  inputTime: 12 },
    6:  { length: 6, displayTime: 800,  inputTime: 11 },
    7:  { length: 7, displayTime: 750,  inputTime: 10 },
    8:  { length: 7, displayTime: 700,  inputTime: 9 },
    9:  { length: 8, displayTime: 650,  inputTime: 8 },
    10: { length: 9, displayTime: 600,  inputTime: 7 }
};

// Spielzustand
let state = {
    sequence: [],
    userInput: [],
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
 * @param {Object} config - { level, mode }
 * @param {Object} callbacks - { onComplete, onScoreUpdate }
 */
export function start(config, callbacks) {
    state = {
        sequence: [],
        userInput: [],
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
    
    generateSequence();
    renderGameArea();
    showSequence();
}

/**
 * Generiert eine neue Zahlensequenz
 */
function generateSequence() {
    const config = LEVEL_CONFIG[state.level];
    const length = config.length + Math.floor((state.round - 1) / 2);
    
    state.sequence = [];
    for (let i = 0; i < length; i++) {
        state.sequence.push(Math.floor(Math.random() * 10));
    }
}

/**
 * Zeigt die Sequenz nacheinander an
 */
async function showSequence() {
    const config = LEVEL_CONFIG[state.level];
    const displayEl = document.querySelector('.sequence-display');
    
    displayEl.innerHTML = '<span style="font-size: 1.5rem; color: var(--color-text-light);">Bereit...</span>';
    await delay(800);
    
    for (let i = 0; i < state.sequence.length; i++) {
        displayEl.innerHTML = `<span class="sequence-item">${state.sequence[i]}</span>`;
        await delay(config.displayTime);
        
        if (i < state.sequence.length - 1) {
            displayEl.innerHTML = '';
            await delay(200);
        }
    }
    
    startInputPhase();
}

/**
 * Startet die Eingabephase
 */
function startInputPhase() {
    state.isInputPhase = true;
    
    const displayEl = document.querySelector('.sequence-display');
    displayEl.innerHTML = `
        <span style="font-size: 1rem; color: var(--color-text-light);">
            Gib die ${state.sequence.length} Zahlen ein
        </span>
    `;
    
    renderInput();
    
    if (state.mode === 'timed') {
        const config = LEVEL_CONFIG[state.level];
        state.timeLeft = config.inputTime + state.sequence.length;
        startTimer();
    }
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    UI.setGameContent(`
        <div class="sequence-display"></div>
    `);
    
    UI.setInputArea('');
    
    UI.updateGameDisplay({
        level: state.level,
        score: state.score,
        time: null
    });
}

/**
 * Rendert die Eingabetastatur
 */
function renderInput() {
    UI.setInputArea(`
        <div class="input-display">
            <span id="user-input-display"></span>
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
            <button class="numpad-btn submit" data-action="submit">
                <i class="fas fa-check"></i>
            </button>
        </div>
    `);
    
    setupInputListeners();
    updateInputDisplay();
}

/**
 * Setzt Event-Listener für Numpad
 */
function setupInputListeners() {
    const numpad = document.querySelector('.numpad');
    
    numpad.addEventListener('click', (e) => {
        if (!state.isInputPhase) return;
        
        const btn = e.target.closest('.numpad-btn');
        if (!btn) return;
        
        const num = btn.dataset.num;
        const action = btn.dataset.action;
        
        if (num !== undefined) {
            addDigit(parseInt(num));
        } else if (action === 'delete') {
            removeDigit();
        } else if (action === 'submit') {
            submitAnswer();
        }
    });
}

/**
 * Fügt eine Ziffer hinzu
 */
function addDigit(digit) {
    if (state.userInput.length >= state.sequence.length) return;
    
    state.userInput.push(digit);
    updateInputDisplay();
    
    if (state.userInput.length === state.sequence.length) {
        setTimeout(() => submitAnswer(), 300);
    }
}

/**
 * Entfernt letzte Ziffer
 */
function removeDigit() {
    if (state.userInput.length > 0) {
        state.userInput.pop();
        updateInputDisplay();
    }
}

/**
 * Aktualisiert Eingabe-Anzeige
 */
function updateInputDisplay() {
    const displayEl = document.getElementById('user-input-display');
    if (displayEl) {
        displayEl.textContent = state.userInput.join(' ');
    }
}

/**
 * Prüft die Eingabe
 */
async function submitAnswer() {
    if (!state.isInputPhase) return;
    state.isInputPhase = false;
    
    stopTimer();
    
    const isCorrect = state.userInput.length === state.sequence.length &&
                      state.userInput.every((num, i) => num === state.sequence[i]);
    
    if (isCorrect) {
        await handleCorrect();
    } else {
        await handleWrong();
    }
}

/**
 * Behandelt richtige Antwort
 */
async function handleCorrect() {
    const basePoints = state.sequence.length * 10;
    const levelBonus = state.level * 5;
    const roundPoints = basePoints + levelBonus;
    
    state.score += roundPoints;
    
    await UI.showFeedback('success', `+${roundPoints} Punkte!`, 1000);
    
    UI.updateGameDisplay({ score: state.score });
    
    state.round++;
    startRound();
}

/**
 * Behandelt falsche Antwort
 */
async function handleWrong() {
    const correctStr = state.sequence.join(' ');
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', `Richtig war: ${correctStr}`, 2000);
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', `Falsch! Richtig: ${correctStr}`, 2000);
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
            game: 'numbers',
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
