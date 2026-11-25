// Sizzle & Serve — the kitchen state machine: the plate being assembled,
// the grill slots, the order board, the shift clock, score, coins, combo
// and strikes. Every rule of the game lives here; rendering only reads it.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  var cfg = null;

  function freshState(seed) {
    cfg = window.Sizzle.cfg;
    var rng = window.Sizzle.makeRng(seed || 1);
    var state = {
      seed: seed || 1,
      rng: rng,
      phase: 'title', // title | playing | paused | over
      timeLeftMs: cfg.shiftSeconds * 1000,
      elapsedMs: 0,
      orders: [],
      plate: [],
      grill: [],
      score: 0,
      coins: 0,
      served: 0,
      combo: 0,
      bestCombo: 0,
      strikes: 0,
      spawnInMs: 2500,
      message: '',
      messageUntilMs: 0,
      overReason: '',
      lastTickSecond: -1,
      muted: false
    };
    for (var i = 0; i < cfg.grillSlots; i++) {
      state.grill.push({ ingredient: null, progressMs: 0, done: false, burnt: false });
    }
    return state;
  }

  function startShift(state) {
    state.phase = 'playing';
    state.timeLeftMs = cfg.shiftSeconds * 1000;
    state.elapsedMs = 0;
    state.orders = [];
    state.plate = [];
    state.score = 0;
    state.coins = 0;
    state.served = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.strikes = 0;
    state.spawnInMs = 1200;
    state.overReason = '';
    state.lastTickSecond = -1;
    state.grill.forEach(function (slot) {
      slot.ingredient = null;
      slot.progressMs = 0;
      slot.done = false;
      slot.burnt = false;
    });
    spawnOrder(state);
    spawnOrder(state);
    setMessage(state, 'Shift started! Build what the board asks for.', 2600);
    window.Sizzle.audio.unlock();
  }

  function setMessage(state, text, durMs) {
    state.message = text;
    state.messageUntilMs = state.elapsedMs + (durMs || 2200);
  }

  function spawnOrder(state) {
    if (state.orders.length >= cfg.maxOrders) return;
    var order = window.Sizzle.orders.create(state.rng, state.elapsedMs / 1000);
    state.orders.push(order);
  }

  // Add an ingredient to the plate. Patties must be grilled first: tapping
  // Patty sends it to the grill instead of straight onto the plate.
  function addIngredient(state, id) {
    if (state.phase !== 'playing') return 'not-playing';
    var def = window.Sizzle.ingredientById(id);
    if (!def) return 'unknown';
    if (def.grill) return placeOnGrill(state, id);
    if (state.plate.length >= 6) {
      setMessage(state, 'Plate is full! Serve it or clear it.', 1800);
      window.Sizzle.audio.wrong();
      return 'full';
    }
    state.plate.push(id);
    window.Sizzle.audio.add();
    return 'added';
  }

  function placeOnGrill(state, id) {
    for (var i = 0; i < state.grill.length; i++) {
      var slot = state.grill[i];
      if (!slot.ingredient) {
        slot.ingredient = id;
        slot.progressMs = 0;
        slot.done = false;
        slot.burnt = false;
        window.Sizzle.audio.grill();
        setMessage(state, 'Patty on the grill — take it off when it dings!', 2000);
        return 'grilling';
      }
    }
    setMessage(state, 'Grill is full! Wait for a patty to finish.', 1800);
    window.Sizzle.audio.wrong();
    return 'grill-full';
  }

  // Take a patty off the grill onto the plate. Raw is refused, burnt is
  // refused (and tossed), done goes on the plate.
  function takeFromGrill(state, index) {
    if (state.phase !== 'playing') return 'not-playing';
    var slot = state.grill[index];
    if (!slot || !slot.ingredient) return 'empty';
    if (slot.burnt) {
      slot.ingredient = null;
      slot.progressMs = 0;
      slot.burnt = false;
      slot.done = false;
      setMessage(state, 'Burnt patty tossed. Watch the grill!', 2000);
      window.Sizzle.audio.wrong();
      return 'burnt';
    }
    if (!slot.done) {
      setMessage(state, 'Still raw! Let it cook until it dings.', 1800);
      window.Sizzle.audio.wrong();
      return 'raw';
    }
    if (state.plate.length >= 6) {
      setMessage(state, 'Plate is full! Serve it or clear it.', 1800);
      return 'full';
    }
    state.plate.push(slot.ingredient);
    slot.ingredient = null;
    slot.progressMs = 0;
    slot.done = false;
    window.Sizzle.audio.add();
    return 'added';
  }

  function clearPlate(state) {
    if (state.phase !== 'playing') return;
    if (!state.plate.length) return;
    state.plate = [];
    window.Sizzle.audio.click();
    setMessage(state, 'Plate cleared. Start the dish again.', 1400);
  }

  // Serve the plate. A matching ticket pays coins and points with a combo
  // bonus; a wrong plate costs a strike and breaks the combo.
  function serve(state) {
    if (state.phase !== 'playing') return 'not-playing';
    if (!state.plate.length) {
      setMessage(state, 'Nothing on the plate yet!', 1500);
      return 'empty';
    }
    var order = window.Sizzle.orders.matching(state.orders, state.plate);
    if (!order) {
      state.strikes++;
      state.combo = 0;
      state.score = Math.max(0, state.score - cfg.wrongServePenalty);
      window.Sizzle.audio.wrong();
      if (state.strikes >= cfg.maxStrikes) {
        endShift(state, 'Too many wrong serves — the lunch rush walked out!');
        return 'shift-over';
      }
      setMessage(state, 'Wrong dish! No ticket wants that stack.', 2200);
      return 'wrong';
    }
    var comboBonus = state.combo * 25;
    var timeBonus = Math.round((order.patienceMs / order.patienceMax) * 50);
    var earned = cfg.serveBasePoints + comboBonus + timeBonus;
    state.score += earned;
    state.coins += order.recipe.price;
    state.served++;
    state.combo++;
    if (state.combo > state.bestCombo) state.bestCombo = state.combo;
    state.orders.splice(state.orders.indexOf(order), 1);
    state.plate = [];
    window.Sizzle.audio.serve();
    window.Sizzle.audio.coin();
    setMessage(state, order.recipe.name + ' served! +' + earned + ' pts, $' + order.recipe.price, 2400);
    return 'served';
  }

  function endShift(state, reason) {
    state.phase = 'over';
    state.overReason = reason || 'Shift complete!';
    window.Sizzle.audio.grillStopped();
    window.Sizzle.audio.fanfare();
  }

  // One simulation step: clock, spawning, patience, grill progress.
  function tick(state, dtMs) {
    if (state.phase !== 'playing') return;
    state.elapsedMs += dtMs;
    state.timeLeftMs -= dtMs;

    var whole = Math.ceil(state.timeLeftMs / 1000);
    if (whole !== state.lastTickSecond) {
      state.lastTickSecond = whole;
      if (whole <= 10 && whole > 0) window.Sizzle.audio.tick();
    }
    if (state.timeLeftMs <= 0) {
      state.timeLeftMs = 0;
      endShift(state, 'Shift complete! The dinner crowd is happy.');
      return;
    }

    state.spawnInMs -= dtMs;
    if (state.spawnInMs <= 0) {
      spawnOrder(state);
      state.spawnInMs = cfg.orderSpawnMs * (0.85 + state.rng() * 0.3);
    }

    for (var i = state.orders.length - 1; i >= 0; i--) {
      if (window.Sizzle.orders.tick(state.orders[i], dtMs) === 'expired') {
        state.orders.splice(i, 1);
        state.combo = 0;
        state.score = Math.max(0, state.score - cfg.expiredOrderPenalty);
        window.Sizzle.audio.wrong();
        setMessage(state, 'A customer walked out! -' + cfg.expiredOrderPenalty + ' pts.', 2200);
      }
    }

    var anyGrilling = false;
    state.grill.forEach(function (slot) {
      if (!slot.ingredient || slot.burnt) return;
      anyGrilling = true;
      slot.progressMs += dtMs;
      var def = window.Sizzle.ingredientById(slot.ingredient);
      if (!slot.done && slot.progressMs >= def.cookMs) {
        slot.done = true;
        window.Sizzle.audio.grillDone();
        setMessage(state, 'Patty is ready — grab it before it burns!', 2200);
      } else if (slot.done && slot.progressMs >= cfg.grillBurnMs) {
        slot.burnt = true;
        window.Sizzle.audio.wrong();
        setMessage(state, 'A patty burnt on the grill!', 2000);
      }
    });
    if (!anyGrilling) window.Sizzle.audio.grillStopped();
  }

  function starsFor(state) {
    if (state.served >= 12) return 3;
    if (state.served >= 8) return 2;
    if (state.served >= 4) return 1;
    return 0;
  }

  window.Sizzle.kitchen = {
    fresh: freshState,
    start: startShift,
    tick: tick,
    add: addIngredient,
    takeFromGrill: takeFromGrill,
    clearPlate: clearPlate,
    serve: serve,
    end: endShift,
    message: setMessage,
    stars: starsFor
  };
})();
