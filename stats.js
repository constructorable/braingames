/* =========================================
   Stats Module
   Statistiken und Diagramm-Rendering
   ========================================= */

import * as Storage from './storage.js';

// Spielfarben für Diagramme
const GAME_COLORS = {
    numbers: '#f59e0b',
    letters: '#10b981',
    colors: '#ec4899',
    pattern: '#8b5cf6',
    math: '#3b82f6'
};

// Spielnamen
const GAME_NAMES = {
    numbers: 'Zahlen',
    letters: 'Buchstaben',
    colors: 'Farben',
    pattern: 'Muster',
    math: 'Rechnen'
};

// Spiel-Icons
const GAME_ICONS = {
    numbers: 'fa-hashtag',
    letters: 'fa-font',
    colors: 'fa-palette',
    pattern: 'fa-th',
    math: 'fa-calculator'
};

/**
 * Rendert alle Statistiken
 */
export function renderStats() {
    renderOverview();
    renderProgressChart();
    renderHighscoreChart();
    renderHistory();
}

/**
 * Rendert Übersichts-Statistiken
 */
function renderOverview() {
    const stats = Storage.getStats();
    
    document.getElementById('total-games').textContent = formatNumber(stats.totalGames);
    document.getElementById('total-score').textContent = formatNumber(stats.totalScore);
    document.getElementById('best-streak').textContent = formatNumber(stats.bestStreak);
}

/**
 * Rendert Fortschritts-Diagramm (letzte 7 Tage)
 */
function renderProgressChart() {
    const container = document.getElementById('progress-chart');
    const data = Storage.getDailyProgress(7);
    
    // Maximalen Wert finden für Skalierung
    const maxScore = Math.max(...data.map(d => d.score), 1);
    
    container.innerHTML = data.map(day => {
        const height = (day.score / maxScore) * 100;
        return `
            <div class="chart-bar" 
                 style="height: ${Math.max(height, 3)}%"
                 data-label="${day.label}"
                 title="${day.score} Punkte">
            </div>
        `;
    }).join('');
}

/**
 * Rendert Highscore-Diagramm nach Spielen
 */
function renderHighscoreChart() {
    const container = document.getElementById('highscore-chart');
    const highscores = Storage.getAllHighscores();
    
    // Maximalen Wert finden
    const maxScore = Math.max(...Object.values(highscores), 1);
    
    container.innerHTML = Object.entries(highscores).map(([game, score]) => {
        const height = (score / maxScore) * 100;
        return `
            <div class="chart-bar" 
                 style="height: ${Math.max(height, 3)}%; background: linear-gradient(180deg, ${GAME_COLORS[game]}, ${adjustColor(GAME_COLORS[game], -30)})"
                 data-label="${GAME_NAMES[game]}"
                 title="${score} Punkte">
            </div>
        `;
    }).join('');
}

/**
 * Rendert Spielhistorie
 */
function renderHistory() {
    const container = document.getElementById('game-history');
    const history = Storage.getHistory(15);
    
    if (history.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Noch keine Spiele gespielt</p>';
        return;
    }
    
    container.innerHTML = history.map(entry => {
        const date = new Date(entry.date);
        const formattedDate = formatDate(date);
        
        return `
            <div class="history-item">
                <div class="history-game">
                    <i class="fas ${GAME_ICONS[entry.game]}" 
                       style="background-color: ${GAME_COLORS[entry.game]}"></i>
                    <span>${GAME_NAMES[entry.game]}</span>
                </div>
                <span class="history-score">${formatNumber(entry.score)}</span>
                <span class="history-date">${formattedDate}</span>
            </div>
        `;
    }).join('');
}

/**
 * Setzt Event-Listener für Statistik-Aktionen
 * @param {Function} onClear - Callback beim Löschen
 */
export function setupStatsEvents(onClear) {
    const clearBtn = document.getElementById('btn-clear-stats');
    
    // Clone & Replace um doppelte Listener zu vermeiden
    const newBtn = clearBtn.cloneNode(true);
    clearBtn.parentNode.replaceChild(newBtn, clearBtn);
    
    newBtn.addEventListener('click', () => {
        if (confirm('Alle Statistiken wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            Storage.clearAllData();
            renderStats();
            if (onClear) onClear();
        }
    });
}

// Hilfsfunktionen

/**
 * Formatiert Datum kurz
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Heute';
    } else if (diffDays === 1) {
        return 'Gestern';
    } else if (diffDays < 7) {
        return `vor ${diffDays} Tagen`;
    } else {
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }
}

/**
 * Formatiert große Zahlen
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    return num.toLocaleString('de-DE');
}

/**
 * Passt Farbe an (heller/dunkler)
 * @param {string} hex - Hex-Farbcode
 * @param {number} amount - Positive = heller, Negative = dunkler
 * @returns {string}
 */
function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
