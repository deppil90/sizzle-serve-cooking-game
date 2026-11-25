// Sizzle & Serve — all sound is synthesized live with WebAudio, so the game
// ships no audio files and makes no network request. Sounds are short
// oscillator blips: a sizzle loop while a patty grills, a ding on a serve,
// a low buzz on a mistake, and a coin arpeggio on a combo.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  var ctx = null;
  var muted = false;
  var sizzleNodes = null;

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  }

  function unlock() {
    var c = ensureCtx();
    if (c && c.state === 'suspended') c.resume();
  }

  function blip(freq, durMs, type, gain, whenMs) {
    if (muted) return;
    var c = ensureCtx();
    if (!c) return;
    var t0 = c.currentTime + (whenMs || 0) / 1000;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(gain || 0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + durMs / 1000 + 0.02);
  }

  function startSizzle() {
    if (muted || sizzleNodes) return;
    var c = ensureCtx();
    if (!c) return;
    var buffer = c.createBuffer(1, c.sampleRate * 1, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    var filter = c.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;
    var g = c.createGain();
    g.gain.value = 0.03;
    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start();
    sizzleNodes = { src: src, gain: g };
  }

  function stopSizzle() {
    if (!sizzleNodes) return;
    try { sizzleNodes.src.stop(); } catch (e) { /* already stopped */ }
    sizzleNodes = null;
  }

  window.Sizzle.audio = {
    unlock: unlock,
    isMuted: function () { return muted; },
    toggleMute: function () {
      muted = !muted;
      if (muted) stopSizzle();
      return muted;
    },
    click: function () { blip(660, 60, 'triangle', 0.08); },
    add: function () { blip(520, 90, 'sine', 0.10); blip(780, 70, 'sine', 0.07, 60); },
    grill: function () { blip(220, 120, 'sawtooth', 0.06); startSizzle(); },
    grillDone: function () { blip(880, 120, 'sine', 0.10); blip(1174, 160, 'sine', 0.10, 110); },
    grillStopped: stopSizzle,
    serve: function () {
      blip(523, 110, 'sine', 0.12);
      blip(659, 110, 'sine', 0.12, 100);
      blip(784, 200, 'sine', 0.12, 200);
    },
    coin: function () { blip(988, 80, 'square', 0.05); blip(1319, 140, 'square', 0.05, 70); },
    wrong: function () { blip(160, 220, 'sawtooth', 0.10); blip(120, 260, 'sawtooth', 0.10, 120); },
    tick: function () { blip(980, 40, 'sine', 0.05); },
    fanfare: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { blip(f, 220, 'triangle', 0.12, i * 140); });
    }
  };
})();
