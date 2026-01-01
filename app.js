/* =========================================
   BrainFit – Haupt-App-Controller
   Verbindet alle Module und steuert den Spielfluss
   ========================================= */

import * as UI from './ui.js';
import * as Storage from './storage.js';
import * as Stats from './stats.js';

// Spiel-Module dynamisch importieren
import * as NumberGame from './numberSequence.js';
import * as LetterGame from './letterSequence.js';
import * as ColorGame from './colorSequence.js';
import * as PatternGame from './patternMemory.js';
import * as MathGame from './mathSequence.js';

// Spiele-Registry
const GAMES = {
    numbers: { module: NumberGame, title: 'Zahlenfolge' },
    letters: { module: LetterGame, title: 'Buchstabenfolge' },
    colors: { module: ColorGame, title: 'Farbsequenz' },
    pattern: { module: PatternGame, title: 'Muster-Memory' },
    math: { module: MathGame, title: 'Rechenfolge' }
};

// App-State
const appState = {
    currentGame: null,
    selectedLevel: 1,
    selectedMode: 'endless'
};

/**
 * App initialisieren
 */
function init() {
    UI.init();
    setupEventListeners();
    checkFirstVisit();
    
    console.log('BrainFit App initialisiert');
}

/**
 * Setzt alle Event-Listener
 */
function setupEventListeners() {
    // Spielkarten im Hauptmenü
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const gameId = card.dataset.game;
            selectGame(gameId);
        });
    });
    
    // Tutorial-Button
    document.getElementById('btn-tutorial').addEventListener('click', () => {
        UI.openTutorial();
    });
    
    // Statistiken-Button
    document.getElementById('btn-stats').addEventListener('click', () => {
        showStats();
    });
    
    // Modus-Auswahl
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectMode(btn.dataset.mode);
        });
    });
    
    // Spiel starten
    document.getElementById('btn-start-game').addEventListener('click', () => {
        startGame();
    });
    
    // Ergebnis-Aktionen
    document.getElementById('btn-play-again').addEventListener('click', () => {
        startGame();
    });
    
    document.getElementById('btn-back-menu').addEventListener('click', () => {
        returnToMenu();
    });
    
    // Statistik-Events
    Stats.setupStatsEvents(() => {
        UI.updateHighscoreDisplays();
    });
}

/**
 * Prüft ob erster Besuch und zeigt Tutorial
 */
function checkFirstVisit() {
    if (Storage.isFirstVisit()) {
        setTimeout(() => {
            UI.openTutorial();
        }, 500);
    }
}

/**
 * Wählt ein Spiel aus und zeigt Modus-Auswahl
 */
function selectGame(gameId) {
    if (!GAMES[gameId]) return;
    
    appState.currentGame = gameId;
    appState.selectedLevel = 1;
    appState.selectedMode = 'endless';
    
    // Titel setzen
    document.getElementById('mode-game-title').textContent = GAMES[gameId].title;
    
    // Level-Buttons rendern
    UI.renderLevelButtons(10, appState.selectedLevel, (level) => {
        appState.selectedLevel = level;
    });
    
    // Standard-Modus markieren
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mode === appState.selectedMode);
    });
    
    // Screen wechseln
    UI.showScreen('mode-select', { title: GAMES[gameId].title });
}

/**
 * Wählt einen Spielmodus
 */
function selectMode(mode) {
    appState.selectedMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mode === mode);
    });
}

/**
 * Startet das ausgewählte Spiel
 */
function startGame() {
    const game = GAMES[appState.currentGame];
    if (!game) return;
    
    UI.resetHistory();
    UI.showScreen('game-area', { title: game.title });
    
    // Spiel starten
    game.module.start(
        {
            level: appState.selectedLevel,
            mode: appState.selectedMode
        },
        {
            onComplete: handleGameComplete
        }
    );
}

/**
 * Behandelt Spielende
 */
function handleGameComplete(result) {
    // Highscore prüfen und speichern
    const isNewHighscore = Storage.updateHighscore(result.game, result.score);
    const currentHighscore = Storage.getHighscore(result.game);
    
    // Ergebnis speichern
    Storage.addGameResult(result);
    
    // Highscore-Anzeigen aktualisieren
    UI.updateHighscoreDisplays();
    
    // Ergebnis-Screen anzeigen
    UI.renderResult({
        score: result.score,
        highscore: currentHighscore,
        round: result.round,
        isNewHighscore
    });
    
    UI.showScreen('game-result', { title: 'Ergebnis' });
}

/**
 * Zeigt Statistiken
 */
function showStats() {
    Stats.renderStats();
    UI.showScreen('stats-screen', { title: 'Statistiken' });
}

/**
 * Kehrt zum Hauptmenü zurück
 */
function returnToMenu() {
    // Laufendes Spiel stoppen
    if (appState.currentGame && GAMES[appState.currentGame]) {
        GAMES[appState.currentGame].module.stop();
    }
    
    UI.resetHistory();
    UI.showScreen('main-menu', { addToHistory: false });
}

// App starten wenn DOM bereit
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
