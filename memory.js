/* =========================================
   Memory Game
   Klassisches Gedächtnisspiel
   Smartphone-optimiert mit progressiven Levels
   ========================================= */

import * as UI from './ui.js';

// Karten-Symbole (Emojis für einfache Darstellung)
const CARD_SETS = {
    1: ['🍎', '🍌', '🍊', '🍋', '🍓', '🍒'],
    2: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊'],
    3: ['⚽', '🏀', '🎾', '🏐', '🏈', '⚾'],
    4: ['🌹', '🌻', '🌷', '🌼', '🌸', '🌺'],
    5: ['⭐', '🌙', '☀️', '⚡', '❄️', '🔥'],
    6: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️'],
    7: ['🎸', '🎹', '🎺', '🎻', '🥁', '🪕'],
    8: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮'],
    9: ['👑', '💎', '🎁', '🎀', '🎊', '🎉'],
    10: ['🧩', '🎮', '🎲', '🃏', '🎯', '🎪']
};

// Spielkonfiguration pro Level
const LEVEL_CONFIG = {
    1:  { pairs: 6, cardSize: 70 },
    2:  { pairs: 8, cardSize: 65 },
    3:  { pairs: 10, cardSize: 60 },
    4:  { pairs: 12, cardSize: 55 },
    5:  { pairs: 14, cardSize: 50 },
    6:  { pairs: 16, cardSize: 48 },
    7:  { pairs: 18, cardSize: 46 },
    8:  { pairs: 20, cardSize: 44 },
    9:  { pairs: 22, cardSize: 42 },
    10: { pairs: 24, cardSize: 40 }
};

// Spielzustand
let state = {
    level: 1,
    mode: 'endless',
    score: 0,
    pairs: 0,
    pairsFound: 0,
    moves: 0,
    callbacks: null,
    cards: [],
    flipped: [],
    matched: [],
    isProcessing: false,
    gameActive: false,
    startTime: 0,
    timeElapsed: 0,
    timer: null
};

/**
 * Startet das Spiel
 */
export function start(config, callbacks) {
    state = {
        level: config.level,
        mode: config.mode,
        score: 0,
        pairs: 0,
        pairsFound: 0,
        moves: 0,
        callbacks,
        cards: [],
        flipped: [],
        matched: [],
        isProcessing: false,
        gameActive: false,
        startTime: 0,
        timeElapsed: 0,
        timer: null
    };
    
    const config_data = LEVEL_CONFIG[state.level];
    state.pairs = config_data.pairs;
    
    UI.showTimer(false);
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.flipped = [];
    state.matched = [];
    state.moves = 0;
    state.pairsFound = 0;
    state.isProcessing = false;
    state.gameActive = true;
    state.startTime = Date.now();
    
    generateCards();
    renderGameArea();
}

/**
 * Generiert Karten
 */
