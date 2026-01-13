/* =========================================
   Pattern Breaker Game
   Erkennen und brechen Sie Muster, bevor es zu spät ist!
   KI-inspiriertes Logik-Spiel mit 10 Schwierigkeitsstufen
   ========================================= */

import * as UI from './ui.js';

// Muster-Generierung (mathematisch komplexer)
const PATTERN_TYPES = {
    arithmetic: { name: 'Arithmetik', complexity: 1 },
    fibonacci: { name: 'Fibonacci', complexity: 2 },
    geometric: { name: 'Geometrie', complexity: 3 },
    prime: { name: 'Primzahlen', complexity: 4 },
    quadratic: { name: 'Quadratisch', complexity: 5 },
    exponential: { name: 'Exponentiell', complexity: 6 },
    triangular: { name: 'Dreieckszahl', complexity: 7 },
    factorial: { name: 'Fakultät', complexity: 8 },
    power: { name: 'Potenzen', complexity: 9 },
    mixed: { name: 'Gemischt', complexity: 10 }
};

// Level-Konfiguration (VEREINFACHT & MEHR ZEIT)
const LEVEL_CONFIG = {
    1:  { timeLimit: 90, patternLength: 3, choices: 4, patterns: ['arithmetic'] },
    2:  { timeLimit: 85, patternLength: 3, choices: 4, patterns: ['arithmetic'] },
    3:  { timeLimit: 80, patternLength: 4, choices: 4, patterns: ['arithmetic', 'fibonacci'] },
    4:  { timeLimit: 75, patternLength: 4, choices: 5, patterns: ['arithmetic', 'fibonacci'] },
    5:  { timeLimit: 70, patternLength: 5, choices: 5, patterns: ['arithmetic', 'fibonacci', 'geometric'] },
    6:  { timeLimit: 65, patternLength: 5, choices: 5, patterns: ['fibonacci', 'geometric', 'quadratic'] },
    7:  { timeLimit: 60, patternLength: 6, choices: 6, patterns: ['geometric', 'quadratic', 'exponential'] },
    8:  { timeLimit: 55, patternLength: 6, choices: 6, patterns: ['quadratic', 'exponential', 'triangular'] },
    9:  { timeLimit: 50, patternLength: 7, choices: 7, patterns: ['exponential', 'triangular', 'power'] },
    10: { timeLimit: 45, patternLength: 7, choices: 7, patterns: ['triangular', 'power', 'factorial'] }
};

// Spielzustand
let state = {
    level: 1,
    mode: 'endless',
    score: 0,
    round: 0,
    correctAnswers: 0,
    streakCount: 0,
    timeLeft: 0,
    callbacks: null,
    isGameActive: false,
    gameTimer: null,
    currentPattern: null,
    currentSequence: [],
    choices: [],
    selectedAnswer: null
};

/**
 * Startet das Spiel
 */
export function start(config, callbacks) {
    state = {
        level: config.level,
        mode: config.mode,
        score: 0,
        round: 0,
        correctAnswers: 0,
        streakCount: 0,
        timeLeft: 0,
        callbacks,
        isGameActive: false,
        gameTimer: null,
        currentPattern: null,
        currentSequence: [],
        choices: [],
        selectedAnswer: null
    };
    
    UI.showTimer(false);
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.isGameActive = true;
    state.selectedAnswer = null;
    
    const levelConfig = LEVEL_CONFIG[state.level];
    state.timeLeft = levelConfig.timeLimit;
    
    generatePattern(levelConfig);
    renderGameArea();
    startTimer();
}

/**
 * Generiert ein Muster
 */
function generatePattern(levelConfig) {
    const patternType = levelConfig.patterns[Math.floor(Math.random() * levelConfig.patterns.length)];
    state.currentPattern = patternType;
    
    // Generiere Sequenz basierend auf Mustertyp
    state.currentSequence = generateSequence(patternType, levelConfig.patternLength);
    
    // Generiere Antwortoptionen
    const correctNext = getPatternNext(patternType, state.currentSequence);
    state.choices = generateChoices(correctNext, levelConfig.choices);
    
    // Shuffle Choices
    for (let i = state.choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.choices[i], state.choices[j]] = [state.choices[j], state.choices[i]];
    }
}

