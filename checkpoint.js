import { Game, WAVES, seededRandom } from "./game.js";
import { CLASSES, createBuild, statsOf } from "./build.js";

const KEY = "astra.expedition.v1";
// Save at Pulse boundaries so interrupted combat restarts on fair footing.
export function checkpoint(game) {
  const { build, wave, phase, kills, player, difficulty, rewardEarned } = game;
  if (!["combat", "shop"].includes(phase)) return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        build,
        wave,
        phase,
        kills,
        player: {
          hp: player.hp,
          x: player.x,
          y: player.y,
          angle: player.angle,
          riteCooldown: player.riteCooldown,
        },
        difficulty,
        rewardEarned,
        seed: game.seed,
        randomState: game.random.state?.(),
        pulseState: game.pulseState,
      }),
    );
  } catch {}
}
export function clearCheckpoint() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
export function restore() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (
      s?.version !== 1 ||
      !CLASSES.some((c) => c.id === s.build?.classId) ||
      !Number.isInteger(s.wave) ||
      s.wave < 1 ||
      s.wave > WAVES ||
      !["combat", "shop"].includes(s.phase)
    )
      return null;
    const game = new Game(s.build.classId, Math.random, s.difficulty);
    const defaults = createBuild(s.build.classId);
    for (const key of Object.keys(defaults)) {
      if (typeof s.build[key] !== typeof defaults[key] || s.build[key] === null)
        return null;
    }
    game.build = s.build;
    game.wave = s.wave;
    game.phase = "shop";
    game.kills = s.kills;
    game.stats = statsOf(game.build);
    game.player.maxHp = game.stats.maxHp;
    game.seed = s.seed;
    game.pulseState = s.pulseState;
    game.random = seededRandom(
      s.phase === "combat" ? s.pulseState : s.randomState,
    );
    game.enemies = [];
    game.projectiles = [];
    game.drops = [];
    game.effects = [];
    if (s.phase === "combat") {
      game.wave--;
      game.nextWave();
    }
    for (const field of ["hp", "x", "y", "angle", "riteCooldown"]) {
      if (!Number.isFinite(s.player?.[field])) return null;
      game.player[field] = s.player[field];
    }
    game.rewardEarned = s.rewardEarned;
    return game;
  } catch {
    return null;
  }
}
