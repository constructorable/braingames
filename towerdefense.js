/* =========================================
   BrainTower — Klassisches Tower Defense
   Verteidige deine Basis gegen Wellen von Gegnern!
   ========================================= */

// ÄNDERUNG: Refaktorierte Bewegungslogik mit frame-unabhängiger Geschwindigkeit

const GAME_CONFIG = {
    startGold: 200,
    startLives: 20,
    goldPerWave: 50,
    interestRate: 0.05,
    maxInterestGold: 500,
    comboTime: 2000,
    critChance: 0.15,
    critMultiplier: 2.5,
    baseSpeed: 50 // NEU: Basis-Pixel pro Sekunde für Geschwindigkeitsberechnung
};

const TOWER_TYPES = {
    arrow: {
        name: 'Pfeilturm',
        icon: 'fa-bullseye',
        color: '#22c55e',
        baseCost: 50,
        damage: [10, 15, 22, 32, 45],
        range: [100, 110, 120, 135, 150],
        fireRate: [800, 750, 700, 600, 500],
        upgradeCost: [30, 50, 80, 120],
        description: 'Schnell, mittlerer Schaden',
        projectileSpeed: 400 // ÄNDERUNG: Pixel pro Sekunde statt arbiträre Werte
    },
    cannon: {
        name: 'Kanone',
        icon: 'fa-circle',
        color: '#f59e0b',
        baseCost: 100,
        damage: [35, 50, 70, 95, 130],
        range: [80, 85, 90, 100, 110],
        fireRate: [1500, 1400, 1300, 1200, 1000],
        splashRadius: [30, 35, 40, 50, 60],
        upgradeCost: [60, 100, 150, 220],
        description: 'Flächenschaden',
        projectileSpeed: 280
    },
    ice: {
        name: 'Eisturm',
        icon: 'fa-snowflake',
        color: '#3b82f6',
        baseCost: 75,
        damage: [5, 8, 12, 18, 25],
        range: [90, 100, 110, 125, 140],
        fireRate: [1000, 950, 900, 850, 750],
        slowAmount: [0.3, 0.35, 0.4, 0.5, 0.6],
        slowDuration: [1500, 1700, 2000, 2500, 3000],
        upgradeCost: [45, 75, 110, 160],
        description: 'Verlangsamt Gegner',
        projectileSpeed: 320
    },
    laser: {
        name: 'Laserturm',
        icon: 'fa-dot-circle',
        color: '#ef4444',
        baseCost: 150,
        damage: [25, 40, 60, 85, 120],
        range: [120, 130, 145, 160, 180],
        fireRate: [100, 100, 100, 100, 100],
        chainTargets: [1, 2, 2, 3, 4],
        upgradeCost: [90, 140, 200, 280],
        description: 'Konstanter Strahl',
        projectileSpeed: 0
    }
};

const ENEMY_TYPES = {
    basic: { name: 'Grundling', color: '#94a3b8', health: 30, speed: 1.0, reward: 5, size: 12 },
    fast: { name: 'Sprinter', color: '#22d3ee', health: 20, speed: 2.0, reward: 8, size: 10 },
    tank: { name: 'Panzer', color: '#a855f7', health: 150, speed: 0.5, reward: 20, armor: 5, size: 18 },
    healer: { name: 'Heiler', color: '#4ade80', health: 50, speed: 0.8, reward: 15, healRadius: 50, healAmount: 2, size: 14 },
    swarm: { name: 'Schwarm', color: '#fbbf24', health: 10, speed: 1.5, reward: 2, size: 8 },
    boss: { name: 'BOSS', color: '#dc2626', health: 1000, speed: 0.35, reward: 200, armor: 10, size: 30, isBoss: true },
    miniboss: { name: 'Elite', color: '#f97316', health: 400, speed: 0.6, reward: 75, armor: 3, size: 22 }
};

