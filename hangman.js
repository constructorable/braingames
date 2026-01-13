/* =========================================
   Hangman Spiel
   Erraten Sie das Wort - Falsche Buchstaben
   führen zum Galgenmännchen
   ========================================= */

import * as UI from './ui.js';

// Wortdatenbank nach Schwierigkeitsstufe
const WORDS_BY_DIFFICULTY = {
    1: [
        'HAUS', 'BAUM', 'TISCH', 'STUHL', 'NASE', 'OFEN', 'WALD', 'FEST', 'GLUT',
        'HAND', 'KOPF', 'BLEI', 'FUSS', 'HAUT', 'LUFT', 'MAIS', 'MAUS', 'NEST',
        'PILZ', 'RABE', 'SALZ', 'TEST', 'TURM', 'ZIEL', 'BOOT', 'DACH', 'FALKE',
        'GIFT', 'HALT', 'HOSE', 'HUND', 'JEANS', 'KALT', 'KERN', 'KIND', 'KLUB',
        'LACK', 'LAGER', 'LAMM', 'LAND', 'LEER', 'LOCH', 'LOGO', 'LUST', 'MACH'
    ],
    2: [
        'APFEL', 'BLUME', 'FARBE', 'FROSCH', 'GAESTE', 'GEFUEHL', 'GLAUBE', 'GLUECK',
        'GRUND', 'GRUENE', 'HALLO', 'HAMMER', 'HASEN', 'HEIDE', 'HERTZ', 'HIMMEL',
        'HOBBY', 'HOEHLE', 'HOTEL', 'HUSTEN', 'IMAGE', 'INSEL', 'JACKE', 'JAPAN',
        'JEDES', 'JENER', 'JETZT', 'JUBEL', 'KABEL', 'KAESE', 'KAISER', 'KAMMER',
        'KAMPF', 'KANAL', 'KANTE', 'KAPUT', 'KARTE', 'KATZE', 'KAUFE', 'KAUM'
    ],
    3: [
        'FAHRRAD', 'FENSTER', 'FESTIVAL', 'FEUER', 'FILIALE', 'FINGER', 'FLASCHE',
        'FLEISCH', 'FLIEGEN', 'FLUESSE', 'FLAECHE', 'FREUND', 'FRIEDEN', 'FUEHLUNG',
        'FUELLE', 'FURCHT', 'GARTEN', 'GAESTE', 'GEBAEUDE', 'GEBRAUCH', 'GEDANKE',
        'GEFUEHL', 'GEGEND', 'GEGNER', 'GEHALT', 'GEHEIM', 'GEIST', 'GELANG',
        'GELB', 'GELD', 'GELEHRTE', 'GELIEBTE', 'GEMEINDE', 'GEMUESE', 'GENAUIGKEIT'
    ],
    4: [
        'BAUSTELLE', 'BEACHTUNG', 'BEAMTETE', 'BEARBEITET', 'BEARBEITUNG', 'BEAUFTRAG',
        'BEAUMARIS', 'BEAUMONT', 'BEAUPRE', 'BEAUQUIER', 'BEAUSMONT', 'BEAUTIFIER',
        'BEAAUTIES', 'BEAUFRAGE', 'BEAUGUNG', 'BEAUMONTE', 'BEAUTIQUE', 'BEAUSANG',
        'BEAUTISAN', 'BEAUTYSAN', 'BERFASTER', 'BERGSTUHL', 'BERTSCHUNG', 'BERUEFUNG',
        'BERUFDUNG', 'BERUFLICH', 'BERUFUNG', 'BERUEFUNG', 'BESAMLUNG', 'BESAETIGUNG'
    ],
    5: [
        'SCHREIBTISCH', 'SCHREIBSTIFT', 'SCHREINER', 'SCHRIFTSTELLER', 'SCHRIFTENLEHRER',
        'SCHRIFTE', 'SCHRIFTEN', 'SCHRIFT', 'SCHRIFTFUEHRER', 'SCHRIFTGELEHRTE',
        'SCHRIFTGELEHRTER', 'SCHRIFTGELEHRTEN', 'SCHRIFTLEITER', 'SCHRIFTLESER',
        'SCHRIFTSETZER', 'SCHRIFTSINN', 'SCHRIFTSPRACHE', 'SCHRIFTSTUECK', 'SCHRIFTTUMER',
        'SCHRIFTZUG', 'SCHRIFTZUEGE', 'SCHRIFTWERK', 'SCHRIFTENWERK', 'SCHRIFTENBESTAND'
    ],
    6: [
        'FREUNDSCHAFT', 'HERAUSFORDERUNG', 'ABENTEUER', 'BERGSTEIGER', 'ENTWICKLUNG',
        'FANTASTISCH', 'UNGLAUBLICH', 'SICHERHEIT', 'ZUSAMMENHANG', 'SPAZIERGANEGER',
        'VERSTAENDNIS', 'MUSIKALISCH', 'UNTERSCHIED', 'INTELLIGENZ', 'PERSOENLICHKEIT',
        'LEIDENSCHAFT', 'SELBSTBEWUSSTSEIN', 'KOOPERATIV', 'METAMORPHOSE', 'ATMOSPHAERE',
        'TRANSFORMATION', 'KALEIDOSKOP', 'WIDERSPRUCHLICH', 'UNBEGRENZTHEIT', 'MANIFESTATION'
    ],
    7: [
        'ZUSAMMENGENOMMENHEIT', 'WISSENSCHAFTLICH', 'KOORDINATION', 'BEWUSSTSEINSERWEITERUNG',
        'VERANTWORTUNGSBEWUSSTSEIN', 'GESCHICHTSSCHREIBUNG', 'NATURWISSENSCHAFTLICH',
        'ARCHAEOLOGISCHE', 'ABENTEURLICHKEIT', 'ABENTEUERLUST', 'ABENTEURLUSTIG',
        'ABENTEUERSERIE', 'ABENTEUERSINN', 'ABENTEUERSINNIG', 'ABENTEUERSPIRIT',
        'ABENTEUERSTOFF', 'ABENTEUERSTUNDE', 'ABENTEUERSUCHT', 'ABENTEUERTUM', 'ABENTEUERVOLL'
    ],
    8: [
        'VERANTWORTUNGSBEWUSSTSEIN', 'GESCHICHTSSCHREIBUNG', 'NATURWISSENSCHAFTLICH',
        'ARCHAEOLOGISCHE', 'ABENTEUERLUSTIGKEIT', 'ABENTEURLUSTIG', 'ABENTEUERSUCHTIG',
        'WIDERSPRUCHSVOLL', 'WAHRSCHEINLICHKEIT', 'WISSENSCHAFTLICHKEIT', 'VERSTAENDLICHKEIT',
        'VERANTWORTUNGSVOLL', 'UNVERANTWORTLICHKEIT', 'AUFMERKSAMKEIT', 'SICHERHEITSBESTIMMUNG',
        'GEHEIMHALTUNG', 'GEHEIMNISSVOLL', 'GEHEIMSPION', 'GEHEIMNISKRAEMEREI', 'GEHEIMNISKRAEMER'
    ],
    9: [
        'VERANTWORTUNGSBEWUSSTSEIN', 'GESCHICHTSSCHREIBUNG', 'NATURWISSENSCHAFTLICH',
        'ARCHAEOLOGISCHE', 'ABENTEUERLUSTIGKEIT', 'ABENTEURLUSTIG', 'ABENTEUERSUCHTIG',
        'WIDERSPRUCHSVOLL', 'WAHRSCHEINLICHKEIT', 'WISSENSCHAFTLICHKEIT', 'VERSTAENDLICHKEIT',
        'VERANTWORTUNGSVOLL', 'UNVERANTWORTLICHKEIT', 'AUFMERKSAMKEIT', 'SICHERHEITSBESTIMMUNG',
        'GEHEIMHALTUNG', 'GEHEIMNISSVOLL', 'WIDERSPRUCHSLOSIGKEIT', 'BEDENKENLOSIGKEIT', 'UNZUVERLAESSIGKEIT'
    ],
    10: [
        'VERANTWORTUNGSBEWUSSTSEIN', 'GESCHICHTSSCHREIBUNG', 'NATURWISSENSCHAFTLICH',
        'ARCHAEOLOGISCHE', 'ABENTEUERLUSTIGKEIT', 'ABENTEURLUSTIG', 'ABENTEUERSUCHTIG',
        'WIDERSPRUCHSVOLL', 'WAHRSCHEINLICHKEIT', 'WISSENSCHAFTLICHKEIT', 'VERSTAENDLICHKEIT',
        'VERANTWORTUNGSVOLL', 'UNVERANTWORTLICHKEIT', 'AUFMERKSAMKEIT', 'SICHERHEITSBESTIMMUNG',
        'GEHEIMHALTUNG', 'GEHEIMNISSVOLL', 'WIDERSPRUCHSLOSIGKEIT', 'BEDENKENLOSIGKEIT', 'UNZUVERLAESSIGKEIT'
    ]
};

