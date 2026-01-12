/* =========================================
   UI Module
   Screen-Verwaltung und DOM-Manipulation
   ========================================= */

import * as Storage from './storage.js';
import * as Sudoku from './sudoku.js';
import * as towerdefense from './towerdefense.js';

// DOM-Referenzen (gecached)
const elements = {
    app: null,
    header: null,
    headerTitle: null,
    btnBack: null,
    btnStats: null,
    screens: {},
    feedback: null,
    loadingOverlay: null,
    tutorialModal: null
};

// Aktueller Screen-State
let currentScreen = 'main-menu';
let screenHistory = [];

/**
 * Initialisiert das UI-Modul
 */
export function init() {
    cacheElements();
    setupEventListeners();
    updateHighscoreDisplays();
}

/**
 * Cached häufig verwendete DOM-Elemente
 */
function cacheElements() {
    elements.app = document.getElementById('app');
    elements.header = document.getElementById('app-header');
    elements.headerTitle = document.getElementById('header-title');
    elements.btnBack = document.getElementById('btn-back');
    elements.btnStats = document.getElementById('btn-stats');
    elements.feedback = document.getElementById('game-feedback');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.tutorialModal = document.getElementById('tutorial-modal');
    
    // Screens cachen
    elements.screens = {
        'main-menu': document.getElementById('main-menu'),
        'mode-select': document.getElementById('mode-select'),
        'game-area': document.getElementById('game-area'),
        'game-result': document.getElementById('game-result'),
        'stats-screen': document.getElementById('stats-screen')
    };
}

/**
 * Basis-Event-Listener für UI
 */
function setupEventListeners() {
    // Zurück-Button
    elements.btnBack.addEventListener('click', navigateBack);
    
    // Tutorial Modal schließen
    const modalClose = elements.tutorialModal.querySelector('.modal-close');
    modalClose.addEventListener('click', closeTutorial);
    
    // Modal-Overlay schließen
    elements.tutorialModal.addEventListener('click', (e) => {
        if (e.target === elements.tutorialModal) {
            closeTutorial();
        }
    });
}

/**
 * Wechselt zu einem anderen Screen
 * @param {string} screenId - ID des Ziel-Screens
 * @param {Object} options - Optionen für den Wechsel
 */
export function showScreen(screenId, options = {}) {
    const { addToHistory = true, title = null } = options;
    
    // Aktuellen Screen deaktivieren
    const currentEl = elements.screens[currentScreen];
    if (currentEl) {
        currentEl.classList.remove('active');
    }
    
    // Zur History hinzufügen
    if (addToHistory && currentScreen !== screenId) {
        screenHistory.push(currentScreen);
    }
    
    // Neuen Screen aktivieren
    const targetEl = elements.screens[screenId];
    if (targetEl) {
        targetEl.classList.add('active');
        currentScreen = screenId;
    }
    
    // Header aktualisieren
    updateHeader(screenId, title);
}

/**
 * Aktualisiert Header basierend auf aktuellem Screen
 */
function updateHeader(screenId, customTitle) {
    const showBack = screenId !== 'main-menu';
    const showStats = screenId === 'main-menu';
    
    elements.btnBack.classList.toggle('hidden', !showBack);
    elements.btnStats.classList.toggle('hidden', !showStats);
    
    // Titel anpassen
    const titles = {
        'main-menu': 'BrainFit',
        'mode-select': 'Spielmodus',
        'game-area': 'Spiel',
        'game-result': 'Ergebnis',
        'stats-screen': 'Statistiken'
    };
    
    elements.headerTitle.textContent = customTitle || titles[screenId] || 'BrainFit';
}

/**
 * Navigiert zum vorherigen Screen
 */
export function navigateBack() {
    if (screenHistory.length > 0) {
        const previousScreen = screenHistory.pop();
        showScreen(previousScreen, { addToHistory: false });
    } else {
        showScreen('main-menu', { addToHistory: false });
    }
}

/**
 * Setzt die Screen-History zurück
 */
export function resetHistory() {
    screenHistory = [];
}

/**
 * Zeigt Feedback-Overlay (Erfolg/Fehler)
 * @param {string} type - 'success' oder 'error'
 * @param {string} message - Nachricht
 * @param {number} duration - Anzeigedauer in ms
 */
export function showFeedback(type, message, duration = 1500) {
    const iconEl = elements.feedback.querySelector('.feedback-icon');
    const textEl = elements.feedback.querySelector('.feedback-text');
    
    iconEl.className = 'feedback-icon fas';
    iconEl.classList.add(type === 'success' ? 'fa-check-circle' : 'fa-times-circle');
    iconEl.classList.add(type);
    
    textEl.textContent = message;
    elements.feedback.classList.remove('hidden');
    
    return new Promise(resolve => {
        setTimeout(() => {
            elements.feedback.classList.add('hidden');
            resolve();
        }, duration);
    });
}

/**
 * Zeigt Loading-Overlay
 * @param {boolean} show
 */
export function showLoading(show) {
    elements.loadingOverlay.classList.toggle('hidden', !show);
}

