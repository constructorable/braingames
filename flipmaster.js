/* =========================================
   Flip Master Game
   Klicke die Karten in der richtigen Reihenfolge!
   Schnelle Reaktionen = Hohe Punkte
   ========================================= */

import * as UI from './ui.js';

// Level-Konfiguration
const LEVEL_CONFIG = {
    1:  { cardCount: 4, flipSpeed: 2000, sequenceLength: 3, timeLimit: 60 },
    2:  { cardCount: 4, flipSpeed: 1800, sequenceLength: 4, timeLimit: 60 },
    3:  { cardCount: 6, flipSpeed: 1600, sequenceLength: 4, timeLimit: 55 },
    4:  { cardCount: 6, flipSpeed: 1400, sequenceLength: 5, timeLimit: 55 },
    5:  { cardCount: 8, flipSpeed: 1200, sequenceLength: 5, timeLimit: 50 },
    6:  { cardCount: 8, flipSpeed: 1000, sequenceLength: 6, timeLimit: 50 },
    7:  { cardCount: 9, flipSpeed: 900, sequenceLength: 6, timeLimit: 45 },
    8:  { cardCount: 9, flipSpeed: 800, sequenceLength: 7, timeLimit: 45 },
    9:  { cardCount: 12, flipSpeed: 700, sequenceLength: 7, timeLimit: 40 },
    10: { cardCount: 12, flipSpeed: 600, sequenceLength: 8, timeLimit: 40 }
};

// Emoji-Sets für verschiedene Kartenserien
const CARD_EMOJIS = ['🍎', '🍌', '🍊', '🍓', '🍇', '🍉', '🍒', '🥝', '🍑', '🥑', '🍍', '🥥'];

// Spielzustand
let state = {
    level: 1,
    mode: 'endless',
    score: 0,
    round: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: 0,
    callbacks: null,
    isGameActive: false,
    gameTimer: null,
    cards: [],
    currentSequence: [],
    flippedCards: new Set(),
    selectedCards: [],
    isProcessing: false,
    currentFlipIndex: 0,
    flipInterval: null
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
        combo: 0,
        maxCombo: 0,
        timeLeft: 0,
        callbacks,
        isGameActive: false,
        gameTimer: null,
        cards: [],
        currentSequence: [],
        flippedCards: new Set(),
        selectedCards: [],
        isProcessing: false,
        currentFlipIndex: 0,
        flipInterval: null
    };
    
    UI.showTimer(false);
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.isGameActive = true;
    state.selectedCards = [];
    state.isProcessing = false;
    state.currentFlipIndex = 0;
    
    const levelConfig = LEVEL_CONFIG[state.level];
    state.timeLeft = levelConfig.timeLimit;
    
    generateRound(levelConfig);
    renderGameArea();
    startCardFlipping(levelConfig);
    startTimer();
}

/**
 * Generiert eine neue Runde
 */
