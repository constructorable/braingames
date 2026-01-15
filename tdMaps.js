/* =========================================
   BrainTower — Karten-Definitionen
   Vertikale Pfade für mobile Geräte
   ========================================= */

// NEU: Alle Karten mit vertikalen Pfaden (optimiert für Hochkant-Display)
// Koordinaten in Prozent (0-100) des Canvas
export const MAPS = {
    // Karte 1: Einfache Serpentine
    serpentine: {
        id: 'serpentine',
        name: 'Serpentine',
        description: 'Klassischer Zickzack-Pfad',
        difficulty: 1,
        icon: 'fa-road',
        color: '#22c55e',
        pathPoints: [
            { x: 50, y: -5 },
            { x: 50, y: 15 },
            { x: 20, y: 15 },
            { x: 20, y: 35 },
            { x: 80, y: 35 },
            { x: 80, y: 55 },
            { x: 20, y: 55 },
            { x: 20, y: 75 },
            { x: 50, y: 75 },
            { x: 50, y: 105 }
        ]
    },

    // Karte 2: Spirale
    spiral: {
        id: 'spiral',
        name: 'Spirale',
        description: 'Kreisförmiger Pfad zur Mitte',
        difficulty: 2,
        icon: 'fa-hurricane',
        color: '#3b82f6',
        pathPoints: [
            { x: 50, y: -5 },
            { x: 50, y: 10 },
            { x: 85, y: 10 },
            { x: 85, y: 45 },
            { x: 15, y: 45 },
            { x: 15, y: 25 },
            { x: 65, y: 25 },
            { x: 65, y: 60 },
            { x: 35, y: 60 },
            { x: 35, y: 40 },
            { x: 50, y: 40 },
            { x: 50, y: 75 },
            { x: 50, y: 105 }
        ]
    },

    // Karte 3: Doppelpfad
    dual: {
        id: 'dual',
        name: 'Doppelpfad',
        description: 'Zwei Wege die sich kreuzen',
        difficulty: 3,
        icon: 'fa-code-branch',
        color: '#f59e0b',
        pathPoints: [
            { x: 25, y: -5 },
            { x: 25, y: 20 },
            { x: 50, y: 35 },
            { x: 75, y: 20 },
            { x: 75, y: 50 },
            { x: 50, y: 65 },
            { x: 25, y: 50 },
            { x: 25, y: 80 },
            { x: 50, y: 90 },
            { x: 50, y: 105 }
        ],
        // Zweiter Eingang für fortgeschrittene Wellen
        secondaryPath: [
            { x: 75, y: -5 },
            { x: 75, y: 20 }
        ]
    },

    // Karte 4: Labyrinth
    labyrinth: {
        id: 'labyrinth',
        name: 'Labyrinth',
        description: 'Komplexer verschlungener Pfad',
        difficulty: 4,
        icon: 'fa-maze',
        color: '#a855f7',
        pathPoints: [
            { x: 15, y: -5 },
            { x: 15, y: 12 },
            { x: 85, y: 12 },
            { x: 85, y: 28 },
            { x: 35, y: 28 },
            { x: 35, y: 42 },
            { x: 65, y: 42 },
            { x: 65, y: 58 },
            { x: 15, y: 58 },
            { x: 15, y: 72 },
            { x: 85, y: 72 },
            { x: 85, y: 88 },
            { x: 50, y: 88 },
            { x: 50, y: 105 }
        ]
    },

    // Karte 5: Diamant
    diamond: {
        id: 'diamond',
        name: 'Diamant',
        description: 'Pfad in Diamant-Form',
        difficulty: 2,
        icon: 'fa-gem',
        color: '#06b6d4',
        pathPoints: [
            { x: 50, y: -5 },
            { x: 50, y: 10 },
            { x: 15, y: 35 },
            { x: 15, y: 50 },
            { x: 50, y: 75 },
            { x: 85, y: 50 },
            { x: 85, y: 35 },
            { x: 50, y: 10 },
            { x: 50, y: 35 },
            { x: 50, y: 105 }
        ]
    },

    // Karte 6: Fluss
    river: {
        id: 'river',
        name: 'Flusslauf',
        description: 'Geschwungener natürlicher Pfad',
        difficulty: 1,
        icon: 'fa-water',
        color: '#0ea5e9',
        pathPoints: [
            { x: 30, y: -5 },
            { x: 30, y: 8 },
            { x: 45, y: 18 },
            { x: 70, y: 25 },
            { x: 75, y: 38 },
            { x: 55, y: 48 },
            { x: 30, y: 55 },
            { x: 25, y: 68 },
            { x: 45, y: 78 },
            { x: 65, y: 88 },
            { x: 60, y: 105 }
        ]
    },

    // Karte 7: Kreuz
    cross: {
        id: 'cross',
        name: 'Kreuzung',
        description: 'Pfad mit zentraler Kreuzung',
        difficulty: 3,
        icon: 'fa-crosshairs',
        color: '#ec4899',
        pathPoints: [
            { x: 50, y: -5 },
            { x: 50, y: 20 },
            { x: 20, y: 20 },
            { x: 20, y: 50 },
            { x: 50, y: 50 },
            { x: 80, y: 50 },
            { x: 80, y: 80 },
            { x: 50, y: 80 },
            { x: 50, y: 105 }
        ]
    },

    // Karte 8: Turm
    tower: {
        id: 'tower',
        name: 'Turm',
        description: 'Vertikaler Aufstieg mit Etagen',
        difficulty: 4,
        icon: 'fa-chess-rook',
        color: '#8b5cf6',
        pathPoints: [
            { x: 50, y: -5 },
            { x: 50, y: 8 },
            { x: 25, y: 8 },
            { x: 25, y: 22 },
            { x: 75, y: 22 },
            { x: 75, y: 36 },
            { x: 25, y: 36 },
            { x: 25, y: 50 },
            { x: 75, y: 50 },
            { x: 75, y: 64 },
            { x: 25, y: 64 },
            { x: 25, y: 78 },
            { x: 75, y: 78 },
            { x: 75, y: 92 },
            { x: 50, y: 92 },
            { x: 50, y: 105 }
        ]
    }
};

