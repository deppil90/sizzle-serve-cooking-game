// Sizzle & Serve — orders: what customers want, how long they will wait,
// and whether the plate on the counter matches a ticket on the board.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  var nextId = 1;

  // Build a fresh order from the seeded RNG: a recipe, a patience clock,
  // and the coins it pays. Harder recipes appear as the shift goes on.
  function createOrder(rng, elapsedSeconds) {
    var cfg = window.Sizzle.cfg;
    var pool = cfg.recipes.filter(function (r) {
      if (elapsedSeconds < 45) return r.stack.length <= 4;
      if (elapsedSeconds < 120) return r.stack.length <= 5;
      return true;
    });
    var recipe = window.Sizzle.pick(rng, pool.length ? pool : cfg.recipes);
    return {
      id: nextId++,
      recipe: recipe,
      patienceMs: cfg.patienceMs,
      patienceMax: cfg.patienceMs,
      flash: false
    };
  }

  // Count an order's patience down. Returns 'expired' once, then 'ok'.
  function tickOrder(order, dtMs) {
    order.patienceMs -= dtMs;
    if (order.patienceMs <= 0) return 'expired';
    order.flash = order.patienceMs < 12000;
    return 'ok';
  }

  // True when the plate's stack, bottom to top, is exactly the recipe.
  function plateMatches(order, plate) {
    var want = order.recipe.stack;
    if (want.length !== plate.length) return false;
    for (var i = 0; i < want.length; i++) {
      if (want[i] !== plate[i]) return false;
    }
    return true;
  }

  // Find the first open order the plate satisfies, or null.
  function matchingOrder(orders, plate) {
    for (var i = 0; i < orders.length; i++) {
      if (plateMatches(orders[i], plate)) return orders[i];
    }
    return null;
  }

  // How close the plate is to an order: shared prefix length, for hints.
  function plateProgress(order, plate) {
    var want = order.recipe.stack;
    var n = 0;
    while (n < plate.length && n < want.length && plate[n] === want[n]) n++;
    return n;
  }

  window.Sizzle.orders = {
    create: createOrder,
    tick: tickOrder,
    matches: plateMatches,
    matching: matchingOrder,
    progress: plateProgress
  };
})();
