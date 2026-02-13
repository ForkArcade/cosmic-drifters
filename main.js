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
  FA.bindKey('dock',      ['f']);
  FA.bindKey('undock',    ['Escape']);
  FA.bindKey('tabLeft',   ['q']);
  FA.bindKey('tabRight',  ['e']);

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
    // Dock
    if (state.screen === 'playing' && data.action === 'dock' && state.stationDockable) {
      Ship.dockAtStation(state);
      return;
    }
    // Undock
    if (state.screen === 'docked' && data.action === 'undock') {
      Ship.undockFromStation(state);
      return;
    }
    // Tab switch w docked
    if (state.screen === 'docked') {
      var tabs = ['editor', 'buy', 'sell'];
      var ci = tabs.indexOf(state.tradeTab);
      if (data.action === 'tabLeft' && ci > 0) {
        state.tradeTab = tabs[ci - 1];
        state.dragPart = null;
        state.dragGhost = null;
        return;
      }
      if (data.action === 'tabRight' && ci < tabs.length - 1) {
        state.tradeTab = tabs[ci + 1];
        state.dragPart = null;
        state.dragGhost = null;
        return;
      }
    }
  });

  // === MOUSE EVENTS (native — engine nie ma mousedown/mouseup) ===
  var canvas = document.getElementById('game');
  if (canvas) {
    canvas.addEventListener('mousedown', function(e) {
      var state = FA.getState();
      if (state.screen !== 'docked') return;
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;

      if (state.tradeTab === 'editor') {
        Ship.startDrag(state, mx, my);
      } else if (state.tradeTab === 'buy' && state.buyHitboxes) {
        for (var i = 0; i < state.buyHitboxes.length; i++) {
          var hb = state.buyHitboxes[i];
          if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) {
            Ship.buyPart(state, hb.index);
            break;
          }
        }
      } else if (state.tradeTab === 'sell' && state.sellHitboxes) {
        for (var j = 0; j < state.sellHitboxes.length; j++) {
          var sh = state.sellHitboxes[j];
          if (mx >= sh.x && mx <= sh.x + sh.w && my >= sh.y && my <= sh.y + sh.h) {
            Ship.sellPart(state, sh.partIndex);
            break;
          }
        }
      }
    });

    canvas.addEventListener('mousemove', function(e) {
      var state = FA.getState();
      if (state.screen !== 'docked' || !state.dragPart) return;
      var rect = canvas.getBoundingClientRect();
      Ship.updateDrag(state, e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener('mouseup', function(e) {
      var state = FA.getState();
      if (state.screen !== 'docked') return;
      Ship.endDrag(state);
    });
  }

  // === SCORE ===
  FA.on('game:over', function(data) {
    if (typeof ForkArcade !== 'undefined') {
      ForkArcade.submitScore(data.score);
    }
  });

  // === GAME LOOP ===
  FA.setUpdate(function(dt) {
    var state = FA.getState();

    // Docked: narrative timer only
    if (state.screen === 'docked') {
      if (state.narrativeMessage && state.narrativeMessage.life > 0) {
        state.narrativeMessage.life -= dt;
      }
      return;
    }

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

      // Station proximity
      if (state.station) {
        var sDist = Math.hypot(state.ship.x - state.station.x, state.ship.y - state.station.y);
        state.stationDockable = sDist < cfg.dockRadius;
      } else {
        state.stationDockable = false;
      }
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