// NEU: Karten-Liste für Menü-Darstellung
export const MAP_LIST = Object.values(MAPS).sort((a, b) => a.difficulty - b.difficulty);

// NEU: Hilfsfunktion zur Pfad-Berechnung
export function calculatePathData(mapId, canvasWidth, canvasHeight) {
    const map = MAPS[mapId];
    if (!map) return null;

    // Konvertiere Prozent zu Pixel
    const pathPixels = map.pathPoints.map(p => ({
        x: (p.x / 100) * canvasWidth,
        y: (p.y / 100) * canvasHeight
    }));

    // Berechne Segment-Längen
    const segmentLengths = [];
    let totalLength = 0;

    for (let i = 0; i < pathPixels.length - 1; i++) {
        const dx = pathPixels[i + 1].x - pathPixels[i].x;
        const dy = pathPixels[i + 1].y - pathPixels[i].y;
        const length = Math.sqrt(dx * dx + dy * dy);
        segmentLengths.push(length);
        totalLength += length;
    }

    return {
        pixels: pathPixels,
        segmentLengths,
        totalLength
    };
}

// NEU: Hilfsfunktion zum Prüfen ob Punkt auf Pfad liegt
export function isPointOnPath(x, y, pathPixels, threshold = 30) {
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

// NEU: Punkt-zu-Linie Distanz-Berechnung
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

// NEU: Hilfsfunktion zur Position auf Pfad
export function getPositionOnPath(distanceTraveled, pathPixels, segmentLengths, totalLength) {
    let remainingDistance = distanceTraveled;

    for (let i = 0; i < segmentLengths.length; i++) {
        if (remainingDistance <= segmentLengths[i]) {
            const t = remainingDistance / segmentLengths[i];
            const p1 = pathPixels[i];
            const p2 = pathPixels[i + 1];
            return {
                x: p1.x + (p2.x - p1.x) * t,
                y: p1.y + (p2.y - p1.y) * t
            };
        }
        remainingDistance -= segmentLengths[i];
    }

    // Am Ende des Pfades
    return pathPixels[pathPixels.length - 1];
}
