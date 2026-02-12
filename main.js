// Cosmic Drifters — Entry Point
// Keybindings, game loop, sektory, narracja, ForkArcade integration
(function() {
  'use strict';
  var FA = window.FA;
  var cfg = FA.lookup('config', 'game');
  var colors = FA.lookup('config', 'colors');

  FA.initCanvas('game', cfg.canvasWidth, cfg.canvasHeight);

  // === KEYBINDINGS ===
  FA.bindKey('thrust',    ['w', 'ArrowUp']);
  FA.bindKey('brake',     ['s', 'ArrowDown']);
  FA.bindKey('turnLeft',  ['a', 'ArrowLeft']);
  FA.bindKey('turnRight', ['d', 'ArrowRight']);
  FA.bindKey('shoot',     [' ']);
  FA.bindKey('turbo',     ['Shift']);
  FA.bindKey('start',     [' ']);
  FA.bindKey('restart',   ['r']);
  FA.bindKey('choiceYes', ['y']);
  FA.bindKey('choiceNo',  ['n']);

  // === INPUT (akcje jednorazowe) ===
  FA.on('input:action', function(data) {
    var state = FA.getState();
    if (state.screen === 'start' && (data.action === 'start' || data.action === 'shoot')) {
      Ship.beginGame();
      return;
    }
    if ((state.screen === 'death' || state.screen === 'victory') && (data.action === 'restart' || data.action === 'shoot')) {
      Ship.startScreen();
      return;
    }
    // Choice Y/N
    if (state.screen === 'playing' && state.choiceActive) {
      if (data.action === 'choiceYes') {
        Ship.resolveChoice(state, 1);
        return;
      }
      if (data.action === 'choiceNo') {
        Ship.resolveChoice(state, 0);
        return;
      }
    }
  });

  // === SCORE ===
  FA.on('game:over', function(data) {
    if (typeof ForkArcade !== 'undefined') {
      ForkArcade.submitScore(data.score);
    }
  });

  // === GAME LOOP ===
  FA.setUpdate(function(dt) {
    var state = FA.getState();
    if (state.screen !== 'playing') return;

    // Player input (real-time: isHeld)
    if (state.ship) {
      state.ship.activeEngines = new Set();
      var turbo = FA.isHeld('turbo') ? cfg.turboMultiplier : 1;
      var base = cfg.thrustBase * turbo;

      if (FA.isHeld('thrust')) {
        for (var i = 0; i < state.ship.parts.length; i++) {
          if (state.ship.parts[i].type === 'engine' && Physics.isConnected(state.ship.parts, i)) {
            Physics.applyThrust(state.ship, state.ship.parts[i], base);
          }
        }
      }
      if (FA.isHeld('brake')) {
        state.ship.vx *= 0.95;
        state.ship.vy *= 0.95;
      }
      if (FA.isHeld('turnLeft'))  Physics.applyTurn(state.ship, 'left', base * 0.8);
      if (FA.isHeld('turnRight')) Physics.applyTurn(state.ship, 'right', base * 0.8);
      if (FA.isHeld('shoot')) Ship.playerShoot(state);

      // Fizyka gracza
      Physics.updatePhysics(state.ship);

      // Kamera
      FA.camera.x = state.ship.x - cfg.canvasWidth / 2;
      FA.camera.y = state.ship.y - cfg.canvasHeight / 2;
    }

    // Enemy AI + fizyka
    for (var j = 0; j < state.enemies.length; j++) {
      state.enemies[j].activeEngines = new Set();
      Ship.updateEnemyAI(state.enemies[j], state.ship, state);
      Physics.updatePhysics(state.enemies[j]);
    }

    // Pociski
    Ship.updateBullets(state);

    // Dryfujace czesci
    Ship.updateFloatingParts(state);

    // Efekty
    FA.updateEffects(dt);
    FA.updateFloats(dt);

    // Narrative timer
    if (state.narrativeMessage && state.narrativeMessage.life > 0) {
      state.narrativeMessage.life -= dt;
    }

    // Narrative queue — po wygasnieciu obecnej, pokaz nastepna
    if (state.narrativeQueue && state.narrativeQueue.length > 0) {
      if (!state.narrativeMessage || state.narrativeMessage.life <= 0) {
        state.narrativeQueueTimer += dt;
        if (state.narrativeQueueTimer > 500) {
          var nextNode = state.narrativeQueue.shift();
          Ship.showNarrative(nextNode);
          state.narrativeQueueTimer = 0;
          // Distress signal choice trigger
          if (nextNode === 'distress_signal' && !state.distressTriggered) {
            state.distressTriggered = true;
            state.choiceActive = 'distress';
            state.choiceTimer = 300;
          }
        }
      }
    }

    // Choice timer countdown
    if (state.choiceActive && state.choiceTimer > 0) {
      state.choiceTimer--;
      if (state.choiceTimer <= 0) {
        // Auto-resolve: default = no
        Ship.resolveChoice(state, 0);
      }
    }

    // Pilot show timer
    if (state.pilotShowTimer > 0) {
      state.pilotShowTimer--;
    }

    // Survival time
    state.survivalTime += dt / 1000;

    // Sektor advancement — wave cleared
    if (state.enemies.length === 0 && state.ship) {
      if (!state.waveCleared) {
        state.waveCleared = true;
        // Sektor 7 cleared = victory
        if (state.sector >= 7) {
          Ship.gameOver(state);
        } else {
          // Krótka pauza, potem advance
          state.sectorAdvanceTimer = 120; // 2 sekundy
        }
      }
      if (state.sectorAdvanceTimer > 0) {
        state.sectorAdvanceTimer--;
        if (state.sectorAdvanceTimer <= 0) {
          state.waveCleared = false;
          Ship.advanceSector(state);
        }
      }
    } else {
      state.waveCleared = false;
    }

    // Connectivity check — odczep niepolaczone czesci
    if (state.ship) {
      for (var c = state.ship.parts.length - 1; c >= 0; c--) {
        if (state.ship.parts[c].type !== 'core' && !Physics.isConnected(state.ship.parts, c)) {
          Ship.detach(state.ship, c, state);
        }
      }
    }

    FA.clearInput();
  });

  FA.setRender(function() {
    FA.draw.clear(colors.bg);
    FA.renderLayers();
  });

  // === START ===
  Render.setup();
  Ship.startScreen();

  if (typeof ForkArcade !== 'undefined') {
    ForkArcade.onReady(function() {});
  }

  FA.start();
})();