// Hangman Zeichnungen
const HANGMAN_STAGES = [
    // 0 Fehler
    `
    ------
    |    |
    |
    |
    |
    |
    --------`,
    // 1 Fehler
    `
    ------
    |    |
    |    O
    |
    |
    |
    --------`,
    // 2 Fehler
    `
    ------
    |    |
    |    O
    |    |
    |
    |
    --------`,
    // 3 Fehler
    `
    ------
    |    |
    |    O
    |   \\|
    |
    |
    --------`,
    // 4 Fehler
    `
    ------
    |    |
    |    O
    |   \\|/
    |
    |
    --------`,
    // 5 Fehler
    `
    ------
    |    |
    |    O
    |   \\|/
    |    |
    |
    --------`,
    // 6 Fehler (Game Over)
    `
    ------
    |    |
    |    O
    |   \\|/
    |    |
    |   / \\
    --------`
];

// Spielzustand
let state = {
    secretWord: '',
    guessedLetters: [],
    wrongLetters: [],
    level: 1,
    mode: 'endless',
    score: 0,
    round: 1,
    isGameActive: false,
    timer: null,
    timeLeft: 0,
    callbacks: null,
    maxWrongs: 6
};

/**
 * Startet das Spiel
 */
export function start(config, callbacks) {
    state = {
        secretWord: '',
        guessedLetters: [],
        wrongLetters: [],
        level: config.level,
        mode: config.mode,
        score: 0,
        round: 1,
        isGameActive: false,
        timer: null,
        timeLeft: 0,
        callbacks,
        maxWrongs: 6
    };
    
    UI.showTimer(config.mode === 'timed');
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.guessedLetters = [];
    state.wrongLetters = [];
    
    selectRandomWord();
    renderGameArea();
    
    if (state.mode === 'timed') {
        state.timeLeft = 60;
        startTimer();
    }
}

