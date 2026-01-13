/* =========================================
   BrainFit – Haupt-App-Controller (optimiert)
   Kompakte, wartbare Struktur
   ========================================= */

import * as UI from './ui.js';
import * as Storage from './storage.js';
import * as Stats from './stats.js';
import * as Theme from './theme.js';

// Game-Module
import * as NumberGame from './numberSequence.js';
import * as LetterGame from './letterSequence.js';
import * as ColorGame from './colorSequence.js';
import * as PatternGame from './patternMemory.js';
import * as MathGame from './mathSequence.js';
import * as WordScramble from './wordScramble.js';
import * as Hangman from './hangman.js';
import * as Dodge from './dodge.js';
import * as Millionaire from './millionaire.js';
import * as Memory from './memory.js';
import * as PatternBreaker from './patternbreaker.js';
import * as FlipMaster from './flipmaster.js';
import * as IQMaster from './iqmaster.js';
import * as Sudoku from './sudoku.js';
import * as ChainReaction from './chainReaction.js';
import * as MindMaze from './mindMaze.js';
import * as towerdefense from './towerdefense.js';

// Spiele-Konfiguration (mit Level-Auswahl)
const GAMES = {
    numbers: { module: NumberGame, title: 'Zahlenfolge' },
    letters: { module: LetterGame, title: 'Buchstabenfolge' },
    colors: { module: ColorGame, title: 'Farbsequenz' },
    pattern: { module: PatternGame, title: 'Muster-Memory' },
    math: { module: MathGame, title: 'Rechenfolge' },
    wordscramble: { module: WordScramble, title: 'Wort-Anagramm' },
    hangman: { module: Hangman, title: 'Galgenmännchen' },
    dodge: { module: Dodge, title: 'Dodge Master' },
    millionaire: { module: Millionaire, title: 'Millionär Quiz' },
    memory: { module: Memory, title: 'Memory' },
    patternbreaker: { module: PatternBreaker, title: 'Pattern Breaker' },
    flipmaster: { module: FlipMaster, title: 'Flip Master' },
    iqmaster: { module: IQMaster, title: 'IQ Master' }
};

// Spiele mit spezialer Initialisierung
const SPECIAL_GAMES = ['sudoku', 'chain', 'mindmaze', 'towerdefense'];

// App-State
const appState = {
    currentGame: null,
    selectedLevel: 1,
    selectedMode: 'endless'
};

// ÄNDERUNG: Init mit Event-Delegation statt mehrfacher Listener
function init() {
    Theme.init();
    UI.init();
    setupEventDelegation();
    if (Storage.isFirstVisit()) {
        setTimeout(() => UI.openTutorial(), 500);
    }
}

/**
 * ÄNDERUNG: Event-Delegation statt einzelner Listener
 * Reduziert Code und ist performanter
 */
function setupEventDelegation() {
    // Haupt-Delegator für UI-Events
    document.addEventListener('click', (e) => {
        const gameCard = e.target.closest('.game-card');
        const modeBtn = e.target.closest('.mode-btn');
        const btn = e.target.closest('button[id]');

        if (gameCard) {
            handleGameCardClick(gameCard.dataset.game);
        } else if (modeBtn) {
            selectMode(modeBtn.dataset.mode);
        } else if (btn?.id === 'btn-tutorial') {
            UI.openTutorial();
        } else if (btn?.id === 'btn-stats') {
            Stats.renderStats();
            UI.showScreen('stats-screen', { title: 'Statistiken' });
        } else if (btn?.id === 'btn-start-game') {
            startGame();
        } else if (btn?.id === 'btn-play-again') {
            startGame();
        } else if (btn?.id === 'btn-back-menu') {
            returnToMenu();
        }
    });

    // Stats-Events einmalig
    Stats.setupStatsEvents(() => UI.updateHighscoreDisplays());
}

/**
 * ÄNDERUNG: Vereinheitlichte Game-Card Behandlung
 */
function handleGameCardClick(gameId) {
    // NEU: Dynamische Module für spezielle Spiele
    const specialInit = {
        sudoku: () => { Sudoku.init(); Sudoku.show(); },
        chain: () => { ChainReaction.init(); ChainReaction.show(); },
        mindmaze: () => { MindMaze.init(); MindMaze.show(); },
        towerdefense: () => { towerdefense.init(); towerdefense.show(); }
    };

    if (specialInit[gameId]) {
        specialInit[gameId]();
    } else {
        selectGame(gameId);
    }
}

/**
 * Wählt ein normales Spiel aus
 */
function selectGame(gameId) {
    if (!GAMES[gameId]) return;

    appState.currentGame = gameId;
    appState.selectedLevel = 1;
    appState.selectedMode = 'endless';

    document.getElementById('mode-game-title').textContent = GAMES[gameId].title;
    UI.renderLevelButtons(10, appState.selectedLevel, (level) => {
        appState.selectedLevel = level;
    });
    updateModeBtns('endless');
    UI.showScreen('mode-select', { title: GAMES[gameId].title });
}

/**
 * ÄNDERUNG: Vereinfachte Mode-Auswahl
 */
function selectMode(mode) {
    appState.selectedMode = mode;
    updateModeBtns(mode);
}

/**
 * ÄNDERUNG: DRY - Helper für Mode-Button Update
 */
function updateModeBtns(selected) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mode === selected);
    });
}

/**
 * Startet das Spiel
 */
function startGame() {
    const game = GAMES[appState.currentGame];
    if (!game) return;

    UI.resetHistory();
    UI.showScreen('game-area', { title: game.title });

    game.module.start(
        {
            level: appState.selectedLevel,
            mode: appState.selectedMode
        },
        { onComplete: handleGameComplete }
    );
}

/**
 * Behandelt Spielende
 */
function handleGameComplete(result) {
    const isNewHighscore = Storage.updateHighscore(result.game, result.score);
    Storage.addGameResult(result);
    
    UI.updateHighscoreDisplays();
    UI.renderResult({
        score: result.score,
        highscore: Storage.getHighscore(result.game),
        round: result.round,
        isNewHighscore
    });

    UI.showScreen('game-result', { title: 'Ergebnis' });
}

/**
 * ÄNDERUNG: Kompaktere Rückkehr zum Menü
 */
function returnToMenu() {
    // Aktuelles Spiel stoppen
    if (appState.currentGame && GAMES[appState.currentGame]) {
        GAMES[appState.currentGame].module.stop();
    }

    // Spezielle Spiele ausblenden (nur wenn vorhanden)
    [Sudoku, ChainReaction, MindMaze, towerdefense].forEach(game => {
        game?.hide?.();
    });

    UI.resetHistory();
    UI.showScreen('main-menu', { addToHistory: false });
}

/**
 * App-Start
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}