const WAVE_CONFIG = [
    { enemies: [{ type: 'basic', count: 8 }], delay: 1200 },
    { enemies: [{ type: 'basic', count: 10 }, { type: 'fast', count: 3 }], delay: 1100 },
    { enemies: [{ type: 'fast', count: 8 }], delay: 800 },
    { enemies: [{ type: 'basic', count: 12 }, { type: 'fast', count: 5 }], delay: 1000 },
    { enemies: [{ type: 'tank', count: 2 }, { type: 'basic', count: 10 }], delay: 1000 },
    { enemies: [{ type: 'swarm', count: 20 }], delay: 400 },
    { enemies: [{ type: 'tank', count: 4 }, { type: 'fast', count: 8 }], delay: 900 },
    { enemies: [{ type: 'healer', count: 3 }, { type: 'tank', count: 3 }, { type: 'basic', count: 10 }], delay: 800 },
    { enemies: [{ type: 'fast', count: 15 }, { type: 'swarm', count: 15 }], delay: 500 },
    { enemies: [{ type: 'miniboss', count: 1 }, { type: 'tank', count: 5 }], delay: 1000 },
    { enemies: [{ type: 'swarm', count: 30 }, { type: 'healer', count: 2 }], delay: 350 },
    { enemies: [{ type: 'tank', count: 8 }, { type: 'healer', count: 4 }], delay: 800 },
    { enemies: [{ type: 'fast', count: 20 }, { type: 'miniboss', count: 1 }], delay: 600 },
    { enemies: [{ type: 'miniboss', count: 2 }, { type: 'healer', count: 3 }, { type: 'tank', count: 5 }], delay: 700 },
    { enemies: [{ type: 'boss', count: 1 }], delay: 2000 },
    { enemies: [{ type: 'swarm', count: 40 }, { type: 'fast', count: 15 }], delay: 300 },
    { enemies: [{ type: 'tank', count: 12 }, { type: 'healer', count: 5 }], delay: 600 },
    { enemies: [{ type: 'miniboss', count: 3 }, { type: 'tank', count: 8 }], delay: 700 },
    { enemies: [{ type: 'boss', count: 1 }, { type: 'miniboss', count: 2 }, { type: 'healer', count: 4 }], delay: 800 },
    { enemies: [{ type: 'boss', count: 2 }, { type: 'tank', count: 10 }], delay: 1000 }
];

// Pfadpunkte in Prozent (0-100)
const PATH_POINTS = [
    { x: -5, y: 50 }, { x: 15, y: 50 }, { x: 15, y: 20 }, { x: 40, y: 20 },
    { x: 40, y: 80 }, { x: 60, y: 80 }, { x: 60, y: 35 }, { x: 85, y: 35 },
    { x: 85, y: 65 }, { x: 105, y: 65 }
];

let state = {
    phase: 'menu',
    gold: 200,
    lives: 20,
    wave: 0,
    score: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    particles: [],
    selectedTowerType: null,
    selectedTower: null,
    waveInProgress: false,
    enemySpawnQueue: [],
    spawnTimer: null,
    gameLoop: null,
    lastFrameTime: 0,
    isPaused: false,
    gameSpeed: 1,
    totalKills: 0,
    combo: 0,
    comboTimer: null,
    maxCombo: 0,
    abilities: {
        nuke: { cooldown: 0, maxCooldown: 45000, cost: 100 },
        freeze: { cooldown: 0, maxCooldown: 30000, cost: 50 },
        gold: { cooldown: 0, maxCooldown: 60000, cost: 0 }
    }
};

let canvas, ctx, canvasWidth, canvasHeight;
let pathPixels = [];
let pathSegmentLengths = []; // NEU: Vorberechnete Segmentlängen
let totalPathLength = 0;     // NEU: Gesamte Pfadlänge
let nextId = 1;

export function init() {
    renderScreen();
    setupEventListeners();
}

