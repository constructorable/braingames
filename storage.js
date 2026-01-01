/* =========================================
   Storage Module
   LocalStorage-Verwaltung für Spielstände
   ========================================= */

const STORAGE_KEY = 'brainfit_data';

// Standardstruktur für neue Benutzer
const DEFAULT_DATA = {
    version: 1,
    firstVisit: true,
    highscores: {
        numbers: 0,
        letters: 0,
        colors: 0,
        pattern: 0,
        math: 0
    },
    stats: {
        totalGames: 0,
        totalScore: 0,
        bestStreak: 0
    },
    history: [], // { game, score, level, mode, date, errors }
    dailyProgress: {} // { 'YYYY-MM-DD': totalScore }
};

/**
 * Lädt alle gespeicherten Daten aus dem LocalStorage
 * @returns {Object} Gespeicherte Daten oder Standardwerte
 */
export function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return { ...DEFAULT_DATA };
        }
        
        const data = JSON.parse(stored);
        // Merge mit Defaults für fehlende Felder (Versionskompatibilität)
        return mergeWithDefaults(data);
    } catch (error) {
        console.error('Storage: Fehler beim Laden', error);
        return { ...DEFAULT_DATA };
    }
}

/**
 * Speichert alle Daten im LocalStorage
 * @param {Object} data - Zu speichernde Daten
 * @returns {boolean} Erfolg
 */
export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Storage: Fehler beim Speichern', error);
        return false;
    }
}

/**
 * Aktualisiert den Highscore für ein Spiel
 * @param {string} game - Spielname (numbers, letters, etc.)
 * @param {number} score - Neue Punktzahl
 * @returns {boolean} True wenn neuer Highscore
 */
export function updateHighscore(game, score) {
    const data = loadData();
    const isNewHighscore = score > data.highscores[game];
    
    if (isNewHighscore) {
        data.highscores[game] = score;
        saveData(data);
    }
    
    return isNewHighscore;
}

/**
 * Holt den Highscore für ein Spiel
 * @param {string} game - Spielname
 * @returns {number} Highscore
 */
export function getHighscore(game) {
    const data = loadData();
    return data.highscores[game] || 0;
}

/**
 * Holt alle Highscores
 * @returns {Object} Alle Highscores
 */
export function getAllHighscores() {
    const data = loadData();
    return { ...data.highscores };
}

/**
 * Fügt ein Spielergebnis zur Historie hinzu
 * @param {Object} result - Spielergebnis
 */
export function addGameResult(result) {
    const data = loadData();
    
    // Ergebnis zur Historie hinzufügen
    const historyEntry = {
        game: result.game,
        score: result.score,
        level: result.level,
        mode: result.mode,
        round: result.round,
        errors: result.errors || 0,
        date: new Date().toISOString()
    };
    
    // Maximal 100 Einträge speichern
    data.history.unshift(historyEntry);
    if (data.history.length > 100) {
        data.history = data.history.slice(0, 100);
    }
    
    // Statistiken aktualisieren
    data.stats.totalGames++;
    data.stats.totalScore += result.score;
    
    if (result.round > data.stats.bestStreak) {
        data.stats.bestStreak = result.round;
    }
    
    // Täglichen Fortschritt aktualisieren
    const today = new Date().toISOString().split('T')[0];
    data.dailyProgress[today] = (data.dailyProgress[today] || 0) + result.score;
    
    // Alte Tageseinträge entfernen (älter als 30 Tage)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    Object.keys(data.dailyProgress).forEach(date => {
        if (date < cutoffDate) {
            delete data.dailyProgress[date];
        }
    });
    
    saveData(data);
}

/**
 * Holt die Gesamtstatistiken
 * @returns {Object} Statistiken
 */
export function getStats() {
    const data = loadData();
    return { ...data.stats };
}

/**
 * Holt die Spielhistorie
 * @param {number} limit - Maximale Anzahl
 * @returns {Array} Letzte Spiele
 */
export function getHistory(limit = 20) {
    const data = loadData();
    return data.history.slice(0, limit);
}

/**
 * Holt den täglichen Fortschritt
 * @param {number} days - Anzahl Tage
 * @returns {Array} Fortschrittsdaten [{date, score}]
 */
export function getDailyProgress(days = 7) {
    const data = loadData();
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        result.push({
            date: dateStr,
            label: formatDateShort(date),
            score: data.dailyProgress[dateStr] || 0
        });
    }
    
    return result;
}

/**
 * Prüft ob es der erste Besuch ist
 * @returns {boolean}
 */
export function isFirstVisit() {
    const data = loadData();
    return data.firstVisit;
}

/**
 * Markiert den ersten Besuch als abgeschlossen
 */
export function markFirstVisitComplete() {
    const data = loadData();
    data.firstVisit = false;
    saveData(data);
}

/**
 * Löscht alle gespeicherten Daten
 */
export function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Storage: Fehler beim Löschen', error);
        return false;
    }
}

// Hilfsfunktionen

/**
 * Merged gespeicherte Daten mit Defaults
 * @param {Object} data - Gespeicherte Daten
 * @returns {Object} Gemergte Daten
 */
function mergeWithDefaults(data) {
    return {
        ...DEFAULT_DATA,
        ...data,
        highscores: { ...DEFAULT_DATA.highscores, ...data.highscores },
        stats: { ...DEFAULT_DATA.stats, ...data.stats },
        history: data.history || [],
        dailyProgress: data.dailyProgress || {}
    };
}

/**
 * Formatiert ein Datum kurz (z.B. "Mo", "Di")
 * @param {Date} date
 * @returns {string}
 */
function formatDateShort(date) {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return days[date.getDay()];
}
