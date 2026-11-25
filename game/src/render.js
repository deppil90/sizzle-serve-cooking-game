// Sizzle & Serve — every pixel the player sees: the kitchen, the order
// board, the ingredient counter, the grill, the assembly plate, the HUD
// timer and score, plus the title, pause and end-of-shift overlays.
// All art is drawn with canvas shapes, so the game needs no image files.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  var cfg = null;
  var ctx = null;

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(str, x, y, size, color, align, bold) {
    ctx.fillStyle = color || '#2c2118';
    ctx.font = (bold ? 'bold ' : '') + size + 'px Trebuchet MS, Verdana, sans-serif';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }

  function fmtClock(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  // One ingredient drawn as a chunky little icon: a bun is a dome, a patty
  // a brown slab, lettuce a wavy leaf, tomato a red disc, cheese a yellow
  // wedge, sauce a drizzle. size is the icon's width in pixels.
  function drawIngredient(id, cx, cy, size) {
    var def = window.Sizzle.ingredientById(id);
    if (!def) return;
    var s = size;
    ctx.save();
    ctx.translate(cx, cy);
    if (id === 'bun') {
      ctx.fillStyle = def.color;
      rr(-s / 2, -s * 0.32, s, s * 0.62, s * 0.28);
      ctx.fill();
      ctx.fillStyle = def.dark;
      ctx.fillRect(-s / 2, -s * 0.05, s, s * 0.08);
      ctx.fillStyle = '#fff2cf';
      [[-0.28, -0.18], [0, -0.24], [0.28, -0.18]].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p[0] * s, p[1] * s, s * 0.045, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (id === 'patty') {
      ctx.fillStyle = def.color;
      rr(-s / 2, -s * 0.22, s, s * 0.44, s * 0.2);
      ctx.fill();
      ctx.fillStyle = def.dark;
      for (var i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(i * s * 0.18, 0, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'lettuce') {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      for (var x = -s / 2; x <= s / 2; x += s / 8) {
        var y = Math.sin((x / s) * Math.PI * 3) * s * 0.12;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(s / 2, s * 0.22);
      ctx.lineTo(-s / 2, s * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = def.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (id === 'tomato') {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a8a';
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.12, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = def.dark;
      ctx.fillRect(-s * 0.06, -s * 0.42, s * 0.12, s * 0.12);
    } else if (id === 'cheese') {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.moveTo(-s / 2, s * 0.28);
      ctx.lineTo(s / 2, s * 0.28);
      ctx.lineTo(0, -s * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = def.dark;
      [[-0.18, 0.08], [0.14, 0.02]].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p[0] * s, p[1] * s, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (id === 'sauce') {
      ctx.strokeStyle = def.color;
      ctx.lineWidth = s * 0.14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s * 0.36, s * 0.1);
      ctx.quadraticCurveTo(0, -s * 0.34, s * 0.36, s * 0.08);
      ctx.stroke();
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(s * 0.36, s * 0.16, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawKitchen(state) {
    var c = cfg.colors;
    ctx.fillStyle = c.wall;
    ctx.fillRect(0, 0, cfg.width, cfg.height);
    ctx.fillStyle = c.wallTrim;
    ctx.fillRect(0, 96, cfg.width, 10);
    // wall tiles
    ctx.strokeStyle = 'rgba(160,120,70,0.25)';
    ctx.lineWidth = 2;
    for (var x = 0; x < cfg.width; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 96); ctx.stroke();
    }
    // hanging lamps
    [320, 640, 960].forEach(function (lx) {
      ctx.strokeStyle = '#7a5a34';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 34); ctx.stroke();
      ctx.fillStyle = '#ffc53d';
      ctx.beginPath(); ctx.arc(lx, 44, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,197,61,0.25)';
      ctx.beginPath(); ctx.arc(lx, 44, 30, 0, Math.PI * 2); ctx.fill();
    });
    // floor
    ctx.fillStyle = c.floor;
    ctx.fillRect(0, 560, cfg.width, 160);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var fx = 0; fx < cfg.width; fx += 120) ctx.fillRect(fx, 560, 4, 160);
    // back counter
    ctx.fillStyle = c.counter;
    ctx.fillRect(24, 470, cfg.width - 48, 90);
    ctx.fillStyle = c.counterTop;
    ctx.fillRect(24, 470, cfg.width - 48, 16);
    text('SIZZLE & SERVE  —  FOOD TRUCK KITCHEN', 48, 545, 18, '#fff6dd', 'left', true);
  }

  function drawOrderBoard(state) {
    var c = cfg.colors;
    ctx.fillStyle = c.board;
    rr(24, 116, 300, 330, 14);
    ctx.fill();
    ctx.fillStyle = c.boardPaper;
    rr(34, 126, 280, 310, 10);
    ctx.fill();
    text('ORDER BOARD', 174, 148, 22, '#3e2f23', 'center', true);
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(48, 166); ctx.lineTo(300, 166); ctx.stroke();

    if (!state.orders.length) {
      text('No orders yet —', 174, 220, 16, '#8a7a5c', 'center');
      text('the rush is coming!', 174, 244, 16, '#8a7a5c', 'center');
      return;
    }
    state.orders.forEach(function (order, i) {
      var y = 186 + i * 86;
      var ready = window.Sizzle.orders.matches(order, state.plate);
      ctx.fillStyle = ready ? '#e2f3d8' : '#fdf3d0';
      rr(44, y, 260, 78, 8);
      ctx.fill();
      ctx.strokeStyle = ready ? '#4a9e3f' : '#d8c49a';
      ctx.lineWidth = ready ? 3 : 1;
      rr(44, y, 260, 78, 8);
      ctx.stroke();
      text('#' + order.id + '  ' + order.recipe.name, 56, y + 16, 15, '#3e2f23', 'left', true);
      text('$' + order.recipe.price, 292, y + 16, 15, '#4a9e3f', 'right', true);
      order.recipe.stack.forEach(function (id, j) {
        drawIngredient(id, 64 + j * 30, y + 44, 24);
      });
      if (ready) {
        text('READY TO SERVE!', 174, y + 68, 13, '#4a9e3f', 'center', true);
        return;
      }
      var frac = Math.max(0, order.patienceMs / order.patienceMax);
      ctx.fillStyle = '#e0d3b2';
      rr(56, y + 62, 236, 10, 5);
      ctx.fill();
      ctx.fillStyle = order.flash ? (Math.floor(state.elapsedMs / 300) % 2 ? '#e5484d' : '#f08c1e') : (frac > 0.5 ? '#4a9e3f' : frac > 0.25 ? '#f08c1e' : '#e5484d');
      if (frac > 0) {
        rr(56, y + 62, 236 * frac, 10, 5);
        ctx.fill();
      }
    });
  }

  function drawStations(state) {
    var c = cfg.colors;
    text('INGREDIENTS — click, or press 1-6', 640, 586, 17, '#fff6dd', 'center', true);
    window.Sizzle.input.clear();
    cfg.ingredients.forEach(function (ing, i) {
      var x = 330 + i * 106;
      var y = 606;
      ctx.fillStyle = '#fff6dd';
      rr(x, y, 96, 92, 12);
      ctx.fill();
      ctx.strokeStyle = ing.dark;
      ctx.lineWidth = 2;
      rr(x, y, 96, 92, 12);
      ctx.stroke();
      drawIngredient(ing.id, x + 48, y + 34, 46);
      text(ing.name, x + 48, y + 70, 14, '#2c2118', 'center', true);
      text('[' + ing.key + ']' + (ing.grill ? ' grill' : ''), x + 48, y + 86, 11, '#8a7a5c', 'center');
      window.Sizzle.input.register('station-' + ing.id, { x: x, y: y, w: 96, h: 92 }, function (st) {
        window.Sizzle.kitchen.add(st, ing.id);
      });
    });
  }

  function drawGrill(state) {
    text('GRILL', 1090, 380, 18, '#3e2f23', 'center', true);
    state.grill.forEach(function (slot, i) {
      var x = 1000 + i * 118;
      var y = 396;
      ctx.fillStyle = '#4a4a4a';
      rr(x, y, 106, 84, 10);
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      for (var g = 0; g < 4; g++) {
        ctx.beginPath(); ctx.moveTo(x + 12 + g * 24, y + 8); ctx.lineTo(x + 12 + g * 24, y + 76); ctx.stroke();
      }
      if (slot.ingredient) {
        var def = window.Sizzle.ingredientById(slot.ingredient);
        var frac = Math.min(1, slot.progressMs / def.cookMs);
        drawIngredient(slot.ingredient, x + 53, y + 34, 44);
        ctx.fillStyle = '#e0d3b2';
        rr(x + 12, y + 66, 82, 8, 4);
        ctx.fill();
        ctx.fillStyle = slot.burnt ? '#e5484d' : slot.done ? '#4a9e3f' : '#f08c1e';
        rr(x + 12, y + 66, 82 * frac, 8, 4);
        ctx.fill();
        text(slot.burnt ? 'BURNT!' : slot.done ? 'READY!' : 'cooking…', x + 53, y + 94, 12, slot.burnt ? '#e5484d' : '#fff6dd', 'center', true);
        window.Sizzle.input.register('grill-' + i, { x: x, y: y, w: 106, h: 84 }, function (st) {
          window.Sizzle.kitchen.takeFromGrill(st, i);
        });
      } else {
        text('empty', x + 53, y + 42, 13, '#999', 'center');
      }
    });
  }

  function drawPlate(state) {
    var cx = 640;
    var cy = 430;
    ctx.fillStyle = cfg.colors.plate;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 150, 58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = cfg.colors.plateRim;
    ctx.lineWidth = 4;
    ctx.stroke();
    text('YOUR PLATE', cx, cy - 74, 16, '#3e2f23', 'center', true);
    if (!state.plate.length) {
      text('empty — add ingredients', cx, cy + 2, 15, '#b0a894', 'center');
    } else {
      state.plate.forEach(function (id, i) {
        var y = cy + 34 - i * 13;
        var w = 190 - i * 8;
        ctx.fillStyle = window.Sizzle.ingredientById(id).color;
        rr(cx - w / 2, y - 9, w, 15, 7);
        ctx.fill();
        ctx.strokeStyle = window.Sizzle.ingredientById(id).dark;
        ctx.lineWidth = 1;
        rr(cx - w / 2, y - 9, w, 15, 7);
        ctx.stroke();
      });
      state.plate.forEach(function (id, i) {
        text(window.Sizzle.ingredientById(id).name, cx + 162, cy + 30 - i * 13, 12, '#3e2f23', 'left', true);
      });
    }
    var ready = window.Sizzle.orders.matching(state.orders, state.plate);
    var bx = cx - 190;
    var by = 500;
    var pulse = ready ? 0.5 + 0.5 * Math.sin(state.elapsedMs / 180) : 0;
    ctx.fillStyle = ready ? '#4a9e3f' : '#3e2f23';
    rr(bx, by, 180, 52, 12);
    ctx.fill();
    ctx.strokeStyle = ready ? 'rgba(255,255,255,' + (0.4 + pulse * 0.6) + ')' : '#d8c49a';
    ctx.lineWidth = ready ? 4 : 2;
    rr(bx, by, 180, 52, 12);
    ctx.stroke();
    text('SERVE  [Space]', bx + 90, by + 26, 18, '#fff6dd', 'center', true);
    window.Sizzle.input.register('serve', { x: bx, y: by, w: 180, h: 52 }, function (st) {
      window.Sizzle.kitchen.serve(st);
    });
    ctx.fillStyle = '#5d4a33';
    rr(bx + 196, by, 120, 52, 12);
    ctx.fill();
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 2;
    rr(bx + 196, by, 120, 52, 12);
    ctx.stroke();
    text('CLEAR  [C]', bx + 256, by + 26, 15, '#fff6dd', 'center', true);
    window.Sizzle.input.register('clear', { x: bx + 196, y: by, w: 120, h: 52 }, function (st) {
      window.Sizzle.kitchen.clearPlate(st);
    });
    if (ready) {
      text('READY TO SERVE!', cx, cy - 96, 20, '#4a9e3f', 'center', true);
    }
  }

  function drawHud(state) {
    var c = cfg.colors;
    ctx.fillStyle = c.hud;
    ctx.fillRect(0, 0, cfg.width, 64);
    text('SIZZLE & SERVE', 24, 34, 26, '#ffc53d', 'left', true);
    // shift timer, big and central
    var urgent = state.timeLeftMs < 30000 && state.phase === 'playing';
    var tc = urgent ? (Math.floor(state.elapsedMs / 300) % 2 ? '#ff6b6b' : '#ffc53d') : '#fff6dd';
    text('TIME  ' + fmtClock(state.timeLeftMs), 640, 34, 30, tc, 'center', true);
    text('SCORE  ' + state.score, 900, 34, 22, '#fff6dd', 'center', true);
    text('$' + state.coins, 1024, 34, 22, '#7dc242', 'center', true);
    if (state.combo >= 2) text('COMBO x' + state.combo, 1130, 34, 18, '#ff8c42', 'center', true);
    // strikes
    for (var i = 0; i < cfg.maxStrikes; i++) {
      ctx.fillStyle = i < state.strikes ? '#e5484d' : 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.arc(60 + i * 26, 56, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    text('strikes', 140, 56, 11, 'rgba(255,255,255,0.6)', 'left');
    // mute + pause buttons
    ctx.fillStyle = '#4a3a28';
    rr(1196, 12, 68, 40, 8);
    ctx.fill();
    text(state.muted ? 'MUTED' : 'SOUND', 1230, 32, 13, '#fff6dd', 'center', true);
    window.Sizzle.input.register('mute', { x: 1196, y: 12, w: 68, h: 40 }, function (st) {
      st.muted = window.Sizzle.audio.toggleMute();
    });
  }

  function drawMessage(state) {
    if (!state.message || state.elapsedMs > state.messageUntilMs) return;
    ctx.fillStyle = 'rgba(44,33,24,0.92)';
    var w = ctx.measureText(state.message).width + 40;
    rr(640 - w / 2, 108, w, 36, 18);
    ctx.fill();
    text(state.message, 640, 126, 15, '#fff6dd', 'center');
  }

  function drawOverlay(state) {
    if (state.phase === 'title') {
      ctx.fillStyle = 'rgba(30,20,12,0.55)';
      ctx.fillRect(0, 0, cfg.width, cfg.height);
      ctx.fillStyle = '#fff6dd';
      rr(340, 150, 600, 400, 18);
      ctx.fill();
      text('SIZZLE & SERVE', 640, 210, 46, '#e5484d', 'center', true);
      text('Run the food-truck kitchen!', 640, 252, 20, '#3e2f23', 'center');
      text('Read the order board, stack the dish on your plate,', 640, 300, 16, '#5d4a33', 'center');
      text('grill patties until they ding, then SERVE before', 640, 324, 16, '#5d4a33', 'center');
      text('the customer walks out. 3-minute shift!', 640, 348, 16, '#5d4a33', 'center');
      text('Click ingredients or press 1-6  •  Space serves', 640, 396, 16, '#3e2f23', 'center', true);
      text('G grabs a patty  •  C clears the plate  •  P pauses', 640, 422, 15, '#5d4a33', 'center');
      ctx.fillStyle = '#e5484d';
      rr(520, 460, 240, 56, 12);
      ctx.fill();
      text('START SHIFT  [Enter]', 640, 488, 19, '#fff6dd', 'center', true);
      window.Sizzle.input.register('start', { x: 520, y: 460, w: 240, h: 56 }, function (st) {
        window.Sizzle.kitchen.start(st);
      });
    } else if (state.phase === 'paused') {
      ctx.fillStyle = 'rgba(30,20,12,0.6)';
      ctx.fillRect(0, 0, cfg.width, cfg.height);
      text('PAUSED', 640, 340, 52, '#fff6dd', 'center', true);
      text('Press P to keep cooking', 640, 396, 18, '#ffc53d', 'center');
    } else if (state.phase === 'over') {
      ctx.fillStyle = 'rgba(30,20,12,0.62)';
      ctx.fillRect(0, 0, cfg.width, cfg.height);
      ctx.fillStyle = '#fff6dd';
      rr(380, 140, 520, 430, 18);
      ctx.fill();
      text('SHIFT OVER', 640, 190, 40, '#e5484d', 'center', true);
      text(state.overReason, 640, 230, 16, '#5d4a33', 'center');
      text('SCORE  ' + state.score, 640, 286, 30, '#2c2118', 'center', true);
      text('Dishes served: ' + state.served + '    Coins earned: $' + state.coins, 640, 330, 17, '#3e2f23', 'center');
      text('Best combo: x' + state.bestCombo + '    Strikes: ' + state.strikes, 640, 360, 17, '#3e2f23', 'center');
      var stars = window.Sizzle.kitchen.stars(state);
      var starText = '';
      for (var s = 0; s < 3; s++) starText += s < stars ? '★ ' : '☆ ';
      text(starText, 640, 410, 34, '#ffc53d', 'center');
      text(stars === 3 ? 'Head-chef material!' : stars === 2 ? 'Solid shift, chef!' : stars === 1 ? 'A warm-up shift.' : 'The rush got away — try again!', 640, 452, 16, '#5d4a33', 'center');
      ctx.fillStyle = '#e5484d';
      rr(520, 486, 240, 52, 12);
      ctx.fill();
      text('COOK AGAIN  [Enter]', 640, 512, 18, '#fff6dd', 'center', true);
      window.Sizzle.input.register('restart', { x: 520, y: 486, w: 240, h: 52 }, function (st) {
        window.Sizzle.kitchen.start(st);
      });
    }
  }

  function draw(state, canvas) {
    cfg = window.Sizzle.cfg;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, cfg.width, cfg.height);
    drawKitchen(state);
    drawOrderBoard(state);
    drawPlate(state);
    drawGrill(state);
    drawStations(state);
    drawHud(state);
    drawMessage(state);
    drawOverlay(state);
  }

  window.Sizzle.render = {
    draw: draw,
    drawIngredient: drawIngredient,
    fmtClock: fmtClock
  };
})();
