// Cosmic Drifters — Rendering
// Warstwy: ekrany, grid, statki, pociski, efekty, piloci, narracja, HUD
(function() {
  'use strict';
  var FA = window.FA;

  // === RYSOWANIE PORTRETU PILOTA (sprite-based) ===

  // Mapowanie wlasciwosci pilota na nazwy sprite'ow
  var SKIN_MAP = { '#e8c4a0': 'face_light', '#c49870': 'face_light', '#d4a574': 'face_light',
                   '#c68c5a': 'face_medium', '#a37452': 'face_medium',
                   '#8d5c3a': 'face_dark', '#6b4226': 'face_dark' };
  var HELM_MAP = { '#2a3a5a': 'helm_blue', '#1a3a4a': 'helm_blue',
                   '#2a4a3a': 'helm_green', '#3a2a4a': 'helm_dark',
                   '#4a3a2a': 'helm_dark', '#5a2a2a': 'helm_dark', '#3a3a3a': 'helm_dark' };
  var VISOR_MAP = { '#0ff': 'visor_cyan', '#4ff': 'visor_cyan', '#08f': 'visor_cyan',
                    '#f0f': 'visor_magenta', '#f44': 'visor_magenta',
                    '#ff0': 'visor_orange', '#f80': 'visor_orange', '#0f0': 'visor_cyan' };
  var IMPLANT_MAP = { '#f44': 'implant_red', '#ff0': 'implant_red', '#f0f': 'implant_red',
                      '#0ff': 'implant_cyan', '#4f4': 'implant_cyan' };
  var MOHAWK_MAP = { '#ff0': 'mohawk_yellow', '#f80': 'mohawk_yellow', '#fff': 'mohawk_yellow',
                     '#0ff': 'mohawk_cyan', '#444': 'mohawk_cyan',
                     '#f0f': 'mohawk_magenta' };

  function drawPilotPortrait(ctx, pilot, x, y, size) {
    if (!pilot) return;
    var s = size || 64;
    var hs = s / 2;
    var sx = x - hs;
    var sy = y - hs;

    // Tlo
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(sx - 2, sy - 2, s + 4, s + 4);

    // Baza twarzy
    var faceSprite = getSprite('ui', SKIN_MAP[pilot.skinTone] || 'face_medium');
    if (faceSprite) drawSprite(ctx, faceSprite, sx, sy, s);

    // Mohawk (przed helmem — helm przykryje)
    if (pilot.hasMohawk && !pilot.helmColor) {
      var mohawkSprite = getSprite('ui', MOHAWK_MAP[pilot.hairColor] || 'mohawk_yellow');
      if (mohawkSprite) drawSprite(ctx, mohawkSprite, sx, sy, s);
    }

    // Helm
    if (pilot.helmColor) {
      var helmSprite = getSprite('ui', HELM_MAP[pilot.helmColor] || 'helm_dark');
      if (helmSprite) drawSprite(ctx, helmSprite, sx, sy, s);
    }

    // Visor
    if (pilot.visorColor) {
      var visorSprite = getSprite('ui', VISOR_MAP[pilot.visorColor] || 'visor_cyan');
      if (visorSprite) drawSprite(ctx, visorSprite, sx, sy, s);
    }

    // Blizna
    if (pilot.hasScar) {
      var scarSprite = getSprite('ui', 'scar');
      if (scarSprite) drawSprite(ctx, scarSprite, sx, sy, s);
    }

    // Implant cyborga
    if (pilot.isCyborg && pilot.implantColor) {
      var implantSprite = getSprite('ui', IMPLANT_MAP[pilot.implantColor] || 'implant_red');
      if (implantSprite) drawSprite(ctx, implantSprite, sx, sy, s);
    }

    // Breather
    if (pilot.hasBreather) {
      var breatherSprite = getSprite('ui', 'breather');
      if (breatherSprite) drawSprite(ctx, breatherSprite, sx, sy, s);
    }

    // Ramka
    var frameSprite = getSprite('ui', pilot.isCyborg ? 'frame_cyborg' : 'frame_normal');
    if (frameSprite) drawSprite(ctx, frameSprite, sx - 2, sy - 2, s + 4);
  }

  // === DOCK SCREEN HELPERS ===

  function drawShipEditor(ctx, state, cfg, colors, panelY, panelH) {
    var g = cfg.gridSize;
    var editorX = cfg.canvasWidth / 2;
    var editorY = cfg.canvasHeight / 2 - 30;

    // Siatka 7×7
    var gridHalf = 3;
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 1;
    for (var gx = -gridHalf; gx <= gridHalf; gx++) {
      for (var gy = -gridHalf; gy <= gridHalf; gy++) {
        ctx.strokeRect(editorX + gx * g - g / 2, editorY + gy * g - g / 2, g, g);
      }
    }

    // Rysuj czesci
    if (state.ship) {
      for (var i = 0; i < state.ship.parts.length; i++) {
        // Skip dragged part
        if (state.dragPart && state.dragPart.index === i) continue;
        var part = state.ship.parts[i];
        var px = editorX + part.x;
        var py = editorY + part.y;
        var def = FA.lookup('partTypes', part.type);
        var ch = def ? def.char : '?';
        var color = getPartColor(part.type, true, true, colors);
        FA.draw.sprite('player', part.type, px - 10, py - 10, 20, ch, color);

        // HP bar
        if (part.hp < part.maxHp) {
          FA.draw.bar(px - 12, py + 12, 24, 3, part.hp / part.maxHp, '#f44', '#400');
        }
        // Label
        FA.draw.text(def ? def.name : part.type, px, py + 20,
          { color: '#668', size: 9, align: 'center' });
      }

      // Drag ghost
      if (state.dragPart && state.dragGhost) {
        var localX = state.dragGhost.x - editorX;
        var localY = state.dragGhost.y - editorY;
        var snapped = Physics.snapToGrid(localX, localY);
        var ghostX = editorX + snapped.x;
        var ghostY = editorY + snapped.y;
        var ghostColor = state.dragValid ? 'rgba(0,255,128,0.4)' : 'rgba(255,64,64,0.4)';
        ctx.fillStyle = ghostColor;
        ctx.fillRect(ghostX - g / 2, ghostY - g / 2, g, g);
        ctx.strokeStyle = state.dragValid ? '#4f8' : '#f44';
        ctx.lineWidth = 2;
        ctx.strokeRect(ghostX - g / 2, ghostY - g / 2, g, g);
      }
    }

    FA.draw.text('Przeciagnij myszka aby przestawic czesci', cfg.canvasWidth / 2, cfg.canvasHeight - 90,
      { color: '#446', size: 12, align: 'center' });
  }

  function drawBuyPanel(ctx, state, cfg, colors, panelY, panelH) {
    // Ship preview po lewej
    var previewX = 200;
    var previewY = panelY + panelH / 2;
    drawShipPreview(ctx, state, cfg, colors, previewX, previewY);

    // Stock po prawej
    var listX = cfg.canvasWidth / 2 + 50;
    var listY = panelY + 20;
    FA.draw.text('DOSTEPNE CZESCI', listX + 100, listY, { color: '#0ff', size: 16, bold: true, align: 'center' });
    listY += 30;

    if (!state.station || !state.station.stock || state.station.stock.length === 0) {
      FA.draw.text('Brak towaru', listX + 100, listY, { color: '#446', size: 14, align: 'center' });
      return;
    }

    // Zapisz hitboxy do state
    state.buyHitboxes = [];
    for (var i = 0; i < state.station.stock.length; i++) {
      var item = state.station.stock[i];
      var iy = listY + i * 50;
      var canBuy = state.credits >= item.price;

      // Background
      FA.draw.rect(listX, iy, 200, 42, canBuy ? '#0a1a2a' : '#0a0a14');
      ctx.strokeStyle = canBuy ? '#1a3a5a' : '#1a1a2a';
      ctx.lineWidth = 1;
      ctx.strokeRect(listX, iy, 200, 42);

      // Sprite
      var def = FA.lookup('partTypes', item.type);
      var ch = def ? def.char : '?';
      var color = getPartColor(item.type, true, true, colors);
      FA.draw.sprite('player', item.type, listX + 8, iy + 11, 20, ch, color);

      // Nazwa + cena
      FA.draw.text(def ? def.name : item.type, listX + 42, iy + 8,
        { color: canBuy ? '#cde' : '#445', size: 14 });
      FA.draw.text(item.price + ' CR', listX + 42, iy + 24,
        { color: canBuy ? '#ff0' : '#553', size: 12 });

      // Klik button
      if (canBuy) {
        FA.draw.rect(listX + 150, iy + 6, 44, 28, '#1a3a2a');
        FA.draw.text('KUP', listX + 172, iy + 14, { color: '#4f4', size: 12, bold: true, align: 'center' });
      }

      state.buyHitboxes.push({ x: listX, y: iy, w: 200, h: 42, index: i });
    }
  }

  function drawSellPanel(ctx, state, cfg, colors, panelY, panelH) {
    // Ship preview po lewej
    var previewX = 200;
    var previewY = panelY + panelH / 2;
    drawShipPreview(ctx, state, cfg, colors, previewX, previewY);

    // Parts list po prawej
    var listX = cfg.canvasWidth / 2 + 50;
    var listY = panelY + 20;
    FA.draw.text('TWOJE CZESCI', listX + 100, listY, { color: '#f80', size: 16, bold: true, align: 'center' });
    listY += 30;

    if (!state.ship) return;

    state.sellHitboxes = [];
    var sellIdx = 0;
    var prices = FA.lookup('config', 'tradePrices');
    for (var i = 0; i < state.ship.parts.length; i++) {
      var part = state.ship.parts[i];
      if (part.type === 'core') continue; // Core nie sprzedajemy
      var iy = listY + sellIdx * 50;
      var basePrice = prices[part.type] || 30;
      var sellPrice = Math.round(basePrice * cfg.sellRatio);

      // Background
      FA.draw.rect(listX, iy, 200, 42, '#1a0a0a');
      ctx.strokeStyle = '#3a1a1a';
      ctx.lineWidth = 1;
      ctx.strokeRect(listX, iy, 200, 42);

      // Sprite
      var def = FA.lookup('partTypes', part.type);
      var ch = def ? def.char : '?';
      var color = getPartColor(part.type, true, true, colors);
      FA.draw.sprite('player', part.type, listX + 8, iy + 11, 20, ch, color);

      // Nazwa + cena + HP
      FA.draw.text((def ? def.name : part.type) + ' (' + part.hp + '/' + part.maxHp + ')', listX + 42, iy + 8,
        { color: '#cde', size: 14 });
      FA.draw.text('+' + sellPrice + ' CR', listX + 42, iy + 24,
        { color: '#ff0', size: 12 });

      // Sprzedaj button
      FA.draw.rect(listX + 140, iy + 6, 54, 28, '#3a1a1a');
      FA.draw.text('SPRZEDAJ', listX + 167, iy + 14, { color: '#f80', size: 11, bold: true, align: 'center' });

      state.sellHitboxes.push({ x: listX, y: iy, w: 200, h: 42, partIndex: i });
      sellIdx++;
    }

    if (sellIdx === 0) {
      FA.draw.text('Brak czesci do sprzedazy', listX + 100, listY, { color: '#446', size: 14, align: 'center' });
    }
  }

  function drawShipPreview(ctx, state, cfg, colors, cx, cy) {
    if (!state.ship) return;
    FA.draw.text('Twoj statek', cx, cy - 100, { color: '#688', size: 12, align: 'center' });
    for (var i = 0; i < state.ship.parts.length; i++) {
      var part = state.ship.parts[i];
      var px = cx + part.x;
      var py = cy + part.y;
      var def = FA.lookup('partTypes', part.type);
      var ch = def ? def.char : '?';
      var color = getPartColor(part.type, true, Physics.isConnected(state.ship.parts, i), colors);
      FA.draw.sprite('player', part.type, px - 10, py - 10, 20, ch, color);
    }
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

      FA.draw.text('WASD — lot | SHIFT — turbo | F — dokuj', cfg.canvasWidth / 2, 460, { color: '#aaa', size: 14, align: 'center' });
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

    // === EKRAN DOKU ===
    FA.addLayer('dockedScreen', function() {
      var state = FA.getState();
      if (state.screen !== 'docked') return;

      // Tlo
      FA.draw.rect(0, 0, cfg.canvasWidth, cfg.canvasHeight, '#050a12');

      // Tytul
      var stName = state.station && state.station.pilot ? state.station.pilot.name + ' Station' : 'Stacja';
      FA.draw.text('STACJA DOKUJACA', cfg.canvasWidth / 2, 30, { color: '#0ff', size: 28, bold: true, align: 'center' });
      FA.draw.text('Sektor ' + state.sector + ' — ' + stName, cfg.canvasWidth / 2, 56, { color: '#688', size: 14, align: 'center' });

      // Kredyty
      FA.draw.text('CR: ' + state.credits, cfg.canvasWidth / 2, 80, { color: '#ff0', size: 18, bold: true, align: 'center' });

      // Taby
      var tabs = ['editor', 'buy', 'sell'];
      var tabLabels = { editor: '[Q] Edytor', buy: 'Kup [E]', sell: 'Sprzedaj' };
      var tabWidth = 120;
      var tabStartX = cfg.canvasWidth / 2 - (tabs.length * tabWidth) / 2;
      for (var t = 0; t < tabs.length; t++) {
        var tx = tabStartX + t * tabWidth;
        var isActive = state.tradeTab === tabs[t];
        FA.draw.rect(tx, 100, tabWidth - 4, 28, isActive ? '#1a3a5a' : '#0a1520');
        ctx.strokeStyle = isActive ? '#0ff' : '#334';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, 100, tabWidth - 4, 28);
        FA.draw.text(tabLabels[tabs[t]], tx + tabWidth / 2 - 2, 108,
          { color: isActive ? '#0ff' : '#668', size: 13, align: 'center' });
      }

      var panelY = 140;
      var panelH = cfg.canvasHeight - panelY - 80;

      if (state.tradeTab === 'editor') {
        drawShipEditor(ctx, state, cfg, colors, panelY, panelH);
      } else if (state.tradeTab === 'buy') {
        drawBuyPanel(ctx, state, cfg, colors, panelY, panelH);
      } else if (state.tradeTab === 'sell') {
        drawSellPanel(ctx, state, cfg, colors, panelY, panelH);
      }

      // Narrative message w doku
      if (state.narrativeMessage && state.narrativeMessage.life > 0) {
        var alpha = Math.min(1, state.narrativeMessage.life / 1000);
        FA.draw.withAlpha(alpha, function() {
          FA.draw.rect(0, cfg.canvasHeight - 70, cfg.canvasWidth, 30, 'rgba(0,0,0,0.7)');
          FA.draw.text(state.narrativeMessage.text, cfg.canvasWidth / 2, cfg.canvasHeight - 62,
            { color: state.narrativeMessage.color, size: 14, align: 'center' });
        });
      }

      // ESC hint
      FA.draw.text('[ESC] Oddokuj', cfg.canvasWidth / 2, cfg.canvasHeight - 20,
        { color: '#688', size: 14, align: 'center' });
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

    // === STACJA W SWIECIE ===
    FA.addLayer('station', function() {
      var state = FA.getState();
      if (state.screen !== 'playing' || !state.station) return;
      var st = state.station;
      var sx = st.x - FA.camera.x;
      var sy = st.y - FA.camera.y;
      if (sx < -100 || sx > cfg.canvasWidth + 100 || sy < -100 || sy > cfg.canvasHeight + 100) return;

      st.angle += 0.005; // Powolna rotacja

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(st.angle);

      // Glow
      ctx.shadowColor = '#0ff';
      ctx.shadowBlur = 15;

      // Hex
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      var r = cfg.stationSize / 2;
      for (var i = 0; i < 6; i++) {
        var a = Math.PI / 3 * i - Math.PI / 6;
        var hx = Math.cos(a) * r;
        var hy = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner hex
      ctx.strokeStyle = '#088';
      ctx.lineWidth = 1;
      ctx.beginPath();
      var ri = r * 0.6;
      for (var j = 0; j < 6; j++) {
        var ai = Math.PI / 3 * j - Math.PI / 6;
        var hxi = Math.cos(ai) * ri;
        var hyi = Math.sin(ai) * ri;
        if (j === 0) ctx.moveTo(hxi, hyi); else ctx.lineTo(hxi, hyi);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.restore();

      // "D" label (nie rotuje)
      FA.draw.text('D', sx, sy - 5, { color: '#0ff', size: 14, bold: true, align: 'center' });
    }, 3);

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

    // === STATION INDICATOR ===
    FA.addLayer('stationIndicator', function() {
      var state = FA.getState();
      if (state.screen !== 'playing' || !state.station || !state.ship) return;
      var st = state.station;
      var sx = st.x - FA.camera.x;
      var sy = st.y - FA.camera.y;

      // Off-screen hex indicator
      if (sx < 0 || sx > cfg.canvasWidth || sy < 0 || sy > cfg.canvasHeight) {
        var ccx = cfg.canvasWidth / 2, ccy = cfg.canvasHeight / 2;
        var sAngle = Math.atan2(sy - ccy, sx - ccx);
        var ix = FA.clamp(ccx + Math.cos(sAngle) * 300, 30, cfg.canvasWidth - 30);
        var iy = FA.clamp(ccy + Math.sin(sAngle) * 300, 30, cfg.canvasHeight - 30);
        ctx.save();
        ctx.translate(ix, iy);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var h = 0; h < 6; h++) {
          var ha = Math.PI / 3 * h - Math.PI / 6;
          var hx = Math.cos(ha) * 8;
          var hy = Math.sin(ha) * 8;
          if (h === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // Dock prompt
      if (state.stationDockable) {
        FA.draw.text('[F] Dokuj na stacji', cfg.canvasWidth / 2, cfg.canvasHeight / 2 + 60,
          { color: '#0ff', size: 18, bold: true, align: 'center' });
      }
    }, 21);

    // === NARRACJA ===
    FA.addLayer('narrative', function() {
      var state = FA.getState();
      if (state.screen !== 'playing') return; // docked ma wlasna narracje w dockedScreen
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
        + ' | Wrogowie:' + state.enemies.length + ' | CR:' + state.credits + ' | Wynik:' + score;
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
