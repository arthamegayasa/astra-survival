import { createBuild, statsOf, addGlint } from "./build.js";

export const WORLD = Object.freeze({ width: 960, height: 540 });
export const WAVES = 20;
const STEP = 1 / 60;
const BOSS_WAVES = [7, 14, 20];
const BOSS_NAMES = [
  "The Bell Without a Tongue",
  "Abbess of Ash",
  "The Last Lamplighter",
];
const TYPES = {
  hound: { hp: 13, speed: 43, r: 9, damage: 7, value: 2 },
  wisp: { hp: 7, speed: 66, r: 7, damage: 5, value: 1 },
  brute: { hp: 42, speed: 29, r: 15, damage: 12, value: 4 },
  lancer: { hp: 23, speed: 40, r: 10, damage: 9, value: 3 },
  seer: { hp: 17, speed: 32, r: 10, damage: 8, value: 3 },
  warden: { hp: 100, speed: 39, r: 18, damage: 12, value: 15 },
  boss: { hp: 190, speed: 33, r: 27, damage: 16, value: 35 },
};
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function seededRandom(seed) {
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  next.state = () => state;
  return next;
}

export class Game {
  constructor(classId = "vanguard", random = Math.random, difficulty = 0) {
    this.random = random;
    this.difficulty = Math.max(0, Number(difficulty) || 0);
    this.build = createBuild(classId);
    this.stats = statsOf(this.build);
    this.player = {
      x: 480,
      y: 277,
      angle: -Math.PI / 2,
      r: 10,
      hp: this.stats.maxHp,
      maxHp: this.stats.maxHp,
      classId,
      riteCooldown: 0,
      riteMax: this.stats.riteCooldown,
      invuln: 0,
      moving: false,
    };
    this.wave = 0;
    this.kills = 0;
    this.events = [];
    this.enemies = [];
    this.drops = [];
    this.projectiles = [];
    this.effects = [];
    this.phase = "shop";
    this.elapsed = 0;
    this.clock = 0;
    this.fraction = 0;
    this.nextId = 1;
    this.nextWave();
  }

  get level() {
    return this.build.level;
  }
  get glint() {
    return this.build.glint;
  }
  get xp() {
    return this.build.xp;
  }
  get pendingLevels() {
    return this.build.pendingLevels;
  }
  get biome() {
    return this.wave <= 7 ? 0 : this.wave <= 14 ? 1 : 2;
  }

  nextWave() {
    if (this.phase !== "shop" || this.wave >= WAVES) return false;
    this.wave++;
    this.stats = statsOf(this.build);
    const p = this.player;
    p.hp = Math.min(
      this.stats.maxHp,
      p.hp + Math.max(0, this.stats.maxHp - p.maxHp) + (this.wave > 1 ? 5 : 0),
    );
    p.maxHp = this.stats.maxHp;
    p.riteMax = this.stats.riteCooldown;
    p.riteCooldown = Math.min(p.riteCooldown, p.riteMax * 0.35);
    p.invuln = 0.5;
    this.phase = "combat";
    this.duration = 26 + Math.floor((this.wave - 1) / 3) * 2;
    this.timeLeft = this.duration;
    this.clock = this.fraction = this.shotTimer = 0;
    this.spawnTimer = 0.9;
    this.rewardEarned = this.specialSpawned = this.riteQueued = false;
    for (let i = 0; i < 3; i++) this.spawn(i === 1 ? "wisp" : "hound");
    return true;
  }

