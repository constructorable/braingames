/* =========================================
   BrainTower — UI-Modul
   Interface-Rendering und Event-Handling
   ========================================= */

import { TOWER_TYPES } from './tdConfig.js';
import { MAPS, MAP_LIST } from './tdMaps.js';
import * as State from './tdState.js';
import { initGame, startWave, stopGame, upgradeTower, sellTower, useAbility } from './tdGame.js';

// NEU: Screen rendern
export function renderScreen() {
    const app = document.getElementById('app');
    if (document.getElementById('td-screen')) return;

    const screen = document.createElement('section');
    screen.id = 'td-screen';
    screen.className = 'screen';

    screen.innerHTML = `
        <div class="td-container">
            <!-- HAUPTMENÜ -->
            <div id="td-menu" class="td-menu">
                <div class="td-header">
                    <div class="td-logo"><i class="fas fa-chess-rook"></i></div>
                    <h2>BrainTower</h2>
                    <p class="td-tagline">Tower Defense</p>
                </div>
                <div class="td-features">
                    <div class="td-feature"><i class="fas fa-chess-rook"></i><span>4 Türme</span></div>
                    <div class="td-feature"><i class="fas fa-arrow-up"></i><span>5 Upgrades</span></div>
                    <div class="td-feature"><i class="fas fa-water"></i><span>20 Wellen</span></div>
                    <div class="td-feature"><i class="fas fa-map"></i><span>8 Karten</span></div>
                </div>
                <div class="td-tower-preview">
                    <h3>Türme</h3>
                    <div class="td-tower-list">
                        ${Object.entries(TOWER_TYPES).map(([key, t]) => `
                            <div class="td-tower-preview-item">
                                <div class="td-tower-icon" style="background:${t.color}"><i class="fas ${t.icon}"></i></div>
                                <div class="td-tower-info"><span class="td-tower-name">${t.name}</span><span class="td-tower-desc">${t.description}</span></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button id="btn-td-start" class="btn-primary btn-large"><i class="fas fa-play"></i> Karte wählen</button>
            </div>

            <!-- KARTENAUSWAHL -->
            <div id="td-map-select" class="td-map-select hidden">
                <div class="td-map-header">
                    <h2><i class="fas fa-map"></i> Karte wählen</h2>
                    <p>Wähle eine Karte für dein Spiel</p>
                </div>
                <div class="td-map-grid">
                    ${MAP_LIST.map(map => `
                        <button class="td-map-card" data-map="${map.id}">
                            <div class="td-map-icon" style="background:${map.color}">
                                <i class="fas ${map.icon}"></i>
                            </div>
                            <div class="td-map-info">
                                <span class="td-map-name">${map.name}</span>
                                <span class="td-map-desc">${map.description}</span>
                                <div class="td-map-difficulty">
                                    ${Array(4).fill(0).map((_, i) => `
                                        <i class="fas fa-star ${i < map.difficulty ? 'active' : ''}"></i>
                                    `).join('')}
                                </div>
                            </div>
                        </button>
                    `).join('')}
                </div>
                <button id="btn-td-map-back" class="btn-secondary"><i class="fas fa-arrow-left"></i> Zurück</button>
            </div>

            <!-- SPIELBEREICH -->
            <div id="td-game" class="td-game hidden">
                <div class="td-stats-bar">
                    <div class="td-stat lives"><i class="fas fa-heart"></i><span id="td-lives">20</span></div>
                    <div class="td-stat gold"><i class="fas fa-coins"></i><span id="td-gold">200</span></div>
                    <div class="td-stat wave"><i class="fas fa-water"></i><span id="td-wave">0</span><small>/20</small></div>
                    <div class="td-stat combo" id="td-combo-stat"><i class="fas fa-fire"></i><span id="td-combo">0</span><small>x</small></div>
                </div>

                <div class="td-canvas-container" id="td-canvas-container">
                    <canvas id="td-canvas"></canvas>
                    <div id="td-tower-info" class="td-tower-info hidden">
                        <div class="td-info-header"><span id="td-info-name">Turm</span><span id="td-info-level">Lvl 1</span></div>
                        <div class="td-info-stats">
                            <div><i class="fas fa-crosshairs"></i><span id="td-info-damage">0</span></div>
                            <div><i class="fas fa-expand"></i><span id="td-info-range">0</span></div>
                            <div><i class="fas fa-clock"></i><span id="td-info-speed">0</span>/s</div>
                        </div>
                        <div class="td-info-actions">
                            <button id="btn-upgrade" class="td-info-btn upgrade"><i class="fas fa-arrow-up"></i><span id="upgrade-cost">50</span></button>
                            <button id="btn-sell" class="td-info-btn sell"><i class="fas fa-coins"></i><span id="sell-value">25</span></button>
                        </div>
                    </div>
                </div>

                <div class="td-tower-selection">
                    ${Object.entries(TOWER_TYPES).map(([key, t]) => `
                        <button class="td-tower-btn" data-tower="${key}">
                            <div class="td-tower-btn-icon" style="background:${t.color}"><i class="fas ${t.icon}"></i></div>
                            <span class="td-tower-btn-cost">${t.baseCost}</span>
                        </button>
                    `).join('')}
                    <div class="td-divider"></div>
                    <button class="td-ability-btn" id="ability-nuke" title="Nuke: 100 Schaden an alle (100G)"><i class="fas fa-bomb"></i><div class="ability-cooldown" id="nuke-cd"></div></button>
                    <button class="td-ability-btn" id="ability-freeze" title="Freeze: Alle einfrieren (50G)"><i class="fas fa-snowflake"></i><div class="ability-cooldown" id="freeze-cd"></div></button>
                    <button class="td-ability-btn" id="ability-gold" title="Gold Rush: +100 Gold"><i class="fas fa-gem"></i><div class="ability-cooldown" id="gold-cd"></div></button>
                </div>

                <div class="td-actions">
                    <button id="btn-td-wave" class="td-action-btn primary"><i class="fas fa-play"></i><span>Welle starten</span></button>
                    <button id="btn-td-speed" class="td-action-btn"><i class="fas fa-forward"></i><span id="speed-text">1x</span></button>
                    <button id="btn-td-pause" class="td-action-btn"><i class="fas fa-pause"></i></button>
                    <button id="btn-td-quit" class="td-action-btn danger"><i class="fas fa-door-open"></i></button>
                </div>
            </div>

            <!-- GAME OVER -->
            <div id="td-gameover" class="td-gameover hidden">
                <div class="td-gameover-content">
                    <div class="td-gameover-icon fail"><i class="fas fa-skull"></i></div>
                    <h2>Niederlage!</h2>
                    <div class="td-gameover-stats">
                        <div class="td-go-stat"><span class="td-go-value" id="go-wave">0</span><span class="td-go-label">Wellen</span></div>
                        <div class="td-go-stat"><span class="td-go-value" id="go-kills">0</span><span class="td-go-label">Kills</span></div>
                        <div class="td-go-stat"><span class="td-go-value" id="go-score">0</span><span class="td-go-label">Score</span></div>
                        <div class="td-go-stat"><span class="td-go-value" id="go-combo">0</span><span class="td-go-label">Max Combo</span></div>
                    </div>
                    <div class="td-gameover-actions">
                        <button id="btn-td-retry" class="btn-primary btn-large"><i class="fas fa-redo"></i> Nochmal</button>
                        <button id="btn-td-menu" class="btn-secondary"><i class="fas fa-home"></i> Menü</button>
                    </div>
                </div>
            </div>

            <!-- SIEG -->
            <div id="td-victory" class="td-victory hidden">
                <div class="td-victory-content">
                    <div class="td-victory-icon"><i class="fas fa-crown"></i></div>
                    <h2>SIEG!</h2>
                    <p>Alle 20 Wellen überlebt!</p>
                    <div class="td-gameover-stats">
                        <div class="td-go-stat"><span class="td-go-value" id="vic-score">0</span><span class="td-go-label">Score</span></div>
                        <div class="td-go-stat"><span class="td-go-value" id="vic-kills">0</span><span class="td-go-label">Kills</span></div>
                        <div class="td-go-stat"><span class="td-go-value" id="vic-combo">0</span><span class="td-go-label">Max Combo</span></div>
                        <div class="td-go-stat"><span class="td-go-value" id="vic-lives">0</span><span class="td-go-label">Leben</span></div>
                    </div>
                    <div class="td-gameover-actions">
                        <button id="btn-td-menu-vic" class="btn-primary btn-large"><i class="fas fa-home"></i> Zum Menü</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    app.insertBefore(screen, document.getElementById('loading-overlay'));
    addStyles();
}

