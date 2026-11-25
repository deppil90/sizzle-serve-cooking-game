// Sizzle & Serve — staged screenshot states. ?shot=start|play|serve|end
// (with &seed=N) rebuilds a fixed, lively moment of the game so the
// screenshots are real renders of the game's own code, not mock-ups.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  function fillOrders(state, names) {
    state.orders = [];
    names.forEach(function (name) {
      var recipe = window.Sizzle.recipeByName(name);
      var order = window.Sizzle.orders.create(state.rng, 30);
      order.recipe = recipe;
      state.orders.push(order);
    });
  }

  function applyShot(state, shot) {
    var cfg = window.Sizzle.cfg;
    if (shot === 'start') {
      // Title screen over a fresh, busy kitchen: board full, timer at 3:00.
      state.phase = 'title';
      state.timeLeftMs = cfg.shiftSeconds * 1000;
      state.elapsedMs = 0;
      fillOrders(state, ['Classic Burger', 'Cheese Melt', 'Garden Stack']);
      state.plate = [];
      window.Sizzle.kitchen.message(state, 'Welcome to the truck! Press Enter to start.', 999999);
    } else if (shot === 'play') {
      // Mid-shift, mid-assembly: a half-built burger, a patty on the grill.
      state.phase = 'playing';
      state.timeLeftMs = 134000;
      state.elapsedMs = 46000;
      fillOrders(state, ['Classic Burger', 'Double Trouble', 'Saucy Stack']);
      state.orders[0].patienceMs = 30000;
      state.orders[1].patienceMs = 42000;
      state.orders[2].patienceMs = 18000;
      state.plate = ['bun', 'patty', 'lettuce'];
      state.grill[0] = { ingredient: 'patty', progressMs: 3500, done: false, burnt: false };
      state.score = 340;
      state.coins = 26;
      state.combo = 2;
      state.served = 3;
      window.Sizzle.kitchen.message(state, 'Patty on the grill — take it off when it dings!', 999999);
    } else if (shot === 'serve') {
      // A finished Classic Burger on the plate, its ticket lit up READY.
      state.phase = 'playing';
      state.timeLeftMs = 92000;
      state.elapsedMs = 88000;
      fillOrders(state, ['Classic Burger', 'Garden Stack', 'Sunny Burger']);
      state.orders[0].patienceMs = 26000;
      state.orders[1].patienceMs = 40000;
      state.orders[2].patienceMs = 12000;
      state.plate = ['bun', 'patty', 'lettuce', 'tomato'];
      state.score = 610;
      state.coins = 41;
      state.combo = 3;
      state.served = 5;
      window.Sizzle.kitchen.message(state, 'Classic Burger ready — SERVE it now!', 999999);
    } else if (shot === 'end') {
      // End-of-shift summary with a 3-star result.
      state.phase = 'over';
      state.timeLeftMs = 0;
      state.elapsedMs = cfg.shiftSeconds * 1000;
      fillOrders(state, ['Cheese Melt']);
      state.plate = [];
      state.score = 1480;
      state.coins = 96;
      state.served = 13;
      state.combo = 0;
      state.bestCombo = 5;
      state.strikes = 1;
      state.overReason = 'Shift complete! The dinner crowd is happy.';
    }
    return state;
  }

  window.Sizzle.shots = { apply: applyShot };
})();
