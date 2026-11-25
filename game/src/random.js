// Sizzle & Serve — a tiny seeded random-number generator so a screenshot
// mode (or a replay) can rebuild the exact same orders every time.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  // mulberry32: small, fast, and fully deterministic for a given seed.
  function makeRng(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, list) {
    return list[Math.floor(rng() * list.length)];
  }

  function range(rng, min, max) {
    return min + rng() * (max - min);
  }

  function intRange(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  window.Sizzle.makeRng = makeRng;
  window.Sizzle.pick = pick;
  window.Sizzle.range = range;
  window.Sizzle.intRange = intRange;
})();