// NEU: Event-Listener einrichten
export function setupEventListeners() {
    document.getElementById('btn-td-start').addEventListener('click', showMapSelect);
    document.getElementById('btn-td-map-back').addEventListener('click', showMenu);

    document.querySelectorAll('.td-map-card').forEach(card => {
        card.addEventListener('click', () => startGame(card.dataset.map));
    });

    document.querySelectorAll('.td-tower-btn').forEach(btn => {
        btn.addEventListener('click', () => selectTowerType(btn.dataset.tower));
    });

    document.getElementById('btn-td-wave').addEventListener('click', startWave);
    document.getElementById('btn-td-speed').addEventListener('click', toggleSpeed);
    document.getElementById('btn-td-pause').addEventListener('click', togglePause);
    document.getElementById('btn-td-quit').addEventListener('click', showMenu);

    document.getElementById('btn-upgrade').addEventListener('click', upgradeTower);
    document.getElementById('btn-sell').addEventListener('click', sellTower);

    document.getElementById('ability-nuke').addEventListener('click', () => useAbility('nuke'));
    document.getElementById('ability-freeze').addEventListener('click', () => useAbility('freeze'));
    document.getElementById('ability-gold').addEventListener('click', () => useAbility('gold'));

    document.getElementById('btn-td-retry').addEventListener('click', retryGame);
    document.getElementById('btn-td-menu').addEventListener('click', showMenu);
    document.getElementById('btn-td-menu-vic').addEventListener('click', showMenu);
}