function generateCards() {
    const symbols = CARD_SETS[state.level];
    state.cards = [];
    
    // Erstelle Paare
    for (let i = 0; i < state.pairs; i++) {
        const symbol = symbols[i % symbols.length];
        state.cards.push({ id: i * 2, symbol, matched: false });
        state.cards.push({ id: i * 2 + 1, symbol, matched: false });
    }
    
    // Shuffle
    for (let i = state.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.cards[i], state.cards[j]] = [state.cards[j], state.cards[i]];
    }
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    const config_data = LEVEL_CONFIG[state.level];
    const cols = Math.ceil(Math.sqrt(state.cards.length));
    
    UI.setGameContent(`
        <div class="memory-container">
            <div class="memory-header">
                <div class="memory-stat">
                    <span class="memory-label">Paare</span>
                    <span class="memory-value" id="memory-pairs">${state.pairsFound}/${state.pairs}</span>
                </div>
                <div class="memory-stat">
                    <span class="memory-label">Züge</span>
                    <span class="memory-value" id="memory-moves">${state.moves}</span>
                </div>
                <div class="memory-stat">
                    <span class="memory-label">Level</span>
                    <span class="memory-value">${state.level}</span>
                </div>
            </div>
            
            <div class="memory-board" id="memory-board" style="--cols: ${cols}; --card-size: ${config_data.cardSize}px;">
                ${state.cards.map((card, index) => `
                    <div class="memory-card" data-index="${index}" data-id="${card.id}">
                        <div class="memory-card-inner">
                            <div class="memory-card-front">?</div>
                            <div class="memory-card-back">${card.symbol}</div>
                        </div>
                    </div>
                `).join('')}
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
    const existingStyle = document.querySelector('style[data-memory-style]');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.setAttribute('data-memory-style', 'true');
    style.textContent = `
        .memory-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow: hidden;
        }

        .memory-header {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 3px solid rgba(255, 255, 255, 0.3);
            color: white;
        }

        .memory-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }

        .memory-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.1em;
            opacity: 0.9;
        }

        .memory-value {
            font-size: 1.5rem;
            font-weight: 900;
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
        }

        .memory-board {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(var(--cols), 1fr);
            gap: 0.75rem;
            padding: 1rem;
            overflow-y: auto;
            align-content: start;
        }

        .memory-card {
            width: var(--card-size);
            height: var(--card-size);
            margin: auto;
            cursor: pointer;
            perspective: 1000px;
        }

        .memory-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s;
            transform-style: preserve-3d;
        }

        .memory-card.flipped .memory-card-inner {
            transform: rotateY(180deg);
        }

        .memory-card.matched .memory-card-inner {
            transform: rotateY(180deg);
        }

        .memory-card-front,
        .memory-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            backface-visibility: hidden;
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            font-weight: 600;
        }

        .memory-card-front {
            background: linear-gradient(135deg, #4c63d2 0%, #bc83e3 100%);
            color: white;
            font-size: 1.5rem;
            font-weight: 900;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .memory-card-front:hover {
            background: linear-gradient(135deg, #5c73e2 0%, #cc93f3 100%);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .memory-card-back {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-size: 2rem;
            transform: rotateY(180deg);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .memory-card.matched .memory-card-front,
        .memory-card.matched .memory-card-back {
            background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
            border-color: rgba(0, 212, 170, 0.6);
        }

        .memory-card.disabled {
            pointer-events: none;
        }

        @media (max-width: 640px) {
            .memory-board {
                gap: 0.6rem;
                padding: 0.75rem;
            }

            .memory-header {
                padding: 0.75rem;
            }

            .memory-label {
                font-size: 0.65rem;
            }

            .memory-value {
                font-size: 1.2rem;
            }
        }

        @media (orientation: portrait) and (max-height: 900px) {
            .memory-board {
                gap: 0.5rem;
            }

            .memory-card {
                width: calc(var(--card-size) * 0.9);
                height: calc(var(--card-size) * 0.9);
            }

            .memory-card-back {
                font-size: 1.5rem;
            }

            .memory-card-front {
                font-size: 1.2rem;
            }
        }

        /* Kleine Screens */
        @media (max-height: 700px) {
            .memory-board {
                gap: 0.4rem;
                padding: 0.5rem;
            }

            .memory-card {
                width: calc(var(--card-size) * 0.8);
                height: calc(var(--card-size) * 0.8);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener
 */
function setupEventListeners() {
    const cards = document.querySelectorAll('.memory-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (!state.gameActive) return;
            flipCard(card);
        });
    });
}

/**
 * Flippt eine Karte
 */
function flipCard(cardEl) {
    const index = parseInt(cardEl.dataset.index);
    
    // Verhindere doppeltes Klicken
    if (state.flipped.includes(index) || state.matched.includes(index) || state.isProcessing) {
        return;
    }
    
    // Maximal 2 Karten gleichzeitig
    if (state.flipped.length >= 2) {
        return;
    }
    
    state.flipped.push(index);
    cardEl.classList.add('flipped');
    
    // Überprüfe bei 2 Karten
    if (state.flipped.length === 2) {
        state.moves++;
        updateDisplay();
        checkMatch();
    }
}

/**
 * Prüft Match
 */
async function checkMatch() {
    state.isProcessing = true;
    
    const index1 = state.flipped[0];
    const index2 = state.flipped[1];
    
    const card1 = state.cards[index1];
    const card2 = state.cards[index2];
    
    if (card1.symbol === card2.symbol) {
        // Match gefunden
        await delay(300);
        state.matched.push(index1, index2);
        state.pairsFound++;
        
        document.querySelector(`[data-index="${index1}"]`).classList.add('matched');
        document.querySelector(`[data-index="${index2}"]`).classList.add('matched');
        
        updateDisplay();
        
        if (state.pairsFound === state.pairs) {
            await delay(500);
            await handleGameWon();
        }
    } else {
        // Kein Match - Karten wieder umdrehen
        await delay(800);
        document.querySelector(`[data-index="${index1}"]`).classList.remove('flipped');
        document.querySelector(`[data-index="${index2}"]`).classList.remove('flipped');
    }
    
    state.flipped = [];
    state.isProcessing = false;
}

/**
 * Aktualisiert Display
 */
function updateDisplay() {
    const pairsEl = document.getElementById('memory-pairs');
    const movesEl = document.getElementById('memory-moves');
    
    if (pairsEl) pairsEl.textContent = `${state.pairsFound}/${state.pairs}`;
    if (movesEl) movesEl.textContent = state.moves;
    
    // Punkte berechnen: Je weniger Züge, desto mehr Punkte
    const basePoints = state.pairs * 100;
    const movesPenalty = state.moves * 5;
    state.score = Math.max(0, basePoints - movesPenalty);
    
    UI.updateGameDisplay({ score: state.score });
}

/**
 * Behandelt Spielgewinn
 */
async function handleGameWon() {
    state.gameActive = false;
    
    const timeBonus = Math.max(0, 300 - Math.floor(state.timeElapsed));
    const finalScore = state.score + timeBonus + (state.level * 100);
    
    await UI.showFeedback('success', `${state.pairs} Paare gefunden! +${finalScore} Punkte! 🎉`, 1500);
    
    endGame(finalScore);
}

/**
 * Beendet das Spiel
 */
function endGame(finalScore) {
    if (state.timer) clearInterval(state.timer);
    state.gameActive = false;
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'memory',
            score: finalScore,
            level: state.level,
            mode: state.mode,
            round: 1
        });
    }
}

/**
 * Stoppt das Spiel
 */
export function stop() {
    if (state.timer) clearInterval(state.timer);
    state.gameActive = false;
}

/**
 * Hilfsfunktion: Verzögerung
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}