/**
 * ÄNDERUNG: Generiert eine Sequenz basierend auf Mustertyp
 */
function generateSequence(type, length) {
    const seq = [];
    const start = Math.floor(Math.random() * 10) + 1;
    
    switch(type) {
        case 'arithmetic':
            // Kleinere Differenzen für leichtere Level
            const diff = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < length; i++) seq.push(start + i * diff);
            break;
        case 'fibonacci':
            seq.push(1, 1);
            for (let i = 2; i < length; i++) seq.push(seq[i-1] + seq[i-2]);
            break;
        case 'geometric':
            const ratio = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < length; i++) seq.push(start * Math.pow(ratio, i));
            break;
        case 'prime':
            const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
            for (let i = 0; i < length; i++) {
                const idx = Math.floor(Math.random() * primes.length);
                seq.push(primes[idx]);
            }
            break;
        case 'quadratic':
            for (let i = 0; i < length; i++) seq.push((i + 1) * (i + 1));
            break;
        case 'exponential':
            const base = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < length; i++) seq.push(Math.pow(base, i + 1));
            break;
        case 'triangular':
            for (let i = 0; i < length; i++) seq.push((i + 1) * (i + 2) / 2);
            break;
        case 'factorial':
            for (let i = 0; i < length; i++) seq.push(factorial(i + 1));
            break;
        case 'power':
            const pow = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < length; i++) seq.push(Math.pow(i + 1, pow));
            break;
        case 'mixed':
            return generateSequence(['arithmetic', 'fibonacci', 'geometric'][Math.floor(Math.random() * 3)], length);
    }
    
    return seq;
}

/**
 * Berechnet das nächste Element
 */
function getPatternNext(type, seq) {
    if (seq.length < 2) return seq[seq.length - 1] + 1;
    
    switch(type) {
        case 'arithmetic':
            return seq[seq.length - 1] + (seq[seq.length - 1] - seq[seq.length - 2]);
        case 'fibonacci':
            return seq[seq.length - 1] + seq[seq.length - 2];
        case 'geometric':
            return seq[seq.length - 1] * (seq[seq.length - 1] / seq[seq.length - 2]);
        case 'prime':
            const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
            return primes[Math.floor(Math.random() * primes.length)];
        case 'quadratic':
            const n = seq.length + 1;
            return n * n;
        case 'exponential':
            const base = seq[1] / seq[0];
            return seq[seq.length - 1] * base;
        case 'triangular':
            const tn = seq.length + 1;
            return tn * (tn + 1) / 2;
        case 'factorial':
            return factorial(seq.length + 1);
        case 'power':
            const pow = seq.length > 1 ? Math.round(Math.log(seq[1]) / Math.log(2)) : 2;
            return Math.pow(seq.length + 1, pow);
        case 'mixed':
            return seq[seq.length - 1] + (seq[seq.length - 1] - seq[seq.length - 2]);
    }
    
    return seq[seq.length - 1] + 1;
}

/**
 * ÄNDERUNG: Generiert Antwortoptionen mit größeren Abständen
 */
function generateChoices(correct, count) {
    const choices = [correct];
    
    while (choices.length < count) {
        // Größere Abstände zwischen falschen Antworten
        const offset = Math.floor(Math.random() * 80) - 40;
        const candidate = correct + offset;
        
        if (!choices.includes(candidate) && candidate > 0) {
            choices.push(candidate);
        }
    }
    
    return choices.slice(0, count);
}

/**
 * Berechnet Fakultät
 */
function factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

/**
 * Rendert Spielbereich
 */
