const W = 960,
  H = 540,
  TAU = Math.PI * 2;
const surfaces = new Map();
function surface(key, w, h, paint) {
  if (!surfaces.has(key)) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    paint(c.getContext("2d"));
    surfaces.set(key, c);
  }
  return surfaces.get(key);
}
function rng(seed) {
  return () =>
    (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
}
function poly(c, points, fill, stroke) {
  c.beginPath();
  c.moveTo(...points[0]);
  for (const p of points.slice(1)) c.lineTo(...p);
  c.closePath();
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.stroke();
  }
}
function line(c, x, y, X, Y, color, width = 1) {
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(X, Y);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
  c.lineWidth = 1;
}
function box(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(Math.floor(x), Math.floor(y), w, h);
}
function ellipse(c, x, y, a, b, color, stroke = false) {
  c.beginPath();
  c.ellipse(x, y, Math.max(0.1, a), Math.max(0.1, b), 0, 0, TAU);
  if (stroke) {
    c.strokeStyle = color;
    c.stroke();
  } else {
    c.fillStyle = color;
    c.fill();
  }
}
function light(c, x, y, r, col) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col);
  g.addColorStop(1, "transparent");
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}
function gradient(c, y, h, stops) {
  const g = c.createLinearGradient(0, y, 0, h + y);
  stops.forEach(([a, b]) => g.addColorStop(a, b));
  c.fillStyle = g;
  c.fillRect(0, y, W, h);
}
function shard(c, x, y, s, colors, lean = 0) {
  const tip = [x + lean * s, y - s * 4.4],
    l = [x - s, y - s * 1.5],
    r = [x + s, y - s],
    m = [x + s * 0.1, y - s * 0.6],
    base = [x, y];
  poly(c, [tip, l, base, m], colors[0]);
  poly(c, [tip, m, base, r], colors[1]);
  line(c, tip[0], tip[1], l[0], l[1], colors[2]);
  line(c, tip[0], tip[1], m[0], m[1], colors[2], 0.65);
}
const amethyst = ["#5a3c88", "#32294e", "#b599f2"],
  ice = ["#378b99", "#214957", "#9aeee2"];
