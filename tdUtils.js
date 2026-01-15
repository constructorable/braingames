/* =========================================
   BrainTower — Hilfsfunktionen
   Utility-Funktionen für das Spiel
   ========================================= */

import { getPathData } from './tdState.js';

// NEU: Gegner-Position auf Pfad berechnen
export function getEnemyPosition(enemy) {
    const pathData = getPathData();
    let remainingDistance = enemy.distanceTraveled;

    for (let i = 0; i < pathData.segmentLengths.length; i++) {
        if (remainingDistance <= pathData.segmentLengths[i]) {
            const t = remainingDistance / pathData.segmentLengths[i];
            const p1 = pathData.pixels[i];
            const p2 = pathData.pixels[i + 1];
            return {
                x: p1.x + (p2.x - p1.x) * t,
                y: p1.y + (p2.y - p1.y) * t
            };
        }
        remainingDistance -= pathData.segmentLengths[i];
    }

    return pathData.pixels[pathData.pixels.length - 1];
}

// NEU: Farbe aufhellen/abdunkeln
export function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// NEU: Distanz zwischen zwei Punkten
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// NEU: Punkt-zu-Linie Distanz
export function pointToLineDistance(px, py, x1, y1, x2, y2) {
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

// NEU: Prüfen ob Punkt auf Pfad liegt
export function isOnPath(x, y, threshold = 35) {
    const pathData = getPathData();
    
    for (let i = 0; i < pathData.pixels.length - 1; i++) {
        const dist = pointToLineDistance(
            x, y,
            pathData.pixels[i].x, pathData.pixels[i].y,
            pathData.pixels[i + 1].x, pathData.pixels[i + 1].y
        );
        if (dist < threshold) return true;
    }
    return false;
}

// NEU: Partikel erstellen
export function createParticles(x, y, color, count, particles) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push({
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

// NEU: Nummer formatieren (z.B. 1000 -> 1.000)
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// NEU: Zufällige Ganzzahl
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// NEU: Clamp-Funktion
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// NEU: Linear Interpolation
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// NEU: Richtung zwischen zwei Punkten
export function getDirection(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return { x: 0, y: 0 };
    
    return {
        x: dx / dist,
        y: dy / dist
    };
}
