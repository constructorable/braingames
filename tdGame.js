/* =========================================
   BrainTower — Spiellogik
   Update-Funktionen für Spielobjekte
   ========================================= */

import { GAME_CONFIG, TOWER_TYPES, ENEMY_TYPES, WAVE_CONFIG } from './tdConfig.js';
import * as State from './tdState.js';
import { getEnemyPosition, createParticles, isOnPath, distance } from './tdUtils.js';
import { updateUI, updateTowerButtons, showTowerInfo, hideTowerInfo, showGameOver, showVictory } from './tdUI.js';
import { render } from './tdRenderer.js';
import { calculatePathData } from './tdMaps.js';

// NEU: Haupt-Game-Loop
export function gameLoop(timestamp) {
    const state = State.getState();
    if (state.phase !== 'playing') return;

    let deltaTime = Math.min((timestamp - state.lastFrameTime) / 1000, 0.1) * state.gameSpeed;
    State.setLastFrameTime(timestamp);

    if (!state.isPaused) {
        update(deltaTime);
    }

    render();
    State.setGameLoop(requestAnimationFrame(gameLoop));
}

// NEU: Haupt-Update-Funktion
function update(dt) {
    updateEnemies(dt);
    updateTowers(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    updateAbilityCooldowns(dt);

    const state = State.getState();
    if (state.waveInProgress && state.enemies.length === 0 && state.enemySpawnQueue.length === 0) {
        waveComplete();
    }
}

// NEU: Gegner aktualisieren
function updateEnemies(dt) {
    const state = State.getState();
    const pathData = State.getPathData();
    const canvas = State.getCanvas();
    const toRemove = [];

    state.enemies.forEach(enemy => {
        const type = ENEMY_TYPES[enemy.type];

        // Verlangsamung verarbeiten
        if (enemy.slowed && enemy.slowTimer > 0) {
            enemy.slowTimer -= dt * 1000;
            if (enemy.slowTimer <= 0) {
                enemy.slowed = false;
                enemy.slowAmount = 0;
            }
        }

        // Geschwindigkeit berechnen
        let speed = type.speed * GAME_CONFIG.baseSpeed;
        if (enemy.slowed) {
            speed *= (1 - enemy.slowAmount);
        }

        // Bewegung
        enemy.distanceTraveled += speed * dt;

        // Prüfen ob Ziel erreicht
        if (enemy.distanceTraveled >= pathData.totalLength) {
            const lives = State.removeLive();
            toRemove.push(enemy.id);

            // Screen-Shake Effekt
            if (canvas) {
                canvas.style.transform = 'translateX(5px)';
                setTimeout(() => canvas.style.transform = '', 50);
            }

            if (lives <= 0) {
                gameOver();
            }
        }

        // Heiler-Fähigkeit
        if (type.healRadius && type.healAmount) {
            const pos = getEnemyPosition(enemy);
            state.enemies.forEach(other => {
                if (other.id !== enemy.id) {
                    const otherPos = getEnemyPosition(other);
                    const dist = distance(pos.x, pos.y, otherPos.x, otherPos.y);
                    if (dist < type.healRadius) {
                        other.health = Math.min(other.maxHealth, other.health + type.healAmount * dt);
                    }
                }
            });
        }
    });

    // Entfernte Gegner filtern
    State.setState({
        enemies: state.enemies.filter(e => !toRemove.includes(e.id) && e.health > 0)
    });
    
    updateUI();
}

// NEU: Türme aktualisieren
function updateTowers(dt) {
    const state = State.getState();

    state.towers.forEach(tower => {
        tower.cooldown -= dt * 1000;
        if (tower.cooldown > 0) return;

        const type = TOWER_TYPES[tower.type];
        const range = type.range[tower.level];

        // Bestes Ziel finden
        let bestTarget = null;
        let bestProgress = -1;

        state.enemies.forEach(enemy => {
            const pos = getEnemyPosition(enemy);
            const dist = distance(tower.x, tower.y, pos.x, pos.y);

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

// NEU: Turm feuert
function fireTower(tower, target) {
    const state = State.getState();
    const type = TOWER_TYPES[tower.type];
    const targetPos = getEnemyPosition(target);

    if (tower.type === 'laser') {
        dealDamage(target, type.damage[tower.level], tower);

        const chainTargets = type.chainTargets[tower.level];
        if (chainTargets > 1) {
            let lastPos = targetPos;
            const hits = [target.id];

            for (let i = 1; i < chainTargets; i++) {
                const nextTarget = state.enemies.find(e => {
                    if (hits.includes(e.id)) return false;
                    const pos = getEnemyPosition(e);
                    return distance(lastPos.x, lastPos.y, pos.x, pos.y) < 80;
                });

                if (nextTarget) {
                    dealDamage(nextTarget, type.damage[tower.level] * 0.5, tower);
                    hits.push(nextTarget.id);
                    lastPos = getEnemyPosition(nextTarget);
                }
            }
        }
    } else {
        const dx = targetPos.x - tower.x;
        const dy = targetPos.y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        State.addProjectile({
            x: tower.x,
            y: tower.y,
            vx: (dx / dist) * type.projectileSpeed,
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

// NEU: Schaden zufügen
function dealDamage(enemy, damage, tower) {
    const state = State.getState();
    const type = ENEMY_TYPES[enemy.type];

    // Rüstung
    if (type.armor) {
        damage = Math.max(1, damage - type.armor);
    }

    // Kritischer Treffer
    if (Math.random() < GAME_CONFIG.critChance) {
        damage *= GAME_CONFIG.critMultiplier;
        const pos = getEnemyPosition(enemy);
        createParticles(pos.x, pos.y - 20, '#fbbf24', 5, state.particles);
    }

    enemy.health -= damage;

    // Verlangsamung
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

// NEU: Gegner töten
function killEnemy(enemy) {
    const state = State.getState();
    const type = ENEMY_TYPES[enemy.type];
    const pos = getEnemyPosition(enemy);

    State.addGold(type.reward);
    State.addScore(type.reward * 10);
    State.incrementKills();
    State.incrementCombo();

    // Combo-Timer zurücksetzen
    if (state.comboTimer) {
        clearTimeout(state.comboTimer);
    }

    const comboTimer = setTimeout(() => {
        State.resetCombo();
        const comboStat = document.getElementById('td-combo-stat');
        if (comboStat) comboStat.classList.remove('active');
    }, GAME_CONFIG.comboTime);
    
    State.setComboTimer(comboTimer);

    const comboStat = document.getElementById('td-combo-stat');
    if (comboStat) comboStat.classList.add('active');

    createParticles(pos.x, pos.y, type.color, type.isBoss ? 30 : 12, state.particles);

    updateUI();
    updateTowerButtons();
}

// NEU: Projektile aktualisieren
function updateProjectiles(dt) {
    const state = State.getState();
    const { width, height } = State.getCanvasDimensions();

    State.setState({
        projectiles: state.projectiles.filter(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Außerhalb des Bildschirms
            if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
                return false;
            }

            // Kollisionsprüfung
            const target = state.enemies.find(e => e.id === p.targetId);
            if (target) {
                const pos = getEnemyPosition(target);
                const dist = distance(p.x, p.y, pos.x, pos.y);

                if (dist < 15) {
                    dealDamage(target, p.damage, p.tower);

                    // Splash-Schaden für Kanone
                    if (p.type === 'cannon') {
                        const splashRadius = TOWER_TYPES.cannon.splashRadius[p.tower.level];
                        state.enemies.forEach(e => {
                            if (e.id !== target.id) {
                                const ePos = getEnemyPosition(e);
                                if (distance(pos.x, pos.y, ePos.x, ePos.y) < splashRadius) {
                                    dealDamage(e, p.damage * 0.5, p.tower);
                                }
                            }
                        });
                        createParticles(pos.x, pos.y, '#f59e0b', 8, state.particles);
                    }
                    return false;
                }
            }
            return true;
        })
    });
}

// NEU: Partikel aktualisieren
function updateParticles(dt) {
    const state = State.getState();

    State.setState({
        particles: state.particles.filter(p => {
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
            p.vy += 6 * dt;
            p.alpha -= 1.2 * dt;
            p.size *= Math.pow(0.97, dt * 60);
            return p.alpha > 0;
        })
    });
}

// NEU: Fähigkeits-Cooldowns aktualisieren
function updateAbilityCooldowns(dt) {
    const state = State.getState();

    Object.entries(state.abilities).forEach(([key, ability]) => {
        State.updateAbilityCooldown(key, dt * 1000);

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

// NEU: Welle starten
export function startWave() {
    const state = State.getState();
    if (state.waveInProgress || state.wave >= WAVE_CONFIG.length) return;

    const wave = State.incrementWave();
    State.setWaveInProgress(true);

    const waveData = WAVE_CONFIG[wave - 1];
    const queue = [];

    waveData.enemies.forEach(group => {
        for (let i = 0; i < group.count; i++) {
            queue.push(group.type);
        }
    });

    State.setEnemySpawnQueue(queue);
    spawnNextEnemy(waveData.delay);

    const waveBtn = document.getElementById('btn-td-wave');
    if (waveBtn) {
        waveBtn.disabled = true;
        const span = waveBtn.querySelector('span');
        if (span) span.textContent = 'Welle läuft...';
    }

    updateUI();
}

// NEU: Nächsten Gegner spawnen
function spawnNextEnemy(delay) {
    const state = State.getState();
    if (state.enemySpawnQueue.length === 0 || state.phase !== 'playing') return;

    const type = State.shiftEnemyFromQueue();
    const enemyType = ENEMY_TYPES[type];
    const healthScale = 1 + (state.wave - 1) * 0.15;

    State.addEnemy({
        type,
        distanceTraveled: 0,
        health: Math.floor(enemyType.health * healthScale),
        maxHealth: Math.floor(enemyType.health * healthScale),
        speed: enemyType.speed,
        slowed: false,
        slowTimer: 0,
        slowAmount: 0
    });

    if (State.getState().enemySpawnQueue.length > 0) {
        const timer = setTimeout(() => spawnNextEnemy(delay), delay / state.gameSpeed);
        State.setSpawnTimer(timer);
    }
}

// NEU: Welle abgeschlossen
function waveComplete() {
    const state = State.getState();
    
    State.setWaveInProgress(false);
    State.addGold(GAME_CONFIG.goldPerWave);
    State.addGold(Math.floor(Math.min(state.gold, GAME_CONFIG.maxInterestGold) * GAME_CONFIG.interestRate));
    State.addScore(500);

    const waveBtn = document.getElementById('btn-td-wave');
    if (waveBtn) {
        waveBtn.disabled = false;
        const span = waveBtn.querySelector('span');
        if (span) span.textContent = 'Nächste Welle';
    }

    updateUI();
    updateTowerButtons();

    if (state.wave >= WAVE_CONFIG.length) {
        victory();
    }
}

// NEU: Game Over
function gameOver() {
    stopGame();
    State.setPhase('gameover');
    showGameOver();
}

// NEU: Sieg
function victory() {
    const state = State.getState();
    stopGame();
    State.setPhase('victory');
    State.addScore(state.lives * 100);
    showVictory();
}

// NEU: Spiel stoppen
export function stopGame() {
    const state = State.getState();
    
    if (state.gameLoop) {
        cancelAnimationFrame(state.gameLoop);
        State.setGameLoop(null);
    }
    if (state.spawnTimer) {
        clearTimeout(state.spawnTimer);
        State.setSpawnTimer(null);
    }
    if (state.comboTimer) {
        clearTimeout(state.comboTimer);
        State.setComboTimer(null);
    }
}

// NEU: Turm platzieren
export function placeTower(x, y) {
    const state = State.getState();
    if (!state.selectedTowerType) return false;

    const type = TOWER_TYPES[state.selectedTowerType];
    if (state.gold < type.baseCost) return false;
    if (isOnPath(x, y, 35)) return false;
    if (state.towers.some(t => distance(t.x, t.y, x, y) < 45)) return false;

    State.removeGold(type.baseCost);
    State.addTower({
        type: state.selectedTowerType,
        x,
        y,
        level: 0,
        cooldown: 0,
        target: null,
        totalDamage: 0
    });

    createParticles(x, y, type.color, 10, state.particles);
    State.clearSelection();

    document.querySelectorAll('.td-tower-btn').forEach(b => b.classList.remove('selected'));
    updateUI();
    updateTowerButtons();

    return true;
}

// NEU: Turm upgraden
export function upgradeTower() {
    const state = State.getState();
    if (!state.selectedTower || state.selectedTower.level >= 4) return;

    const type = TOWER_TYPES[state.selectedTower.type];
    const cost = type.upgradeCost[state.selectedTower.level];
    if (state.gold < cost) return;

    State.removeGold(cost);
    state.selectedTower.level++;

    createParticles(state.selectedTower.x, state.selectedTower.y, '#fbbf24', 15, state.particles);
    showTowerInfo(state.selectedTower);
    updateUI();
    updateTowerButtons();
}

// NEU: Turm verkaufen
export function sellTower() {
    const state = State.getState();
    if (!state.selectedTower) return;

    const type = TOWER_TYPES[state.selectedTower.type];
    State.addGold(Math.floor(type.baseCost * 0.6 + state.selectedTower.level * 20));

    createParticles(state.selectedTower.x, state.selectedTower.y, '#fbbf24', 10, state.particles);
    State.removeTower(state.selectedTower.id);
    State.clearSelection();
    hideTowerInfo();
    updateUI();
    updateTowerButtons();
}

// NEU: Fähigkeit nutzen
export function useAbility(type) {
    const state = State.getState();
    const ability = state.abilities[type];
    
    if (ability.cooldown > 0 || (ability.cost > 0 && state.gold < ability.cost)) return;

    State.removeGold(ability.cost);
    State.setAbilityCooldown(type, ability.maxCooldown);

    if (type === 'nuke') {
        state.enemies.forEach(enemy => {
            enemy.health -= 100;
            const pos = getEnemyPosition(enemy);
            createParticles(pos.x, pos.y, '#ef4444', 5, state.particles);
            if (enemy.health <= 0) killEnemy(enemy);
        });
    } else if (type === 'freeze') {
        state.enemies.forEach(enemy => {
            enemy.slowed = true;
            enemy.slowAmount = 0.8;
            enemy.slowTimer = 5000;
        });
    } else if (type === 'gold') {
        State.addGold(100);
    }

    updateUI();
    updateTowerButtons();
}

// NEU: Spiel initialisieren
// ÄNDERUNG: Spiel initialisieren mit verzögertem Canvas-Setup für korrektes Aspect-Ratio
export function initGame(mapId) {
    State.setCurrentMap(mapId);
    State.resetForNewGame();

    // Kurze Verzögerung damit CSS aspect-ratio angewendet wird
    requestAnimationFrame(() => {
        const container = document.getElementById('td-canvas-container');
        const canvas = document.getElementById('td-canvas');
        
        if (!container || !canvas) return;

        // ÄNDERUNG: Nutze tatsächliche Container-Größe nach CSS-Anwendung
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Canvas-Auflösung setzen (für scharfe Darstellung)
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Interne Dimensionen ohne DPR für Berechnungen
        State.setCanvas(canvas, ctx, width, height);

        // Pfad berechnen
        const pathData = calculatePathData(mapId, width, height);
        State.setPathData(pathData);

        // Canvas-Click Handler
        canvas.onclick = handleCanvasClick;

        State.setLastFrameTime(performance.now());
        State.setGameLoop(requestAnimationFrame(gameLoop));
    });
}

// NEU: Canvas-Click Handler
function handleCanvasClick(e) {
    const state = State.getState();
    const canvas = State.getCanvas();
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (state.selectedTowerType) {
        placeTower(x, y);
        return;
    }

    const clickedTower = state.towers.find(t => distance(t.x, t.y, x, y) < 25);

    if (clickedTower) {
        State.selectTower(clickedTower);
        showTowerInfo(clickedTower);
    } else {
        hideTowerInfo();
        State.clearSelection();
    }
}