// NEU: Menü anzeigen
export function showMenu() {
    stopGame();
    State.setPhase('menu');

    document.getElementById('td-menu').classList.remove('hidden');
    document.getElementById('td-map-select').classList.add('hidden');
    document.getElementById('td-game').classList.add('hidden');
    document.getElementById('td-gameover').classList.add('hidden');
    document.getElementById('td-victory').classList.add('hidden');
}

// NEU: Kartenauswahl anzeigen
function showMapSelect() {
    State.setPhase('mapSelect');

    document.getElementById('td-menu').classList.add('hidden');
    document.getElementById('td-map-select').classList.remove('hidden');
}

// NEU: Spiel starten
function startGame(mapId) {
    State.setCurrentMap(mapId);

    document.getElementById('td-map-select').classList.add('hidden');
    document.getElementById('td-game').classList.remove('hidden');
    document.getElementById('td-gameover').classList.add('hidden');
    document.getElementById('td-victory').classList.add('hidden');

    initGame(mapId);
    updateUI();
    updateTowerButtons();
    hideTowerInfo();
}

// NEU: Spiel wiederholen
function retryGame() {
    const state = State.getState();
    startGame(state.currentMap);
}

// NEU: Turm-Typ auswählen
function selectTowerType(type) {
    const state = State.getState();
    if (state.gold < TOWER_TYPES[type].baseCost) return;

    State.clearSelection();
    hideTowerInfo();

    const currentType = State.getState().selectedTowerType;
    State.selectTowerType(currentType === type ? null : type);

    document.querySelectorAll('.td-tower-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.tower === State.getState().selectedTowerType);
    });
}

// NEU: Geschwindigkeit umschalten
function toggleSpeed() {
    const speed = State.toggleSpeed();
    document.getElementById('speed-text').textContent = `${speed}x`;
}

// NEU: Pause umschalten
function togglePause() {
    const state = State.getState();
    State.setPaused(!state.isPaused);

    document.getElementById('btn-td-pause').innerHTML = state.isPaused
        ? '<i class="fas fa-play"></i>'
        : '<i class="fas fa-pause"></i>';
}

// NEU: UI aktualisieren
export function updateUI() {
    const state = State.getState();

    document.getElementById('td-lives').textContent = state.lives;
    document.getElementById('td-gold').textContent = state.gold;
    document.getElementById('td-wave').textContent = state.wave;
    document.getElementById('td-combo').textContent = state.combo;
}

// NEU: Turm-Buttons aktualisieren
export function updateTowerButtons() {
    const state = State.getState();

    document.querySelectorAll('.td-tower-btn').forEach(btn => {
        btn.classList.toggle('disabled', state.gold < TOWER_TYPES[btn.dataset.tower].baseCost);
    });
}

