/* =========================================
   Word Scramble Spiel
   Sortiere durcheinander gewürfelte Buchstaben
   in die richtige Reihenfolge
   ========================================= */

import * as UI from './ui.js';

// Wortdatenbank nach Schwierigkeitsstufe (exakte Buchstabenlänge)
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

// Spielkonfiguration pro Level
const LEVEL_CONFIG = {
    1:  { scrambleIntensity: 0.3, timeLimit: 45 },
    2:  { scrambleIntensity: 0.4, timeLimit: 40 },
    3:  { scrambleIntensity: 0.5, timeLimit: 35 },
    4:  { scrambleIntensity: 0.6, timeLimit: 30 },
    5:  { scrambleIntensity: 0.7, timeLimit: 28 },
    6:  { scrambleIntensity: 0.75, timeLimit: 25 },
    7:  { scrambleIntensity: 0.8, timeLimit: 22 },
    8:  { scrambleIntensity: 0.85, timeLimit: 20 },
    9:  { scrambleIntensity: 0.9, timeLimit: 18 },
    10: { scrambleIntensity: 0.95, timeLimit: 15 }
};

// Spielzustand
let state = {
    currentWord: '',
    scrambledLetters: [],
    selectedOrder: [],
    level: 1,
    mode: 'endless',
    score: 0,
    round: 1,
    isGameActive: false,
    timer: null,
    timeLeft: 0,
    callbacks: null,
    draggedIndex: null
};

/**
 * Startet das Spiel
 */
export function start(config, callbacks) {
    state = {
        currentWord: '',
        scrambledLetters: [],
        selectedOrder: [],
        level: config.level,
        mode: config.mode,
        score: 0,
        round: 1,
        isGameActive: false,
        timer: null,
        timeLeft: 0,
        callbacks,
        draggedIndex: null
    };
    
    UI.showTimer(config.mode === 'timed');
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.selectedOrder = [];
    state.draggedIndex = null;
    
    selectRandomWord();
    generateScrambledLetters();
    renderGameArea();
    
    if (state.mode === 'timed') {
        const config = LEVEL_CONFIG[state.level];
        state.timeLeft = config.timeLimit;
        startTimer();
    }
}

/**
 * Wählt zufälliges Wort aus Schwierigkeitsstufe
 */
function selectRandomWord() {
    const words = WORDS_BY_DIFFICULTY[state.level];
    state.currentWord = words[Math.floor(Math.random() * words.length)];
}

/**
 * Generiert gescramblte Buchstaben
 */
function generateScrambledLetters() {
    const letters = state.currentWord.split('');
    const config = LEVEL_CONFIG[state.level];
    
    // Fisher-Yates Shuffle mit Intensität
    for (let i = letters.length - 1; i > 0; i--) {
        if (Math.random() < config.scrambleIntensity) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
    }
    
    state.scrambledLetters = letters.map((letter, index) => ({ letter, id: index }));
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    state.isGameActive = true;
    
    UI.setGameContent(`
        <div class="scramble-container">
            <div class="word-info">
                <span class="hint-text">Länge: ${state.currentWord.length} Buchstaben</span>
            </div>
            <div class="scrambled-letters-area" id="scrambled-letters">
                <!-- Gescramblte Buchstaben hier -->
            </div>
            <div class="solution-area" id="solution-area">
                <!-- Richtige Anordnung hier -->
            </div>
            <div class="scramble-actions">
                <button id="reset-btn" class="action-btn reset-btn">
                    <i class="fas fa-redo"></i> Zurücksetzen
                </button>
                <button id="submit-btn" class="action-btn submit-btn">
                    <i class="fas fa-check"></i> Fertig
                </button>
            </div>
        </div>
    `);
    
    injectScrambleStyles();
    
    UI.updateGameDisplay({
        level: state.level,
        score: state.score,
        time: state.mode === 'timed' ? state.timeLeft : null
    });
    
    renderScrambledLetters();
    renderSolutionArea();
    setupEventListeners();
}

/**
 * Rendert die gescramblten Buchstaben
 */
function renderScrambledLetters() {
    const container = document.getElementById('scrambled-letters');
    
    container.innerHTML = state.scrambledLetters.map((item, index) => `
        <div class="letter-tile" draggable="true" data-id="${item.id}" data-index="${index}">
            ${item.letter}
        </div>
    `).join('');
}

/**
 * Rendert das Lösungsfeld
 */
