/* =========================================
   Farbsequenz Spiel (Senso-Style)
   Merke dir die Farbreihenfolge
   ========================================= */

import * as UI from './ui.js';

// Senso-Farben
const COLORS = ['red', 'blue', 'green', 'yellow'];

// Spielkonfiguration pro Level
const LEVEL_CONFIG = {
    1:  { startLength: 2, flashTime: 600, pauseTime: 200, inputTimeout: 5 },
    2:  { startLength: 2, flashTime: 550, pauseTime: 180, inputTimeout: 4.5 },
    3:  { startLength: 3, flashTime: 500, pauseTime: 160, inputTimeout: 4 },
    4:  { startLength: 3, flashTime: 450, pauseTime: 140, inputTimeout: 3.5 },
    5:  { startLength: 4, flashTime: 400, pauseTime: 120, inputTimeout: 3 },
    6:  { startLength: 4, flashTime: 350, pauseTime: 100, inputTimeout: 2.8 },
    7:  { startLength: 5, flashTime: 300, pauseTime: 90,  inputTimeout: 2.5 },
    8:  { startLength: 5, flashTime: 280, pauseTime: 80,  inputTimeout: 2.2 },
    9:  { startLength: 6, flashTime: 250, pauseTime: 70,  inputTimeout: 2 },
    10: { startLength: 6, flashTime: 220, pauseTime: 60,  inputTimeout: 1.8 }
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
    inputTimer: null,
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
        inputTimer: null,
        callbacks
    };
    
    UI.showTimer(config.mode === 'timed');
    renderGameArea();
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.userInput = [];
    state.isInputPhase = false;
    
    // Neue Farbe zur Sequenz hinzufügen
    addToSequence();
    
    UI.updateGameDisplay({
        level: state.level,
        score: state.score,
        time: null
    });
    
    // Sequenz anzeigen
    showSequence();
}

/**
 * Fügt eine neue Farbe zur Sequenz hinzu
 */
function addToSequence() {
    const config = LEVEL_CONFIG[state.level];
    
    // Bei erster Runde: Startlänge erstellen
    if (state.sequence.length === 0) {
        for (let i = 0; i < config.startLength; i++) {
            const randomIndex = Math.floor(Math.random() * COLORS.length);
            state.sequence.push(COLORS[randomIndex]);
        }
    } else {
        // Sonst: Eine Farbe hinzufügen
        const randomIndex = Math.floor(Math.random() * COLORS.length);
        state.sequence.push(COLORS[randomIndex]);
    }
}

/**
 * Rendert den Spielbereich mit Senso-Board
 */
function renderGameArea() {
    UI.setGameContent(`
        <div class="senso-container">
            <div class="senso-status" id="senso-status">Schau zu...</div>
            <div class="senso-board">
                <button class="senso-btn" data-color="red" disabled></button>
                <button class="senso-btn" data-color="blue" disabled></button>
                <button class="senso-btn" data-color="green" disabled></button>
                <button class="senso-btn" data-color="yellow" disabled></button>
            </div>
            <div class="senso-progress">
                <span id="senso-count">0</span> / <span id="senso-total">0</span>
            </div>
        </div>
    `);
    
    // Zusätzliches CSS für Senso
    addSensoStyles();
    
    UI.setInputArea('');
    
    setupSensoListeners();
}

/**
 * Fügt Senso-spezifische Styles hinzu
 */