function generateRound(levelConfig) {
    // Erstelle Karten
    state.cards = [];
    const selectedEmojis = CARD_EMOJIS.slice(0, levelConfig.cardCount);
    
    for (let i = 0; i < levelConfig.cardCount; i++) {
        state.cards.push({
            id: i,
            emoji: selectedEmojis[i],
            isFlipped: false
        });
    }
    
    // Generiere Sequenz (welche Karten in welcher Reihenfolge zu klicken)
    state.currentSequence = [];
    for (let i = 0; i < levelConfig.sequenceLength; i++) {
        const randomId = Math.floor(Math.random() * levelConfig.cardCount);
        state.currentSequence.push(randomId);
    }
    
    state.flippedCards = new Set();
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    const levelConfig = LEVEL_CONFIG[state.level];
    const cols = Math.ceil(Math.sqrt(state.cards.length));
    
    UI.setGameContent(`
        <div class="flip-master-container">
            <div class="flip-header">
                <div class="flip-stat">
                    <span class="flip-label">Score</span>
                    <span class="flip-value" id="flip-score">${state.score}</span>
                </div>
                <div class="flip-stat">
                    <span class="flip-label">Combo</span>
                    <span class="flip-value" id="flip-combo">${state.combo}</span>
                </div>
                <div class="flip-stat">
                    <span class="flip-label">Zeit</span>
                    <span class="flip-value" id="flip-time">${state.timeLeft}s</span>
                </div>
            </div>
            
            <div class="flip-instruction">
                Klicke die Karten in dieser Reihenfolge:
                <span class="flip-sequence-preview">${state.currentSequence.map((id, i) => `
                    <span class="flip-preview-item">${i + 1}</span>
                `).join('')}</span>
            </div>
            
            <div class="flip-board" style="--cols: ${cols};">
                ${state.cards.map((card, index) => `
                    <div class="flip-card" data-id="${card.id}">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">?</div>
                            <div class="flip-card-back">${card.emoji}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="flip-progress">
                <span id="flip-progress-text">Warte auf die Karten...</span>
            </div>
        </div>
    `);
    
    injectStyles();
    UI.updateGameDisplay({ level: state.level, score: state.score });
    
    setupEventListeners();
}

/**
 * Startet das automatische Flippen der Karten
 */
function startCardFlipping(levelConfig) {
    let delayCounter = 1000; // 1 Sekunde vor dem ersten Flip
    
    // Zeige jede Karte in der Sequenz
    state.currentSequence.forEach((cardId, index) => {
        setTimeout(() => {
            if (!state.isGameActive) return;
            
            // Flip die Karte
            const cardEl = document.querySelector(`[data-id="${cardId}"]`);
            if (cardEl) {
                cardEl.classList.add('flipped');
                state.flippedCards.add(cardId);
                
                // Gib ihr einen Glow
                cardEl.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.8)';
            }
            
            // Update Progress
            const progressEl = document.getElementById('flip-progress-text');
            if (progressEl) {
                progressEl.textContent = `Karte ${index + 1} von ${state.currentSequence.length}`;
            }
        }, delayCounter + index * levelConfig.flipSpeed);
        
        // Flip zurück nach kurzer Zeit
        setTimeout(() => {
            if (!state.isGameActive) return;
            
            const cardEl = document.querySelector(`[data-id="${cardId}"]`);
            if (cardEl) {
                cardEl.classList.remove('flipped');
                cardEl.style.boxShadow = '';
            }
        }, delayCounter + index * levelConfig.flipSpeed + 600);
    });
    
    // Nach der Sequenz: Spieler ist dran
    const playerStartDelay = delayCounter + state.currentSequence.length * levelConfig.flipSpeed + 1000;
    setTimeout(() => {
        if (!state.isGameActive) return;
        
        const progressEl = document.getElementById('flip-progress-text');
        if (progressEl) {
            progressEl.textContent = 'DEIN ZIEL: ' + state.currentSequence.map((id, i) => `#${i + 1}`).join(' → ');
        }
        state.isProcessing = false;
    }, playerStartDelay);
}

/**
 * Injiziert Styles
 */