// NEU: Turm-Info anzeigen
export function showTowerInfo(tower) {
    const type = TOWER_TYPES[tower.type];
    const state = State.getState();

    document.getElementById('td-info-name').textContent = type.name;
    document.getElementById('td-info-level').textContent = `Lvl ${tower.level + 1}`;
    document.getElementById('td-info-damage').textContent = type.damage[tower.level];
    document.getElementById('td-info-range').textContent = type.range[tower.level];
    document.getElementById('td-info-speed').textContent = (1000 / type.fireRate[tower.level]).toFixed(1);

    const upgradeBtn = document.getElementById('btn-upgrade');
    if (tower.level < 4) {
        document.getElementById('upgrade-cost').textContent = type.upgradeCost[tower.level];
        upgradeBtn.disabled = state.gold < type.upgradeCost[tower.level];
    } else {
        document.getElementById('upgrade-cost').textContent = 'MAX';
        upgradeBtn.disabled = true;
    }

    document.getElementById('sell-value').textContent = Math.floor(type.baseCost * 0.6 + tower.level * 20);
    document.getElementById('td-tower-info').classList.remove('hidden');
}

// NEU: Turm-Info verstecken
export function hideTowerInfo() {
    document.getElementById('td-tower-info').classList.add('hidden');
}

// NEU: Game Over anzeigen
export function showGameOver() {
    const state = State.getState();

    document.getElementById('td-game').classList.add('hidden');
    document.getElementById('td-gameover').classList.remove('hidden');

    document.getElementById('go-wave').textContent = state.wave;
    document.getElementById('go-kills').textContent = state.totalKills;
    document.getElementById('go-score').textContent = state.score;
    document.getElementById('go-combo').textContent = state.maxCombo;
}

// NEU: Sieg anzeigen
export function showVictory() {
    const state = State.getState();

    document.getElementById('td-game').classList.add('hidden');
    document.getElementById('td-victory').classList.remove('hidden');

    document.getElementById('vic-score').textContent = state.score;
    document.getElementById('vic-kills').textContent = state.totalKills;
    document.getElementById('vic-combo').textContent = state.maxCombo;
    document.getElementById('vic-lives').textContent = state.lives;
}

