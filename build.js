export const CLASSES = [
  {
    id: "vanguard",
    name: "Vanguard",
    weapon: "Sun lance",
    rite: "Solar Rupture",
    description: "An armored keeper who breaks the siege at close range.",
    color: "#ffd482",
  },
  {
    id: "ranger",
    name: "Ranger",
    weapon: "Starbow",
    rite: "Meteor Volley",
    description: "A fleet hunter who slips between volleys.",
    color: "#76ebd8",
  },
  {
    id: "oracle",
    name: "Oracle",
    weapon: "Prism staff",
    rite: "Astral Flare",
    description: "A glass seer whose bolts leap between the Unlit.",
    color: "#a7baff",
  },
];

const base = {
  damage: 15,
  speed: 177,
  fireRate: 1.8,
  maxHp: 100,
  range: 240,
  shots: 1,
  pierce: 0,
  splash: 0,
  magnet: 62,
  crit: 0.05,
  regen: 0,
  armor: 0,
  riteCooldown: 9,
  chain: 0,
  knockback: 3,
  lifesteal: 0,
};
const profiles = {
  vanguard: {
    damage: 21,
    speed: 165,
    maxHp: 125,
    armor: 2,
    range: 210,
    knockback: 7,
  },
  ranger: { speed: 200, range: 290, fireRate: 2.3, maxHp: 90, damage: 14 },
  oracle: {
    chain: 1,
    damage: 17,
    range: 260,
    fireRate: 1.45,
    maxHp: 88,
    riteCooldown: 8,
  },
};
const catalog = [
  [
    "lance",
    "Sun Lance",
    "Edge",
    14,
    { damage: 5, pierce: 1 },
    "Pierce one more enemy for +5 damage.",
  ],
  [
    "bow",
    "Crescent Bow",
    "Shard",
    20,
    { shots: 1 },
    "Add a projectile to each volley.",
  ],
  [
    "bell",
    "Storm Bell",
    "Echo",
    19,
    { chain: 1 },
    "Let each bolt jump to another target.",
  ],
  [
    "cinder",
    "Cinder Urn",
    "Flame",
    17,
    { splash: 23 },
    "Shatter bolts into a blast on impact.",
  ],
  [
    "clock",
    "Wind Spindle",
    "Echo",
    14,
    { fireRate: 0.42 },
    "Fire faster with each turn of the spindle.",
  ],
  [
    "hammer",
    "Gate Hammer",
    "Ward",
    12,
    { knockback: 8, damage: 3 },
    "Drive targets back with heavier blows.",
  ],
  [
    "needle",
    "Gilded Needle",
    "Trade",
    14,
    { crit: 0.12, range: 25 },
    "Reach farther and strike critical seams.",
  ],
  [
    "sickle",
    "Ember Sickle",
    "Flame",
    18,
    { lifesteal: 0.025, damage: 2 },
    "Siphon health from enemies struck.",
  ],
  ["boots", "Courier Boots", "Edge", 9, { speed: 18 }, "Move 18 units faster."],
  [
    "ring",
    "Widow’s Ring",
    "Shard",
    10,
    { crit: 0.09 },
    "Gain 9 percentage points of critical chance.",
  ],
  [
    "key",
    "Tollhouse Key",
    "Trade",
    8,
    { magnet: 36 },
    "Draw distant Glint into reach.",
  ],
  [
    "mantle",
    "Porcelain Mantle",
    "Ward",
    10,
    { armor: 1, maxHp: 8 },
    "Block one damage and gain 8 maximum health.",
  ],
  [
    "reed",
    "Choir Reed",
    "Echo",
    11,
    { riteCooldown: -0.75 },
    "Recover your Rite three quarters of a second sooner.",
  ],
  ["wick", "Last Wick", "Flame", 10, { damage: 4 }, "Gain 4 attack damage."],
  [
    "glass",
    "Sight Glass",
    "Shard",
    8,
    { range: 42 },
    "Acquire targets farther across the arena.",
  ],
  [
    "seal",
    "Hospice Seal",
    "Ward",
    11,
    { regen: 0.65 },
    "Regrow health slowly throughout the Pulse.",
  ],
  [
    "pin",
    "Duelist Pin",
    "Edge",
    12,
    { crit: 0.05, fireRate: 0.19 },
    "Trade careful timing for faster critical hits.",
  ],
  [
    "ledger",
    "Brass Ledger",
    "Trade",
    9,
    { maxHp: 12, magnet: 15 },
    "Carry more life and pull in nearby Glint.",
  ],
  [
    "fuse",
    "Signal Fuse",
    "Flame",
    12,
    { splash: 11, range: 12 },
    "Widen explosions and reach farther.",
  ],
  [
    "lens",
    "Frost Lens",
    "Shard",
    12,
    { pierce: 1 },
    "Send shots through an extra body.",
  ],
  [
    "dial",
    "Twin Dial",
    "Echo",
    13,
    { fireRate: 0.22, riteCooldown: -0.4 },
    "Wind both weapon and Rite more quickly.",
  ],
  [
    "strap",
    "Sabre Strap",
    "Edge",
    10,
    { damage: 3, speed: 6 },
    "Strike harder and move faster.",
  ],
  [
    "coin",
    "Ferryman’s Coin",
    "Trade",
    9,
    { regen: 0.4, magnet: 12 },
    "Recover on long crossings and draw in Glint.",
  ],
  [
    "brick",
    "Hearth Brick",
    "Ward",
    12,
    { armor: 1, regen: 0.35 },
    "Shelter from impacts and recover health.",
  ],
  [
    "match",
    "Blue Match",
    "Flame",
    10,
    { damage: 3, crit: 0.035 },
    "Ignite the weak points in a target.",
  ],
  [
    "quill",
    "Silver Quill",
    "Shard",
    11,
    { fireRate: 0.25, range: 10 },
    "Loose a quicker, longer volley.",
  ],
  [
    "tuning",
    "Tuning Fork",
    "Echo",
    13,
    { knockback: 3, riteCooldown: -0.65 },
    "Push the horde back as your Rite recovers.",
  ],
  [
    "clasp",
    "Fox Clasp",
    "Edge",
    11,
    { speed: 12, range: 20 },
    "Keep the horde at your preferred distance.",
  ],
  [
    "scale",
    "Pearl Scale",
    "Trade",
    12,
    { crit: 0.06, magnet: 22 },
    "Draw in spoils while finding critical seams.",
  ],
  [
    "tablet",
    "Dawn Tablet",
    "Ward",
    11,
    { maxHp: 18 },
    "Carry 18 more maximum health.",
  ],
  [
    "ash",
    "Funeral Ash",
    "Flame",
    14,
    { damage: 4, splash: 7 },
    "Spread stronger hits through a crowd.",
  ],
  [
    "comb",
    "Glass Comb",
    "Shard",
    12,
    { pierce: 1, range: 8 },
    "Lengthen the path of piercing bolts.",
  ],
  [
    "hymn",
    "Sleeping Hymn",
    "Echo",
    12,
    { regen: 0.45, fireRate: 0.15 },
    "Recover health while accelerating attacks.",
  ],
  [
    "knife",
    "Letter Knife",
    "Edge",
    12,
    { pierce: 1, damage: 1 },
    "Slip a blade through a packed line.",
  ],
  [
    "reliquary",
    "Star Reliquary",
    "Ward",
    17,
    { armor: 1, lifesteal: 0.023 },
    "Turn an enemy’s wound into shelter.",
    6,
  ],
  [
    "mirror",
    "Split Mirror",
    "Shard",
    19,
    { shots: 1, range: 15 },
    "Cast a second image into every volley.",
    10,
  ],
  [
    "censer",
    "Hollow Censer",
    "Flame",
    18,
    { splash: 16, regen: 0.55 },
    "Carry a healing ember into battle.",
    15,
  ],
  [
    "diadem",
    "Silent Diadem",
    "Echo",
    21,
    { chain: 1, riteCooldown: -0.6 },
    "Fork your bolt and hasten your Rite.",
    20,
  ],
];
export const ITEMS = catalog.map(
  ([id, name, tag, price, stats, description, unlockCost], i) => ({
    id,
    name,
    tag,
    price,
    stats,
    description,
    unlockCost,
    type: i < 8 ? "Weapon" : "Keepsake",
  }),
);
const byId = Object.fromEntries(ITEMS.map((item) => [item.id, item]));
const resonances = {
  Edge: ["+20 speed and +5 damage", { speed: 20, damage: 5 }],
  Shard: ["One extra bolt per volley", { shots: 1 }],
  Flame: ["+24 blast radius", { splash: 24 }],
  Ward: ["+2 armor and steady recovery", { armor: 2, regen: 0.65 }],
  Echo: ["Rite recovers 2 seconds sooner", { riteCooldown: -2 }],
  Trade: ["Glint grants 25% more currency", { magnet: 28 }],
};
export const LEVELS = [
  ["blood", "Vital Vessel", "Gain 16 maximum health.", { maxHp: 16 }],
  ["aim", "True North", "Gain 4 weapon damage.", { damage: 4 }],
  [
    "stride",
    "Light Step",
    "Move faster and draw in more Glint.",
    { speed: 10, magnet: 7 },
  ],
  ["rhythm", "Quick Hands", "Attack faster.", { fireRate: 0.25 }],
  ["focus", "Prism Focus", "Add 7% critical chance.", { crit: 0.07 }],
  ["respite", "Warm Light", "Regenerate health each second.", { regen: 0.55 }],
].map(([id, name, description, stats]) => ({ id, name, description, stats }));

