// Cosmic Drifters — Data
// Config, typy czesci, uklady statkow, piloci, dzwieki, rozbudowana narracja
(function() {
  'use strict';
  var FA = window.FA;

  // === CONFIG ===
  FA.register('config', 'game', {
    canvasWidth: 1000,
    canvasHeight: 800,
    gridSize: 30,
    partProximity: 40,
    bulletSpeed: 10,
    bulletLife: 100,
    shootCooldown: 150,
    thrustBase: 0.4,
    turboMultiplier: 1.8,
    friction: 0.98,
    angularFriction: 0.9,
    enemySpawnDistance: 600,
    floatingPartLife: 900,
    pickupRadius: 45,
    maxEnemies: 6,
    dockRadius: 80,
    stationSize: 60,
    startCredits: 100,
    sellRatio: 0.5,
    sectorPriceScale: 0.15
  });

  FA.register('config', 'tradePrices', {
    engine: 40, gun: 60, cargo: 30, shield: 80
  });

  FA.register('config', 'colors', {
    bg: '#000a14',
    gridLine: '#0a1a2a',
    playerCore: '#0ff', playerEngine: '#4f4', playerGun: '#f4f',
    enemyCore: '#f84', enemyEngine: '#8f4', enemyGun: '#f44',
    cargo: '#ee4', shield: '#48f', disconnected: '#444',
    bulletFriendly: '#0ff', bulletEnemy: '#f66',
    text: '#cde', dim: '#556',
    narrative: '#c8b4ff',
    pilotBg: '#0a1520', pilotBorder: '#1a3a5a'
  });

  FA.register('config', 'scoring', {
    killMultiplier: 100,
    partCollectedMultiplier: 25,
    damageMultiplier: 2,
    survivalPerSecond: 1,
    sectorBonus: 200
  });

  // === TYPY CZESCI ===
  FA.register('partTypes', 'core',   { name: 'Rdzen',    mass: 10, maxHp: 8, char: 'O' });
  FA.register('partTypes', 'engine', { name: 'Silnik',   mass: 5,  maxHp: 3, char: 'E' });
  FA.register('partTypes', 'gun',    { name: 'Dzialo',   mass: 5,  maxHp: 2, char: 'G' });
  FA.register('partTypes', 'cargo',  { name: 'Ladownia', mass: 5,  maxHp: 2, char: 'C' });
  FA.register('partTypes', 'shield', { name: 'Tarcza',   mass: 8,  maxHp: 6, char: 'S' });

  // === UKLADY STATKOW ===
  FA.register('shipLayouts', 'player_default', {
    parts: [
      { x: 0, y: 0, type: 'core' },
      { x: 0, y: 30, type: 'engine' },
      { x: -30, y: 30, type: 'engine' },
      { x: 30, y: 30, type: 'engine' },
      { x: 0, y: -30, type: 'gun' },
      { x: -30, y: -30, type: 'gun' }
    ]
  });

  FA.register('shipLayouts', 'enemy_scout', {
    parts: [
      { x: 0, y: 0, type: 'core' },
      { x: 0, y: 30, type: 'engine' },
      { x: 0, y: -30, type: 'gun' }
    ]
  });

  FA.register('shipLayouts', 'enemy_fighter', {
    parts: [
      { x: 0, y: 0, type: 'core' },
      { x: 0, y: 30, type: 'engine' },
      { x: -30, y: 0, type: 'engine' },
      { x: 30, y: 0, type: 'engine' },
      { x: 0, y: -30, type: 'gun' },
      { x: -30, y: -30, type: 'gun' },
      { x: 30, y: -30, type: 'gun' }
    ]
  });

  FA.register('shipLayouts', 'enemy_heavy', {
    parts: [
      { x: 0, y: 0, type: 'core' },
      { x: 0, y: -60, type: 'gun' },
      { x: -30, y: -30, type: 'cargo' },
      { x: 30, y: -30, type: 'cargo' },
      { x: -60, y: 0, type: 'engine' },
      { x: 60, y: 0, type: 'engine' },
      { x: 0, y: 30, type: 'engine' },
      { x: 0, y: -30, type: 'shield' }
    ]
  });

  FA.register('shipLayouts', 'enemy_carrier', {
    parts: [
      { x: 0, y: 0, type: 'core' },
      { x: -30, y: 0, type: 'core' },
      { x: 30, y: 0, type: 'core' },
      { x: 0, y: 60, type: 'engine' },
      { x: -30, y: 60, type: 'engine' },
      { x: 30, y: 60, type: 'engine' },
      { x: 0, y: -30, type: 'gun' },
      { x: -60, y: -30, type: 'gun' },
      { x: 60, y: -30, type: 'gun' },
      { x: -30, y: -30, type: 'shield' },
      { x: 30, y: -30, type: 'shield' }
    ]
  });

  // === SEKTORY ===
  FA.register('sectors', 1, { name: 'Strefa Rozproszenia', enemies: ['enemy_scout'], count: 2, color: '#2a4a6a' });
  FA.register('sectors', 2, { name: 'Chmura Pylu', enemies: ['enemy_scout', 'enemy_fighter'], count: 3, color: '#3a3a5a' });
  FA.register('sectors', 3, { name: 'Pole Wrakow', enemies: ['enemy_fighter'], count: 3, color: '#4a2a3a' });
  FA.register('sectors', 4, { name: 'Pas Asteroidow', enemies: ['enemy_fighter', 'enemy_heavy'], count: 4, color: '#2a4a3a' });
  FA.register('sectors', 5, { name: 'Mgawica Krwi', enemies: ['enemy_heavy'], count: 4, color: '#5a1a2a' });
  FA.register('sectors', 6, { name: 'Strefa Ciszy', enemies: ['enemy_heavy', 'enemy_carrier'], count: 5, color: '#1a1a3a' });
  FA.register('sectors', 7, { name: 'Granica Pustki', enemies: ['enemy_carrier'], count: 3, color: '#0a0a2a' });

  // === GENERATOR PILOTOW ===
  FA.register('pilotGen', 'names_first', [
    'Kira', 'Zax', 'Nova', 'Renn', 'Vex', 'Syl', 'Jace', 'Nyx', 'Orin', 'Kael',
    'Thane', 'Lyra', 'Dex', 'Mira', 'Zan', 'Pyra', 'Colt', 'Vega', 'Ash', 'Rex',
    'Hex', 'Luna', 'Bolt', 'Faye', 'Grim', 'Echo', 'Blaze', 'Sable', 'Crow', 'Jade'
  ]);
  FA.register('pilotGen', 'names_last', [
    'Voidwalker', 'Nightshard', 'Stardust', 'Ironheart', 'Blackburn', 'Drift',
    'Chrome', 'Flux', 'Wraith', 'Storm', 'Cipher', 'Null', 'Vortex', 'Splicer',
    'Rust', 'Haze', 'Neon', 'Ghost', 'Wire', 'Frost', 'Pulse', 'Ember', 'Glitch'
  ]);
  FA.register('pilotGen', 'titles', [
    'Kapitan', 'Nawigator', 'Pilot', 'Zwiadowca', 'Weteran', 'Najemnik',
    'Korsarz', 'Strzelec', 'Inzynier', 'Technik', 'Dryftowiec', 'Samotnik'
  ]);
  FA.register('pilotGen', 'traits', [
    'Cybernetyczne oko', 'Blizna przez twarz', 'Implant sluchowy', 'Mechaniczna szczeka',
    'Wzmocniony kregoslup', 'Bioniczne ramie', 'Neurolacz', 'Taktyczny HUD',
    'Filtr oddechowy', 'Modulacja glosu', 'Wzmocnione reflexy', 'Syntetyczna skora'
  ]);
  FA.register('pilotGen', 'backgrounds', [
    'Uciekinier z kolonii gorniczej',
    'Byly pilot floty imperialnej',
    'Szmugler z Pasa Zewnetrznego',
    'Technik ze stacji Aether-7',
    'Dezerter z wojny korporacyjnej',
    'Odkrywca zaginionych sektorow',
    'Pirat z Mgawicy Krab',
    'Mechanik z orbitalnego stoczni',
    'Kurier miedzyplanetarny',
    'Agent wywiadu handlowego',
    'Lowca nagrod z Krancow',
    'Survivalista po katastrofie Proxima'
  ]);
  FA.register('pilotGen', 'skinTones',  ['#d4a574', '#c68c5a', '#8d5c3a', '#a37452', '#e8c4a0', '#6b4226']);
  FA.register('pilotGen', 'helmColors', ['#2a3a5a', '#3a2a4a', '#4a3a2a', '#2a4a3a', '#5a2a2a', '#1a3a4a', '#3a3a3a']);
  FA.register('pilotGen', 'visorColors', ['#0ff', '#f0f', '#ff0', '#0f0', '#f80', '#08f', '#f44', '#4ff']);
  FA.register('pilotGen', 'implantColors', ['#f44', '#0ff', '#ff0', '#f0f', '#4f4']);

  // Generuj pilota proceduralnie
  window.generatePilot = function(seed) {
    var s = seed || Math.floor(Math.random() * 99999);
    function seededRand() { s = (s * 16807 + 0) % 2147483647; return (s & 0x7fffffff) / 2147483647; }
    function pick(arr) { return arr[Math.floor(seededRand() * arr.length)]; }

    var firstName = pick(FA.lookup('pilotGen', 'names_first'));
    var lastName = pick(FA.lookup('pilotGen', 'names_last'));
    var title = pick(FA.lookup('pilotGen', 'titles'));
    var isCyborg = seededRand() > 0.5;
    var hasVisor = seededRand() > 0.3;
    var hasHelmet = seededRand() > 0.4;

    return {
      seed: seed || s,
      name: firstName + ' ' + lastName,
      title: title,
      background: pick(FA.lookup('pilotGen', 'backgrounds')),
      trait: isCyborg ? pick(FA.lookup('pilotGen', 'traits')) : null,
      // Portret
      skinTone: pick(FA.lookup('pilotGen', 'skinTones')),
      helmColor: hasHelmet ? pick(FA.lookup('pilotGen', 'helmColors')) : null,
      visorColor: hasVisor ? pick(FA.lookup('pilotGen', 'visorColors')) : null,
      implantColor: isCyborg ? pick(FA.lookup('pilotGen', 'implantColors')) : null,
      isCyborg: isCyborg,
      eyeColor: pick(['#4ef', '#f84', '#4f4', '#f4f', '#ff4', '#fff']),
      // Feature flags
      hasScar: seededRand() > 0.7,
      hasBreather: seededRand() > 0.75,
      hasMohawk: !hasHelmet && seededRand() > 0.6,
      hairColor: pick(['#ff0', '#f80', '#f0f', '#0ff', '#fff', '#444'])
    };
  };

  // === DZWIEKI ===
  FA.defineSound('shoot', function(actx, dest) {
    var osc = actx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, actx.currentTime + 0.05);
    osc.connect(dest); osc.start(); osc.stop(actx.currentTime + 0.05);
  });

  FA.defineSound('explosion', function(actx, dest) {
    var osc = actx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, actx.currentTime + 0.3);
    var g = actx.createGain();
    g.gain.setValueAtTime(0.8, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.3);
    osc.connect(g); g.connect(dest); osc.start(); osc.stop(actx.currentTime + 0.3);
  });

  FA.defineSound('sector_clear', function(actx, dest) {
    var t = actx.currentTime;
    [300, 400, 500, 700].forEach(function(freq, i) {
      var osc = actx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.12);
      osc.connect(dest); osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.15);
    });
  });

  FA.defineSound('pilot_encounter', function(actx, dest) {
    var osc = actx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, actx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(600, actx.currentTime + 0.2);
    osc.connect(dest); osc.start(); osc.stop(actx.currentTime + 0.2);
  });

  FA.defineSound('warp', function(actx, dest) {
    var osc = actx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, actx.currentTime + 0.5);
    var g = actx.createGain();
    g.gain.setValueAtTime(0.5, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.5);
    osc.connect(g); g.connect(dest); osc.start(); osc.stop(actx.currentTime + 0.5);
  });

  FA.defineSound('dock', function(actx, dest) {
    var t = actx.currentTime;
    [400, 600, 800].forEach(function(freq, i) {
      var osc = actx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      var g = actx.createGain();
      g.gain.setValueAtTime(0.3, t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.12);
      osc.connect(g); g.connect(dest); osc.start(t + i * 0.08); osc.stop(t + i * 0.08 + 0.12);
    });
  });

  FA.defineSound('trade', function(actx, dest) {
    var osc = actx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, actx.currentTime + 0.08);
    var g = actx.createGain();
    g.gain.setValueAtTime(0.4, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.1);
    osc.connect(g); g.connect(dest); osc.start(); osc.stop(actx.currentTime + 0.1);
  });

  FA.defineSound('undock', function(actx, dest) {
    var t = actx.currentTime;
    [800, 600, 400].forEach(function(freq, i) {
      var osc = actx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      var g = actx.createGain();
      g.gain.setValueAtTime(0.3, t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.12);
      osc.connect(g); g.connect(dest); osc.start(t + i * 0.08); osc.stop(t + i * 0.08 + 0.12);
    });
  });

  FA.defineSound('engine', function(actx, dest) {
    var t = actx.currentTime;
    var dur = 0.1;
    // Low rumble
    var osc = actx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55 + Math.random() * 15, t);
    osc.frequency.linearRampToValueAtTime(45 + Math.random() * 10, t + dur);
    // Noise texture via detuned square
    var osc2 = actx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(38 + Math.random() * 8, t);
    var g = actx.createGain();
    g.gain.setValueAtTime(0.06, t);
    g.gain.linearRampToValueAtTime(0.0, t + dur);
    var g2 = actx.createGain();
    g2.gain.setValueAtTime(0.02, t);
    g2.gain.linearRampToValueAtTime(0.0, t + dur);
    osc.connect(g); g.connect(dest);
    osc2.connect(g2); g2.connect(dest);
    osc.start(t); osc.stop(t + dur);
    osc2.start(t); osc2.stop(t + dur);
  });

  // === NARRACJA ===
  FA.register('config', 'narrative', {
    startNode: 'awakening',
    variables: {
      kills: 0, sector: 1, parts_collected: 0,
      pilots_met: 0, reputation: 0, ship_size: 6,
      has_ally: false, betrayed: false, knows_truth: false,
      credits: 100, trades_made: 0, stations_visited: 0
    },
    graph: {
      nodes: [
        { id: 'awakening', label: 'Przebudzenie', type: 'scene' },
        { id: 'first_drift', label: 'Pierwszy dryft', type: 'scene' },
        { id: 'first_kill', label: 'Pierwsza walka', type: 'scene' },
        { id: 'scavenger_meet', label: 'Scavenger', type: 'choice' },
        { id: 'scavenger_ally', label: 'Sojusznik', type: 'scene' },
        { id: 'scavenger_fight', label: 'Walka', type: 'scene' },
        { id: 'sector_2', label: 'Chmura Pylu', type: 'scene' },
        { id: 'distress_signal', label: 'SOS', type: 'choice' },
        { id: 'rescue_pilot', label: 'Ratunek', type: 'scene' },
        { id: 'ignore_signal', label: 'Ignorujesz', type: 'scene' },
        { id: 'sector_3', label: 'Pole Wrakow', type: 'scene' },
        { id: 'ghost_ship', label: 'Statek widmo', type: 'scene' },
        { id: 'ghost_data', label: 'Dane z wraku', type: 'scene' },
        { id: 'sector_4', label: 'Pas Asteroidow', type: 'scene' },
        { id: 'ambush', label: 'Zasadzka', type: 'scene' },
        { id: 'sector_5', label: 'Mgawica Krwi', type: 'scene' },
        { id: 'signal_source', label: 'Zrodlo', type: 'scene' },
        { id: 'the_truth', label: 'Prawda', type: 'choice' },
        { id: 'accept_truth', label: 'Akceptacja', type: 'scene' },
        { id: 'deny_truth', label: 'Odmowa', type: 'scene' },
        { id: 'sector_6', label: 'Strefa Ciszy', type: 'scene' },
        { id: 'ally_betrays', label: 'Zdrada', type: 'scene' },
        { id: 'ally_helps', label: 'Pomoc', type: 'scene' },
        { id: 'sector_7', label: 'Granica Pustki', type: 'scene' },
        { id: 'final_battle', label: 'Finalna walka', type: 'scene' },
        { id: 'victory_drift', label: 'Wolny dryft', type: 'scene' },
        { id: 'victory_return', label: 'Powrot', type: 'scene' },
        { id: 'destroyed', label: 'Zniszczony', type: 'scene' },
        { id: 'station_first_dock', label: 'Pierwsza stacja', type: 'scene' },
        { id: 'station_s1', label: 'Stacja S1', type: 'scene' },
        { id: 'station_s2', label: 'Stacja S2', type: 'scene' },
        { id: 'station_s3', label: 'Stacja S3', type: 'scene' },
        { id: 'station_s4', label: 'Stacja S4', type: 'scene' },
        { id: 'station_s5', label: 'Stacja S5', type: 'scene' },
        { id: 'station_s6', label: 'Stacja S6', type: 'scene' }
      ],
      edges: [
        { from: 'awakening', to: 'first_drift' },
        { from: 'first_drift', to: 'first_kill' },
        { from: 'first_kill', to: 'scavenger_meet' },
        { from: 'scavenger_meet', to: 'scavenger_ally' },
        { from: 'scavenger_meet', to: 'scavenger_fight' },
        { from: 'scavenger_ally', to: 'sector_2' },
        { from: 'scavenger_fight', to: 'sector_2' },
        { from: 'sector_2', to: 'distress_signal' },
        { from: 'distress_signal', to: 'rescue_pilot' },
        { from: 'distress_signal', to: 'ignore_signal' },
        { from: 'rescue_pilot', to: 'sector_3' },
        { from: 'ignore_signal', to: 'sector_3' },
        { from: 'sector_3', to: 'ghost_ship' },
        { from: 'ghost_ship', to: 'ghost_data' },
        { from: 'ghost_data', to: 'sector_4' },
        { from: 'sector_4', to: 'ambush' },
        { from: 'ambush', to: 'sector_5' },
        { from: 'sector_5', to: 'signal_source' },
        { from: 'signal_source', to: 'the_truth' },
        { from: 'the_truth', to: 'accept_truth' },
        { from: 'the_truth', to: 'deny_truth' },
        { from: 'accept_truth', to: 'sector_6' },
        { from: 'deny_truth', to: 'sector_6' },
        { from: 'sector_6', to: 'ally_betrays' },
        { from: 'sector_6', to: 'ally_helps' },
        { from: 'ally_betrays', to: 'sector_7' },
        { from: 'ally_helps', to: 'sector_7' },
        { from: 'sector_7', to: 'final_battle' },
        { from: 'final_battle', to: 'victory_drift' },
        { from: 'final_battle', to: 'victory_return' },
        { from: 'first_drift', to: 'station_first_dock' },
        { from: 'station_first_dock', to: 'station_s1' },
        { from: 'sector_2', to: 'station_s2' },
        { from: 'sector_3', to: 'station_s3' },
        { from: 'sector_4', to: 'station_s4' },
        { from: 'sector_5', to: 'station_s5' },
        { from: 'sector_6', to: 'station_s6' }
      ]
    }
  });

  // === TEKSTY NARRACYJNE ===
  FA.register('narrativeText', 'awakening', { text: 'Systemy online. Pamiec fragmentaryczna. Jestes sam w pustce.', color: '#c8b4ff' });
  FA.register('narrativeText', 'first_drift', { text: 'Silniki odpalaja. Statek odpowiada. Dryfujesz ku nieznanemu.', color: '#8ac4ff' });
  FA.register('narrativeText', 'first_kill', { text: 'Pierwszy wrog. Pierwszy wrak. Zbierz co zostalo.', color: '#ffb84a' });
  FA.register('narrativeText', 'scavenger_meet', { text: '>> "Hej, dryfterze. Mam czesci. Gadamy czy strzelamy?"', color: '#4ff' });
  FA.register('narrativeText', 'scavenger_ally', { text: 'Scavenger dolacza. Masz sojusznika. Na razie.', color: '#4f4' });
  FA.register('narrativeText', 'scavenger_fight', { text: 'Wybrales walke. Jego czesci sa teraz twoje.', color: '#f84' });
  FA.register('narrativeText', 'sector_2', { text: '— Sektor 2: Chmura Pylu. Widocznosc ograniczona.', color: '#8888cc' });
  FA.register('narrativeText', 'distress_signal', { text: '>> SOS: "Silniki padly... prosze... ktokolwiek..."', color: '#f44' });
  FA.register('narrativeText', 'rescue_pilot', { text: 'Uratowales pilota. Mowi o dziwnych sygnalach z glebi.', color: '#4f4' });
  FA.register('narrativeText', 'ignore_signal', { text: 'Sygnal cichnie. Nie kazdego da sie uratowac.', color: '#888' });
  FA.register('narrativeText', 'sector_3', { text: '— Sektor 3: Pole Wrakow. Setki martwych statkow.', color: '#aa6644' });
  FA.register('narrativeText', 'ghost_ship', { text: 'Statek widmo. Systemy wciaz aktywne. Logi ostatniego pilota...', color: '#8844aa' });
  FA.register('narrativeText', 'ghost_data', { text: '"...cos nas ciagnie w strone granicy..."', color: '#aa44aa' });
  FA.register('narrativeText', 'sector_4', { text: '— Sektor 4: Pas Asteroidow. Uwazaj na zasadzki.', color: '#44aa66' });
  FA.register('narrativeText', 'ambush', { text: 'ZASADZKA! Kilka statkow wyskakuje zza asteroidow!', color: '#f44' });
  FA.register('narrativeText', 'sector_5', { text: '— Sektor 5: Mgawica Krwi. Czerwona poswiate.', color: '#cc3344' });
  FA.register('narrativeText', 'signal_source', { text: 'Ogromna konstrukcja. Nie ludzka. Zrodlo wszystkich sygnalow.', color: '#ff44ff' });
  FA.register('narrativeText', 'the_truth', { text: '"Jestes kopia. Oryginal zginat dawno. Chcesz wiedziec wiecej?"', color: '#ff88ff' });
  FA.register('narrativeText', 'accept_truth', { text: 'Akceptujesz. Jestes tym, kim jestes.', color: '#88ff88' });
  FA.register('narrativeText', 'deny_truth', { text: 'Odrzucasz. Jestes prawdziwy. Nic innego sie nie liczy.', color: '#ff8844' });
  FA.register('narrativeText', 'sector_6', { text: '— Sektor 6: Strefa Ciszy. Martwa przestrzen.', color: '#334466' });
  FA.register('narrativeText', 'ally_betrays', { text: '"Przepraszam. Kazali mi." Sojusznik obraca dziala.', color: '#ff4444' });
  FA.register('narrativeText', 'ally_helps', { text: '"Jade z toba do konca, dryfterze."', color: '#44ff44' });
  FA.register('narrativeText', 'sector_7', { text: '— Sektor 7: Granica Pustki. Stad nie ma powrotu.', color: '#2244aa' });
  FA.register('narrativeText', 'final_battle', { text: 'STRAZNIK GRANICY. To jest koniec albo poczatek.', color: '#ffaa00' });
  FA.register('narrativeText', 'victory_drift', { text: 'Granica otwarta. Dryfujesz w nieskonczonosc. Wolny.', color: '#88ccff' });
  FA.register('narrativeText', 'victory_return', { text: 'Odwracasz sie. Wracasz. Ktos musi opowiedziec te historie.', color: '#ffcc88' });
  FA.register('narrativeText', 'destroyed', { text: 'Rdzen gasnie. Ciemnosc. Ale kopie dryfuja dalej...', color: '#ff4444' });

  // Stacyjne
  FA.register('narrativeText', 'station_first_dock', { text: 'Stacja dokujaca. Swiatla migaja. Moze znajdziesz tu cos uzytecznego.', color: '#4ff' });
  FA.register('narrativeText', 'station_s1', { text: '"Witaj, dryfterze. Strefa Rozproszenia to niebezpieczne miejsce. Moze potrzebujesz czegosc?"', color: '#4ff' });
  FA.register('narrativeText', 'station_s2', { text: '"Chmura Pylu niszczy silniki. Mam zapasowe. Za rozsadna cene."', color: '#88aacc' });
  FA.register('narrativeText', 'station_s3', { text: '"Pole Wrakow. Duzo towaru prosto z wrakow. Tanio, ale bez gwarancji."', color: '#aa8866' });
  FA.register('narrativeText', 'station_s4', { text: '"Pas Asteroidow to strefa wojenna. Tarcze? Dziala? Mam wszystko."', color: '#66aa88' });
  FA.register('narrativeText', 'station_s5', { text: '"Mgawica Krwi... Malo kto dociera tak daleko. Ceny premium, dryfterze."', color: '#cc6688' });
  FA.register('narrativeText', 'station_s6', { text: '"Ostatnia stacja przed Granica. Potem juz nic. Zaopatrz sie."', color: '#6666aa' });

})();
