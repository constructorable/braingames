/* =========================================
   BrainTower — Spielkonfiguration
   Türme, Gegner und globale Einstellungen
   ========================================= */

// NEU: Globale Spielkonfiguration
export const GAME_CONFIG = {
    startGold: 200,
    startLives: 20,
    goldPerWave: 50,
    interestRate: 0.05,
    maxInterestGold: 500,
    comboTime: 2000,
    critChance: 0.15,
    critMultiplier: 2.5,
    baseSpeed: 50
};

// NEU: Turm-Definitionen
export const TOWER_TYPES = {
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
        projectileSpeed: 400
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

// NEU: Gegner-Definitionen
export const ENEMY_TYPES = {
    basic: { name: 'Grundling', color: '#94a3b8', health: 30, speed: 1.0, reward: 5, size: 12 },
    fast: { name: 'Sprinter', color: '#22d3ee', health: 20, speed: 2.0, reward: 8, size: 10 },
    tank: { name: 'Panzer', color: '#a855f7', health: 150, speed: 0.5, reward: 20, armor: 5, size: 18 },
    healer: { name: 'Heiler', color: '#4ade80', health: 50, speed: 0.8, reward: 15, healRadius: 50, healAmount: 2, size: 14 },
    swarm: { name: 'Schwarm', color: '#fbbf24', health: 10, speed: 1.5, reward: 2, size: 8 },
    boss: { name: 'BOSS', color: '#dc2626', health: 1000, speed: 0.35, reward: 200, armor: 10, size: 30, isBoss: true },
    miniboss: { name: 'Elite', color: '#f97316', health: 400, speed: 0.6, reward: 75, armor: 3, size: 22 }
};

// NEU: Wellen-Konfiguration
export const WAVE_CONFIG = [
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

// NEU: Fähigkeiten-Konfiguration
export const ABILITIES_CONFIG = {
    nuke: { cooldown: 0, maxCooldown: 45000, cost: 100 },
    freeze: { cooldown: 0, maxCooldown: 30000, cost: 50 },
    gold: { cooldown: 0, maxCooldown: 60000, cost: 0 }
};
