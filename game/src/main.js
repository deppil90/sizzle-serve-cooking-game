// Sizzle & Serve — boot and main loop. Reads ?shot= and ?seed= from the
// URL: a shot name stages a fixed moment for screenshots, otherwise the
// game starts on its title screen. Runs on requestAnimationFrame.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  var canvas = null;
  var state = null;
  var lastTs = 0;

  function params() {
    var q = new URLSearchParams(window.location.search);
    return {
      shot: q.get('shot') || '',
      seed: parseInt(q.get('seed') || '1', 10) || 1
    };
  }

  function frame(ts) {
    var dt = lastTs ? Math.min(100, ts - lastTs) : 16;
    lastTs = ts;
    if (state.phase === 'playing') window.Sizzle.kitchen.tick(state, dt);
    window.Sizzle.render.draw(state, canvas);
    window.requestAnimationFrame(frame);
  }

  function boot() {
    canvas = document.getElementById('game');
    var p = params();
    state = window.Sizzle.kitchen.fresh(p.seed);
    if (p.shot) {
      window.Sizzle.shots.apply(state, p.shot);
    } else {
      // A lively kitchen behind the title screen.
      state.orders = [
        window.Sizzle.orders.create(state.rng, 0),
        window.Sizzle.orders.create(state.rng, 0)
      ];
    }
    window.Sizzle.input.attach(canvas, state);
    window.requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