/**
 * Öffnet das Tutorial-Modal
 */
export function openTutorial() {
    elements.tutorialModal.classList.remove('hidden');
    resetTutorialSlides();
    setupTutorialNavigation();
}

/**
 * Schließt das Tutorial-Modal
 */
export function closeTutorial() {
    elements.tutorialModal.classList.add('hidden');
}

/**
 * Setzt Tutorial-Slides zurück
 */
function resetTutorialSlides() {
    const slides = elements.tutorialModal.querySelectorAll('.tutorial-slide');
    const dots = elements.tutorialModal.querySelectorAll('.dot');
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === 0);
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === 0);
    });
    
    updateTutorialButton(0, slides.length);
}

/**
 * Setup für Tutorial-Navigation
 */
function setupTutorialNavigation() {
    const nextBtn = document.getElementById('btn-tutorial-next');
    const dots = elements.tutorialModal.querySelectorAll('.dot');
    const slides = elements.tutorialModal.querySelectorAll('.tutorial-slide');
    
    let currentSlide = 0;
    
    // Entferne alte Listener (Clone & Replace)
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    
    newNextBtn.addEventListener('click', () => {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            showSlide(currentSlide);
        } else {
            closeTutorial();
            Storage.markFirstVisitComplete();
        }
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        updateTutorialButton(index, slides.length);
    }
}

/**
 * Aktualisiert Tutorial-Button-Text
 */
function updateTutorialButton(currentIndex, totalSlides) {
    const btn = document.getElementById('btn-tutorial-next');
    if (currentIndex === totalSlides - 1) {
        btn.innerHTML = 'Los geht\'s! <i class="fas fa-check"></i>';
    } else {
        btn.innerHTML = 'Weiter <i class="fas fa-arrow-right"></i>';
    }
}

/**
 * Aktualisiert Highscore-Anzeigen im Menü
 */
export function updateHighscoreDisplays() {
    const highscores = Storage.getAllHighscores();
    
    Object.entries(highscores).forEach(([game, score]) => {
        const el = document.querySelector(`[data-highscore="${game}"]`);
        if (el) {
            el.textContent = formatNumber(score);
        }
    });
}

/**
 * Generiert Level-Buttons
 * @param {number} unlockedLevel - Höchstes freigeschaltetes Level
 * @param {number} selectedLevel - Aktuell ausgewähltes Level
 * @param {Function} onSelect - Callback bei Auswahl
 */
export function renderLevelButtons(unlockedLevel, selectedLevel, onSelect) {
    const container = document.querySelector('.level-grid');
    container.innerHTML = '';
    
    for (let level = 1; level <= 10; level++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = level;
        btn.dataset.level = level;
        
        // NEU: Alle Level sind freigeschaltet
        if (level === selectedLevel) {
            btn.classList.add('selected');
        }
        
        btn.addEventListener('click', () => {
            container.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            onSelect(level);
        });
        
        container.appendChild(btn);
    }
}

/**
 * Aktualisiert Spielanzeige (Level, Punkte, Zeit)
 * @param {Object} data - { level, score, time }
 */
export function updateGameDisplay(data) {
    if (data.level !== undefined) {
        document.getElementById('current-level').textContent = data.level;
    }
    if (data.score !== undefined) {
        document.getElementById('current-score').textContent = formatNumber(data.score);
    }
    if (data.time !== undefined) {
        const timerEl = document.getElementById('current-timer');
        timerEl.textContent = data.time !== null ? formatTime(data.time) : '--';
    }
}

/**
 * Zeigt Timer-Anzeige an/aus
 * @param {boolean} show
 */
export function showTimer(show) {
    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.style.visibility = show ? 'visible' : 'hidden';
}

/**
 * Rendert Ergebnis-Screen
 * @param {Object} result - Spielergebnis
 */
export function renderResult(result) {
    document.getElementById('result-score').textContent = formatNumber(result.score);
    document.getElementById('result-highscore').textContent = formatNumber(result.highscore);
    document.getElementById('result-round').textContent = result.round;
    
    const badge = document.getElementById('new-highscore-badge');
    badge.classList.toggle('hidden', !result.isNewHighscore);
}

/**
 * Setzt Inhalt des Spielbereichs
 * @param {string} html - HTML-Inhalt
 */
export function setGameContent(html) {
    document.getElementById('game-content').innerHTML = html;
}

/**
 * Setzt Inhalt des Eingabebereichs
 * @param {string} html - HTML-Inhalt
 */
export function setInputArea(html) {
    document.getElementById('game-input').innerHTML = html;
}

/**
 * Holt Game-Content-Container
 * @returns {HTMLElement}
 */
export function getGameContent() {
    return document.getElementById('game-content');
}

/**
 * Holt Input-Container
 * @returns {HTMLElement}
 */
export function getInputArea() {
    return document.getElementById('game-input');
}

// Hilfsfunktionen

/**
 * Formatiert große Zahlen (1000 → 1.000)
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    return num.toLocaleString('de-DE');
}

/**
 * Formatiert Zeit in Sekunden (mm:ss oder ss)
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
    if (seconds >= 60) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
}
