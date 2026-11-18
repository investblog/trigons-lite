// The trigons-lite mark: a low-poly gem, 11 facets on a 64-unit square.
// Recipe and the reasoning behind it: ./README.md.
//
//   node docs/brand/mark.mjs > docs/brand/mark.svg

// Vertices. Three loose rows; the outer hull reaches 4..60 so the gem fills the
// square without touching it. Deliberately irregular — a regular lattice reads as
// a pattern, not as a cut stone.
const P = {
  a: [6, 10], b: [30, 4], c: [58, 12], // crown
  d: [20, 30], e: [44, 28], // girdle
  f: [4, 50], g: [32, 46], h: [60, 44], // pavilion
  i: [16, 60], j: [48, 60], // culet
};

// One blue ramp, dark → light. The ends are the library's own defaults:
// 0–1 from `colors` (#16213e, #0f3460), 7 is the `pattern()` stroke (#8fa2ff).
// 2–6 are mid-tones between them, picked by eye.
const RAMP = ['#16213e', '#0f3460', '#1f4f8a', '#2a4f8f', '#3d6fc0', '#5b7fd6', '#6f8ee8', '#8fa2ff'];

// Facets as [vertex, vertex, vertex, ramp step]. Light falls from the top
// centre: the brightest facet sits under the crown's apex, the darkest run
// down the left and right edges, and no two neighbours share a step (11 of the
// 14 shared edges jump three or more; the seam carries the other three).
const FACETS = [
  ['a', 'b', 'd', 4], ['b', 'e', 'd', 7], ['b', 'c', 'e', 5],
  ['c', 'h', 'e', 1], ['a', 'd', 'f', 0], ['d', 'g', 'f', 3],
  ['d', 'e', 'g', 6], ['e', 'h', 'g', 2], ['f', 'g', 'i', 4],
  ['g', 'j', 'i', 1], ['g', 'h', 'j', 5],
];

// Seams: a hairline in the brightest ramp colour — the `lines` mode's edge glow.
const SEAM = { color: RAMP[7], width: '.6' };

const pt = (k) => P[k].join(',');
const faces = FACETS.map(
  ([x, y, z, step]) => `<polygon points="${pt(x)} ${pt(y)} ${pt(z)}" fill="${RAMP[step]}"/>`,
).join('');

process.stdout.write(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g stroke="${SEAM.color}" stroke-width="${SEAM.width}" stroke-linejoin="round">${faces}</g></svg>\n`,
);