function addSensoStyles() {
    if (document.getElementById('senso-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'senso-styles';
    style.textContent = `
        .senso-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
            width: 100%;
        }
        .senso-status {
            font-size: var(--font-size-xl);
            font-weight: 600;
            color: var(--color-text-light);
            min-height: 2rem;
        }
        .senso-board {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
            width: 100%;
            max-width: 280px;
            aspect-ratio: 1;
        }
        .senso-btn {
            border-radius: var(--radius-xl);
            transition: filter 0.15s, transform 0.15s;
            box-shadow: var(--shadow-md);
            border: none;
            cursor: pointer;
        }
        .senso-btn:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }
        .senso-btn:not(:disabled):active,
        .senso-btn.flash {
            filter: brightness(1.4);
            transform: scale(0.95);
        }
        .senso-btn[data-color="red"] { background-color: #ef4444; }
        .senso-btn[data-color="blue"] { background-color: #3b82f6; }
        .senso-btn[data-color="green"] { background-color: #22c55e; }
        .senso-btn[data-color="yellow"] { background-color: #eab308; }
        .senso-progress {
            font-size: var(--font-size-lg);
            color: var(--color-text-muted);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Zeigt die Farbsequenz an
 */
async function showSequence() {
    const config = LEVEL_CONFIG[state.level];
    const statusEl = document.getElementById('senso-status');
    
    // Buttons deaktivieren
    disableSensoButtons(true);
    
    statusEl.textContent = 'Schau zu...';
    await delay(600);
    
    // Sequenz abspielen
    for (let i = 0; i < state.sequence.length; i++) {
        const color = state.sequence[i];
        await flashColor(color, config.flashTime);
        await delay(config.pauseTime);
    }
    
    // Eingabephase starten
    startInputPhase();
}

/**
 * Lässt eine Farbe aufleuchten
 */
async function flashColor(color, duration) {
    const btn = document.querySelector(`.senso-btn[data-color="${color}"]`);
    if (!btn) return;
    
    btn.classList.add('flash');
    await delay(duration);
    btn.classList.remove('flash');
}

/**
 * Startet die Eingabephase
 */
function startInputPhase() {
    state.isInputPhase = true;
    state.userInput = [];
    
    const statusEl = document.getElementById('senso-status');
    statusEl.textContent = 'Deine Eingabe!';
    
    updateProgress();
    disableSensoButtons(false);
    
    if (state.mode === 'timed') {
        const config = LEVEL_CONFIG[state.level];
        state.timeLeft = Math.ceil(config.inputTimeout * state.sequence.length);
        startTimer();
    }
    
    // Input-Timeout pro Eingabe (für schnelleres Gameplay)
    resetInputTimer();
}

/**
 * Setzt Event-Listener für Senso-Buttons
 */
function setupSensoListeners() {
    const board = document.querySelector('.senso-board');
    
    board.addEventListener('click', async (e) => {
        const btn = e.target.closest('.senso-btn');
        if (!btn || btn.disabled || !state.isInputPhase) return;
        
        const color = btn.dataset.color;
        await handleColorInput(color);
    });
}

/**
 * Behandelt Farbeingabe
 */
async function handleColorInput(color) {
    if (!state.isInputPhase) return;
    
    const config = LEVEL_CONFIG[state.level];
    
    // Visuelles Feedback
    await flashColor(color, 150);
    
    // Input-Timer zurücksetzen
    resetInputTimer();
    
    // Eingabe speichern
    state.userInput.push(color);
    updateProgress();
    
    // Prüfen ob korrekt
    const currentIndex = state.userInput.length - 1;
    const isCorrect = state.userInput[currentIndex] === state.sequence[currentIndex];
    
    if (!isCorrect) {
        state.isInputPhase = false;
        stopTimer();
        stopInputTimer();
        await handleWrong();
        return;
    }
    
    // Prüfen ob komplett
    if (state.userInput.length === state.sequence.length) {
        state.isInputPhase = false;
        stopTimer();
        stopInputTimer();
        await handleCorrect();
    }
}

/**
 * Aktualisiert Fortschrittsanzeige
 */
function updateProgress() {
    const countEl = document.getElementById('senso-count');
    const totalEl = document.getElementById('senso-total');
    
    if (countEl && totalEl) {
        countEl.textContent = state.userInput.length;
        totalEl.textContent = state.sequence.length;
    }
}

/**
 * Aktiviert/Deaktiviert Senso-Buttons
 */
function disableSensoButtons(disabled) {
    const buttons = document.querySelectorAll('.senso-btn');
    buttons.forEach(btn => btn.disabled = disabled);
}

/**
 * Behandelt richtige Antwort
 */
async function handleCorrect() {
    disableSensoButtons(true);
    
    const basePoints = state.sequence.length * 15;
    const levelBonus = state.level * 8;
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
    disableSensoButtons(true);
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', 'Falsche Farbe!', 1500);
        // Sequenz neu starten, aber nicht verlängern
        state.userInput = [];
        await showSequence();
    } else {
        await UI.showFeedback('error', 'Falsche Farbe!', 1500);
        endGame();
    }
}

/**
 * Startet den Gesamt-Timer
 */
function startTimer() {
    UI.updateGameDisplay({ time: state.timeLeft });
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        UI.updateGameDisplay({ time: state.timeLeft });
        
        if (state.timeLeft <= 0) {
            stopTimer();
            stopInputTimer();
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
 * Setzt Input-Timer zurück (Timeout pro Eingabe)
 */
function resetInputTimer() {
    stopInputTimer();
    
    if (state.mode !== 'relaxed') {
        const config = LEVEL_CONFIG[state.level];
        state.inputTimer = setTimeout(() => {
            if (state.isInputPhase) {
                state.isInputPhase = false;
                stopTimer();
                handleTimeout();
            }
        }, config.inputTimeout * 1000);
    }
}

/**
 * Stoppt Input-Timer
 */
function stopInputTimer() {
    if (state.inputTimer) {
        clearTimeout(state.inputTimer);
        state.inputTimer = null;
    }
}

/**
 * Behandelt Zeitüberschreitung
 */
async function handleTimeout() {
    state.isInputPhase = false;
    disableSensoButtons(true);
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', 'Zu langsam!', 1500);
        state.userInput = [];
        await showSequence();
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
    stopInputTimer();
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'colors',
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
    stopInputTimer();
    state.isInputPhase = false;
}

/**
 * Hilfsfunktion: Verzögerung
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