/**
 * Wählt zufälliges Wort
 */
function selectRandomWord() {
    const words = WORDS_BY_DIFFICULTY[state.level];
    state.secretWord = words[Math.floor(Math.random() * words.length)];
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    state.isGameActive = true;
    
    UI.setGameContent(`
        <div class="hangman-container">
            <div class="hangman-display">
                <pre class="gallows-ascii" id="gallows">${HANGMAN_STAGES[state.wrongLetters.length]}</pre>
                <div class="hangman-stats">
                    <span class="stat-item">Fehler: <strong>${state.wrongLetters.length}/${state.maxWrongs}</strong></span>
                </div>
            </div>
            
            <div class="hangman-word-display">
                <div class="word-placeholder" id="word-display">
                    ${getDisplayWord()}
                </div>
            </div>
            
            <div class="hangman-guesses">
                <div class="guessed-section">
                    <h4>Erratene Buchstaben:</h4>
                    <div class="guessed-letters" id="guessed-display">
                        ${state.guessedLetters.length > 0 ? state.guessedLetters.join(' ') : 'Keine'}
                    </div>
                </div>
                <div class="wrong-section">
                    <h4>Falsche Buchstaben:</h4>
                    <div class="wrong-letters" id="wrong-display">
                        ${state.wrongLetters.length > 0 ? state.wrongLetters.join(' ') : 'Keine'}
                    </div>
                </div>
            </div>
            
            <div class="hangman-keyboard" id="hangman-keyboard">
                <!-- Tastatur wird hier generiert -->
            </div>
        </div>
    `);
    
    injectHangmanStyles();
    
    UI.updateGameDisplay({
        level: state.level,
        score: state.score,
        time: state.mode === 'timed' ? state.timeLeft : null
    });
    
    renderKeyboard();
    setupEventListeners();
}

/**
 * Gibt das angezeigte Wort mit Unterstrichen zurück
 */
function getDisplayWord() {
    return state.secretWord
        .split('')
        .map(letter => state.guessedLetters.includes(letter) ? letter : '_')
        .join(' ');
}

/**
 * Rendert die Tastatur
 */
function renderKeyboard() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const keyboard = document.getElementById('hangman-keyboard');
    
    keyboard.innerHTML = alphabet.map(letter => {
        const isGuessed = state.guessedLetters.includes(letter) || state.wrongLetters.includes(letter);
        const isWrong = state.wrongLetters.includes(letter);
        
        return `
            <button class="hangman-key ${isGuessed ? 'disabled' : ''} ${isWrong ? 'wrong' : ''}" 
                    data-letter="${letter}"
                    ${isGuessed ? 'disabled' : ''}>
                ${letter}
            </button>
        `;
    }).join('');
}

/**
 * Injiziert Hangman-spezifische Styles
 */