function injectStyles() {
    const existingStyle = document.querySelector('style[data-flip-style]');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.setAttribute('data-flip-style', 'true');
    style.textContent = `
        .flip-master-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            overflow: hidden;
        }

        .flip-header {
            display: flex;
            justify-content: space-around;
            padding: 1.5rem 1rem;
            background: rgba(0, 0, 0, 0.5);
            border-bottom: 3px solid rgba(59, 130, 246, 0.3);
        }

        .flip-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
        }

        .flip-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.1em;
            opacity: 0.8;
            color: #94a3b8;
        }

        .flip-value {
            font-size: 1.5rem;
            font-weight: 900;
            color: #3b82f6;
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        }

        .flip-instruction {
            padding: 1rem;
            background: rgba(59, 130, 246, 0.1);
            border-bottom: 2px solid rgba(59, 130, 246, 0.2);
            text-align: center;
            font-size: 0.9rem;
            color: #cbd5e1;
        }

        .flip-sequence-preview {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            margin-top: 0.5rem;
            flex-wrap: wrap;
        }

        .flip-preview-item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        .flip-board {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(var(--cols), 1fr);
            gap: 1rem;
            padding: 1.5rem;
            overflow-y: auto;
            align-content: start;
        }

        .flip-card {
            aspect-ratio: 1;
            cursor: pointer;
            perspective: 1000px;
            position: relative;
        }

        .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            transform-style: preserve-3d;
        }

        .flip-card.flipped .flip-card-inner {
            transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            backface-visibility: hidden;
            border-radius: 12px;
            border: 3px solid rgba(59, 130, 246, 0.4);
            font-weight: 700;
        }

        .flip-card-front {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            color: #60a5fa;
            font-size: 2rem;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease;
        }

        .flip-card:not(.disabled):hover .flip-card-front {
            background: linear-gradient(135deg, #1e40af 0%, #0c4a6e 100%);
            box-shadow: 0 12px 30px rgba(59, 130, 246, 0.5);
            border-color: rgba(59, 130, 246, 0.8);
        }

        .flip-card-back {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            font-size: 2.5rem;
            transform: rotateY(180deg);
            box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.2), 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .flip-card.correct .flip-card-front,
        .flip-card.correct .flip-card-back {
            border-color: #10b981;
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
        }

        .flip-card.wrong .flip-card-front,
        .flip-card.wrong .flip-card-back {
            border-color: #ef4444;
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.8);
            animation: shake 0.5s;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }

        .flip-card.disabled {
            pointer-events: none;
            opacity: 0.6;
        }

        .flip-progress {
            padding: 1rem;
            background: rgba(0, 0, 0, 0.5);
            border-top: 2px solid rgba(59, 130, 246, 0.2);
            text-align: center;
            font-size: 1rem;
            font-weight: 700;
            color: #93c5fd;
            letter-spacing: 0.05em;
        }

        @media (max-width: 640px) {
            .flip-board {
                gap: 0.75rem;
                padding: 1rem;
            }

            .flip-card-front {
                font-size: 1.5rem;
            }

            .flip-card-back {
                font-size: 2rem;
            }

            .flip-header {
                padding: 1rem;
            }

            .flip-label {
                font-size: 0.65rem;
            }

            .flip-value {
                font-size: 1.2rem;
            }

            .flip-instruction {
                padding: 0.75rem;
                font-size: 0.8rem;
            }
        }

        @media (orientation: portrait) and (max-height: 900px) {
            .flip-board {
                gap: 0.6rem;
                padding: 1rem;
            }

            .flip-card-front {
                font-size: 1.3rem;
            }

            .flip-card-back {
                font-size: 1.8rem;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener
 */
function setupEventListeners() {
    const cards = document.querySelectorAll('.flip-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (!state.isGameActive || state.isProcessing) return;
            
            handleCardClick(card);
        });
    });
}

/**
 * ÄNDERUNG: Behandelt Kartenklik
 */
function handleCardClick(cardEl) {
    const cardId = parseInt(cardEl.dataset.id);
    const expectedCardId = state.currentSequence[state.selectedCards.length];
    
    if (cardId === expectedCardId) {
        // RICHTIG!
        state.selectedCards.push(cardId);
        cardEl.classList.add('correct');
        
        const comboBonus = state.combo * 5;
        const speedBonus = Math.floor(state.timeLeft / 10);
        const points = 100 + comboBonus + speedBonus;
        
        state.score += points;
        state.combo++;
        state.maxCombo = Math.max(state.maxCombo, state.combo);
        
        updateDisplay();
        
        // Prüfe ob Sequenz komplett
        if (state.selectedCards.length === state.currentSequence.length) {
            handleRoundWon();
        }
    } else {
        // FALSCH!
        cardEl.classList.add('wrong');
        state.combo = 0;
        updateDisplay();
        
        setTimeout(() => {
            handleWrongAnswer();
        }, 500);
    }
}

/**
 * Behandelt Rundengewinn
 */
async function handleRoundWon() {
    state.isProcessing = true;
    state.isGameActive = false;
    
    await UI.showFeedback('success', `Perfekt! +${state.score} Punkte! 🎉`, 1200);
    
    state.round++;
    startRound();
}

/**
 * Behandelt falsche Antwort
 */
async function handleWrongAnswer() {
    state.isGameActive = false;
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', 'Falsch! Aber es geht weiter!', 1000);
        state.selectedCards = [];
        state.isGameActive = true;
    } else {
        await UI.showFeedback('error', 'Game Over!', 1500);
        endGame();
    }
}

/**
 * Aktualisiert Display
 */
function updateDisplay() {
    const scoreEl = document.getElementById('flip-score');
    const comboEl = document.getElementById('flip-combo');
    const timeEl = document.getElementById('flip-time');
    
    if (scoreEl) scoreEl.textContent = state.score;
    if (comboEl) comboEl.textContent = state.combo;
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
        state.selectedCards = [];
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
    if (state.flipInterval) clearInterval(state.flipInterval);
    state.isGameActive = false;
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'flipmaster',
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
    if (state.flipInterval) clearInterval(state.flipInterval);
    state.isGameActive = false;
}