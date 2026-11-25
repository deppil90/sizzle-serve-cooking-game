// Sizzle & Serve — mouse and keyboard input. Clicks are mapped to the
// kitchen's hot zones (ingredient stations, grill slots, serve/clear, HUD
// buttons); keys mirror the same actions so the game plays either way.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  var zones = [];

  function registerZone(id, rect, action) {
    zones.push({ id: id, rect: rect, action: action });
  }

  function clearZones() {
    zones = [];
  }

  function toGameCoords(canvas, clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    var cfg = window.Sizzle.cfg;
    return {
      x: (clientX - r.left) * (cfg.width / r.width),
      y: (clientY - r.top) * (cfg.height / r.height)
    };
  }

  function handleClick(canvas, state, clientX, clientY) {
    window.Sizzle.audio.unlock();
    var p = toGameCoords(canvas, clientX, clientY);
    for (var i = zones.length - 1; i >= 0; i--) {
      var z = zones[i];
      if (p.x >= z.rect.x && p.x <= z.rect.x + z.rect.w &&
          p.y >= z.rect.y && p.y <= z.rect.y + z.rect.h) {
        z.action(state);
        return z.id;
      }
    }
    return null;
  }

  function handleKey(state, key) {
    var k = key.toLowerCase();
    window.Sizzle.audio.unlock();
    if (state.phase === 'title' && (k === 'enter' || k === ' ')) {
      window.Sizzle.kitchen.start(state);
      return 'start';
    }
    if (state.phase === 'over' && (k === 'enter' || k === 'r')) {
      window.Sizzle.kitchen.start(state);
      return 'restart';
    }
    if (k === 'p' && (state.phase === 'playing' || state.phase === 'paused')) {
      state.phase = state.phase === 'playing' ? 'paused' : 'playing';
      return 'pause';
    }
    if (state.phase !== 'playing') return null;
    if (k === ' ') {
      window.Sizzle.kitchen.serve(state);
      return 'serve';
    }
    if (k === 'c') {
      window.Sizzle.kitchen.clearPlate(state);
      return 'clear';
    }
    if (k === 'm') {
      state.muted = window.Sizzle.audio.toggleMute();
      return 'mute';
    }
    if (k === 'g') {
      window.Sizzle.kitchen.takeFromGrill(state, 0);
      return 'grill-take';
    }
    var cfg = window.Sizzle.cfg;
    for (var i = 0; i < cfg.ingredients.length; i++) {
      if (cfg.ingredients[i].key === k) {
        window.Sizzle.kitchen.add(state, cfg.ingredients[i].id);
        return 'ingredient-' + cfg.ingredients[i].id;
      }
    }
    return null;
  }

  function attach(canvas, state) {
    canvas.addEventListener('pointerdown', function (ev) {
      handleClick(canvas, state, ev.clientX, ev.clientY);
    });
    window.addEventListener('keydown', function (ev) {
      if ([' ', 'arrowup', 'arrowdown'].indexOf(ev.key.toLowerCase()) !== -1) {
        ev.preventDefault();
      }
      handleKey(state, ev.key);
    });
  }

  window.Sizzle.input = {
    register: registerZone,
    clear: clearZones,
    click: handleClick,
    key: handleKey,
    attach: attach
  };
})();