function injectHangmanStyles() {
    const existingStyle = document.querySelector('style[data-hangman-style]');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.setAttribute('data-hangman-style', 'true');
    style.textContent = `
        .hangman-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            padding: 1.5rem;
        }

        .hangman-display {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 2rem;
            padding: 1.5rem;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-md);
        }

        .gallows-ascii {
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.4;
            color: var(--color-text);
            white-space: pre;
            margin: 0;
            flex-shrink: 0;
        }

        .hangman-stats {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .stat-item {
            font-size: 1rem;
            color: var(--color-text-light);
        }

        .stat-item strong {
            color: var(--color-text);
            font-weight: 700;
        }

        .hangman-word-display {
            display: flex;
            justify-content: center;
            padding: 2rem 1.5rem;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-md);
            min-height: 100px;
        }

        .word-placeholder {
            font-size: 2.5rem;
            font-weight: 700;
            letter-spacing: 1.5rem;
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            text-align: center;
        }

        .hangman-guesses {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            padding: 1.5rem;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-md);
        }

        .guessed-section, .wrong-section {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .guessed-section h4, .wrong-section h4 {
            margin: 0;
            font-size: 0.9rem;
            color: var(--color-text-light);
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.05em;
        }

        .guessed-letters, .wrong-letters {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            min-height: 30px;
            align-items: center;
        }

        .guessed-letters {
            color: var(--color-success);
            font-weight: 600;
            letter-spacing: 0.1em;
        }

        .wrong-letters {
            color: var(--color-error);
            font-weight: 600;
            letter-spacing: 0.1em;
        }

        .hangman-keyboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(45px, 1fr));
            gap: 0.5rem;
            padding: 1.5rem;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-md);
            max-width: 600px;
            margin: 0 auto;
            width: 100%;
        }

        .hangman-key {
            padding: 0.75rem 0.5rem;
            font-size: 0.95rem;
            font-weight: 600;
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: var(--shadow-sm);
        }

        .hangman-key:hover:not(:disabled) {
            border-color: var(--color-primary);
            background: var(--color-primary-light);
            transform: translateY(-2px);
        }

        .hangman-key:active:not(:disabled) {
            transform: translateY(0);
        }

        .hangman-key.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: var(--color-bg-hover);
        }

        .hangman-key.wrong {
            border-color: var(--color-error);
            color: var(--color-error);
        }

        @media (max-width: 768px) {
            .hangman-display {
                flex-direction: column;
                gap: 1rem;
            }

            .hangman-guesses {
                grid-template-columns: 1fr;
            }

            .word-placeholder {
                font-size: 2rem;
                letter-spacing: 1rem;
            }

            .hangman-keyboard {
                grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
            }

            .hangman-key {
                padding: 0.6rem 0.4rem;
                font-size: 0.85rem;
            }
        }

        @media (max-width: 480px) {
            .hangman-container {
                padding: 1rem;
                gap: 1rem;
            }

            .word-placeholder {
                font-size: 1.5rem;
                letter-spacing: 0.8rem;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener
 */
function setupEventListeners() {
    const keyboard = document.getElementById('hangman-keyboard');
    
    keyboard.addEventListener('click', (e) => {
        const btn = e.target.closest('.hangman-key');
        if (!btn || !state.isGameActive) return;
        
        const letter = btn.dataset.letter;
        guessLetter(letter);
    });
}

/**
 * ÄNDERUNG: Buchstabe raten
 */
async function guessLetter(letter) {
    if (!state.isGameActive) return;
    if (state.guessedLetters.includes(letter) || state.wrongLetters.includes(letter)) return;
    
    if (state.secretWord.includes(letter)) {
        state.guessedLetters.push(letter);
        
        // Prüfe ob Wort komplett
        if (isWordComplete()) {
            await handleCorrect();
        } else {
            renderGameArea();
        }
    } else {
        state.wrongLetters.push(letter);
        
        // Prüfe ob Game Over
        if (state.wrongLetters.length >= state.maxWrongs) {
            await handleGameOver();
        } else {
            renderGameArea();
        }
    }
}

/**
 * Prüft ob Wort komplett erraten
 */
function isWordComplete() {
    return state.secretWord.split('').every(letter => state.guessedLetters.includes(letter));
}

/**
 * Behandelt richtig erratenes Wort
 */
async function handleCorrect() {
    state.isGameActive = false;
    
    const basePoints = state.secretWord.length * 15;
    const levelBonus = state.level * 10;
    const wrongPenalty = state.wrongLetters.length * 5;
    const roundPoints = Math.max(0, basePoints + levelBonus - wrongPenalty);
    
    state.score += roundPoints;
    
    await UI.showFeedback('success', `+${roundPoints} Punkte!`, 1000);
    
    UI.updateGameDisplay({ score: state.score });
    
    state.round++;
    startRound();
}

/**
 * Behandelt Game Over
 */
async function handleGameOver() {
    state.isGameActive = false;
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', `Das Wort war: ${state.secretWord}`, 2500);
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', `Game Over! Wort: ${state.secretWord}`, 2500);
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
    state.isGameActive = false;
    
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
    state.isGameActive = false;
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'hangman',
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
    state.isGameActive = false;
}