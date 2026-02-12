// sprites.js — ForkArcade pixel art sprites
// Wygenerowany z _sprites.json przez create_sprite tool

var SPRITE_DEFS = {
  "player": {
    "core": {
      "w": 8,
      "h": 8,
      "palette": {
        "C": "#00ffff",
        "c": "#008888",
        "w": "#ffffff",
        "b": "#005566"
      },
      "pixels": [
        "..cCCc..",
        ".cCwwCc.",
        "cCwwwwCc",
        "CCwwwwCC",
        "CCwwwwCC",
        "cCwwwwCc",
        ".cCwwCc.",
        "..cCCc.."
      ]
    },
    "engine": {
      "w": 8,
      "h": 8,
      "palette": {
        "G": "#44ff44",
        "g": "#228822",
        "d": "#116611",
        "n": "#0a440a"
      },
      "pixels": [
        "..gGGg..",
        ".gGGGGg.",
        ".GGGGGG.",
        "gGGddGGg",
        "gGddddGg",
        ".gdddng.",
        ".gddddg.",
        "..gnng.."
      ]
    },
    "engineActive": {
      "w": 8,
      "h": 8,
      "palette": {
        "G": "#44ff44",
        "g": "#228822",
        "f": "#00ffff",
        "F": "#88ffff",
        "w": "#ffffff"
      },
      "pixels": [
        "..gGGg..",
        ".gGGGGg.",
        ".GGGGGG.",
        "gGGffGGg",
        "gGfFFfGg",
        ".gfwwfg.",
        "..fFFf..",
        "...fw..."
      ]
    },
    "gun": {
      "w": 8,
      "h": 8,
      "palette": {
        "M": "#ff44ff",
        "m": "#882288",
        "p": "#cc22cc",
        "w": "#ffffff"
      },
      "pixels": [
        "...ww...",
        "...MM...",
        "..MMMM..",
        ".mMppMm.",
        ".mMppMm.",
        ".mMMMMm.",
        "..mMMm..",
        "..mmmm.."
      ]
    },
    "cargo": {
      "w": 8,
      "h": 8,
      "palette": {
        "Y": "#eeff44",
        "y": "#888822",
        "d": "#666611",
        "w": "#ffffff"
      },
      "pixels": [
        ".yYYYYy.",
        "yYYwwYYy",
        "YYYwwYYY",
        "YYYYYYYd",
        "YYYYYYYd",
        "YYYYYYdd",
        "yYYYYYd.",
        ".yyyyyd."
      ]
    },
    "shield": {
      "w": 8,
      "h": 8,
      "palette": {
        "B": "#4488ff",
        "b": "#2244aa",
        "w": "#88bbff",
        "g": "#6699ff"
      },
      "pixels": [
        "..bBBb..",
        ".bBwwBb.",
        "bBwggwBb",
        "BwggggwB",
        "BwggggwB",
        "bBwggwBb",
        ".bBwwBb.",
        "..bBBb.."
      ]
    }
  },
  "enemies": {
    "core": {
      "w": 8,
      "h": 8,
      "palette": {
        "O": "#ff8844",
        "o": "#884422",
        "w": "#ffcc88",
        "r": "#663311"
      },
      "pixels": [
        "..oOOo..",
        ".oOwwOo.",
        "oOwwwwOo",
        "OOwwwwOO",
        "OOwwwwOO",
        "oOwwwwOo",
        ".oOwwOo.",
        "..oOOo.."
      ]
    },
    "engine": {
      "w": 8,
      "h": 8,
      "palette": {
        "G": "#88ff44",
        "g": "#448822",
        "d": "#336611",
        "n": "#224a0a"
      },
      "pixels": [
        "..gGGg..",
        ".gGGGGg.",
        ".GGGGGG.",
        "gGGddGGg",
        "gGddddGg",
        ".gdddng.",
        ".gddddg.",
        "..gnng.."
      ]
    },
    "gun": {
      "w": 8,
      "h": 8,
      "palette": {
        "R": "#ff4444",
        "r": "#882222",
        "p": "#cc2222",
        "w": "#ffaaaa"
      },
      "pixels": [
        "...ww...",
        "...RR...",
        "..RRRR..",
        ".rRppRr.",
        ".rRppRr.",
        ".rRRRRr.",
        "..rRRr..",
        "..rrrr.."
      ]
    },
    "cargo": {
      "w": 8,
      "h": 8,
      "palette": {
        "Y": "#eeff44",
        "y": "#888822",
        "d": "#666611"
      },
      "pixels": [
        ".yYYYYy.",
        "yYYYYYYy",
        "YYYYYYYY",
        "YYYYYYYd",
        "YYYYYYYd",
        "YYYYYYdd",
        "yYYYYYd.",
        ".yyyyyd."
      ]
    },
    "shield": {
      "w": 8,
      "h": 8,
      "palette": {
        "B": "#4488ff",
        "b": "#2244aa",
        "g": "#6699ff"
      },
      "pixels": [
        "..bBBb..",
        ".bBBBBb.",
        "bBBggBBb",
        "BBggggBB",
        "BBggggBB",
        "bBBggBBb",
        ".bBBBBb.",
        "..bBBb.."
      ]
    }
  },
  "effects": {
    "bullet": {
      "w": 8,
      "h": 8,
      "palette": {
        "C": "#00ffff",
        "c": "#008888",
        "w": "#ffffff"
      },
      "pixels": [
        "...w....",
        "...C....",
        "..CCC...",
        "...C....",
        "...c....",
        "...c....",
        "........",
        "........"
      ]
    },
    "explosion": {
      "w": 8,
      "h": 8,
      "palette": {
        "R": "#ff4400",
        "Y": "#ffaa00",
        "W": "#ffffff",
        "r": "#882200"
      },
      "pixels": [
        "..R..Y..",
        ".RYYWYR.",
        "R.YWWY.R",
        ".YWWWWY.",
        ".YWWWWY.",
        "R.YWWY.R",
        ".RYYWYR.",
        "..Y..R.."
      ]
    },
    "flame": {
      "w": 8,
      "h": 8,
      "palette": {
        "C": "#00ffff",
        "c": "#008888",
        "w": "#ffffff",
        "b": "#004444"
      },
      "pixels": [
        "..ww....",
        ".cCCc...",
        ".CwwC...",
        "cCwwCc..",
        ".CccC...",
        "..cc....",
        "..b.....",
        "........"
      ]
    },
    "sparks": {
      "w": 8,
      "h": 8,
      "palette": {
        "Y": "#ffff44",
        "W": "#ffffff",
        "y": "#aa8800"
      },
      "pixels": [
        "Y.......",
        "..W....Y",
        "........",
        "...Y....",
        ".W....y.",
        "........",
        "....W...",
        ".y.....Y"
      ]
    }
  },
  "items": {
    "floatingCore": {
      "w": 8,
      "h": 8,
      "palette": {
        "C": "#668888",
        "c": "#445555",
        "w": "#889999"
      },
      "pixels": [
        "..cCCc..",
        ".cCwwCc.",
        "cCwwwwCc",
        "CCwwwwCC",
        "CCwwwwCC",
        "cCwwwwCc",
        ".cCwwCc.",
        "..cCCc.."
      ]
    },
    "floatingEngine": {
      "w": 8,
      "h": 8,
      "palette": {
        "G": "#668866",
        "g": "#445544",
        "d": "#334433"
      },
      "pixels": [
        "..gGGg..",
        ".gGGGGg.",
        ".GGGGGG.",
        "gGGddGGg",
        "gGddddGg",
        ".gdddGg.",
        ".gddddg.",
        "..gddg.."
      ]
    },
    "floatingGun": {
      "w": 8,
      "h": 8,
      "palette": {
        "M": "#886688",
        "m": "#554455",
        "w": "#998899"
      },
      "pixels": [
        "...ww...",
        "...MM...",
        "..MMMM..",
        ".mMMMMm.",
        ".mMMMMm.",
        ".mMMMMm.",
        "..mMMm..",
        "..mmmm.."
      ]
    },
    "floatingCargo": {
      "w": 8,
      "h": 8,
      "palette": {
        "Y": "#888866",
        "y": "#555544",
        "d": "#444433"
      },
      "pixels": [
        ".yYYYYy.",
        "yYYYYYYy",
        "YYYYYYYY",
        "YYYYYYYd",
        "YYYYYYYd",
        "YYYYYYdd",
        "yYYYYYd.",
        ".yyyyyd."
      ]
    }
  },
  "ui": {
    "indicator": {
      "w": 8,
      "h": 8,
      "palette": {
        "R": "#ff8844",
        "r": "#884422",
        "w": "#ffcc88"
      },
      "pixels": [
        "........",
        "...wR...",
        "..wRRR..",
        ".wRRRRR.",
        "..wRRR..",
        "...wR...",
        "........",
        "........"
      ]
    },
    "gridSlot": {
      "w": 8,
      "h": 8,
      "palette": {
        "g": "#1a2a3a",
        "d": "#0a1520"
      },
      "pixels": [
        "gggggggg",
        "g......g",
        "g......g",
        "g......g",
        "g......g",
        "g......g",
        "g......g",
        "gggggggg"
      ]
    }
  }
}

function drawSprite(ctx, spriteDef, x, y, size) {
  if (!spriteDef) return false
  var pw = size / spriteDef.w
  var ph = size / spriteDef.h
  for (var row = 0; row < spriteDef.h; row++) {
    var line = spriteDef.pixels[row]
    for (var col = 0; col < spriteDef.w; col++) {
      var ch = line[col]
      if (ch === ".") continue
      var color = spriteDef.palette[ch]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(x + col * pw, y + row * ph, Math.ceil(pw), Math.ceil(ph))
    }
  }
  return true
}

function getSprite(category, name) {
  return SPRITE_DEFS[category] && SPRITE_DEFS[category][name] || null
}
