/* =========================================
   Dodge Game - Mobile First Design
   Einfaches, effektives Smartphone-Gameplay
   ========================================= */

import * as UI from './ui.js';

// Spielkonfiguration pro Level
const LEVEL_CONFIG = {
    1:  { baseSpeed: 2, spawnRate: 2800, frequency: 0.8 },
    2:  { baseSpeed: 2.5, spawnRate: 2500, frequency: 0.85 },
    3:  { baseSpeed: 3, spawnRate: 2200, frequency: 0.9 },
    4:  { baseSpeed: 3.5, spawnRate: 2000, frequency: 0.95 },
    5:  { baseSpeed: 4, spawnRate: 1800, frequency: 1 },
    6:  { baseSpeed: 4.5, spawnRate: 1600, frequency: 1.05 },
    7:  { baseSpeed: 5, spawnRate: 1400, frequency: 1.1 },
    8:  { baseSpeed: 5.5, spawnRate: 1200, frequency: 1.15 },
    9:  { baseSpeed: 6, spawnRate: 1000, frequency: 1.2 },
    10: { baseSpeed: 6.5, spawnRate: 900, frequency: 1.25 }
};

// Spielzustand
let state = {
    playerX: 50,
    level: 1,
    mode: 'endless',
    score: 0,
    isGameActive: false,
    gameTimer: null,
    callbacks: null,
    obstacles: [],
    nextId: 0,
    spawnTimer: null,
    baseSpeed: 2,
    currentSpeed: 2,
    spawnRate: 2800,
    startTime: 0,
    timeElapsed: 0,
    gameHeight: 0,
    gameWidth: 0,
    frequency: 0.8,
    speedMultiplier: 1
};

/**
 * Startet das Spiel
 */
export function start(config, callbacks) {
    state = {
        playerX: 50,
        level: config.level,
        mode: config.mode,
        score: 0,
        isGameActive: false,
        gameTimer: null,
        callbacks,
        obstacles: [],
        nextId: 0,
        spawnTimer: null,
        baseSpeed: 2,
        currentSpeed: 2,
        spawnRate: 2800,
        startTime: 0,
        timeElapsed: 0,
        gameHeight: 0,
        gameWidth: 0,
        frequency: 0.8,
        speedMultiplier: 1
    };
    
    const config_data = LEVEL_CONFIG[state.level];
    state.baseSpeed = config_data.baseSpeed;
    state.spawnRate = config_data.spawnRate;
    state.frequency = config_data.frequency;
    
    UI.showTimer(config.mode === 'timed');
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.isGameActive = true;
    state.obstacles = [];
    state.nextId = 0;
    state.startTime = Date.now();
    state.timeElapsed = 0;
    state.speedMultiplier = 1;
    
    renderGameArea();
    startGameLoop();
    startSpawning();
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    UI.setGameContent(`
        <div class="dodge-game-wrapper">
            <div class="dodge-game" id="dodge-game">
                <div class="game-background"></div>
                <div class="game-road" id="game-road">
                    <div class="player" id="player"></div>
                </div>
            </div>
            
            <div class="dodge-hud">
                <div class="hud-left">
                    <div class="hud-label">Score</div>
                    <div class="hud-value" id="hud-score">0</div>
                </div>
                <div class="hud-center">
                    <div class="hud-label">Level</div>
                    <div class="hud-value">${state.level}</div>
                </div>
                <div class="hud-right">
                    <div class="hud-label">Speed</div>
                    <div class="hud-value" id="hud-speed">1.0x</div>
                </div>
            </div>
        </div>
    `);
    
    injectStyles();
    
    const gameArea = document.getElementById('dodge-game');
    state.gameHeight = gameArea.offsetHeight;
    state.gameWidth = gameArea.offsetWidth;
    
    setupControls();
    updatePlayerPosition();
}

/**
 * Injiziert Styles
 */