function renderSolutionArea() {
    const container = document.getElementById('solution-area');
    
    container.innerHTML = `
        <div class="solution-slots">
            ${Array(state.currentWord.length).fill(0).map((_, i) => `
                <div class="solution-slot" data-slot="${i}">
                    ${state.selectedOrder[i] ? state.selectedOrder[i] : ''}
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Injiziert spiel-spezifische Styles
 */
function injectScrambleStyles() {
    const existingStyle = document.querySelector('style[data-scramble-style]');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.setAttribute('data-scramble-style', 'true');
    style.textContent = `
        .scramble-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            padding: 1.5rem;
        }

        .word-info {
            text-align: center;
            font-size: 1rem;
            color: var(--color-text-light);
        }

        .scrambled-letters-area {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            justify-content: center;
            padding: 1.5rem;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-md);
            min-height: 100px;
            align-items: center;
        }

        .letter-tile {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            background: var(--color-bg-card);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-sm);
            cursor: grab;
            transition: all 0.2s ease;
            box-shadow: var(--shadow-sm);
            user-select: none;
        }

        .letter-tile:active {
            cursor: grabbing;
            opacity: 0.7;
            transform: scale(1.1);
            box-shadow: var(--shadow-lg);
        }

        .letter-tile:hover {
            border-color: var(--color-primary);
            background: var(--color-bg-hover);
        }

        .letter-tile.dragging {
            opacity: 0.5;
        }

        .solution-area {
            display: flex;
            justify-content: center;
            padding: 1.5rem;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-md);
            min-height: 80px;
        }

        .solution-slots {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
        }

        .solution-slot {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            background: var(--color-bg-card);
            border: 2px dashed var(--color-border);
            border-radius: var(--radius-sm);
            color: var(--color-text);
            transition: all 0.2s ease;
            min-width: 50px;
        }

        .solution-slot.drag-over {
            border-color: var(--color-primary);
            background: var(--color-primary-light);
            transform: scale(1.05);
        }

        .scramble-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .action-btn {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            border-radius: var(--radius-md);
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: var(--shadow-sm);
        }

        .reset-btn {
            background: var(--color-bg-card);
            color: var(--color-text);
            border: 2px solid var(--color-border);
        }

        .reset-btn:hover {
            background: var(--color-bg-hover);
            border-color: var(--color-primary);
        }

        .submit-btn {
            background: var(--color-success);
            color: white;
        }

        .submit-btn:hover:not(:disabled) {
            background: var(--color-success-dark);
            transform: translateY(-2px);
        }

        .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        @media (max-width: 640px) {
            .scramble-container {
                gap: 1.5rem;
                padding: 1rem;
            }

            .letter-tile {
                width: 45px;
                height: 45px;
                font-size: 1.2rem;
            }

            .solution-slot {
                width: 45px;
                height: 45px;
                font-size: 1.2rem;
            }

            .scrambled-letters-area,
            .solution-area {
                padding: 1rem;
                min-height: 80px;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener auf
 */
function setupEventListeners() {
    const scrambledArea = document.getElementById('scrambled-letters');
    const solutionArea = document.getElementById('solution-area');
    const resetBtn = document.getElementById('reset-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // Drag & Drop für Buchstabenkacheln
    scrambledArea.addEventListener('dragstart', handleDragStart);
    scrambledArea.addEventListener('dragend', handleDragEnd);
    
    // Lösungsfeld Drag-Over Handling
    solutionArea.addEventListener('dragover', handleDragOver);
    solutionArea.addEventListener('dragleave', handleDragLeave);
    solutionArea.addEventListener('drop', handleDrop);
    
    // Button-Listener
    resetBtn.addEventListener('click', resetSelection);
    submitBtn.addEventListener('click', submitAnswer);
    
    // Click auf Slots für Touch-Geräte
    document.querySelectorAll('.solution-slot').forEach(slot => {
        slot.addEventListener('click', (e) => handleSlotClick(e, slot));
    });
}

/**
 * ÄNDERUNG: Drag Start Handler
 */
function handleDragStart(e) {
    if (!state.isGameActive) return;
    
    const tile = e.target.closest('.letter-tile');
    if (!tile) return;
    
    const index = parseInt(tile.dataset.index);
    state.draggedIndex = index;
    
    tile.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', tile.innerHTML);
}

/**
 * ÄNDERUNG: Drag End Handler
 */
function handleDragEnd(e) {
    const tile = e.target.closest('.letter-tile');
    if (tile) tile.classList.remove('dragging');
    
    document.querySelectorAll('.solution-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
}

/**
 * ÄNDERUNG: Drag Over Handler
 */
function handleDragOver(e) {
    if (!state.isGameActive) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const slot = e.target.closest('.solution-slot');
    if (slot) slot.classList.add('drag-over');
}

/**
 * ÄNDERUNG: Drag Leave Handler
 */
function handleDragLeave(e) {
    const slot = e.target.closest('.solution-slot');
    if (slot) slot.classList.remove('drag-over');
}

/**
 * ÄNDERUNG: Drop Handler
 */
function handleDrop(e) {
    if (!state.isGameActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const slot = e.target.closest('.solution-slot');
    if (!slot || state.draggedIndex === null) return;
    
    const slotIndex = parseInt(slot.dataset.slot);
    const letter = state.scrambledLetters[state.draggedIndex].letter;
    
    state.selectedOrder[slotIndex] = letter;
    
    renderSolutionArea();
    setupEventListeners();
}

/**
 * Handler für Slot-Klicks (Touch-Geräte)
 */
function handleSlotClick(e, slot) {
    if (!state.isGameActive) return;
    
    const slotIndex = parseInt(slot.dataset.slot);
    
    if (state.selectedOrder[slotIndex]) {
        // Buchstabe entfernen wenn Slot geklickt wird
        state.selectedOrder[slotIndex] = undefined;
        renderSolutionArea();
        setupEventListeners();
    }
}

/**
 * Setzt Auswahl zurück
 */
function resetSelection() {
    state.selectedOrder = [];
    renderSolutionArea();
    setupEventListeners();
}

/**
 * Prüft die Antwort
 */
async function submitAnswer() {
    if (!state.isGameActive) return;
    
    state.isGameActive = false;
    stopTimer();
    
    const userWord = state.selectedOrder.filter(letter => letter !== undefined).join('');
    const isCorrect = userWord === state.currentWord;
    
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
    const basePoints = state.currentWord.length * 10;
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
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', `Richtig war: ${state.currentWord}`, 2000);
        state.round++;
        startRound();
    } else {
        await UI.showFeedback('error', `Falsch! Richtig: ${state.currentWord}`, 2000);
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
            game: 'wordscramble',
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