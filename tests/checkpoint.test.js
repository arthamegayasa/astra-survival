import test from "node:test";
import assert from "node:assert/strict";
import { Game, seededRandom } from "../game.js";
import { checkpoint, restore, clearCheckpoint } from "../checkpoint.js";
import { openShop, claimReward } from "../build.js";
const store = new Map();
globalThis.localStorage = {
  setItem: (k, v) => store.set(k, v),
  getItem: (k) => store.get(k),
  removeItem: (k) => store.delete(k),
};
test("Pulse checkpoints restore the same opening, position, cooldown and random sequence", () => {
  const g = new Game("oracle", seededRandom(531));
  g.seed = g.pulseState = 531;
  g.player.x = 230;
  g.player.riteCooldown = 4;
  checkpoint(g);
  const copy = restore();
  assert.equal(copy.player.x, 230);
  assert.equal(copy.player.riteCooldown, 4);
  assert.equal(copy.random(), g.random());
  assert.deepEqual(
    copy.enemies.map((e) => [e.x, e.y]),
    g.enemies.map((e) => [e.x, e.y]),
  );
  clearCheckpoint();
  assert.equal(restore(), null);
});
test("Shop checkpoint preserves expenses, reward tier and eligible stock", () => {
  const g = new Game("ranger", seededRandom(334));
  g.seed = g.pulseState = 334;
  g.phase = "shop";
  g.wave = 7;
  const b = g.build;
  openShop(b, g.wave, {}, g.random);
  b.offers = ["boots"];
  b.inventory.boots = 2;
  b.rewardOfferWave = 7;
  b.rewardOptions = ["boots"];
  assert.ok(claimReward(b, "boots"));
  checkpoint(g);
  const restored = restore();
  assert.deepEqual(restored.build, b);
  assert.equal(restored.phase, "shop");
  assert.deepEqual(restored.build.offers, []);
  assert.equal(restored.random(), g.random());
});
