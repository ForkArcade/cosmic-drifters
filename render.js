// Cosmic Drifters — Rendering
// Warstwy: ekrany, grid, statki, pociski, efekty, piloci, narracja, HUD
(function() {
  'use strict';
  var FA = window.FA;

  // === RYSOWANIE PORTRETU PILOTA ===

  function drawPilotPortrait(ctx, pilot, x, y, size) {
    if (!pilot) return;
    var s = size || 64;
    var hs = s / 2;

    ctx.save();
    ctx.translate(x, y);

    // Tlo portretu
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(-hs - 4, -hs - 4, s + 8, s + 8);
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-hs - 4, -hs - 4, s + 8, s + 8);

    // Glowa / twarz
    ctx.fillStyle = pilot.skinTone;
    var faceW = s * 0.55, faceH = s * 0.65;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.05, faceW / 2, faceH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helm
    if (pilot.helmColor) {
      ctx.fillStyle = pilot.helmColor;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.12, faceW / 2 + 3, faceH * 0.35, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      // Krawedz helmu
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.12, faceW / 2 + 3, faceH * 0.35, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    // Mohawk (tylko bez helmu)
    if (pilot.hasMohawk && !pilot.helmColor) {
      ctx.fillStyle = pilot.hairColor;
      for (var m = 0; m < 5; m++) {
        var mx = -6 + m * 3;
        var mh = 8 + Math.abs(2 - m) * 3;
        ctx.fillRect(mx, -hs + 2, 3, mh);
      }
    }

    // Oczy
    var eyeY = s * 0.0;
    var eyeSpacing = s * 0.12;
    // Bialka
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.ellipse(-eyeSpacing, eyeY, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(eyeSpacing, eyeY, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Zrenice
    ctx.fillStyle = pilot.eyeColor;
    ctx.beginPath();
    ctx.arc(-eyeSpacing, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeSpacing, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Cyborg implant — zastepuje jedno oko
    if (pilot.isCyborg && pilot.implantColor) {
      ctx.fillStyle = pilot.implantColor;
      ctx.shadowColor = pilot.implantColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();
      // Linie implantowe
      ctx.strokeStyle = pilot.implantColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(eyeSpacing + 4, eyeY);
      ctx.lineTo(eyeSpacing + 10, eyeY - 3);
      ctx.moveTo(eyeSpacing + 4, eyeY + 2);
      ctx.lineTo(eyeSpacing + 8, eyeY + 6);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Visor / gogle
    if (pilot.visorColor) {
      ctx.fillStyle = pilot.visorColor + '66';
      ctx.strokeStyle = pilot.visorColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-faceW / 2 + 2, eyeY - 4);
      ctx.lineTo(faceW / 2 - 2, eyeY - 4);
      ctx.lineTo(faceW / 2 - 2, eyeY + 4);
      ctx.lineTo(-faceW / 2 + 2, eyeY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Blizna
    if (pilot.hasScar) {
      ctx.strokeStyle = '#ff668866';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 5, eyeY - 8);
      ctx.lineTo(eyeSpacing - 3, eyeY + 12);
      ctx.stroke();
    }

    // Usta
    ctx.fillStyle = '#00000044';
    ctx.fillRect(-4, s * 0.18, 8, 2);

    // Breather (oddechowy)
    if (pilot.hasBreather) {
      ctx.fillStyle = '#333';
      ctx.fillRect(-8, s * 0.14, 16, 8);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-6, s * 0.16, 3, 4);
      ctx.fillRect(-1, s * 0.16, 3, 4);
      ctx.fillRect(4, s * 0.16, 3, 4);
      // Rurki
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, s * 0.18);
      ctx.lineTo(-14, s * 0.25);
      ctx.moveTo(8, s * 0.18);
      ctx.lineTo(14, s * 0.25);
      ctx.stroke();
    }

    // Ramka cyborga
    if (pilot.isCyborg) {
      ctx.strokeStyle = pilot.implantColor || '#f44';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(-hs - 4, -hs - 4, s + 8, s + 8);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  function setupLayers() {
    var cfg = FA.lookup('config', 'game');
    var colors = FA.lookup('config', 'colors');
    var ctx = FA.getCtx();

    // === EKRAN STARTOWY ===
    FA.addLayer('startScreen', function() {
      var state = FA.getState();
      if (state.screen !== 'start') return;

      FA.draw.text('COSMIC DRIFTERS', cfg.canvasWidth / 2, 140, { color: '#0ff', size: 48, bold: true, align: 'center' });
      FA.draw.text('Modularne statki. Fizyka. Narracja.', cfg.canvasWidth / 2, 200, { color: '#888', size: 16, align: 'center' });

      // Portret pilota gracza
      if (state.playerPilot) {
        drawPilotPortrait(ctx, state.playerPilot, cfg.canvasWidth / 2, 310, 80);
        FA.draw.text(state.playerPilot.title + ' ' + state.playerPilot.name, cfg.canvasWidth / 2, 370, { color: '#cde', size: 14, align: 'center' });
        FA.draw.text(state.playerPilot.background, cfg.canvasWidth / 2, 390, { color: '#889', size: 12, align: 'center' });
        if (state.playerPilot.trait) {
          FA.draw.text(state.playerPilot.trait, cfg.canvasWidth / 2, 408, { color: state.playerPilot.implantColor || '#f44', size: 12, align: 'center' });
        }
      }

      FA.draw.text('WASD — lot | SHIFT — turbo', cfg.canvasWidth / 2, 460, { color: '#aaa', size: 14, align: 'center' });
      FA.draw.text('SPACJA — strzal | Zbieraj dryfujace czesci', cfg.canvasWidth / 2, 484, { color: '#aaa', size: 14, align: 'center' });
      FA.draw.text('[SPACJA] aby rozpoczac', cfg.canvasWidth / 2, 540, { color: '#fff', size: 20, bold: true, align: 'center' });
    }, 0);

    // === EKRAN SMIERCI ===
    FA.addLayer('deathScreen', function() {
      var state = FA.getState();
      if (state.screen !== 'death') return;
      FA.draw.withAlpha(0.7, function() {
        FA.draw.rect(0, 0, cfg.canvasWidth, cfg.canvasHeight, '#000');
      });
      FA.draw.text('ZNISZCZONY', cfg.canvasWidth / 2, 150, { color: '#f44', size: 48, bold: true, align: 'center' });

      // Portret pilota
      if (state.playerPilot) {
        drawPilotPortrait(ctx, state.playerPilot, cfg.canvasWidth / 2, 240, 64);
        FA.draw.text(state.playerPilot.title + ' ' + state.playerPilot.name, cfg.canvasWidth / 2, 290, { color: '#cde', size: 14, align: 'center' });
      }

      FA.draw.text('Wynik: ' + state.score, cfg.canvasWidth / 2, 330, { color: '#fff', size: 24, align: 'center' });
      FA.draw.text('Sektor: ' + state.sector + '/7 | Zabici: ' + state.kills + ' | Czesci: ' + state.partsCollected, cfg.canvasWidth / 2, 370, { color: '#aaa', size: 14, align: 'center' });
      FA.draw.text('Obrazenia: ' + state.damageDealt + ' | Czas: ' + Math.floor(state.survivalTime) + 's', cfg.canvasWidth / 2, 395, { color: '#aaa', size: 14, align: 'center' });

      if (state.narrativeMessage) {
        FA.draw.text(state.narrativeMessage.text, cfg.canvasWidth / 2, 440, { color: state.narrativeMessage.color, size: 16, align: 'center' });
      }
      FA.draw.text('[R] restart', cfg.canvasWidth / 2, 490, { color: '#fff', size: 18, bold: true, align: 'center' });
    }, 0);

    // === EKRAN ZWYCIESTWA ===
    FA.addLayer('victoryScreen', function() {
      var state = FA.getState();
      if (state.screen !== 'victory') return;
      FA.draw.withAlpha(0.8, function() {
        FA.draw.rect(0, 0, cfg.canvasWidth, cfg.canvasHeight, '#001');
      });

      var knows = FA.narrative.getVar('knows_truth');
      var title = knows ? 'WOLNY DRYFT' : 'POWROT';
      var titleColor = knows ? '#88ccff' : '#ffcc88';
      FA.draw.text(title, cfg.canvasWidth / 2, 120, { color: titleColor, size: 48, bold: true, align: 'center' });

      // Portret
      if (state.playerPilot) {
        drawPilotPortrait(ctx, state.playerPilot, cfg.canvasWidth / 2, 220, 80);
        FA.draw.text(state.playerPilot.title + ' ' + state.playerPilot.name, cfg.canvasWidth / 2, 280, { color: '#cde', size: 16, align: 'center' });
      }

      FA.draw.text('Wynik: ' + state.score, cfg.canvasWidth / 2, 320, { color: '#ff0', size: 28, bold: true, align: 'center' });
      FA.draw.text('Sektor 7/7 | Zabici: ' + state.kills + ' | Czesci: ' + state.partsCollected, cfg.canvasWidth / 2, 360, { color: '#aaa', size: 14, align: 'center' });
      FA.draw.text('Czas: ' + Math.floor(state.survivalTime) + 's | Piloci: ' + state.pilotsMet, cfg.canvasWidth / 2, 385, { color: '#aaa', size: 14, align: 'center' });

      if (state.narrativeMessage) {
        FA.draw.text(state.narrativeMessage.text, cfg.canvasWidth / 2, 430, { color: state.narrativeMessage.color, size: 16, align: 'center' });
      }
      FA.draw.text('[R] nowa gra', cfg.canvasWidth / 2, 490, { color: '#fff', size: 18, bold: true, align: 'center' });
    }, 0);

    // === SIATKA TLA ===
    FA.addLayer('grid', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      var sector = FA.lookup('sectors', state.sector);
      var gridColor = sector ? sector.color : colors.gridLine;
      var gridSize = 250;
      var ox = -(FA.camera.x % gridSize);
      var oy = -(FA.camera.y % gridSize);
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = ox; x < cfg.canvasWidth; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cfg.canvasHeight);
      }
      for (var y = oy; y < cfg.canvasHeight; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(cfg.canvasWidth, y);
      }
      ctx.stroke();
    }, 1);

    // === DRYFUJACE CZESCI ===
    FA.addLayer('floatingParts', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      for (var i = 0; i < state.floatingParts.length; i++) {
        var fp = state.floatingParts[i];
        var sx = fp.x - FA.camera.x;
        var sy = fp.y - FA.camera.y;
        if (sx < -50 || sx > cfg.canvasWidth + 50 || sy < -50 || sy > cfg.canvasHeight + 50) continue;
        var alpha = FA.clamp(fp.life / 200, 0.2, 0.8);
        FA.draw.withAlpha(alpha, function() {
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(fp.angle);
          var def = FA.lookup('partTypes', fp.type);
          var ch = def ? def.char : '?';
          FA.draw.sprite('items', 'floating' + fp.type.charAt(0).toUpperCase() + fp.type.slice(1),
            -10, -10, 20, ch, '#888');
          ctx.restore();
        });
      }
    }, 2);

    // === STATKI ===
    FA.addLayer('ships', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      if (state.ship) drawShip(state.ship, true, ctx, cfg, colors);
      for (var i = 0; i < state.enemies.length; i++) {
        drawShip(state.enemies[i], false, ctx, cfg, colors);
      }
    }, 5);

    // === POCISKI ===
    FA.addLayer('bullets', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      for (var i = 0; i < state.bullets.length; i++) {
        var b = state.bullets[i];
        var sx = b.x - FA.camera.x, sy = b.y - FA.camera.y;
        if (sx < -20 || sx > cfg.canvasWidth + 20 || sy < -20 || sy > cfg.canvasHeight + 20) continue;
        var color = b.friendly ? colors.bulletFriendly : colors.bulletEnemy;
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - b.vx * 0.3, sy - b.vy * 0.3);
        ctx.stroke();
        ctx.restore();
      }
    }, 10);

    // === EFEKTY I FLOATY ===
    FA.addLayer('effects', function() {
      FA.drawFloats();
    }, 15);

    // === WSKAZNIKI WROGOW ===
    FA.addLayer('indicators', function() {
      var state = FA.getState();
      if (state.screen !== 'playing' || !state.ship) return;
      var margin = 30;
      for (var i = 0; i < state.enemies.length; i++) {
        var e = state.enemies[i];
        var ex = e.x - FA.camera.x, ey = e.y - FA.camera.y;
        if (ex >= 0 && ex <= cfg.canvasWidth && ey >= 0 && ey <= cfg.canvasHeight) continue;
        var cx = cfg.canvasWidth / 2, cy = cfg.canvasHeight / 2;
        var angle = Math.atan2(ey - cy, ex - cx);
        var ix = FA.clamp(cx + Math.cos(angle) * 300, margin, cfg.canvasWidth - margin);
        var iy = FA.clamp(cy + Math.sin(angle) * 300, margin, cfg.canvasHeight - margin);
        ctx.save();
        ctx.translate(ix, iy);
        ctx.rotate(angle);
        ctx.fillStyle = '#f84';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, -5);
        ctx.lineTo(-6, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }, 20);

    // === NARRACJA ===
    FA.addLayer('narrative', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      if (!state.narrativeMessage || state.narrativeMessage.life <= 0) return;
      var alpha = Math.min(1, state.narrativeMessage.life / 1000);
      FA.draw.withAlpha(alpha, function() {
        FA.draw.rect(0, 0, cfg.canvasWidth, 44, 'rgba(0,0,0,0.7)');
        FA.draw.text(state.narrativeMessage.text, cfg.canvasWidth / 2, 14,
          { color: state.narrativeMessage.color, size: 16, align: 'center' });
      });
    }, 25);

    // === CHOICE UI ===
    FA.addLayer('choiceUI', function() {
      var state = FA.getState();
      if (state.screen !== 'playing' || !state.choiceActive) return;

      var choiceTexts = {
        scavenger: { q: 'Sojusz ze scavengerem?', y: '[Y] Gadamy', n: '[N] Strzelamy' },
        distress: { q: 'Odpowiedz na SOS?', y: '[Y] Ratuj', n: '[N] Ignoruj' },
        truth: { q: 'Chcesz poznac prawde?', y: '[Y] Tak', n: '[N] Nie' }
      };
      var ct = choiceTexts[state.choiceActive];
      if (!ct) return;

      var bw = 320, bh = 80;
      var bx = cfg.canvasWidth / 2 - bw / 2;
      var by = cfg.canvasHeight / 2 - bh / 2;

      FA.draw.withAlpha(0.85, function() {
        FA.draw.rect(bx, by, bw, bh, '#0a1520');
      });
      ctx.strokeStyle = '#4ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      FA.draw.text(ct.q, cfg.canvasWidth / 2, by + 18, { color: '#fff', size: 16, bold: true, align: 'center' });
      FA.draw.text(ct.y, cfg.canvasWidth / 2 - 60, by + 48, { color: '#4f4', size: 14, align: 'center' });
      FA.draw.text(ct.n, cfg.canvasWidth / 2 + 60, by + 48, { color: '#f44', size: 14, align: 'center' });

      // Timer bar
      if (state.choiceTimer > 0) {
        var ratio = state.choiceTimer / 300;
        FA.draw.bar(bx + 10, by + bh - 10, bw - 20, 4, ratio, '#4ff', '#1a2a3a');
      }
    }, 27);

    // === PILOT POPUP ===
    FA.addLayer('pilotPopup', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return;
      if (!state.lastKilledPilot || state.pilotShowTimer <= 0) return;

      var pilot = state.lastKilledPilot;
      var alpha = Math.min(1, state.pilotShowTimer / 30);
      var px = cfg.canvasWidth - 160;
      var py = 60;

      FA.draw.withAlpha(alpha, function() {
        // Panel tla
        FA.draw.rect(px - 50, py - 50, 180, 130, '#0a1520');
        ctx.strokeStyle = '#1a3a5a';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 50, py - 50, 180, 130);

        FA.draw.text('ZESTRZELONY', px + 40, py - 38, { color: '#f44', size: 10, align: 'center' });
        drawPilotPortrait(ctx, pilot, px, py + 4, 48);
        FA.draw.text(pilot.title, px + 40, py + 42, { color: '#889', size: 10, align: 'center' });
        FA.draw.text(pilot.name, px + 40, py + 58, { color: '#cde', size: 12, align: 'center' });
        if (pilot.trait) {
          FA.draw.text(pilot.trait, px + 40, py + 72, { color: pilot.implantColor || '#f44', size: 9, align: 'center' });
        }
      });
    }, 28);

    // === HUD ===
    FA.addLayer('hud', function() {
      var state = FA.getState();
      if (state.screen !== 'playing' || !state.ship) return;
      var y = cfg.canvasHeight - 30;

      // Zliczenia
      var engines = 0, guns = 0, coreHp = 0, coreMax = 0;
      for (var i = 0; i < state.ship.parts.length; i++) {
        var p = state.ship.parts[i];
        if (p.type === 'engine' && Physics.isConnected(state.ship.parts, i)) engines++;
        if (p.type === 'gun' && Physics.isConnected(state.ship.parts, i)) guns++;
        if (p.type === 'core') { coreHp += p.hp; coreMax += p.maxHp; }
      }

      var sector = FA.lookup('sectors', state.sector);
      var sectorName = sector ? sector.name : 'Sektor ' + state.sector;

      var scoring = FA.lookup('config', 'scoring');
      var score = Math.floor(
        state.kills * scoring.killMultiplier +
        state.partsCollected * scoring.partCollectedMultiplier +
        state.damageDealt * scoring.damageMultiplier +
        state.survivalTime * scoring.survivalPerSecond +
        (state.sector - 1) * scoring.sectorBonus
      );

      // Gorny pasek — sektor
      FA.draw.rect(0, 0, cfg.canvasWidth, 0, 'transparent');
      // Nie rysujemy gornego paska jesli jest narracja — narrative layer ja rysuje

      // Dolny pasek
      FA.draw.rect(0, y - 5, cfg.canvasWidth, 35, 'rgba(0,0,0,0.5)');

      var info = sectorName + ' [' + state.sector + '/7] | '
        + 'Silniki:' + engines + ' Dziala:' + guns + ' Rdzen:' + coreHp + '/' + coreMax
        + ' | Wrogowie:' + state.enemies.length + ' | Wynik:' + score;
      FA.draw.text(info, 10, y, { color: colors.text, size: 14 });

      // Mini pilot portrait w HUD
      if (state.playerPilot) {
        drawPilotPortrait(ctx, state.playerPilot, cfg.canvasWidth - 28, y + 2, 24);
      }
    }, 30);
  }

  // === RYSOWANIE STATKU ===

  function drawShip(ship, isPlayer, ctx, cfg, colors) {
    var sx = ship.x - FA.camera.x;
    var sy = ship.y - FA.camera.y;
    if (sx < -200 || sx > cfg.canvasWidth + 200 || sy < -200 || sy > cfg.canvasHeight + 200) return;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ship.angle);

    for (var i = 0; i < ship.parts.length; i++) {
      var part = ship.parts[i];
      var conn = Physics.isConnected(ship.parts, i);
      var partAlpha = conn ? 1.0 : 0.4;
      var color = getPartColor(part.type, isPlayer, conn, colors);
      var def = FA.lookup('partTypes', part.type);
      var ch = def ? def.char : '?';

      // Hit flash
      var hitFlash = (Date.now() - part.lastHit) < 100;
      if (hitFlash) color = '#fff';

      FA.draw.withAlpha(partAlpha, function() {
        var category = isPlayer ? 'player' : 'enemies';
        var spriteName = part.type;
        // Aktywny silnik
        if (part.type === 'engine' && ship.activeEngines && ship.activeEngines.has(part)) {
          spriteName = 'engineActive';
          ctx.save();
          ctx.shadowColor = '#0ff';
          ctx.shadowBlur = 10;
          FA.draw.rect(part.x - 4, part.y + 12, 8, 6 + Math.random() * 8, '#0ff');
          ctx.restore();
        }
        FA.draw.sprite(category, spriteName, part.x - 10, part.y - 10, 20, ch, color);
      });

      // HP bar dla core
      if (part.type === 'core' && part.hp < part.maxHp) {
        FA.draw.bar(part.x - 12, part.y + 12, 24, 3, part.hp / part.maxHp, '#f44', '#400');
      }
      // Shield glow
      if (part.type === 'shield' && conn) {
        ctx.save();
        ctx.shadowColor = colors.shield;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = colors.shield + '44';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(part.x, part.y, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  function getPartColor(type, isPlayer, connected, colors) {
    if (!connected) return colors.disconnected;
    if (isPlayer) {
      if (type === 'core') return colors.playerCore;
      if (type === 'engine') return colors.playerEngine;
      if (type === 'gun') return colors.playerGun;
      if (type === 'shield') return colors.shield;
    } else {
      if (type === 'core') return colors.enemyCore;
      if (type === 'engine') return colors.enemyEngine;
      if (type === 'gun') return colors.enemyGun;
      if (type === 'shield') return colors.shield;
    }
    return colors.cargo;
  }

  window.Render = {
    setup: setupLayers,
    drawPilotPortrait: drawPilotPortrait
  };

})();