function renderScreen() {
    const app = document.getElementById('app');
    if (document.getElementById('td-screen')) return;
    
    const screen = document.createElement('section');
    screen.id = 'td-screen';
    screen.className = 'screen';
    
    screen.innerHTML = `
        <div class="td-container">
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
                    <div class="td-feature"><i class="fas fa-fire"></i><span>Combos</span></div>
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
                <button id="btn-td-start" class="btn-primary btn-large"><i class="fas fa-play"></i> Spiel starten</button>
            </div>
            
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

function addStyles() {
    if (document.getElementById('td-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'td-styles';
    style.textContent = `
        .td-container { display:flex; flex-direction:column; height:100%; width:100%; background:linear-gradient(180deg,#0c1222 0%,#1a1a2e 100%); }
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
        
        .td-game { display:flex; flex-direction:column; height:100%; gap:4px; padding:4px; }
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
        
        .td-canvas-container { flex:1; position:relative; border-radius:var(--radius-lg); overflow:hidden; min-height:200px; background:#0a0f1a; }
        #td-canvas { width:100%; height:100%; display:block; }
        
        .td-tower-info { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-md); padding:var(--spacing-sm); min-width:200px; backdrop-filter:blur(10px); }
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

function setupEventListeners() {
    document.getElementById('btn-td-start').addEventListener('click', startGame);
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
    document.getElementById('btn-td-retry').addEventListener('click', startGame);
    document.getElementById('btn-td-menu').addEventListener('click', showMenu);
    document.getElementById('btn-td-menu-vic').addEventListener('click', showMenu);
}

function showMenu() {
    stopGame();
    state.phase = 'menu';
    document.getElementById('td-menu').classList.remove('hidden');
    document.getElementById('td-game').classList.add('hidden');
    document.getElementById('td-gameover').classList.add('hidden');
    document.getElementById('td-victory').classList.add('hidden');
}

function startGame() {
    state = {
        phase: 'playing',
        gold: GAME_CONFIG.startGold,
        lives: GAME_CONFIG.startLives,
        wave: 0,
        score: 0,
        towers: [],
        enemies: [],
        projectiles: [],
        particles: [],
        selectedTowerType: null,
        selectedTower: null,
        waveInProgress: false,
        enemySpawnQueue: [],
        spawnTimer: null,
        gameLoop: null,
        lastFrameTime: 0,
        isPaused: false,
        gameSpeed: 1,
        totalKills: 0,
        combo: 0,
        comboTimer: null,
        maxCombo: 0,
        abilities: {
            nuke: { cooldown: 0, maxCooldown: 45000, cost: 100 },
            freeze: { cooldown: 0, maxCooldown: 30000, cost: 50 },
            gold: { cooldown: 0, maxCooldown: 60000, cost: 0 }
        }
    };
    
    document.getElementById('td-menu').classList.add('hidden');
    document.getElementById('td-game').classList.remove('hidden');
    document.getElementById('td-gameover').classList.add('hidden');
    document.getElementById('td-victory').classList.add('hidden');
    
    initCanvas();
    updateUI();
    updateTowerButtons();
    hideTowerInfo();
    
    state.lastFrameTime = performance.now();
    state.gameLoop = requestAnimationFrame(gameLoop);
}

// ÄNDERUNG: Verbesserte Canvas-Initialisierung mit Pfadberechnung
function initCanvas() {
    canvas = document.getElementById('td-canvas');
    const container = document.getElementById('td-canvas-container');
    canvasWidth = container.offsetWidth;
    canvasHeight = container.offsetHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    
    // Konvertiere Prozent-Koordinaten zu Pixel-Koordinaten
    pathPixels = PATH_POINTS.map(p => ({
        x: (p.x / 100) * canvasWidth,
        y: (p.y / 100) * canvasHeight
    }));
    
    // NEU: Berechne Segmentlängen für korrekte Bewegung
    calculatePathLengths();
    
    canvas.onclick = handleCanvasClick;
}

// NEU: Berechnet alle Segmentlängen und Gesamtpfadlänge
function calculatePathLengths() {
    pathSegmentLengths = [];
    totalPathLength = 0;
    
    for (let i = 0; i < pathPixels.length - 1; i++) {
        const dx = pathPixels[i + 1].x - pathPixels[i].x;
        const dy = pathPixels[i + 1].y - pathPixels[i].y;
        const length = Math.sqrt(dx * dx + dy * dy);
        pathSegmentLengths.push(length);
        totalPathLength += length;
    }
}

function gameLoop(timestamp) {
    if (state.phase !== 'playing') return;
    
    // ÄNDERUNG: Delta-Time in Sekunden mit Obergrenze (verhindert Sprünge bei Tab-Wechsel)
    let deltaTime = Math.min((timestamp - state.lastFrameTime) / 1000, 0.1) * state.gameSpeed;
    state.lastFrameTime = timestamp;
    
    if (!state.isPaused) {
        update(deltaTime);
    }
    
    render();
    state.gameLoop = requestAnimationFrame(gameLoop);
}

function update(dt) {
    updateEnemies(dt);
    updateTowers(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    updateAbilityCooldowns(dt);
    
    if (state.waveInProgress && state.enemies.length === 0 && state.enemySpawnQueue.length === 0) {
        waveComplete();
    }
}

function stopGame() {
    if (state.gameLoop) {
        cancelAnimationFrame(state.gameLoop);
        state.gameLoop = null;
    }
    if (state.spawnTimer) {
        clearTimeout(state.spawnTimer);
        state.spawnTimer = null;
    }
    if (state.comboTimer) {
        clearTimeout(state.comboTimer);
        state.comboTimer = null;
    }
}

function render() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBackground();
    drawPath();
    drawTowers();
    drawEnemies();
    drawProjectiles();
    drawParticles();
}

function drawBackground() {
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvasWidth; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvasHeight; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

function drawPath() {
    // Äußere Pfadlinie
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 50;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pathPixels[0].x, pathPixels[0].y);
    for (let i = 1; i < pathPixels.length; i++) {
        ctx.lineTo(pathPixels[i].x, pathPixels[i].y);
    }
    ctx.stroke();
    
    // Innere Pfadlinie
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(pathPixels[0].x, pathPixels[0].y);
    for (let i = 1; i < pathPixels.length; i++) {
        ctx.lineTo(pathPixels[i].x, pathPixels[i].y);
    }
    ctx.stroke();
    
    // Gestrichelte Mittellinie
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(pathPixels[0].x, pathPixels[0].y);
    for (let i = 1; i < pathPixels.length; i++) {
        ctx.lineTo(pathPixels[i].x, pathPixels[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Ziel-Markierung
    const end = pathPixels[pathPixels.length - 1];
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 12, 0, Math.PI * 2);
    ctx.fill();
}

function drawTowers() {
    state.towers.forEach(tower => {
        const type = TOWER_TYPES[tower.type];
        const isSelected = state.selectedTower && state.selectedTower.id === tower.id;
        
        // Reichweiten-Anzeige bei Auswahl
        if (isSelected) {
            ctx.fillStyle = `${type.color}20`;
            ctx.strokeStyle = `${type.color}50`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, type.range[tower.level], 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        // Turm-Basis
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, 22, 0, Math.PI * 2);
        ctx.fill();
        
        // Turm-Körper mit Gradient
        const gradient = ctx.createRadialGradient(tower.x - 5, tower.y - 5, 0, tower.x, tower.y, 18);
        gradient.addColorStop(0, type.color);
        gradient.addColorStop(1, adjustColor(type.color, -40));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // Level-Sterne
        ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < tower.level + 1; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(tower.x + Math.cos(angle) * 24, tower.y + Math.sin(angle) * 24, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Laser-Strahl zeichnen
        if (tower.type === 'laser' && tower.target) {
            const enemy = state.enemies.find(e => e.id === tower.target);
            if (enemy) {
                const pos = getEnemyPosition(enemy);
                ctx.strokeStyle = type.color;
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(tower.x, tower.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    });
}

function drawEnemies() {
    state.enemies.forEach(enemy => {
        const type = ENEMY_TYPES[enemy.type];
        const pos = getEnemyPosition(enemy);
        
        // Schatten
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + type.size * 0.8, type.size * 0.8, type.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Verlangsamungs-Indikator
        if (enemy.slowed) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, type.size + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Gegner-Körper mit Gradient
        const gradient = ctx.createRadialGradient(
            pos.x - type.size * 0.3, pos.y - type.size * 0.3, 0,
            pos.x, pos.y, type.size
        );
        gradient.addColorStop(0, adjustColor(type.color, 30));
        gradient.addColorStop(1, type.color);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, type.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Boss-Krone
        if (type.isBoss) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(pos.x - 12, pos.y - type.size - 5);
            ctx.lineTo(pos.x - 8, pos.y - type.size - 15);
            ctx.lineTo(pos.x - 4, pos.y - type.size - 8);
            ctx.lineTo(pos.x, pos.y - type.size - 18);
            ctx.lineTo(pos.x + 4, pos.y - type.size - 8);
            ctx.lineTo(pos.x + 8, pos.y - type.size - 15);
            ctx.lineTo(pos.x + 12, pos.y - type.size - 5);
            ctx.closePath();
            ctx.fill();
        }
        
        // Gesundheitsbalken
        const barWidth = type.size * 2;
        const barHeight = 4;
        const barY = pos.y - type.size - 8;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(pos.x - barWidth / 2, barY, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.6 ? '#22c55e' : healthPercent > 0.3 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(pos.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
    });
}

function drawProjectiles() {
    state.projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Schweif-Effekt
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(p.x - p.vx * 0.05, p.y - p.vy * 0.05, (p.size || 4) * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

function drawParticles() {
    state.particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// ÄNDERUNG: Komplett überarbeitete Positionsberechnung
function getEnemyPosition(enemy) {
    // distanceTraveled ist jetzt in Pixeln entlang des Pfades
    let remainingDistance = enemy.distanceTraveled;
    
    for (let i = 0; i < pathSegmentLengths.length; i++) {
        if (remainingDistance <= pathSegmentLengths[i]) {
            // Position liegt in diesem Segment
            const t = remainingDistance / pathSegmentLengths[i];
            const p1 = pathPixels[i];
            const p2 = pathPixels[i + 1];
            return {
                x: p1.x + (p2.x - p1.x) * t,
                y: p1.y + (p2.y - p1.y) * t
            };
        }
        remainingDistance -= pathSegmentLengths[i];
    }
    
    // Am Ende des Pfades
    return pathPixels[pathPixels.length - 1];
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (state.selectedTowerType) {
        placeTower(x, y);
        return;
    }
    
    const clickedTower = state.towers.find(t => 
        Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2) < 25
    );
    
    if (clickedTower) {
        selectTower(clickedTower);
    } else {
        hideTowerInfo();
        state.selectedTower = null;
    }
}

function placeTower(x, y) {
    if (!state.selectedTowerType) return;
    
    const type = TOWER_TYPES[state.selectedTowerType];
    if (state.gold < type.baseCost) return;
    if (isOnPath(x, y, 35)) return;
    if (state.towers.some(t => Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2) < 45)) return;
    
    state.gold -= type.baseCost;
    state.towers.push({
        id: nextId++,
        type: state.selectedTowerType,
        x,
        y,
        level: 0,
        cooldown: 0,
        target: null,
        totalDamage: 0
    });
    
    createParticles(x, y, type.color, 10);
    state.selectedTowerType = null;
    document.querySelectorAll('.td-tower-btn').forEach(b => b.classList.remove('selected'));
    updateUI();
    updateTowerButtons();
}

function isOnPath(x, y, threshold = 30) {
    for (let i = 0; i < pathPixels.length - 1; i++) {
        const dist = pointToLineDistance(
            x, y,
            pathPixels[i].x, pathPixels[i].y,
            pathPixels[i + 1].x, pathPixels[i + 1].y
        );
        if (dist < threshold) return true;
    }
    return false;
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = lenSq !== 0 ? dot / lenSq : -1;
    
    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
}

function selectTowerType(type) {
    if (state.gold < TOWER_TYPES[type].baseCost) return;
    
    state.selectedTower = null;
    hideTowerInfo();
    state.selectedTowerType = state.selectedTowerType === type ? null : type;
    
    document.querySelectorAll('.td-tower-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.tower === state.selectedTowerType);
    });
}

function selectTower(tower) {
    state.selectedTower = tower;
    state.selectedTowerType = null;
    document.querySelectorAll('.td-tower-btn').forEach(b => b.classList.remove('selected'));
    showTowerInfo(tower);
}

function showTowerInfo(tower) {
    const type = TOWER_TYPES[tower.type];
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

function hideTowerInfo() {
    document.getElementById('td-tower-info').classList.add('hidden');
}

function upgradeTower() {
    if (!state.selectedTower || state.selectedTower.level >= 4) return;
    
    const type = TOWER_TYPES[state.selectedTower.type];
    const cost = type.upgradeCost[state.selectedTower.level];
    if (state.gold < cost) return;
    
    state.gold -= cost;
    state.selectedTower.level++;
    
    createParticles(state.selectedTower.x, state.selectedTower.y, '#fbbf24', 15);
    showTowerInfo(state.selectedTower);
    updateUI();
    updateTowerButtons();
}

function sellTower() {
    if (!state.selectedTower) return;
    
    const type = TOWER_TYPES[state.selectedTower.type];
    state.gold += Math.floor(type.baseCost * 0.6 + state.selectedTower.level * 20);
    state.towers = state.towers.filter(t => t.id !== state.selectedTower.id);
    
    createParticles(state.selectedTower.x, state.selectedTower.y, '#fbbf24', 10);
    state.selectedTower = null;
    hideTowerInfo();
    updateUI();
    updateTowerButtons();
}

function updateTowerButtons() {
    document.querySelectorAll('.td-tower-btn').forEach(btn => {
        btn.classList.toggle('disabled', state.gold < TOWER_TYPES[btn.dataset.tower].baseCost);
    });
}

function startWave() {
    if (state.waveInProgress || state.wave >= WAVE_CONFIG.length) return;
    
    state.wave++;
    state.waveInProgress = true;
    
    const waveData = WAVE_CONFIG[state.wave - 1];
    state.enemySpawnQueue = [];
    
    waveData.enemies.forEach(group => {
        for (let i = 0; i < group.count; i++) {
            state.enemySpawnQueue.push(group.type);
        }
    });
    
    spawnNextEnemy(waveData.delay);
    
    document.getElementById('btn-td-wave').disabled = true;
    document.getElementById('btn-td-wave').querySelector('span').textContent = 'Welle läuft...';
    updateUI();
}

// ÄNDERUNG: Feinde verwenden jetzt distanceTraveled statt pathProgress
function spawnNextEnemy(delay) {
    if (state.enemySpawnQueue.length === 0 || state.phase !== 'playing') return;
    
    const type = state.enemySpawnQueue.shift();
    const enemyType = ENEMY_TYPES[type];
    const healthScale = 1 + (state.wave - 1) * 0.15;
    
    state.enemies.push({
        id: nextId++,
        type,
        distanceTraveled: 0, // ÄNDERUNG: Pixel-basierte Position statt pathProgress
        health: Math.floor(enemyType.health * healthScale),
        maxHealth: Math.floor(enemyType.health * healthScale),
        speed: enemyType.speed,
        slowed: false,
        slowTimer: 0,
        slowAmount: 0
    });
    
    if (state.enemySpawnQueue.length > 0) {
        state.spawnTimer = setTimeout(() => spawnNextEnemy(delay), delay / state.gameSpeed);
    }
}

// ÄNDERUNG: Komplett überarbeitete Feind-Bewegung mit frame-unabhängiger Geschwindigkeit
function updateEnemies(dt) {
    const toRemove = [];
    
    state.enemies.forEach(enemy => {
        const type = ENEMY_TYPES[enemy.type];
        
        // Verlangsamung verarbeiten (dt ist in Sekunden, slowTimer in ms)
        if (enemy.slowed && enemy.slowTimer > 0) {
            enemy.slowTimer -= dt * 1000;
            if (enemy.slowTimer <= 0) {
                enemy.slowed = false;
                enemy.slowAmount = 0;
            }
        }
        
        // Geschwindigkeit berechnen (Pixel pro Sekunde)
        let speed = type.speed * GAME_CONFIG.baseSpeed;
        if (enemy.slowed) {
            speed *= (1 - enemy.slowAmount);
        }
        
        // Bewegung: distanceTraveled in Pixel erhöhen
        enemy.distanceTraveled += speed * dt;
        
        // Prüfen ob Ziel erreicht
        if (enemy.distanceTraveled >= totalPathLength) {
            state.lives--;
            toRemove.push(enemy.id);
            
            // Screen-Shake Effekt
            canvas.style.transform = 'translateX(5px)';
            setTimeout(() => canvas.style.transform = '', 50);
            
            if (state.lives <= 0) {
                gameOver();
            }
        }
        
        // Heiler-Fähigkeit
        if (type.healRadius && type.healAmount) {
            const pos = getEnemyPosition(enemy);
            state.enemies.forEach(other => {
                if (other.id !== enemy.id) {
                    const otherPos = getEnemyPosition(other);
                    const dist = Math.sqrt((pos.x - otherPos.x) ** 2 + (pos.y - otherPos.y) ** 2);
                    if (dist < type.healRadius) {
                        other.health = Math.min(other.maxHealth, other.health + type.healAmount * dt);
                    }
                }
            });
        }
    });
    
    state.enemies = state.enemies.filter(e => !toRemove.includes(e.id) && e.health > 0);
    updateUI();
}

// ÄNDERUNG: Cooldown jetzt in Sekunden
function updateTowers(dt) {
    state.towers.forEach(tower => {
        tower.cooldown -= dt * 1000; // dt ist in Sekunden, cooldown in ms
        if (tower.cooldown > 0) return;
        
        const type = TOWER_TYPES[tower.type];
        const range = type.range[tower.level];
        
        // Finde bestes Ziel (am weitesten auf Pfad)
        let bestTarget = null;
        let bestProgress = -1;
        
        state.enemies.forEach(enemy => {
            const pos = getEnemyPosition(enemy);
            const dist = Math.sqrt((tower.x - pos.x) ** 2 + (tower.y - pos.y) ** 2);
            
            if (dist <= range && enemy.distanceTraveled > bestProgress) {
                bestProgress = enemy.distanceTraveled;
                bestTarget = enemy;
            }
        });
        
        if (bestTarget) {
            tower.target = bestTarget.id;
            fireTower(tower, bestTarget);
            tower.cooldown = type.fireRate[tower.level];
        } else {
            tower.target = null;
        }
    });
}

function fireTower(tower, target) {
    const type = TOWER_TYPES[tower.type];
    const targetPos = getEnemyPosition(target);
    
    if (tower.type === 'laser') {
        // Laser: Sofortiger Schaden
        dealDamage(target, type.damage[tower.level], tower);
        
        const chainTargets = type.chainTargets[tower.level];
        if (chainTargets > 1) {
            let lastPos = targetPos;
            const hits = [target.id];
            
            for (let i = 1; i < chainTargets; i++) {
                const nextTarget = state.enemies.find(e => {
                    if (hits.includes(e.id)) return false;
                    const pos = getEnemyPosition(e);
                    return Math.sqrt((lastPos.x - pos.x) ** 2 + (lastPos.y - pos.y) ** 2) < 80;
                });
                
                if (nextTarget) {
                    dealDamage(nextTarget, type.damage[tower.level] * 0.5, tower);
                    hits.push(nextTarget.id);
                    lastPos = getEnemyPosition(nextTarget);
                }
            }
        }
    } else {
        // Projektil erstellen
        const dx = targetPos.x - tower.x;
        const dy = targetPos.y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        state.projectiles.push({
            id: nextId++,
            x: tower.x,
            y: tower.y,
            vx: (dx / dist) * type.projectileSpeed, // Pixel pro Sekunde
            vy: (dy / dist) * type.projectileSpeed,
            damage: type.damage[tower.level],
            tower,
            targetId: target.id,
            type: tower.type,
            color: type.color,
            size: tower.type === 'cannon' ? 6 : 4
        });
    }
}

function dealDamage(enemy, damage, tower) {
    const type = ENEMY_TYPES[enemy.type];
    
    // Rüstung reduziert Schaden
    if (type.armor) {
        damage = Math.max(1, damage - type.armor);
    }
    
    // Kritischer Treffer
    if (Math.random() < GAME_CONFIG.critChance) {
        damage *= GAME_CONFIG.critMultiplier;
        const pos = getEnemyPosition(enemy);
        createParticles(pos.x, pos.y - 20, '#fbbf24', 5);
    }
    
    enemy.health -= damage;
    
    // Verlangsamung anwenden
    const towerType = TOWER_TYPES[tower.type];
    if (towerType.slowAmount) {
        enemy.slowed = true;
        enemy.slowAmount = towerType.slowAmount[tower.level];
        enemy.slowTimer = towerType.slowDuration[tower.level];
    }
    
    if (enemy.health <= 0) {
        killEnemy(enemy);
    }
}

function killEnemy(enemy) {
    const type = ENEMY_TYPES[enemy.type];
    const pos = getEnemyPosition(enemy);
    
    state.gold += type.reward;
    state.score += type.reward * 10;
    state.totalKills++;
    state.combo++;
    
    if (state.combo > state.maxCombo) {
        state.maxCombo = state.combo;
    }
    
    if (state.comboTimer) {
        clearTimeout(state.comboTimer);
    }
    
    state.comboTimer = setTimeout(() => {
        state.combo = 0;
        document.getElementById('td-combo-stat').classList.remove('active');
    }, GAME_CONFIG.comboTime);
    
    document.getElementById('td-combo-stat').classList.add('active');
    createParticles(pos.x, pos.y, type.color, type.isBoss ? 30 : 12);
    
    updateUI();
    updateTowerButtons();
}

// ÄNDERUNG: Projektil-Update mit korrekter Zeitbasis
function updateProjectiles(dt) {
    state.projectiles = state.projectiles.filter(p => {
        // Bewegung (dt in Sekunden, vx/vy in Pixel/Sekunde)
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        
        // Entfernen wenn außerhalb des Bildschirms
        if (p.x < -50 || p.x > canvasWidth + 50 || p.y < -50 || p.y > canvasHeight + 50) {
            return false;
        }
        
        // Kollisionsprüfung
        const target = state.enemies.find(e => e.id === p.targetId);
        if (target) {
            const pos = getEnemyPosition(target);
            const dist = Math.sqrt((p.x - pos.x) ** 2 + (p.y - pos.y) ** 2);
            
            if (dist < 15) {
                dealDamage(target, p.damage, p.tower);
                
                // Splash-Schaden für Kanone
                if (p.type === 'cannon') {
                    const splashRadius = TOWER_TYPES.cannon.splashRadius[p.tower.level];
                    state.enemies.forEach(e => {
                        if (e.id !== target.id) {
                            const ePos = getEnemyPosition(e);
                            if (Math.sqrt((pos.x - ePos.x) ** 2 + (pos.y - ePos.y) ** 2) < splashRadius) {
                                dealDamage(e, p.damage * 0.5, p.tower);
                            }
                        }
                    });
                    createParticles(pos.x, pos.y, '#f59e0b', 8);
                }
                return false;
            }
        }
        return true;
    });
}

// ÄNDERUNG: Partikel-Update mit korrekter Zeitbasis
function updateParticles(dt) {
    state.particles = state.particles.filter(p => {
        p.x += p.vx * dt * 60; // Skaliert auf ~60fps Basis
        p.y += p.vy * dt * 60;
        p.vy += 6 * dt; // Gravitation
        p.alpha -= 1.2 * dt;
        p.size *= Math.pow(0.97, dt * 60);
        return p.alpha > 0;
    });
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        state.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            color,
            alpha: 1,
            size: 3 + Math.random() * 4
        });
    }
}

// ÄNDERUNG: Cooldown-Update mit korrekter Zeitbasis (dt in Sekunden)
function updateAbilityCooldowns(dt) {
    Object.entries(state.abilities).forEach(([key, ability]) => {
        if (ability.cooldown > 0) {
            ability.cooldown -= dt * 1000; // dt in Sekunden, cooldown in ms
            if (ability.cooldown < 0) ability.cooldown = 0;
        }
        
        const cdEl = document.getElementById(`${key}-cd`);
        if (cdEl) {
            cdEl.style.height = `${(ability.cooldown / ability.maxCooldown) * 100}%`;
        }
        
        const btn = document.getElementById(`ability-${key}`);
        if (btn) {
            btn.disabled = ability.cooldown > 0 || (ability.cost > 0 && state.gold < ability.cost);
        }
    });
}

function useAbility(type) {
    const ability = state.abilities[type];
    if (ability.cooldown > 0 || (ability.cost > 0 && state.gold < ability.cost)) return;
    
    state.gold -= ability.cost;
    ability.cooldown = ability.maxCooldown;
    
    if (type === 'nuke') {
        state.enemies.forEach(enemy => {
            enemy.health -= 100;
            createParticles(getEnemyPosition(enemy).x, getEnemyPosition(enemy).y, '#ef4444', 5);
            if (enemy.health <= 0) killEnemy(enemy);
        });
    } else if (type === 'freeze') {
        state.enemies.forEach(enemy => {
            enemy.slowed = true;
            enemy.slowAmount = 0.8;
            enemy.slowTimer = 5000;
        });
    } else if (type === 'gold') {
        state.gold += 100;
    }
    
    updateUI();
    updateTowerButtons();
}

function waveComplete() {
    state.waveInProgress = false;
    state.gold += GAME_CONFIG.goldPerWave;
    state.gold += Math.floor(Math.min(state.gold, GAME_CONFIG.maxInterestGold) * GAME_CONFIG.interestRate);
    state.score += 500;
    
    document.getElementById('btn-td-wave').disabled = false;
    document.getElementById('btn-td-wave').querySelector('span').textContent = 'Nächste Welle';
    
    updateUI();
    updateTowerButtons();
    
    if (state.wave >= WAVE_CONFIG.length) {
        victory();
    }
}

function gameOver() {
    stopGame();
    state.phase = 'gameover';
    
    document.getElementById('td-game').classList.add('hidden');
    document.getElementById('td-gameover').classList.remove('hidden');
    
    document.getElementById('go-wave').textContent = state.wave;
    document.getElementById('go-kills').textContent = state.totalKills;
    document.getElementById('go-score').textContent = state.score;
    document.getElementById('go-combo').textContent = state.maxCombo;
}

function victory() {
    stopGame();
    state.phase = 'victory';
    state.score += state.lives * 100;
    
    document.getElementById('td-game').classList.add('hidden');
    document.getElementById('td-victory').classList.remove('hidden');
    
    document.getElementById('vic-score').textContent = state.score;
    document.getElementById('vic-kills').textContent = state.totalKills;
    document.getElementById('vic-combo').textContent = state.maxCombo;
    document.getElementById('vic-lives').textContent = state.lives;
}

function toggleSpeed() {
    state.gameSpeed = state.gameSpeed === 1 ? 2 : state.gameSpeed === 2 ? 3 : 1;
    document.getElementById('speed-text').textContent = `${state.gameSpeed}x`;
}

function togglePause() {
    state.isPaused = !state.isPaused;
    document.getElementById('btn-td-pause').innerHTML = state.isPaused 
        ? '<i class="fas fa-play"></i>' 
        : '<i class="fas fa-pause"></i>';
}

function updateUI() {
    document.getElementById('td-lives').textContent = state.lives;
    document.getElementById('td-gold').textContent = state.gold;
    document.getElementById('td-wave').textContent = state.wave;
    document.getElementById('td-combo').textContent = state.combo;
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

export function show() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('td-screen').classList.add('active');
    document.getElementById('header-title').textContent = 'BrainTower';
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-stats').classList.add('hidden');
}

export function hide() {
    stopGame();
    state.phase = 'menu';
    const screen = document.getElementById('td-screen');
    if (screen) screen.classList.remove('active');
}