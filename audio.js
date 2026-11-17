// The score is composed in sixteen-step phrases. Every voice is synthesized locally.
const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const modes = {
  menu: {
    bpm: 72,
    bass: [38, 34, 41, 36],
    melody: [
      81,
      null,
      null,
      76,
      null,
      74,
      null,
      null,
      77,
      null,
      72,
      null,
      69,
      null,
      null,
      null,
    ],
  },
  shop: {
    bpm: 78,
    bass: [46, 41, 48, 43],
    melody: [
      74,
      null,
      77,
      null,
      null,
      81,
      null,
      null,
      79,
      null,
      null,
      76,
      null,
      72,
      null,
      null,
    ],
  },
  combat: {
    bpm: 108,
    bass: [38, 34, 36, 33],
    melody: [
      74,
      null,
      81,
      null,
      77,
      null,
      null,
      76,
      74,
      null,
      69,
      null,
      72,
      null,
      76,
      null,
    ],
  },
  boss: {
    bpm: 126,
    bass: [38, 37, 34, 33],
    melody: [
      74,
      null,
      75,
      81,
      null,
      77,
      76,
      null,
      69,
      null,
      72,
      75,
      null,
      76,
      69,
      null,
    ],
  },
  victory: {
    bpm: 84,
    bass: [41, 46, 48, 41],
    melody: [
      77,
      null,
      81,
      null,
      84,
      null,
      null,
      null,
      86,
      null,
      null,
      84,
      null,
      81,
      null,
      null,
    ],
  },
  defeat: {
    bpm: 62,
    bass: [38, 34, 31, 33],
    melody: [
      74,
      null,
      null,
      null,
      69,
      null,
      null,
      null,
      65,
      null,
      null,
      null,
      64,
      null,
      null,
      null,
    ],
  },
};
class Soundtrack {
  constructor() {
    this.mode = "menu";
    this.energy = 0;
    this.music = 0.55;
    this.sfx = 0.75;
    this.muted = false;
    this.step = 0;
    this.last = new Map();
  }
  async unlock() {
    try {
      if (!this.ctx) {
        const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Audio) return false;
        const ctx = (this.ctx = new Audio());
        this.master = ctx.createDynamicsCompressor();
        this.master.threshold.value = -16;
        this.master.ratio.value = 4;
        this.master.connect(ctx.destination);
        this.musicBus = ctx.createGain();
        this.sfxBus = ctx.createGain();
        this.musicBus.connect(this.master);
        this.sfxBus.connect(this.master);
        // A short filtered echo gives the glass instruments a sense of space.
        const delay = ctx.createDelay(0.8),
          feedback = ctx.createGain(),
          highcut = ctx.createBiquadFilter();
        delay.delayTime.value = 0.29;
        highcut.type = "lowpass";
        highcut.frequency.value = 1800;
        feedback.gain.value = 0.21;
        delay.connect(highcut);
        highcut.connect(feedback);
        feedback.connect(delay);
        feedback.connect(this.musicBus);
        this.echo = delay;
        this.noise = ctx.createBuffer(
          1,
          Math.floor(ctx.sampleRate * 0.65),
          ctx.sampleRate,
        );
        const data = this.noise.getChannelData(0);
        let seed = 0x6273;
        for (let i = 0; i < data.length; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          data[i] = seed / 2147483648 - 1;
        }
        this.mix();
        this.next = ctx.currentTime + 0.035;
        this.timer = setInterval(() => this.tick(), 65);
      }
      if (this.ctx.state !== "running") await this.ctx.resume();
      this.tick();
      return true;
    } catch {
      return false;
    }
  }
  mix() {
    if (!this.ctx) return;
    this.musicBus.gain.setTargetAtTime(
      this.muted ? 0 : this.music,
      this.ctx.currentTime,
      0.035,
    );
    this.sfxBus.gain.setTargetAtTime(
      this.muted ? 0 : this.sfx,
      this.ctx.currentTime,
      0.025,
    );
  }
  volume(music, sfx) {
    if (Number.isFinite(music)) this.music = Math.max(0, Math.min(1, music));
    if (Number.isFinite(sfx)) this.sfx = Math.max(0, Math.min(1, sfx));
    this.mix();
  }
  mute(value) {
    this.muted = Boolean(value);
    this.mix();
  }
  intensity(value) {
    this.energy = Math.max(0, Math.min(1, value || 0));
  }
  scene(mode) {
    if (!modes[mode] || mode === this.mode) return;
    this.mode = mode;
    this.step = 0;
    this.energy = 0;
    if (this.ctx) this.next = this.ctx.currentTime + 0.08;
  }
  voice({
    at,
    freq,
    end = freq,
    len,
    amp = 0.08,
    type = "sine",
    attack = 0.006,
    bus = this.musicBus,
    filter = 4200,
    verb = false,
  }) {
    const ctx = this.ctx;
    const signal =
      type === "noise" ? ctx.createBufferSource() : ctx.createOscillator();
    if (type === "noise") signal.buffer = this.noise;
    else {
      signal.type = type;
      signal.frequency.setValueAtTime(freq, at);
      if (end !== freq)
        signal.frequency.exponentialRampToValueAtTime(
          Math.max(10, end),
          at + len,
        );
    }
    const tone = ctx.createBiquadFilter(),
      envelope = ctx.createGain();
    tone.type = "lowpass";
    tone.frequency.value = filter;
    tone.Q.value = 0.4;
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(
      amp,
      at + Math.min(attack, len * 0.45),
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + len);
    signal.connect(tone);
    tone.connect(envelope);
    envelope.connect(bus);
    if (verb) envelope.connect(this.echo);
    signal.onended = () => {
      signal.disconnect();
      tone.disconnect();
      envelope.disconnect();
    };
    signal.start(at);
    signal.stop(at + len + 0.01);
  }
  tick() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    if (this.next < ctx.currentTime) this.next = ctx.currentTime + 0.025;
    const music = modes[this.mode],
      beat = 60 / music.bpm,
      stepLen = beat / 4;
    while (this.next < ctx.currentTime + 0.15) {
      if (!this.muted && this.music > 0) this.note(music, beat, this.next);
      this.next += stepLen;
      this.step = (this.step + 1) % 128;
    }
  }
  note(music, beat, at) {
    const pos = this.step % 16,
      bar = Math.floor(this.step / 16),
      root = music.bass[bar % 4];
    const fight = this.mode === "combat" || this.mode === "boss",
      heavy = this.mode === "boss" || this.energy > 0.63;
    if (pos === 0) {
      // A low bowed pad, open fifth, and moving upper voice.
      for (const [interval, amp] of [
        [0, 0.13],
        [7, 0.073],
        [bar % 4 === 1 ? 16 : 15, 0.046],
      ])
        this.voice({
          at,
          freq: midi(root + interval),
          len: beat * 3.95,
          attack: 0.19,
          amp,
          type: "triangle",
          filter: 1300,
        });
    }
    const pitch = music.melody[pos];
    if (pitch != null && (!fight || bar % 2 === 0 || heavy)) {
      const freq = midi(pitch + (bar % 4 === 1 ? -2 : bar % 4 === 2 ? 2 : 0));
      this.voice({
        at,
        freq,
        len: beat * (fight ? 0.76 : 1.5),
        amp: 0.073,
        verb: true,
      });
      this.voice({
        at,
        freq: freq * 2.01,
        len: beat * 0.35,
        amp: 0.022,
        verb: true,
      });
    }
    if (!fight) return;
    if (pos % 4 === 0 || (heavy && pos === 14)) {
      this.voice({ at, freq: 123, end: 42, len: 0.18, amp: 0.24 });
      this.voice({
        at: at + 0.007,
        freq: midi(root - 9 + (pos === 12 ? 7 : 0)),
        type: "triangle",
        len: beat * 0.55,
        amp: 0.17,
        filter: 600,
      });
    }
    if (pos === 4 || pos === 12)
      this.voice({
        at,
        freq: 1,
        type: "noise",
        len: 0.12,
        amp: 0.07,
        filter: 2400,
      });
    if (pos % 4 === 2 || (heavy && pos % 2 === 1))
      this.voice({
        at,
        freq: 1,
        type: "noise",
        len: 0.038,
        amp: 0.028,
        filter: 6600,
      });
    if (heavy && pos % 2 === 0)
      this.voice({
        at,
        freq: midi(root + 12 + [0, 7, 12, 7][(pos >> 1) % 4]),
        len: 0.12,
        amp: 0.045,
        type: "sawtooth",
        filter: 1020,
      });
  }
  play(event) {
    if (!this.ctx || this.ctx.state !== "running" || this.muted || !this.sfx)
      return;
    const aliases = {
      attack: "shot",
      shoot: "shot",
      fire: "shot",
      hit: "impact",
      hurt: "hurt",
      damage: "hurt",
      pickup: "glint",
      collect: "glint",
      levelup: "level",
      buy: "purchase",
      reward: "purchase",
      boss: "warning",
      alert: "warning",
      kill: "break",
      enemyDeath: "break",
      death: "defeat",
      win: "victory",
      won: "victory",
      lost: "defeat",
      warden: "purchase",
      reroll: "ui",
      select: "ui",
      start: "wave",
      pulse: "wave",
      elite: "warning",
    };
    const id = aliases[event] || event,
      at = this.ctx.currentTime + 0.003;
    const interval =
      {
        shot: 0.13,
        glint: 0.08,
        break: 0.11,
        impact: 0.12,
        hurt: 0.15,
        warning: 0.4,
      }[id] || 0.04;
    if (at - (this.last.get(id) ?? -100) < interval) return;
    this.last.set(id, at);
    const v = (offset, freq, end, len, amp, type = "sine", filter = 3200) =>
      this.voice({
        at: at + offset,
        freq,
        end,
        len,
        amp,
        type,
        filter,
        bus: this.sfxBus,
      });
    if (id === "shot") {
      v(0, 780, 245, 0.065, 0.046, "triangle");
      v(0, 1, 1, 0.03, 0.02, "noise", 2500);
    } else if (id === "glint") {
      v(0, 1140, 1670, 0.105, 0.045);
      v(0.025, 2050, 2250, 0.07, 0.018);
    } else if (id === "impact") {
      v(0, 405, 218, 0.065, 0.032, "triangle");
    } else if (id === "hurt") {
      v(0, 176, 48, 0.24, 0.27, "sawtooth", 850);
      v(0, 1, 1, 0.13, 0.16, "noise", 2050);
    } else if (id === "break") {
      v(0, 252, 87, 0.11, 0.07, "triangle");
      v(0, 1, 1, 0.065, 0.05, "noise", 1900);
    } else if (id === "rite") {
      v(0, 135, 870, 0.22, 0.14, "triangle");
      v(0.11, 1, 1, 0.38, 0.22, "noise", 2700);
      v(0.13, 185, 40, 0.52, 0.28);
      [74, 81, 86].forEach((n, i) =>
        v(i * 0.065, midi(n), midi(n), 0.48, 0.08),
      );
    } else if (id === "warning") {
      [0, 0.16].forEach((t) => v(t, 330, 277, 0.14, 0.11, "triangle"));
    } else if (id === "ui") {
      v(0, 518, 733, 0.075, 0.09, "triangle");
    } else {
      const chimes = {
        level: [74, 77, 81, 86],
        purchase: [79, 86, 91],
        wave: [50, 57, 62],
        victory: [65, 69, 72, 77, 81],
        defeat: [62, 58, 53, 50],
      };
      if (chimes[id])
        chimes[id].forEach((n, i) =>
          v(i * 0.087, midi(n), midi(n), 0.48, 0.12, "triangle"),
        );
    }
  }
}
export const audio = new Soundtrack();
