/* =========================================
   BrainTower — Spielzustand-Manager
   Zentrale State-Verwaltung
   ========================================= */

import { GAME_CONFIG, ABILITIES_CONFIG } from './tdConfig.js';

// NEU: Initialer Spielzustand
function createInitialState() {
    return {
        phase: 'menu',           // menu, mapSelect, playing, paused, gameover, victory
        currentMap: 'serpentine',
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
        abilities: JSON.parse(JSON.stringify(ABILITIES_CONFIG))
    };
}

// NEU: Globaler Spielzustand
let state = createInitialState();

// NEU: ID-Counter für Entitäten
let nextId = 1;

// NEU: Canvas-Referenzen
let canvas = null;
let ctx = null;
let canvasWidth = 0;
let canvasHeight = 0;

// NEU: Pfad-Daten
let pathData = {
    pixels: [],
    segmentLengths: [],
    totalLength: 0
};

// --- State-Getter ---

export function getState() {
    return state;
}

export function getCanvas() {
    return canvas;
}

export function getCtx() {
    return ctx;
}

export function getCanvasDimensions() {
    return { width: canvasWidth, height: canvasHeight };
}

export function getPathData() {
    return pathData;
}

export function getNextId() {
    return nextId++;
}

// --- State-Setter ---

export function setState(newState) {
    state = { ...state, ...newState };
}

export function setCanvas(canvasEl, context, width, height) {
    canvas = canvasEl;
    ctx = context;
    canvasWidth = width;
    canvasHeight = height;
}

export function setPathData(data) {
    pathData = data;
}

export function resetState() {
    // Timer aufräumen
    if (state.gameLoop) {
        cancelAnimationFrame(state.gameLoop);
    }
    if (state.spawnTimer) {
        clearTimeout(state.spawnTimer);
    }
    if (state.comboTimer) {
        clearTimeout(state.comboTimer);
    }

    const currentMap = state.currentMap;
    state = createInitialState();
    state.currentMap = currentMap;
    nextId = 1;
}

export function resetForNewGame() {
    const currentMap = state.currentMap;
    
    // Timer aufräumen
    if (state.gameLoop) {
        cancelAnimationFrame(state.gameLoop);
    }
    if (state.spawnTimer) {
        clearTimeout(state.spawnTimer);
    }
    if (state.comboTimer) {
        clearTimeout(state.comboTimer);
    }

    state = {
        ...createInitialState(),
        currentMap,
        phase: 'playing'
    };
    nextId = 1;
}

// --- Entitäten-Management ---

export function addTower(tower) {
    tower.id = getNextId();
    state.towers.push(tower);
    return tower;
}

export function removeTower(towerId) {
    state.towers = state.towers.filter(t => t.id !== towerId);
}

export function addEnemy(enemy) {
    enemy.id = getNextId();
    state.enemies.push(enemy);
    return enemy;
}

export function removeEnemy(enemyId) {
    state.enemies = state.enemies.filter(e => e.id !== enemyId);
}

export function addProjectile(projectile) {
    projectile.id = getNextId();
    state.projectiles.push(projectile);
    return projectile;
}

export function addParticle(particle) {
    state.particles.push(particle);
}

export function clearParticles() {
    state.particles = [];
}

// --- Gold-Management ---

export function addGold(amount) {
    state.gold += amount;
}

export function removeGold(amount) {
    if (state.gold >= amount) {
        state.gold -= amount;
        return true;
    }
    return false;
}

// --- Lives-Management ---

export function removeLive() {
    state.lives--;
    return state.lives;
}

// --- Score-Management ---

export function addScore(amount) {
    state.score += amount;
}

// --- Combo-Management ---

export function incrementCombo() {
    state.combo++;
    if (state.combo > state.maxCombo) {
        state.maxCombo = state.combo;
    }
}

export function resetCombo() {
    state.combo = 0;
}

// --- Kills-Management ---

export function incrementKills() {
    state.totalKills++;
}

// --- Wave-Management ---

export function incrementWave() {
    state.wave++;
    return state.wave;
}

export function setWaveInProgress(inProgress) {
    state.waveInProgress = inProgress;
}

export function setEnemySpawnQueue(queue) {
    state.enemySpawnQueue = queue;
}

export function shiftEnemyFromQueue() {
    return state.enemySpawnQueue.shift();
}

// --- Auswahl-Management ---

export function selectTowerType(type) {
    state.selectedTowerType = type;
    state.selectedTower = null;
}

export function selectTower(tower) {
    state.selectedTower = tower;
    state.selectedTowerType = null;
}

export function clearSelection() {
    state.selectedTowerType = null;
    state.selectedTower = null;
}

// --- Spielsteuerung ---

export function setPhase(phase) {
    state.phase = phase;
}

export function setPaused(paused) {
    state.isPaused = paused;
}

export function toggleSpeed() {
    state.gameSpeed = state.gameSpeed === 1 ? 2 : state.gameSpeed === 2 ? 3 : 1;
    return state.gameSpeed;
}

export function setGameLoop(loop) {
    state.gameLoop = loop;
}

export function setSpawnTimer(timer) {
    state.spawnTimer = timer;
}

export function setComboTimer(timer) {
    state.comboTimer = timer;
}

export function setLastFrameTime(time) {
    state.lastFrameTime = time;
}

// --- Karten-Management ---

export function setCurrentMap(mapId) {
    state.currentMap = mapId;
}

// --- Fähigkeiten ---

export function getAbility(type) {
    return state.abilities[type];
}

export function setAbilityCooldown(type, cooldown) {
    if (state.abilities[type]) {
        state.abilities[type].cooldown = cooldown;
    }
}

export function updateAbilityCooldown(type, deltaMs) {
    if (state.abilities[type] && state.abilities[type].cooldown > 0) {
        state.abilities[type].cooldown -= deltaMs;
        if (state.abilities[type].cooldown < 0) {
            state.abilities[type].cooldown = 0;
        }
    }
}
