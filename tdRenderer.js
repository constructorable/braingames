/* =========================================
   BrainTower — Rendering-Modul
   Canvas-Zeichnung für alle Spielelemente
   ========================================= */

import { TOWER_TYPES, ENEMY_TYPES } from './tdConfig.js';
import { MAPS } from './tdMaps.js';
import { getState, getCtx, getCanvasDimensions, getPathData } from './tdState.js';
import { getEnemyPosition, adjustColor } from './tdUtils.js';

// NEU: Haupt-Render-Funktion
export function render() {
    const ctx = getCtx();
    const { width, height } = getCanvasDimensions();
    
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawPath();
    drawTowers();
    drawEnemies();
    drawProjectiles();
    drawParticles();
}

// NEU: Hintergrund-Gitter zeichnen
function drawBackground() {
    const ctx = getCtx();
    const { width, height } = getCanvasDimensions();

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;

    // Vertikale Linien
    for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Horizontale Linien
    for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// NEU: Pfad zeichnen
function drawPath() {
    const ctx = getCtx();
    const state = getState();
    const pathData = getPathData();
    const map = MAPS[state.currentMap];

    if (!pathData.pixels || pathData.pixels.length < 2) return;

    // Äußere Pfadlinie
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 50;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pathData.pixels[0].x, pathData.pixels[0].y);
    for (let i = 1; i < pathData.pixels.length; i++) {
        ctx.lineTo(pathData.pixels[i].x, pathData.pixels[i].y);
    }
    ctx.stroke();

    // Innere Pfadlinie
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(pathData.pixels[0].x, pathData.pixels[0].y);
    for (let i = 1; i < pathData.pixels.length; i++) {
        ctx.lineTo(pathData.pixels[i].x, pathData.pixels[i].y);
    }
    ctx.stroke();

    // Gestrichelte Mittellinie
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(pathData.pixels[0].x, pathData.pixels[0].y);
    for (let i = 1; i < pathData.pixels.length; i++) {
        ctx.lineTo(pathData.pixels[i].x, pathData.pixels[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Start-Markierung (grün)
    const start = pathData.pixels[0];
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(start.x, start.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Ziel-Markierung (rot)
    const end = pathData.pixels[pathData.pixels.length - 1];
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 12, 0, Math.PI * 2);
    ctx.fill();
}

// NEU: Türme zeichnen
function drawTowers() {
    const ctx = getCtx();
    const state = getState();

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

// NEU: Gegner zeichnen
function drawEnemies() {
    const ctx = getCtx();
    const state = getState();

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

// NEU: Projektile zeichnen
function drawProjectiles() {
    const ctx = getCtx();
    const state = getState();

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

// NEU: Partikel zeichnen
function drawParticles() {
    const ctx = getCtx();
    const state = getState();

    state.particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}