  spawn(kind) {
    const base = TYPES[kind];
    const edge = Math.floor(this.random() * 4);
    const x = edge === 0 ? 9 : edge === 1 ? 951 : 20 + this.random() * 920;
    const y = edge === 2 ? 10 : edge === 3 ? 530 : 20 + this.random() * 500;
    const strength =
      (1 + (this.wave - 1) * 0.085) * (1 + this.difficulty * 0.3);
    const e = {
      ...base,
      x,
      y,
      kind,
      hp: base.hp * strength,
      maxHp: base.hp * strength,
      id: this.nextId++,
      cooldown: 1 + this.random() * 1.2,
      windup: 0,
      dash: 0,
      flash: 0,
      angle: Math.atan2(this.player.y - y, this.player.x - x),
      damage:
        base.damage * (1 + this.wave * 0.029) * (1 + this.difficulty * 0.15),
    };
    if (kind === "boss") e.name = BOSS_NAMES[this.biome];
    if (kind === "warden") e.name = "The Crooked Warden";
    this.enemies.push(e);
    return e;
  }

  effect(kind, unit, color, r, duration, angle = 0) {
    this.effects.push({
      kind,
      x: unit.x,
      y: unit.y,
      r,
      color,
      life: duration,
      maxLife: duration,
      angle,
    });
  }

  collect(value) {
    const oldLevel = this.level;
    addGlint(this.build, value);
    this.events.push(this.level > oldLevel ? "level" : "pickup");
  }

  hit(e, damage, from = this.player) {
    if (e.hp <= 0) return;
    const s = this.stats;
    e.hp -= damage;
    e.flash = 0.1;
    if (s.knockback && e.kind !== "boss") {
      const angle = Math.atan2(e.y - from.y, e.x - from.x);
      e.x = clamp(e.x + Math.cos(angle) * s.knockback, 5, 955);
      e.y = clamp(e.y + Math.sin(angle) * s.knockback, 5, 535);
    }
    this.player.hp = Math.min(
      this.player.maxHp,
      this.player.hp + damage * s.lifesteal,
    );
    this.events.push("hit");
    if (e.hp > 0) return;
    this.kills++;
    this.drops.push({ x: e.x, y: e.y, value: e.value });
    this.effect("burst", e, "#f284c2", e.r * 2, 0.28);
    this.events.push("kill");
    if (e.kind === "boss" || e.kind === "warden") this.rewardEarned = true;
    if (e.kind === "warden") this.events.push("warden");
  }

  hurt(damage) {
    const p = this.player;
    if (p.invuln > 0 || this.phase !== "combat") return;
    p.hp = Math.max(0, p.hp - Math.max(1, damage - this.stats.armor));
    p.invuln = 0.72;
    this.events.push("hurt");
    this.effect("ring", p, "#ff6586", 34, 0.26);
    if (p.hp === 0) {
      this.phase = "lost";
      this.events.push("lost");
    }
  }

  fire(unit, angle, hostile, damage, speed, r, pierce = 0) {
    this.projectiles.push({
      x: unit.x,
      y: unit.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      hostile,
      damage,
      pierce,
      hits: new Set(),
      color: hostile
        ? "#ff5786"
        : this.player.classId === "ranger"
          ? "#ffda80"
          : "#75f7ef",
      kind: hostile ? "enemy" : this.player.classId,
      life: hostile ? 4 : this.stats.range / speed + 0.1,
    });
  }

  rite() {
    const p = this.player;
    if (p.riteCooldown > 0) return;
    p.riteCooldown = p.riteMax;
    p.invuln = Math.max(p.invuln, 0.6);
    const arc = p.classId === "ranger";
    const radius = p.classId === "oracle" ? 200 : 145;
    this.effect("ring", p, "#ffe59e", arc ? 85 : radius, 0.48);
    if (arc) {
      for (let i = 0; i < 32; i++)
        this.fire(
          p,
          (i * Math.PI) / 16,
          false,
          this.stats.damage * 3,
          450,
          6,
          3,
        );
    } else {
      for (const e of this.enemies) {
        if (distance(p, e) > radius + e.r) continue;
        this.hit(e, this.stats.damage * (p.classId === "oracle" ? 3.2 : 4.2));
        if (p.classId === "oracle") e.slow = 2.6;
      }
      if (p.classId === "vanguard") p.invuln = 2.2;
    }
    this.events.push("rite");
  }

