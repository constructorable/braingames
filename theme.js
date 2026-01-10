/* =========================================
   Theme Manager
   Dark/Light Mode Toggle mit Persistenz
   ========================================= */

const THEME_KEY = 'brainfit_theme';

/**
 * Initialisiert den Theme Manager
 */
export function init() {
    // Theme aus LocalStorage oder System-Präferenz laden
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    
    // Toggle-Button erstellen und einfügen
    createToggleButton();
    
    // System-Präferenz-Änderungen beobachten
    watchSystemPreference();
}

/**
 * Holt das gespeicherte Theme oder System-Präferenz
 * @returns {string} 'light' oder 'dark'
 */
function getSavedTheme() {
    // Zuerst gespeichertes Theme prüfen
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    
    // Sonst System-Präferenz nutzen
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    return 'light';
}

/**
 * Wendet ein Theme an
 * @param {string} theme - 'light' oder 'dark'
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
    
    // Meta Theme-Color für Mobile Browser aktualisieren
    updateMetaThemeColor(theme);
}

/**
 * Speichert das Theme
 * @param {string} theme
 */
function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

/**
 * Wechselt zwischen Light und Dark Mode
 */
export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Animation hinzufügen
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.classList.add('switching');
        setTimeout(() => toggleBtn.classList.remove('switching'), 500);
    }
    
    applyTheme(newTheme);
    saveTheme(newTheme);
}

/**
 * Erstellt den Toggle-Button und fügt ihn in den Header ein
 */
function createToggleButton() {
    const header = document.getElementById('app-header');
    if (!header) return;
    
    // Prüfen ob Button bereits existiert
    if (document.getElementById('theme-toggle')) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'theme-toggle';
    toggleBtn.className = 'theme-toggle';
    toggleBtn.setAttribute('aria-label', 'Theme wechseln');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    
    toggleBtn.addEventListener('click', toggleTheme);
    
    // Button zwischen Zurück-Button und Titel einfügen
    const statsBtn = document.getElementById('btn-stats');
    if (statsBtn) {
        header.insertBefore(toggleBtn, statsBtn);
    } else {
        header.appendChild(toggleBtn);
    }
    
    // Icon initial setzen
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateToggleIcon(currentTheme);
}

/**
 * Aktualisiert das Toggle-Icon
 * @param {string} theme
 */
function updateToggleIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    const icon = toggleBtn.querySelector('i');
    if (!icon) return;
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

/**
 * Aktualisiert die Meta Theme-Color für Mobile Browser
 * @param {string} theme
 */
function updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.content = theme === 'dark' ? '#0f0d1a' : '#faf5ff';
}

/**
 * Beobachtet Änderungen der System-Präferenz
 */
function watchSystemPreference() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
        // Nur automatisch wechseln wenn kein manuelles Theme gespeichert
        const saved = localStorage.getItem(THEME_KEY);
        if (!saved) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Gibt das aktuelle Theme zurück
 * @returns {string}
 */
export function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * Setzt ein spezifisches Theme
 * @param {string} theme - 'light' oder 'dark'
 */
export function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    
    applyTheme(theme);
    saveTheme(theme);
}