function renderGameArea() {
    const levelConfig = LEVEL_CONFIG[state.level];
    
    UI.setGameContent(`
        <div class="pattern-breaker-container">
            <div class="pattern-header">
                <div class="pattern-stat">
                    <span class="pattern-label">Score</span>
                    <span class="pattern-value" id="pattern-score">${state.score}</span>
                </div>
                <div class="pattern-stat">
                    <span class="pattern-label">Streak</span>
                    <span class="pattern-value" id="pattern-streak">${state.streakCount}</span>
                </div>
                <div class="pattern-stat">
                    <span class="pattern-label">Zeit</span>
                    <span class="pattern-value" id="pattern-time">${state.timeLeft}s</span>
                </div>
            </div>
            
            <div class="pattern-content">
                <div class="pattern-label-box">
                    <span class="pattern-type">${PATTERN_TYPES[state.currentPattern].name}</span>
                </div>
                
                <div class="pattern-sequence" id="pattern-sequence">
                    ${state.currentSequence.map((num, i) => `
                        <div class="pattern-number" style="animation-delay: ${i * 0.1}s">
                            ${num}
                        </div>
                    `).join('')}
                    <div class="pattern-question">?</div>
                </div>
                
                <div class="pattern-info">
                    Wie geht die Reihe weiter?
                </div>
                
                <div class="pattern-choices" id="pattern-choices">
                    ${state.choices.map((choice, i) => `
                        <button class="pattern-choice-btn" data-choice="${choice}">
                            ${choice}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `);
    
    injectStyles();
    UI.updateGameDisplay({ level: state.level, score: state.score });
    
    setupEventListeners();
}

/**
 * Injiziert Styles
 */
function injectStyles() {
    const existingStyle = document.querySelector('style[data-pattern-style]');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.setAttribute('data-pattern-style', 'true');
    style.textContent = `
        .pattern-breaker-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            overflow: hidden;
        }

        .pattern-header {
            display: flex;
            justify-content: space-around;
            padding: 1.5rem 1rem;
            background: rgba(0, 0, 0, 0.4);
            border-bottom: 2px solid rgba(59, 130, 246, 0.3);
        }

        .pattern-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
        }

        .pattern-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.1em;
            opacity: 0.8;
            color: #94a3b8;
        }

        .pattern-value {
            font-size: 1.5rem;
            font-weight: 900;
            color: #3b82f6;
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        }

        .pattern-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;
            padding: 1.5rem;
            overflow-y: auto;
        }

        .pattern-label-box {
            background: rgba(59, 130, 246, 0.2);
            border: 2px solid rgba(59, 130, 246, 0.5);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }

        .pattern-type {
            font-size: 1.1rem;
            font-weight: 700;
            color: #93c5fd;
            letter-spacing: 0.05em;
        }

        .pattern-sequence {
            display: flex;
            gap: 1rem;
            align-items: center;
            padding: 2rem 1rem;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 12px;
            border: 2px solid rgba(59, 130, 246, 0.2);
            margin: 1rem 0;
            flex-wrap: wrap;
            justify-content: center;
        }

        .pattern-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            border-radius: 8px;
            font-size: 1.4rem;
            font-weight: 900;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            animation: slideIn 0.5s ease-out forwards;
            opacity: 0;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .pattern-question {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(59, 130, 246, 0.3);
            border: 3px dashed rgba(59, 130, 246, 0.6);
            border-radius: 8px;
            font-size: 1.8rem;
            font-weight: 900;
            color: #60a5fa;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        .pattern-info {
            font-size: 0.95rem;
            color: #cbd5e1;
            text-align: center;
            margin: 1rem 0;
        }

        .pattern-choices {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 0.75rem;
            width: 100%;
            max-width: 400px;
        }

        .pattern-choice-btn {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%);
            border: 2px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            color: #93c5fd;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .pattern-choice-btn:hover:not(:disabled) {
            border-color: #3b82f6;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            transform: translateY(-2px);
        }

        .pattern-choice-btn:active:not(:disabled) {
            transform: translateY(0);
        }

        .pattern-choice-btn.correct {
            border-color: #10b981;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%);
            color: #6ee7b7;
            box-shadow: 0 0 25px rgba(16, 185, 129, 0.5);
        }

        .pattern-choice-btn.wrong {
            border-color: #ef4444;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%);
            color: #fca5a5;
            box-shadow: 0 0 25px rgba(239, 68, 68, 0.5);
        }

        .pattern-choice-btn:disabled {
            cursor: not-allowed;
        }

        @media (max-width: 640px) {
            .pattern-sequence {
                gap: 0.75rem;
                padding: 1.5rem 0.75rem;
            }

            .pattern-number, .pattern-question {
                width: 50px;
                height: 50px;
                font-size: 1.1rem;
            }

            .pattern-choices {
                grid-template-columns: repeat(2, 1fr);
            }

            .pattern-choice-btn {
                padding: 0.75rem;
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener
 */
function setupEventListeners() {
    const buttons = document.querySelectorAll('.pattern-choice-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!state.isGameActive) return;
            
            const choice = parseInt(btn.dataset.choice);
            state.selectedAnswer = choice;
            
            // Disable alle Buttons
            buttons.forEach(b => b.disabled = true);
            
            // Richtige Antwort zeigen
            const correct = getPatternNext(state.currentPattern, state.currentSequence);
            buttons.forEach(b => {
                const btnChoice = parseInt(b.dataset.choice);
                if (btnChoice === correct) {
                    b.classList.add('correct');
                }
            });
            
            // Feedback
            if (choice === correct) {
                await handleCorrect();
            } else {
                btn.classList.add('wrong');
                await handleWrong();
            }
        });
    });
}

