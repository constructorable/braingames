/* =========================================
   Buchstabenfolge Spiel
   Merke dir die angezeigte Buchstabenreihe
   ========================================= */

import * as UI from './ui.js';

// Verwendbare Buchstaben (ohne verwechselbare wie I/l, O/0)
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');

// Spielkonfiguration pro Level
const LEVEL_CONFIG = {
    1:  { length: 3, displayTime: 1200, inputTime: 15 },
    2:  { length: 3, displayTime: 1100, inputTime: 15 },
    3:  { length: 4, displayTime: 1000, inputTime: 14 },
    4:  { length: 4, displayTime: 900,  inputTime: 13 },
    5:  { length: 5, displayTime: 850,  inputTime: 12 },
    6:  { length: 5, displayTime: 800,  inputTime: 11 },
    7:  { length: 6, displayTime: 750,  inputTime: 10 },
    8:  { length: 6, displayTime: 700,  inputTime: 9 },
    9:  { length: 7, displayTime: 650,  inputTime: 8 },
    10: { length: 8, displayTime: 600,  inputTime: 7 }
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
 * Generiert eine neue Buchstabensequenz
 */
function generateSequence() {
    const config = LEVEL_CONFIG[state.level];
    const length = config.length + Math.floor((state.round - 1) / 2);
    
    state.sequence = [];
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * LETTERS.length);
        state.sequence.push(LETTERS[randomIndex]);
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
            Gib die ${state.sequence.length} Buchstaben ein
        </span>
    `;
    
    renderInput();
    
    if (state.mode === 'timed') {
        const config = LEVEL_CONFIG[state.level];
        state.timeLeft = config.inputTime + state.sequence.length * 2;
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
 * Rendert die Buchstaben-Tastatur
 */
function renderInput() {
    // Erste Reihe: Q-P
    const row1 = 'QWERTZUIOP'.split('');
    // Zweite Reihe: A-L
    const row2 = 'ASDFGHJKL'.split('');
    // Dritte Reihe: Y-M + Delete
    const row3 = 'YXCVBNM'.split('');
    
    UI.setInputArea(`
        <div class="input-display">
            <span id="user-input-display"></span>
            <span class="input-cursor"></span>
        </div>
        <div class="keyboard-container">
            <div class="keyboard-row">
                ${row1.map(l => `<button class="keyboard-btn" data-letter="${l}">${l}</button>`).join('')}
            </div>
            <div class="keyboard-row">
                ${row2.map(l => `<button class="keyboard-btn" data-letter="${l}">${l}</button>`).join('')}
            </div>
            <div class="keyboard-row">
                ${row3.map(l => `<button class="keyboard-btn" data-letter="${l}">${l}</button>`).join('')}
                <button class="keyboard-btn delete" data-action="delete">
                    <i class="fas fa-backspace"></i>
                </button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-btn submit wide" data-action="submit">
                    <i class="fas fa-check"></i> Fertig
                </button>
            </div>
        </div>
    `);
    
    // Zusätzliches CSS für Keyboard
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-container { 
            width: 100%; 
            max-width: 400px; 
            margin: 0 auto; 
        }
        .keyboard-row { 
            display: flex; 
            justify-content: center; 
            gap: 4px; 
            margin-bottom: 4px; 
        }
        .keyboard-btn { 
            min-width: 32px; 
            height: 48px; 
            font-size: 1rem;
            font-weight: 600;
            background: var(--color-bg-card);
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-sm);
        }
        .keyboard-btn:active { 
            background: var(--color-border); 
            transform: scale(0.95); 
        }
        .keyboard-btn.wide { 
            flex: 1; 
            max-width: 200px; 
        }
        .keyboard-btn.submit { 
            background: var(--color-success); 
            color: white; 
        }
        .keyboard-btn.delete { 
            background: var(--color-error); 
            color: white; 
        }
    `;
    document.head.appendChild(style);
    
    setupInputListeners();
    updateInputDisplay();
}

/**
 * Setzt Event-Listener für Keyboard
 */
function setupInputListeners() {
    const container = document.querySelector('.keyboard-container');
    
    container.addEventListener('click', (e) => {
        if (!state.isInputPhase) return;
        
        const btn = e.target.closest('.keyboard-btn');
        if (!btn) return;
        
        const letter = btn.dataset.letter;
        const action = btn.dataset.action;
        
        if (letter) {
            addLetter(letter);
        } else if (action === 'delete') {
            removeLetter();
        } else if (action === 'submit') {
            submitAnswer();
        }
    });
}

/**
 * Fügt einen Buchstaben hinzu
 */
function addLetter(letter) {
    if (state.userInput.length >= state.sequence.length) return;
    
    state.userInput.push(letter);
    updateInputDisplay();
    
    if (state.userInput.length === state.sequence.length) {
        setTimeout(() => submitAnswer(), 300);
    }
}

/**
 * Entfernt letzten Buchstaben
 */
function removeLetter() {
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
                      state.userInput.every((letter, i) => letter === state.sequence[i]);
    
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
    const basePoints = state.sequence.length * 12;
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
            game: 'letters',
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