  update(dt, input = {}) {
    if (this.phase !== "combat" || !Number.isFinite(dt) || dt < 0) return;
    if (input.rite) this.riteQueued = true;
    this.fraction += Math.min(dt, 0.25);
    while (this.fraction + 1e-10 >= STEP && this.phase === "combat") {
      this.fraction -= STEP;
      this.tick(input);
    }
  }

  tick(input) {
    const p = this.player,
      s = this.stats;
    this.clock += STEP;
    this.elapsed += STEP;
    this.timeLeft = Math.max(0, this.duration - this.clock);
    p.invuln = Math.max(0, p.invuln - STEP);
    p.riteCooldown = Math.max(0, p.riteCooldown - STEP);
    p.hp = Math.min(p.maxHp, p.hp + s.regen * STEP);
    const x = input.x || 0,
      y = input.y || 0;
    const len = Math.max(1, Math.hypot(x, y));
    p.moving = !!(x || y);
    p.x = clamp(p.x + (x / len) * s.speed * STEP, 32, 928);
    p.y = clamp(p.y + (y / len) * s.speed * STEP, 42, 500);
    if (p.moving) p.angle = Math.atan2(y, x);
    if (this.riteQueued) {
      this.rite();
      this.riteQueued = false;
    }
    this.populate();
    this.shotTimer -= STEP;
    if (this.shotTimer <= 0) this.shoot();
    for (const e of this.enemies) if (e.hp > 0) this.advanceEnemy(e);
    if (this.phase !== "combat") return;
    this.advanceShots();
    if (this.phase !== "combat") return;
    this.enemies = this.enemies.filter((e) => e.hp > 0);
    this.drops = this.drops.filter((d) => {
      const dist = distance(p, d);
      if (dist < 17) {
        this.collect(d.value);
        return false;
      }
      if (dist < s.magnet) {
        const move = Math.min(dist, STEP * (200 + 260 * (1 - dist / s.magnet)));
        d.x += ((p.x - d.x) * move) / dist;
        d.y += ((p.y - d.y) * move) / dist;
      }
      return true;
    });
    this.effects = this.effects.filter((f) => (f.life -= STEP) > 0);
    if (!this.timeLeft && !this.enemies.some((e) => e.kind === "boss")) {
      this.phase = this.wave === WAVES ? "won" : "shop";
      this.events.push(this.phase);
      this.enemies.length =
        this.projectiles.length =
        this.drops.length =
        this.effects.length =
          0;
      this.collect(4 + this.wave);
    }
  }

  populate() {
    const boss = BOSS_WAVES.includes(this.wave);
    if (
      !this.specialSpawned &&
      this.clock >= (boss ? 2 : this.duration * 0.4) &&
      (boss || this.wave % 3 === 0)
    ) {
      this.spawn(boss ? "boss" : "warden");
      this.events.push(boss ? "boss" : "elite");
      this.specialSpawned = true;
    }
    if (!this.timeLeft) return;
    this.spawnTimer -= STEP;
    if (this.spawnTimer > 0 || this.enemies.length >= 65) return;
    const pool = ["hound", "hound", "wisp"];
    if (this.wave >= 2) pool.push("brute");
    if (this.wave >= 3) pool.push("lancer");
    if (this.wave >= 4) pool.push("seer");
    this.spawn(pool[Math.floor(this.random() * pool.length)]);
    this.spawnTimer = Math.max(
      0.24,
      1.14 /
        (1 +
          this.wave * 0.092 +
          (this.clock / this.duration) * 0.45 +
          this.difficulty * 0.12),
    );
  }

  shoot() {
    const p = this.player,
      s = this.stats;
    let target,
      nearest = s.range;
    for (const e of this.enemies) {
      const d = distance(p, e);
      if (e.hp > 0 && d < nearest) {
        target = e;
        nearest = d;
      }
    }
    if (!target) return;
    p.angle = Math.atan2(target.y - p.y, target.x - p.x);
    for (let i = 0; i < s.shots; i++) {
      const offset = (i - (s.shots - 1) / 2) * 0.1;
      this.fire(
        p,
        p.angle + offset,
        false,
        s.damage * (this.random() < s.crit ? 1.85 : 1),
        430,
        4,
        s.pierce,
      );
    }
    this.effect("slash", p, "#aff9ef", 23, 0.12, p.angle);
    this.events.push("shot");
    this.shotTimer = 1 / s.fireRate;
  }