/**
 * ÄNDERUNG: Korrekte Antwort - weniger aggressive Bonuse
 */
async function handleCorrect() {
    state.correctAnswers++;
    state.streakCount++;
    const basePoints = 50 + (state.level * 20);
    const streakBonus = Math.floor(state.streakCount / 2) * 5; // Weniger Streak-Bonus
    const timeBonus = Math.floor(state.timeLeft / 5); // Weniger Zeit-Bonus
    const points = basePoints + streakBonus + timeBonus;
    
    state.score += points;
    
    updateDisplay();
    await UI.showFeedback('success', `+${points} Punkte! Streak: ${state.streakCount}`, 1000);
    
    state.round++;
    startRound();
}

/**
 * Behandelt falsche Antwort
 */
async function handleWrong() {
    state.streakCount = 0;
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', 'Falsch! Aber weiter geht\'s!', 1200);
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', 'Game Over!', 1500);
        endGame();
    }
}

/**
 * Aktualisiert Display
 */
function updateDisplay() {
    const scoreEl = document.getElementById('pattern-score');
    const streakEl = document.getElementById('pattern-streak');
    const timeEl = document.getElementById('pattern-time');
    
    if (scoreEl) scoreEl.textContent = state.score;
    if (streakEl) streakEl.textContent = state.streakCount;
    if (timeEl) timeEl.textContent = state.timeLeft;
    
    UI.updateGameDisplay({ score: state.score });
}

/**
 * Startet Timer
 */
function startTimer() {
    state.gameTimer = setInterval(() => {
        state.timeLeft--;
        updateDisplay();
        
        if (state.timeLeft <= 0) {
            clearInterval(state.gameTimer);
            handleTimeout();
        }
    }, 1000);
}

/**
 * Behandelt Zeitüberschreitung
 */
async function handleTimeout() {
    state.isGameActive = false;
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', 'Zeit vorbei!', 1500);
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', 'Zeit vorbei!', 1500);
        endGame();
    }
}

/**
 * Beendet Spiel
 */
function endGame() {
    if (state.gameTimer) clearInterval(state.gameTimer);
    state.isGameActive = false;
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'patternbreaker',
            score: state.score,
            level: state.level,
            mode: state.mode,
            round: state.round
        });
    }
}

/**
 * Stoppt Spiel
 */
export function stop() {
    if (state.gameTimer) clearInterval(state.gameTimer);
    state.isGameActive = false;
}