function tower(c, x, y, w, h, r, shade) {
  const b = y - h,
    half = w / 2;
  const deep = shade ? "#141525" : "#171a2c",
    face = shade ? "#25233a" : "#39384d",
    rim = shade ? "#46405b" : "#6e6272";
  poly(
    c,
    [
      [x - half, y],
      [x - half, b],
      [x, b - 3],
      [x + half, b],
      [x + half, y],
    ],
    face,
  );
  poly(
    c,
    [
      [x, b - 3],
      [x + half, b],
      [x + half, y],
      [x, y],
    ],
    deep,
  );
  for (let z = b + 3; z < y; z += 4) {
    box(c, x - half, z, half, 1, "#ffffff0c");
    if (r() > 0.45) box(c, x - half + r() * half, z - 2, 1, 2, "#15142688");
  }
  poly(
    c,
    [
      [x - half - 2, b + 1],
      [x - 1, b - w * 1.5],
      [x, b],
    ],
    rim,
  );
  poly(
    c,
    [
      [x - 1, b - w * 1.5],
      [x + half + 2, b + 1],
      [x, b],
    ],
    deep,
  );
  for (let z = b + 7; z < y - 4; z += 10) {
    box(c, x - half + 2, z, 1, 3, r() > 0.3 ? "#f5c495" : "#776e79");
  }
  line(c, x - 1, b - w * 1.5, x - 1, b - w * 1.5 - 4, rim);
}
function title(c) {
  const r = rng(30518);
  gradient(c, 0, 270, [
    [0, "#080e20"],
    [0.38, "#20223e"],
    [0.68, "#6a5367"],
    [0.85, "#b19085"],
    [1, "#333043"],
  ]);
  light(c, 336, 65, 99, "#cf977347");
  for (let i = 0; i < 950; i++) {
    const x = r() * 480,
      y = r() * 144;
    box(
      c,
      x,
      y,
      r() > 0.988 ? 2 : 1,
      1,
      "rgba(235,222,231," + r() * 0.56 * (1 - y / 165) + ")",
    );
  }
  // Atmospheric bands catch the sunset underneath the lunar disc.
  for (let i = 0; i < 200; i++) {
    const x = r() * 500 - 10,
      y = 82 + r() * 86;
    box(c, x, y, 2 + r() * 25, r() > 0.8 ? 2 : 1, "#e5c3ba0c");
  }
  const mx = 341,
    my = 68,
    rad = 36;
  light(c, mx, my, 63, "#ffbb8555");
  ellipse(c, mx, my, rad + 1.3, rad + 1.3, "#f6c895");
  c.save();
  c.beginPath();
  c.arc(mx, my, rad, 0, TAU);
  c.clip();
  gradient(c, my - rad, rad * 2, [
    [0, "#2a253c"],
    [0.64, "#433748"],
    [1, "#d3a583"],
  ]);
  for (let i = 0; i < 550; i++)
    box(
      c,
      mx - rad + r() * 72,
      my - rad + r() * 72,
      1 + r() * 6,
      1,
      "#e4bfa50d",
    );
  c.restore();
  ellipse(c, mx, my, 42, 42, "#dcb58b39", true);
  for (let j = 0; j < 4; j++) {
    const base = 135 + j * 18,
      col = ["#60526a", "#4b435b", "#353447", "#252a3c"][j];
    const pts = [
      [0, 270],
      [0, base],
    ];
    for (let x = 0; x <= 490; x += 5) {
      const y =
        base +
        Math.sin(x * 0.018 + j) * 13 +
        Math.cos(x * 0.043 - j) * 6 +
        r() * 8;
      pts.push([x, y]);
    }
    pts.push([490, 270]);
    poly(c, pts, col);
  }
  // Suspended basalt shelf, quarried face and stratified fracture planes.
  const ridge = [
    [216, 183],
    [235, 178],
    [246, 173],
    [264, 175],
    [284, 165],
    [300, 163],
    [311, 158],
    [338, 160],
    [354, 155],
    [373, 156],
    [394, 160],
    [423, 158],
    [452, 168],
    [480, 165],
  ];
  for (let i = 0; i < ridge.length - 1; i++) {
    const [x, y] = ridge[i],
      [X, Y] = ridge[i + 1],
      b = 207 + r() * 34;
    poly(
      c,
      [
        [x, y],
        [X, Y],
        [X - 2, b],
        [x + 4, b + 6],
      ],
      ["#282a40", "#2e3045", "#24273b", "#363348"][i % 4],
    );
    line(c, x, y, X, Y, "#998492", 1);
    for (let n = 0; n < 12; n++) {
      const xx = x + r() * (X - x);
      box(c, xx, y + 4 + r() * 31, 1 + r() * 2, 1 + r() * 6, "#a39ab413");
    }
    poly(
      c,
      [
        [x + 4, b],
        [X - 2, b - 3],
        [x + 6, b + 11 + r() * 9],
      ],
      "#242638",
    );
  }
  for (let i = 0; i < 40; i++) {
    const x = 255 + r() * 195,
      y = 155 + r() * 20;
    tower(c, x, y, 2 + r() * 4, 4 + r() * 10, r, true);
  }
  const towers = [
    [281, 170, 7, 18],
    [296, 163, 9, 23],
    [307, 158, 7, 35],
    [319, 158, 12, 26],
    [330, 157, 10, 35],
    [345, 155, 16, 45],
    [355, 154, 7, 27],
    [365, 156, 11, 31],
    [379, 158, 7, 24],
    [395, 159, 9, 18],
    [411, 162, 6, 13],
  ];
  for (const [x, y, w, h] of towers) tower(c, x, y, w, h, r, false);
  for (let i = 0; i < 18; i++) {
    const x = 290 + i * 7,
      y = 161 + Math.sin(i * 0.5) * 3;
    box(c, x, y, 8, 6, "#383548");
    box(c, x, y, 8, 1, "#897989");
  }
  for (const [x, y, s, k] of [
    [243, 177, 3, -0.5],
    [269, 170, 3, 0.6],
    [427, 162, 5, 0.5],
    [439, 165, 3, 0.8],
    [395, 162, 2, -0.5],
  ])
    shard(c, x, y, s, ice, k);
  for (let i = 0; i < 15; i++) {
    let x = 205 + r() * 259,
      y = 193 + r() * 45,
      s = 1 + r() * 3;
    poly(
      c,
      [
        [x, y],
        [x + s, y - 1],
        [x + s * 2, y],
        [x + s * 0.7, y + s * 2],
      ],
      "#39374c",
    );
  }
  for (let j = 0; j < 3; j++) {
    const pts = [
      [0, 270],
      [0, 195 + j * 18],
    ];
    for (let x = 0; x <= 490; x += 7)
      pts.push([x, 199 + j * 19 + Math.sin(x * 0.014 + j * 2) * 15 + r() * 7]);
    pts.push([490, 270]);
    poly(c, pts, ["#252a3b", "#1c2232", "#101a28"][j]);
  }
  for (let i = 0; i < 200; i++) {
    const x = r() * 490,
      y = 236 + Math.sin(x * 0.021) * 8 + r() * 42,
      h = 4 + r() * 12;
    poly(
      c,
      [
        [x, y - h],
        [x - 1, y - h * 0.6],
        [x - 2, y - h * 0.6],
        [x - 1, y - h * 0.5],
        [x - 4, y],
        [x + 3, y],
        [x + 1, y - h * 0.5],
        [x + 2, y - h * 0.55],
      ],
      "#111a28",
    );
  }
}
const biomeColors = [
  {
    floor: ["#243439", "#293a3c", "#26383c", "#233438", "#304142"],
    stone: ["#35464b", "#202c33", "#546469"],
    light: "#89d8c3",
    orn: "#8d9a7e",
    crystal: ice,
  },
  {
    floor: ["#302c3a", "#36303d", "#322e3c", "#2d2b38", "#3a3340"],
    stone: ["#464151", "#272634", "#625b6a"],
    light: "#bb95e5",
    orn: "#a18b9d",
    crystal: amethyst,
  },
  {
    floor: ["#3b3033", "#403435", "#393034", "#453839", "#3b3134"],
    stone: ["#51434a", "#2f2931", "#70606a"],
    light: "#e8ae84",
    orn: "#c09a78",
    crystal: ["#ab6253", "#683f4a", "#ffc395"],
  },
];
function plinth(c, x, y, w, h, p) {
  const d = w * 0.38;
  poly(
    c,
    [
      [x - w, y - d],
      [x, y],
      [x, y - h],
      [x - w, y - d - h],
    ],
    p.stone[0],
  );
  poly(
    c,
    [
      [x, y],
      [x + w, y - d],
      [x + w, y - d - h],
      [x, y - h],
    ],
    p.stone[1],
  );
  poly(
    c,
    [
      [x - w, y - d - h],
      [x, y - d * 2 - h],
      [x + w, y - d - h],
      [x, y - h],
    ],
    p.stone[2],
  );
  line(c, x - w, y - d - h, x, y - h, "#e4decd40");
}
function arena(c, biome) {
  const p = biomeColors[biome],
    r = rng(12081 + biome);
  box(c, 0, 0, 480, 270, "#202a30");
  // Staggered masonry, chipped paving and scattered grit rendered once per biome.
  for (let row = -2; row < 32; row++) {
    const y = row * 10;
    for (let col = -2; col < 21; col++) {
      const x = col * 29 + (row % 2) * 14 + Math.round(r() * 2);
      poly(
        c,
        [
          [x + 2, y],
          [x + 26, y],
          [x + 28, y + 2],
          [x + 28, y + 8],
          [x + 25, y + 9],
          [x, y + 9],
          [x, y + 2],
        ],
        p.floor[Math.floor(r() * p.floor.length)],
      );
      line(c, x + 2, y + 0.5, x + 24, y + 0.5, "#cfceb016", 0.6);
      if (r() < 0.21) {
        line(c, x + 11, y, x + 9, y + 3, "#101d2240", 0.7);
        line(c, x + 9, y + 3, x + 13, y + 6, "#101d2240", 0.7);
      }
    }
  }
  for (let i = 0; i < 2200; i++)
    box(
      c,
      r() * 480,
      r() * 270,
      1 + r() * 2,
      1,
      r() > 0.52 ? "#d5d6b513" : "#08172020",
    );
  c.save();
  c.globalAlpha = 0.28;
  c.translate(240, 135);
  c.scale(1, 0.57);
  for (const radius of [59, 62, 68, 97, 101]) {
    ellipse(c, 0, 0, radius, radius, p.orn, true);
  }
  for (let i = 0; i < 32; i++) {
    const a = (i * TAU) / 32,
      b = a + TAU / 64;
    line(
      c,
      Math.cos(a) * 69,
      Math.sin(a) * 69,
      Math.cos(a) * 74,
      Math.sin(a) * 74,
      p.orn,
      1.5,
    );
    if (i % 4 === 0)
      poly(
        c,
        [
          [Math.cos(a) * 93, Math.sin(a) * 93],
          [Math.cos(b) * 71, Math.sin(b) * 71],
          [Math.cos(a) * 77, Math.sin(a) * 77],
          [Math.cos(a - TAU / 64) * 71, Math.sin(a - TAU / 64) * 71],
        ],
        p.orn,
      );
  }
  c.restore();
  for (const [x, y, k] of [
    [13, 34, 1],
    [57, 14, 1],
    [416, 12, 1],
    [466, 40, 1],
    [7, 250, 1],
    [463, 259, 1],
    [75, 274, 0.6],
    [389, 276, 0.75],
  ]) {
    const h = 12 + r() * 15;
    ellipse(c, x + 7, y + 2, 15, 4, "#0a161d6e");
    plinth(c, x, y, 12 * k, 3, p);
    plinth(c, x, y - 4, 8 * k, h, p);
    plinth(c, x, y - h - 4, 10 * k, 3, p);
    for (let j = 0; j < 3; j++)
      box(c, x - 4 + j * 3, y - h - 7, 2, 2, "#78847a");
    const xx = x > 240 ? x - 11 : x + 12;
    shard(c, xx, y + 1, 2.1, p.crystal, 0.45);
    shard(c, xx - 4, y + 1, 1.4, p.crystal, -0.5);
    light(c, xx, y - 3, 15, p.light + "27");
  }
  for (let i = 0; i < 100; i++) {
    const x = r() * 480,
      y = r() < 0.5 ? r() * 15 : 257 + r() * 14;
    const s = r() * 2 + 0.5;
    poly(
      c,
      [
        [x - s, y],
        [x, y - s],
        [x + s * 2, y],
        [x + s, y + 1],
      ],
      p.stone[2],
    );
  }
  if (biome === 0) {
    // Dyed market cloth, brass lanterns and cast shadows at the courtyard edge.
    for (const [x, y] of [
      [89, 2],
      [326, 1],
      [138, 270],
      [313, 272],
    ]) {
      line(c, x - 19, y - 12, x - 19, y + 4, "#18242a", 2);
      line(c, x + 17, y - 10, x + 17, y + 6, "#18242a", 2);
      for (let j = 0; j < 7; j++) {
        const u = x - 20 + 5 * j,
          v = y - 7 + Math.sin(j * 0.5) * 2;
        poly(
          c,
          [
            [u, v],
            [u + 5, v],
            [u + 8, v + 8],
            [u + 3, v + 8],
          ],
          j % 2 ? "#5f6064" : "#805a62",
        );
        box(c, u + 3, v + 7, 5, 2, j % 2 ? "#817974" : "#a47373");
      }
      light(c, x + 18, y + 6, 14, "#efaa6555");
      box(c, x + 17, y + 4, 2, 3, "#ffd698");
    }
  } else if (biome === 1) {
    for (const [x, y] of [
      [24, 10],
      [153, 7],
      [287, 4],
      [417, 8],
      [55, 274],
      [381, 274],
    ]) {
      poly(
        c,
        [
          [x - 12, y + 5],
          [x - 12, y - 7],
          [x, y - 22],
          [x + 12, y - 7],
          [x + 12, y + 5],
          [x + 8, y + 5],
          [x + 8, y - 6],
          [x, y - 16],
          [x - 8, y - 6],
          [x - 8, y + 5],
        ],
        "#64596c",
      );
      line(c, x - 12, y - 7, x, y - 22, "#b6a6a8");
      line(c, x, y - 22, x + 12, y - 7, "#96848d");
      box(c, x - 14, y + 4, 9, 2, "#807183");
      box(c, x + 6, y + 4, 9, 2, "#807183");
    }
  } else {
    for (let j = 0; j < 5; j++) {
      const x = 34 + j * 90,
        y = j % 2 ? 272 : 7;
      for (let v = 0; v < 6; v++) {
        const u = x + v * 6,
          k = y + Math.sin(v * 1.3) * 3;
        line(c, u, k, u + 7, k + 1, "#544448", 2);
        line(c, u + 3, k, u + 5, k - 5, "#705351");
        for (let n = 0; n < 3; n++)
          box(
            c,
            u + r() * 6,
            k - r() * 6,
            2 + r() * 2,
            1 + r() * 2,
            r() > 0.5 ? "#a76c56" : "#8b524c",
          );
      }
      light(c, x + 10, y, 22, "#fb86652a");
    }
  }
  light(c, 135, -16, 125, p.light + "22");
  light(c, 383, 274, 98, p.light + "16");
  const v = c.createRadialGradient(240, 118, 68, 240, 121, 291);
  v.addColorStop(0, "transparent");
  v.addColorStop(0.74, "#0810190c");
  v.addColorStop(1, "#060d1a96");
  c.fillStyle = v;
  c.fillRect(0, 0, 480, 270);
}
const sprites = {
  vanguard: [
    "       aa      s ",
    "     aaaha    ss ",
    "    ddhhhhd   st ",
    "   dmmhmhhd   st ",
    "   dmmsksmd   st ",
    "    dkfkfkd   st ",
    "     ffffd    st ",
    "   ddaaadkd   st ",
    "  dttawattkd  st ",
    " dtttmwwmhkk dsts",
    " dtttmwwmdffd gfg",
    "  dttmaamd   fgd ",
    "   dttmmmd   gd  ",
    "   dttdkmd       ",
    "   dtd dkdd      ",
    "   dkd  dkd      ",
    "  dkkd  dkkd     ",
  ],
  ranger: [
    "     aa          ",
    "    aaccc        ",
    "   dttcctd       ",
    "   dtcttttd   g  ",
    "  dttdkkttd  gt  ",
    "   ddffwkd   gf  ",
    "    ddfffd   g f ",
    "   dtttatd  g  f ",
    "  dcttttkddgf  f ",
    "  dcttatkkffg  f ",
    " dctttkdad  g f  ",
    " dctttkkkd   gf  ",
    "dctttdkmdd   g   ",
    " dtdkd dkd       ",
    "  dkkd dkd       ",
    " dkkd  dkkd      ",
  ],
  oracle: [
    "    w       a    ",
    "    ta     awc   ",
    "   attt     cc   ",
    "  dctttd    g    ",
    " dccttttd   g    ",
    "  dkkkkd    g    ",
    "  dkwfwd    g    ",
    "  ddfffd    g    ",
    "  dtaaad    g    ",
    " dtttwatd  fg    ",
    "dtcttwattdffg    ",
    " dcttaatk   g    ",
    " dcttttkd   g    ",
    " dcttttkdd  g    ",
    "dcctttttkd       ",
    "daaaaddaad       ",
  ],
  hound: [
    "    t        h   ",
    "   ttk    h hh   ",
    "  ttkdd  thhht   ",
    " dttmmmmttmwwmd  ",
    "dttmmmmmtttkffdd ",
    " dmmmmmmmkkkd    ",
    "  dtkmmdktkd     ",
    "  dtkd   dtd     ",
    " dtfd     dff    ",
  ],
  wisp: [
    "   a   a  ",
    "    t t   ",
    "   dtttd  ",
    "  dhtthtd ",
    " dhtwwthtd",
    "  dtwwttd ",
    "   dtttd  ",
    "    dhd   ",
    "     t    ",
    "    t     ",
  ],
  brute: [
    "    a     a    ",
    "   hta   ath   ",
    "   dhttttthd   ",
    "  dmmtttttmmd  ",
    "  dmmwkkwmmmd  ",
    "   dtffffftd   ",
    "  dttmkkkmtkd  ",
    " dthtmhhhmthtd ",
    "dttttmhhhmttttd",
    "dttdkmmmmmddttd",
    " dfdmtttttmdfd ",
    "  ddttkkkttdd  ",
    "   dtkd dktd   ",
    "  dkkkd dkkkd  ",
  ],
  lancer: [
    "   h       a ",
    "   ht     at ",
    "  htttd    g ",
    " dttmmd    g ",
    " dkwwkd    g ",
    "  dffkd    g ",
    "  dhtttd   g ",
    " dttmmttd  g ",
    " dtmmmtkfdfg ",
    "  dttttd   g ",
    "   dkkd    g ",
    "  dtkdtkd  g ",
    "  dkd  dk  g ",
  ],
  seer: [
    "  a     a  ",
    "  ha   ah  ",
    "  hth hth  ",
    "  dtttttd  ",
    " dttmmtttd ",
    " dtmwwkmtd ",
    "  dkwwkkd  ",
    "  dtmmttd  ",
    " dtttttttd ",
    "dhtttmttthd",
    " dhttttthd ",
    "   dtkd    ",
    "    t      ",
  ],
  warden: [
    " h    a    h ",
    " th  tht  ht ",
    "  tthhhthtt  ",
    "  dtttttttd  ",
    "  dmmtttmmd  ",
    "   dwkkkwd   ",
    "   dfffffd   ",
    " dhttmmmtthd ",
    "dhtttmamtthtd",
    "dttkkmhmmkttd",
    "dtfdmhhhmddtd",
    " d dtttttdfd ",
    "   dtkkktd   ",
    "  dtkd dktd  ",
    "  dkkd dkkd  ",
  ],
  boss: [
    "a       a       a",
    "ha    aaha    aah",
    "tha   httth   aht",
    " hth hhhthhh hth ",
    "  thhhttthtthht  ",
    "   dtttmmmtttd   ",
    "  dttmkkkkkmttd  ",
    "  dtkwwkkkwwktd  ",
    "  dttkkfffkkttd  ",
    "  dttdfffffdttd  ",
    " dhthmmmaammmthd ",
    "dhthttmaaamttthhd",
    "htttttmawamttttth",
    "dttkmmmhahmmmkt td",
    "dttdmmhhahhmmddtd",
    "dtfdmtthhhttmdftd",
    " df dtttttttd fd ",
    "    dttkkkttd    ",
    "   dttkd dkt td   ",
    "   dkffd dffkd   ",
  ],
};
const heroColors = {
  d: "#111827",
  k: "#253149",
  m: "#3f5e72",
  t: "#319cac",
  c: "#21496c",
  h: "#97b4bd",
  a: "#e8b16d",
  w: "#dbfff7",
  f: "#e1ba9e",
  s: "#dedfc8",
  g: "#a77858",
};
const enemyColors = {
  d: "#221a30",
  k: "#352336",
  m: "#5d3b58",
  t: "#864669",
  h: "#b1688c",
  a: "#e99dab",
  w: "#ffd6ad",
  f: "#bf939c",
  g: "#ae907e",
};
function sprite(id) {
  return surface("sprite" + id, 24, 24, (c) => {
    const rows = sprites[id] || sprites.hound;
    const hero =
      Object.hasOwn(sprites, id) &&
      ["ranger", "oracle", "vanguard"].includes(id);
    const p = { ...(hero ? heroColors : enemyColors) };
    if (id === "oracle") {
      p.t = "#557fbd";
      p.c = "#455685";
      p.a = "#93d9ed";
    }
    if (id === "ranger") {
      p.t = "#469181";
      p.c = "#2b655e";
      p.a = "#d8af74";
    }
    if (id === "wisp" || id === "seer") {
      p.t = "#8758b1";
      p.h = "#bd89cc";
      p.w = "#fff3f3";
    }
    if (id === "boss") {
      p.t = "#8c4b66";
      p.a = "#f9bd7a";
      p.h = "#ba7380";
      p.w = "#fff0be";
    }
    const wide = Math.max(...rows.map((v) => v.length));
    const xx = Math.floor((24 - wide) / 2),
      yy = 24 - rows.length;
    rows.forEach((row, y) =>
      [...row].forEach((v, x) => {
        if (p[v]) box(c, xx + x, yy + y, 1, 1, p[v]);
      }),
    );
  });
}
export function drawPortrait(ctx, classId, x, y, size) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite(classId), x, y, size, size);
  ctx.restore();
}
function actor(c, e, hero, t, still) {
  const kind = hero ? e.classId : e.kind;
  const s = hero
    ? 2
    : kind === "boss"
      ? 3.5
      : kind === "warden"
        ? 2.6
        : kind === "wisp"
          ? 1.8
          : 2;
  const x = Math.round(e.x),
    y = Math.round(e.y);
  const moving = hero ? e.moving : true;
  const bob = still
    ? 0
    : Math.round(
        Math.sin(t * (kind === "wisp" ? 4 : 12) + x * 0.02) *
          (moving ? 1.5 : 0),
      );
  const feet = kind === "wisp" || kind === "seer" ? y - 5 : y + 6;
  const rad = hero ? 10 : Math.max(6, e.r || 8);
  ellipse(c, x + 2, y + 7, rad * 1.15, rad * 0.4, "#08101977");
  if (hero) {
    ellipse(c, x, y + 7, 16, 6, "#9ff9ecab", true);
    poly(
      c,
      [
        [x - 3, y - 36 + bob],
        [x, y - 40 + bob],
        [x + 3, y - 36 + bob],
        [x, y - 32 + bob],
      ],
      "#f9d993",
    );
  }
  if (e.windup > 0) {
    ellipse(c, x, y + 5, rad + 7, rad * 0.64 + 3, "#ff835d", true);
    light(c, x, y, rad * 2, "#ff654a48");
  }
  c.save();
  c.translate(x, feet + bob);
  if (Math.cos(e.angle || 0) < 0) c.scale(-1, 1);
  if (hero && e.invuln > 0 && !still)
    c.globalAlpha = 0.68 + 0.3 * Math.abs(Math.sin(t * 30));
  c.drawImage(sprite(kind), -12 * s, -24 * s, 24 * s, 24 * s);
  c.restore();
  if (e.flash > 0) ellipse(c, x, y - 8, 4, 4, "#fff2cd");
  if (!hero && e.hp < e.maxHp && (kind === "boss" || kind === "warden")) {
    const width = kind === "boss" ? 57 : 32,
      top = y - (kind === "boss" ? 72 : 44);
    box(c, x - width / 2, top, width, 3, "#241e29");
    box(
      c,
      x - width / 2,
      top,
      width * Math.max(0, e.hp / e.maxHp),
      2,
      "#ff9d96",
    );
  }
}
function mote(c, x, y, phase) {
  const r = 2 + phase * 0.65;
  poly(
    c,
    [
      [x, y - r * 1.7],
      [x + r, y],
      [x, y + r * 1.6],
      [x - r, y],
    ],
    "#85ebdd",
  );
  box(c, x - 1, y - 1, 1, 2, "#f3ffdc");
}
function fx(c, e, quiet) {
  const f = Math.max(0, Math.min(1, e.life / (e.maxLife || 1))),
    r = Math.max(2, e.r || 10);
  c.save();
  c.globalAlpha = f * (quiet ? 0.55 : 0.9);
  c.strokeStyle = e.color || "#fff2c3";
  c.fillStyle = c.strokeStyle;
  c.lineWidth = quiet ? 1 : 2;
  if (e.kind === "ring" || e.kind === "slash") {
    const a = e.angle || 0;
    c.beginPath();
    c.arc(
      e.x,
      e.y,
      r * (0.35 + 0.65 * (1 - f)),
      e.kind === "slash" ? a - 0.85 : 0,
      e.kind === "slash" ? a + 0.85 : TAU,
    );
    c.stroke();
  } else {
    const count = quiet ? 3 : 7;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + e.x * 0.7,
        dist = r * (1 - f);
      const x = e.x + Math.cos(a) * dist,
        y = e.y + Math.sin(a) * dist * 0.8;
      c.fillRect(Math.round(x), Math.round(y), 2 + (i % 2), 2);
    }
  }
  c.restore();
}
export function render(ctx, game, time = 0, options = {}) {
  const t = options.reducedMotion ? 0 : time,
    quiet = !!(options.reducedEffects || options.reducedMotion);
  ctx.save();
  ctx.setTransform(ctx.canvas.width / W, 0, 0, ctx.canvas.height / H, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (!game) {
    ctx.drawImage(surface("title", 480, 270, title), 0, 0, W, H);
    if (!quiet) {
      for (let i = 0; i < 39; i++) {
        const x = (i * 127 + Math.sin(t * 0.24 + i) * 9) % W,
          y = H - ((i * 63 + t * (3 + (i % 5))) % H);
        box(
          ctx,
          x,
          y,
          1 + (i % 2),
          1 + (i % 2),
          "rgba(232,207,169," + (0.22 + Math.sin(i + t * 0.6) * 0.18) + ")",
        );
      }
    }
    ctx.restore();
    return;
  }
  const biome = Math.max(0, Math.min(2, Math.floor(game.biome || 0)));
  ctx.drawImage(
    surface("arena" + biome, 480, 270, (c) => arena(c, biome)),
    0,
    0,
    W,
    H,
  );
  for (const d of game.drops) mote(ctx, d.x, d.y, Math.sin(t * 4 + d.x));
  const actors = [...game.enemies, game.player].sort((a, b) => a.y - b.y);
  for (const e of actors) actor(ctx, e, e === game.player, t, quiet);
  for (const p of game.projectiles) {
    const a = Math.atan2(p.vy, p.vx),
      r = Math.max(2, p.r || 2),
      col = p.hostile ? "#ff78a7" : p.color || "#a6fff1";
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(a);
    if (p.hostile) {
      poly(
        ctx,
        [
          [-r * 2, 0],
          [0, -r - 1],
          [r + 2, 0],
          [0, r + 1],
        ],
        col,
        "#602642",
      );
      box(ctx, -1, -1, 3, 2, "#fff3de");
    } else {
      poly(
        ctx,
        [
          [-r * 4, 0],
          [-r, -r],
          [r + 2, 0],
          [-r, r],
        ],
        col,
      );
      box(ctx, -2, -1, 4, 2, "#fffbe2");
    }
    ctx.restore();
  }
  for (const e of game.effects) fx(ctx, e, quiet);
  ctx.restore();
}