  advanceEnemy(e) {
    const p = this.player,
      d = distance(e, p);
    e.flash = Math.max(0, e.flash - STEP);
    e.slow = Math.max(0, (e.slow || 0) - STEP);
    e.cooldown -= STEP;
    let speed = e.speed * (1 + 0.018 * this.wave) * (e.slow ? 0.4 : 1);
    const angle = Math.atan2(p.y - e.y, p.x - e.x);
    if (e.dash > 0) {
      e.dash -= STEP;
      speed *= 5.2;
    } else if (e.windup > 0) {
      e.windup = Math.max(0, e.windup - STEP);
      speed = 0;
      if (!e.windup) {
        if (e.kind === "lancer") e.dash = 0.44;
        else {
          const fan =
            e.kind === "boss"
              ? 5 + 2 * this.biome
              : e.kind === "warden"
                ? 3
                : 1;
          for (let i = 0; i < fan; i++)
            this.fire(
              e,
              e.angle + (i - (fan - 1) / 2) * 0.19,
              true,
              e.damage,
              150 + this.wave * 2,
              5,
            );
          if (e.kind === "boss" && this.biome > 0) {
            for (let i = 0; i < 8; i++)
              this.fire(e, e.angle + (i * Math.PI) / 4, true, e.damage, 85, 6);
          }
        }
      }
    } else {
      e.angle = angle;
      const ranged = ["seer", "warden", "boss"].includes(e.kind);
      if (
        e.cooldown <= 0 &&
        ((ranged && d < 420) || (e.kind === "lancer" && d < 185))
      ) {
        e.windup = e.kind === "boss" ? 0.85 : 0.54;
        e.cooldown = e.kind === "seer" ? 3.3 : 2.8;
        this.events.push("warning");
      }
      if (e.kind === "seer" && d < 185) speed *= d < 130 ? -0.55 : 0;
    }
    e.x = clamp(e.x + Math.cos(e.angle) * speed * STEP, 6, 954);
    e.y = clamp(e.y + Math.sin(e.angle) * speed * STEP, 6, 534);
    if (distance(e, p) < e.r + p.r) this.hurt(e.damage);
  }

  advanceShots() {
    const s = this.stats;
    this.projectiles = this.projectiles.filter((b) => {
      b.life -= STEP;
      b.x += b.vx * STEP;
      b.y += b.vy * STEP;
      if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > 960 || b.y > 540)
        return false;
      if (b.hostile) {
        if (distance(b, this.player) >= b.r + this.player.r) return true;
        this.hurt(b.damage);
        return false;
      }
      for (const e of this.enemies) {
        if (e.hp <= 0 || b.hits.has(e.id) || distance(b, e) >= b.r + e.r)
          continue;
        b.hits.add(e.id);
        this.hit(e, b.damage, b);
        if (s.splash) {
          this.effect("ring", e, "#fac573", s.splash, 0.23);
          for (const n of this.enemies)
            if (n !== e && distance(e, n) < s.splash)
              this.hit(n, b.damage * 0.5, e);
        }
        if (s.chain) {
          let source = e;
          const used = new Set([e]);
          for (let i = 0; i < s.chain; i++) {
            let next,
              nearest = 105;
            for (const n of this.enemies) {
              const d = distance(source, n);
              if (!used.has(n) && n.hp > 0 && d < nearest) {
                nearest = d;
                next = n;
              }
            }
            if (!next) break;
            this.hit(next, b.damage * 0.6, source);
            this.effect("spark", next, "#bcadff", 19, 0.2);
            used.add(next);
            source = next;
          }
        }
        if (b.pierce-- <= 0) return false;
      }
      return true;
    });
  }
}