// NEU: CSS-Styles hinzufügen
function addStyles() {
    if (document.getElementById('td-styles')) return;

    const style = document.createElement('style');
    style.id = 'td-styles';
    style.textContent = `
        .td-container { display:flex; flex-direction:column; height:100%; width:100%; background:linear-gradient(180deg,#0c1222 0%,#1a1a2e 100%); }

        /* Menü */
        .td-menu { display:flex; flex-direction:column; align-items:center; gap:var(--spacing-lg); padding:var(--spacing-md); overflow-y:auto; }
        .td-menu.hidden { display:none; }
        .td-header { text-align:center; }
        .td-logo { width:90px; height:90px; margin:0 auto var(--spacing-md); background:linear-gradient(135deg,#f59e0b,#dc2626); border-radius:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 32px rgba(245,158,11,0.5); animation:logoPulse 2s ease-in-out infinite; }
        @keyframes logoPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
        .td-logo i { font-size:2.5rem; color:white; }
        .td-header h2 { font-size:var(--font-size-2xl); font-weight:800; color:white; }
        .td-tagline { color:#94a3b8; font-weight:600; }
        .td-features { display:grid; grid-template-columns:repeat(2,1fr); gap:var(--spacing-sm); width:100%; max-width:340px; }
        .td-feature { display:flex; align-items:center; gap:var(--spacing-sm); padding:var(--spacing-sm); background:rgba(255,255,255,0.05); border-radius:var(--radius-md); font-size:var(--font-size-sm); color:#e2e8f0; font-weight:500; }
        .td-feature i { color:#f59e0b; }
        .td-tower-preview { width:100%; max-width:340px; }
        .td-tower-preview h3 { font-size:var(--font-size-sm); color:#94a3b8; margin-bottom:var(--spacing-sm); text-align:center; }
        .td-tower-list { display:flex; flex-direction:column; gap:var(--spacing-xs); }
        .td-tower-preview-item { display:flex; align-items:center; gap:var(--spacing-sm); padding:var(--spacing-sm); background:rgba(255,255,255,0.03); border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.05); }
        .td-tower-icon { width:36px; height:36px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:white; font-size:var(--font-size-base); }
        .td-tower-info { display:flex; flex-direction:column; }
        .td-tower-name { font-size:var(--font-size-sm); color:white; font-weight:600; }
        .td-tower-desc { font-size:var(--font-size-xs); color:#64748b; }
        #btn-td-start { width:100%; max-width:340px; }

        /* Kartenauswahl */
        .td-map-select { display:flex; flex-direction:column; align-items:center; gap:var(--spacing-lg); padding:var(--spacing-md); overflow-y:auto; }
        .td-map-select.hidden { display:none; }
        .td-map-header { text-align:center; }
        .td-map-header h2 { font-size:var(--font-size-xl); font-weight:700; color:white; display:flex; align-items:center; justify-content:center; gap:var(--spacing-sm); }
        .td-map-header h2 i { color:#f59e0b; }
        .td-map-header p { color:#94a3b8; font-size:var(--font-size-sm); margin-top:var(--spacing-xs); }
        .td-map-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:var(--spacing-sm); width:100%; max-width:400px; }
        .td-map-card { display:flex; flex-direction:column; align-items:center; gap:var(--spacing-xs); padding:var(--spacing-sm); background:rgba(255,255,255,0.05); border:2px solid transparent; border-radius:var(--radius-lg); cursor:pointer; transition:all 0.3s ease; text-align:center; }
        .td-map-card:hover { background:rgba(255,255,255,0.1); transform:translateY(-2px); }
        .td-map-card:active { transform:scale(0.98); }
        .td-map-icon { width:50px; height:50px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:white; font-size:1.5rem; }
        .td-map-info { display:flex; flex-direction:column; gap:2px; }
        .td-map-name { font-size:var(--font-size-sm); color:white; font-weight:700; }
        .td-map-desc { font-size:var(--font-size-xs); color:#64748b; }
        .td-map-difficulty { display:flex; justify-content:center; gap:2px; margin-top:4px; }
        .td-map-difficulty i { font-size:0.6rem; color:#475569; }
        .td-map-difficulty i.active { color:#fbbf24; }
        #btn-td-map-back { margin-top:var(--spacing-md); }

        /* Spielbereich - ÄNDERUNG: Angepasst für 9:16 Canvas */
        .td-game { display:flex; flex-direction:column; height:100%; gap:4px; padding:4px; overflow-y:auto; }
        .td-game.hidden { display:none; }
        .td-stats-bar { display:flex; justify-content:space-between; padding:var(--spacing-xs) var(--spacing-sm); background:rgba(0,0,0,0.5); border-radius:var(--radius-md); flex-shrink:0; }
        .td-stat { display:flex; align-items:center; gap:4px; font-weight:700; font-size:var(--font-size-sm); color:white; }
        .td-stat small { font-size:var(--font-size-xs); opacity:0.6; }
        .td-stat.lives i { color:#ef4444; }
        .td-stat.gold i { color:#fbbf24; }
        .td-stat.wave i { color:#3b82f6; }
        .td-stat.combo i { color:#f97316; }
        .td-stat.combo { opacity:0; transform:scale(0.8); transition:all 0.3s ease; }
        .td-stat.combo.active { opacity:1; transform:scale(1); animation:comboPulse 0.5s ease; }
        @keyframes comboPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.2);} }

        /* ÄNDERUNG: Canvas-Container mit 9:16 Portrait-Ratio für mobile Geräte */
        .td-canvas-container { 
            position:relative; 
            border-radius:var(--radius-lg); 
            overflow:hidden; 
            background:#0a0f1a;
            width:100%;
            max-width:400px;
            margin:0 auto;
            aspect-ratio: 9 / 16;
            flex-shrink:0;
            touch-action: none; /* NEU: Verhindert Browser-Gesten auf Canvas */
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        #td-canvas { 
            width:100%; 
            height:100%; 
            display:block; 
            touch-action: none; /* NEU: Touch-Events nur für Spiel */
        }

        .td-tower-info { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-md); padding:var(--spacing-sm); min-width:200px; backdrop-filter:blur(10px); z-index:10; }
        .td-tower-info.hidden { display:none; }
        .td-info-header { display:flex; justify-content:space-between; margin-bottom:var(--spacing-xs); }
        .td-info-header span:first-child { font-weight:700; color:white; }
        .td-info-header span:last-child { font-size:var(--font-size-xs); color:#f59e0b; background:rgba(245,158,11,0.2); padding:2px 8px; border-radius:var(--radius-sm); }
        .td-info-stats { display:flex; gap:var(--spacing-md); margin-bottom:var(--spacing-sm); font-size:var(--font-size-xs); color:#94a3b8; }
        .td-info-stats div { display:flex; align-items:center; gap:4px; }
        .td-info-stats i { color:#64748b; }
        .td-info-actions { display:flex; gap:var(--spacing-xs); }
        .td-info-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:4px; padding:var(--spacing-xs); border-radius:var(--radius-sm); font-size:var(--font-size-xs); font-weight:600; border:none; cursor:pointer; transition:all 0.2s ease; }
        .td-info-btn.upgrade { background:linear-gradient(135deg,#22c55e,#16a34a); color:white; }
        .td-info-btn.upgrade:disabled { background:#4b5563; opacity:0.6; cursor:not-allowed; }
        .td-info-btn.sell { background:rgba(239,68,68,0.2); color:#ef4444; border:1px solid #ef4444; }

        .td-tower-selection { display:flex; gap:var(--spacing-xs); padding:var(--spacing-xs) var(--spacing-sm); background:rgba(0,0,0,0.5); border-radius:var(--radius-md); overflow-x:auto; flex-shrink:0; }
        .td-tower-btn { display:flex; flex-direction:column; align-items:center; gap:2px; padding:var(--spacing-xs); background:rgba(255,255,255,0.05); border:2px solid transparent; border-radius:var(--radius-md); cursor:pointer; transition:all 0.2s ease; min-width:50px; }
        .td-tower-btn:hover { background:rgba(255,255,255,0.1); }
        .td-tower-btn.selected { border-color:#22c55e; background:rgba(34,197,94,0.2); }
        .td-tower-btn.disabled { opacity:0.4; cursor:not-allowed; }
        .td-tower-btn-icon { width:32px; height:32px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:white; font-size:var(--font-size-sm); }
        .td-tower-btn-cost { font-size:var(--font-size-xs); color:#fbbf24; font-weight:600; }
        .td-divider { width:1px; background:rgba(255,255,255,0.1); margin:0 var(--spacing-xs); }
        .td-ability-btn { position:relative; width:40px; height:40px; background:rgba(255,255,255,0.05); border:2px solid rgba(255,255,255,0.1); border-radius:var(--radius-md); color:#94a3b8; cursor:pointer; transition:all 0.2s ease; overflow:hidden; }
        .td-ability-btn:hover:not(:disabled) { background:rgba(255,255,255,0.1); color:white; }
        .td-ability-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .ability-cooldown { position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.7); transition:height 0.1s linear; }

        .td-actions { display:flex; gap:var(--spacing-xs); padding:var(--spacing-xs); flex-shrink:0; }
        .td-action-btn { display:flex; align-items:center; justify-content:center; gap:var(--spacing-xs); padding:var(--spacing-xs) var(--spacing-sm); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-md); color:white; font-size:var(--font-size-sm); font-weight:600; cursor:pointer; transition:all 0.2s ease; }
        .td-action-btn:hover { background:rgba(255,255,255,0.1); }
        .td-action-btn:active { transform:scale(0.95); }
        .td-action-btn.primary { background:linear-gradient(135deg,#22c55e,#16a34a); border-color:#22c55e; flex:1; max-width:180px; }
        .td-action-btn.primary:disabled { background:#4b5563; border-color:#4b5563; opacity:0.6; }
        .td-action-btn.danger { background:rgba(239,68,68,0.2); border-color:#ef4444; color:#ef4444; }

        /* Game Over / Victory */
        .td-gameover,.td-victory { display:flex; align-items:center; justify-content:center; padding:var(--spacing-xl); }
        .td-gameover.hidden,.td-victory.hidden { display:none; }
        .td-gameover-content,.td-victory-content { text-align:center; display:flex; flex-direction:column; align-items:center; gap:var(--spacing-lg); }
        .td-gameover-icon,.td-victory-icon { width:100px; height:100px; border-radius:var(--radius-full); display:flex; align-items:center; justify-content:center; font-size:3rem; color:white; }
        .td-gameover-icon.fail { background:linear-gradient(135deg,#64748b,#475569); }
        .td-victory-icon { background:linear-gradient(135deg,#fbbf24,#f59e0b); animation:victoryBounce 1s ease infinite; }
        @keyframes victoryBounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        .td-gameover-content h2,.td-victory-content h2 { font-size:var(--font-size-2xl); font-weight:800; color:white; }
        .td-gameover-content p,.td-victory-content p { color:#94a3b8; }
        .td-gameover-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:var(--spacing-sm); }
        .td-go-stat { display:flex; flex-direction:column; align-items:center; padding:var(--spacing-md); background:rgba(255,255,255,0.05); border-radius:var(--radius-md); min-width:80px; }
        .td-go-value { font-size:var(--font-size-xl); font-weight:800; color:#f59e0b; }
        .td-go-label { font-size:var(--font-size-xs); color:#94a3b8; text-transform:uppercase; }
        .td-gameover-actions { display:flex; flex-direction:column; gap:var(--spacing-sm); width:100%; max-width:250px; }
        .td-gameover-actions button { width:100%; }
    `;
    document.head.appendChild(style);
}