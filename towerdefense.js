/* =========================================
   BrainTower — Haupt-Modul
   Exportiert init, show, hide für App-Integration
   ========================================= */

import { renderScreen, setupEventListeners, showMenu } from './tdUI.js';
import { stopGame } from './tdGame.js';
import * as State from './tdState.js';

// NEU: Initialisierung
export function init() {
    renderScreen();
    setupEventListeners();
}

// NEU: Screen anzeigen
export function show() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('td-screen').classList.add('active');
    document.getElementById('header-title').textContent = 'BrainTower';
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-stats').classList.add('hidden');
}

// NEU: Screen ausblenden
export function hide() {
    stopGame();
    State.setPhase('menu');
    const screen = document.getElementById('td-screen');
    if (screen) screen.classList.remove('active');
}