export function createBuild(classId) {
  if (!Object.hasOwn(profiles, classId)) classId = "vanguard";
  return {
    classId,
    glint: 0,
    xp: 0,
    level: 1,
    nextXp: 12,
    pendingLevels: 0,
    inventory: {},
    training: {},
    offers: [],
    rerolls: 0,
    wave: 0,
    rewardWave: 0,
    rewardOptions: [],
    levelOptions: [],
    tradeRemainder: 0,
  };
}
export function synergies(build) {
  const counts = {};
  for (const id of Object.keys(build.inventory))
    if (byId[id]) counts[byId[id].tag] = (counts[byId[id].tag] || 0) + 1;
  return Object.entries(counts).map(([tag, count]) => ({
    tag,
    count,
    active: count >= 2,
    description: resonances[tag][0],
  }));
}
export function statsOf(build) {
  const stats = { ...base, ...profiles[build.classId] };
  function add(mods, tier = 1) {
    for (const [k, v] of Object.entries(mods)) stats[k] += v * tier;
  }
  for (const [id, tier] of Object.entries(build.inventory))
    if (byId[id]) add(byId[id].stats, tier);
  for (const choice of LEVELS)
    if (build.training[choice.id]) add(choice.stats, build.training[choice.id]);
  for (const res of synergies(build))
    if (res.active) add(resonances[res.tag][1]);
  const caps = {
    shots: 6,
    chain: 4,
    pierce: 7,
    crit: 0.85,
    armor: 14,
    splash: 90,
    fireRate: 7,
    speed: 325,
    lifesteal: 0.15,
  };
  for (const [stat, max] of Object.entries(caps))
    stats[stat] = Math.min(max, stats[stat]);
  stats.riteCooldown = Math.max(2.5, stats.riteCooldown);
  return stats;
}
export function addGlint(build, amount) {
  if (!(Number.isSafeInteger(amount) && amount > 0)) return;
  build.glint += amount;
  build.xp += amount;
  if (synergies(build).some((s) => s.active && s.tag === "Trade")) {
    build.tradeRemainder += amount;
    build.glint += Math.floor(build.tradeRemainder / 4);
    build.tradeRemainder %= 4;
  }
  while (build.xp >= build.nextXp) {
    build.xp -= build.nextXp;
    build.level++;
    build.pendingLevels++;
    build.nextXp = 8 + build.level * 5;
  }
}
function sample(pool, rng) {
  const options = [...pool],
    result = [];
  while (options.length && result.length < 3)
    result.push(options.splice(Math.floor(rng() * options.length), 1)[0]);
  return result;
}
function pool(build, meta) {
  return ITEMS.filter(
    (i) =>
      (build.inventory[i.id] || 0) < 3 &&
      (!i.unlockCost || meta?.unlocks?.includes(i.id)),
  );
}
function roll(build, meta, rng) {
  const choices = sample(pool(build, meta), rng);
  build.offers = choices.map((i) => i.id);
  return build.offers;
}
export function openShop(build, wave, meta, rng = Math.random) {
  if (build.wave !== wave) {
    build.wave = wave;
    build.rerolls = 0;
    roll(build, meta, rng);
  }
  return build.offers;
}
export function buy(build, id) {
  const index = build.offers.indexOf(id),
    item = byId[id];
  if (
    index < 0 ||
    !item ||
    build.glint < item.price ||
    (build.inventory[id] || 0) >= 3
  )
    return false;
  build.glint -= item.price;
  build.inventory[id] = (build.inventory[id] || 0) + 1;
  build.offers.splice(index, 1);
  return true;
}
export function rerollCost(build) {
  return 2 + 2 * build.rerolls;
}
export function reroll(build, meta, rng = Math.random) {
  const price = rerollCost(build);
  if (build.glint < price || !pool(build, meta).length) return false;
  build.glint -= price;
  build.rerolls++;
  roll(build, meta, rng);
  return true;
}
export function levelChoices(build, rng = Math.random) {
  if (!build.pendingLevels) return [];
  if (!build.levelOptions.length)
    build.levelOptions = sample(LEVELS, rng).map((i) => i.id);
  return build.levelOptions.map((id) => LEVELS.find((l) => l.id === id));
}
export function chooseLevel(build, id) {
  if (!build.pendingLevels || !build.levelOptions.includes(id)) return false;
  build.training[id] = (build.training[id] || 0) + 1;
  build.pendingLevels--;
  build.levelOptions = [];
  return true;
}
export function rewardChoices(build, meta, rng = Math.random) {
  if (!build.wave || build.rewardWave === build.wave) return [];
  if (!build.rewardOptions.length || build.rewardOfferWave !== build.wave) {
    build.rewardOptions = sample(
      pool(build, meta).filter((i) => i.type === "Keepsake"),
      rng,
    ).map((i) => i.id);
    build.rewardOfferWave = build.wave;
  }
  return build.rewardOptions.map((id) => byId[id]);
}
export function claimReward(build, id) {
  if (
    build.rewardOfferWave !== build.wave ||
    build.rewardWave === build.wave ||
    !build.rewardOptions.includes(id) ||
    (build.inventory[id] || 0) >= 3
  )
    return false;
  build.inventory[id] = (build.inventory[id] || 0) + 1;
  if (build.inventory[id] === 3)
    build.offers = build.offers.filter((offer) => offer !== id);
  build.rewardWave = build.wave;
  build.rewardOptions = [];
  return true;
}
const KEY = "astra-survival.meta.v1";
function safeInt(n) {
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
}
export function loadMeta() {
  let record = {};
  try {
    record = JSON.parse(globalThis.localStorage.getItem(KEY)) || {};
  } catch {}
  return {
    silt: safeInt(record.silt),
    bestWave: safeInt(record.bestWave),
    wins: safeInt(record.wins),
    runs: safeInt(record.runs),
    unlocks: [
      ...new Set(
        (Array.isArray(record.unlocks) ? record.unlocks : []).filter(
          (id) => byId[id]?.unlockCost,
        ),
      ),
    ],
  };
}
function save(meta) {
  try {
    globalThis.localStorage.setItem(KEY, JSON.stringify(meta));
  } catch {}
}
export function finishRun(meta, { wave, kills, won }) {
  const earned = Math.max(
    1,
    Math.floor(safeInt(kills) / 18) +
      Math.floor(safeInt(wave) / 2) +
      (won ? 8 : 0),
  );
  meta.silt += earned;
  meta.bestWave = Math.max(meta.bestWave, safeInt(wave));
  meta.runs++;
  if (won) meta.wins++;
  save(meta);
  return earned;
}
export function unlock(meta, id) {
  const cost = byId[id]?.unlockCost;
  if (!cost || meta.unlocks.includes(id) || meta.silt < cost) return false;
  meta.silt -= cost;
  meta.unlocks.push(id);
  save(meta);
  return true;
}