function injectStyles() {
    const existingStyle = document.querySelector('style[data-dodge-style]');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.setAttribute('data-dodge-style', 'true');
    style.textContent = `
        .dodge-game-wrapper {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100vw;
            padding: 0;
            margin: 0;
            background: #0a0e27;
            overflow: hidden;
            position: fixed;
            top: 0;
            left: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .dodge-game {
            flex: 1;
            width: 100%;
            position: relative;
            overflow: hidden;
            background: linear-gradient(180deg, #0f1535 0%, #1a2850 100%);
        }

        .game-background {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: 
                repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent calc(25% - 2px),
                    rgba(255, 255, 255, 0.05) calc(25% - 2px),
                    rgba(255, 255, 255, 0.05) 25%
                );
            pointer-events: none;
            z-index: 1;
        }

        .game-road {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 10;
        }

        .player {
            position: absolute;
            bottom: 15px;
            width: 50px;
            height: 60px;
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3);
            transition: left 0.08s ease-out;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            opacity: 0.95;
        }

        .player::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 8px;
            background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent);
            pointer-events: none;
        }

        .obstacle {
            position: absolute;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #ff3d5a 0%, #cc1f3d 100%);
            border-radius: 6px;
            box-shadow: 0 0 15px rgba(255, 61, 90, 0.8);
            z-index: 15;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
        }

        .obstacle::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 6px;
            background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent);
            pointer-events: none;
        }

        .dodge-hud {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 1rem 0;
            background: rgba(0, 0, 0, 0.6);
            border-top: 2px solid rgba(0, 212, 255, 0.3);
            color: white;
        }

        .hud-left, .hud-center, .hud-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }

        .hud-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: rgba(255, 255, 255, 0.6);
        }

        .hud-value {
            font-size: 1.4rem;
            font-weight: 900;
            color: #00d4ff;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
        }

        /* Touch Feedback */
        @media (hover: none) {
            .dodge-game {
                touch-action: none;
            }
        }

        /* Optimiert für Portrait */
        @media (orientation: portrait) {
            .player {
                width: 45px;
                height: 55px;
            }

            .obstacle {
                width: 45px;
                height: 45px;
                font-size: 1.5rem;
            }

            .hud-value {
                font-size: 1.3rem;
            }
        }

        /* Kleine Bildschirme */
        @media (max-height: 700px) {
            .player {
                width: 40px;
                height: 50px;
                font-size: 1.5rem;
            }

            .obstacle {
                width: 40px;
                height: 40px;
                font-size: 1.3rem;
            }

            .dodge-hud {
                padding: 0.75rem 0;
            }

            .hud-value {
                font-size: 1.2rem;
            }

            .hud-label {
                font-size: 0.65rem;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Controls auf
 */
function setupControls() {
    const gameArea = document.getElementById('dodge-game');
    
    gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = gameArea.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        state.playerX = Math.max(5, Math.min(95, x));
        updatePlayerPosition();
    }, { passive: false });
    
    gameArea.addEventListener('mousemove', (e) => {
        const rect = gameArea.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        state.playerX = Math.max(5, Math.min(95, x));
        updatePlayerPosition();
    });
    
    document.addEventListener('keydown', (e) => {
        if (!state.isGameActive) return;
        if (e.key === 'ArrowLeft') state.playerX = Math.max(5, state.playerX - 8);
        if (e.key === 'ArrowRight') state.playerX = Math.min(95, state.playerX + 8);
        updatePlayerPosition();
    });
}

/**
 * Aktualisiert Spielerposition
 */
function updatePlayerPosition() {
    const player = document.getElementById('player');
    if (player) {
        player.style.left = state.playerX + '%';
    }
}

/**
 * Startet Spawning
 */
function startSpawning() {
    const spawn = () => {
        if (!state.isGameActive) return;
        
        const randomX = Math.random() * 90 + 5;
        const icons = ['🚗', '🚕', '🚙', '🚌'];
        const icon = icons[Math.floor(Math.random() * icons.length)];
        
        spawnObstacle(randomX, icon);
        
        state.spawnTimer = setTimeout(spawn, state.spawnRate);
    };
    
    spawn();
}

/**
 * Spawnt Hindernis
 */
function spawnObstacle(x, icon) {
    const id = state.nextId++;
    
    const obstacle = {
        id,
        x,
        icon,
        y: -60,
        element: null
    };
    
    state.obstacles.push(obstacle);
    
    const gameArea = document.getElementById('game-road');
    if (gameArea) {
        const el = document.createElement('div');
        el.className = 'obstacle';
        el.id = `obs-${id}`;
        el.textContent = icon;
        el.style.left = x + '%';
        el.style.top = obstacle.y + 'px';
        gameArea.appendChild(el);
        obstacle.element = el;
    }
}

/**
 * Startet Game Loop
 */
function startGameLoop() {
    state.gameTimer = setInterval(() => {
        if (!state.isGameActive) return;
        
        state.timeElapsed = (Date.now() - state.startTime) / 1000;
        state.speedMultiplier = 1 + (state.timeElapsed / 40);
        state.currentSpeed = state.baseSpeed * state.speedMultiplier;
        
        // Update Hindernisse
        state.obstacles.forEach(obs => {
            obs.y += state.currentSpeed;
            
            if (obs.element) {
                obs.element.style.top = obs.y + 'px';
            }
            
            // Kollisionserkennung
            if (checkCollision(obs)) {
                handleCollision();
            }
        });
        
        // Entferne alte Hindernisse
        state.obstacles = state.obstacles.filter(obs => {
            if (obs.y > state.gameHeight) {
                if (obs.element) obs.element.remove();
                state.score += 10 + Math.floor(state.speedMultiplier * 5);
                updateHUD();
                return false;
            }
            return true;
        });
        
        updateHUD();
    }, 1000 / 60);
}

/**
 * Prüft Kollision
 */
function checkCollision(obs) {
    const playerY = state.gameHeight - 75;
    const playerLeft = (state.playerX / 100) * state.gameWidth;
    const playerRight = playerLeft + 50;
    
    const obsLeft = (obs.x / 100) * state.gameWidth;
    const obsRight = obsLeft + 50;
    const obsTop = obs.y;
    const obsBottom = obs.y + 50;
    
    return playerRight > obsLeft && 
           playerLeft < obsRight && 
           playerY < obsBottom &&
           playerY + 60 > obsTop;
}

/**
 * Behandelt Kollision
 */
async function handleCollision() {
    state.isGameActive = false;
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', 'Hit!', 800);
        startRound();
    } else {
        await UI.showFeedback('error', 'Game Over!', 1500);
        endGame();
    }
}

/**
 * Aktualisiert HUD
 */
function updateHUD() {
    const scoreEl = document.getElementById('hud-score');
    const speedEl = document.getElementById('hud-speed');
    
    if (scoreEl) scoreEl.textContent = state.score;
    if (speedEl) speedEl.textContent = state.speedMultiplier.toFixed(1) + 'x';
    
    UI.updateGameDisplay({ score: state.score });
}

/**
 * Beendet Spiel
 */
function endGame() {
    clearInterval(state.gameTimer);
    clearTimeout(state.spawnTimer);
    state.isGameActive = false;
    
    state.obstacles.forEach(obs => {
        if (obs.element) obs.element.remove();
    });
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'dodge',
            score: state.score,
            level: state.level,
            mode: state.mode,
            round: 1
        });
    }
}

/**
 * Stoppt Spiel
 */
export function stop() {
    clearInterval(state.gameTimer);
    clearTimeout(state.spawnTimer);
    state.isGameActive = false;
}