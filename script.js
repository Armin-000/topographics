import * as Perlin from "https://esm.sh/@chriscourses/perlin-noise";

/* ===========================
   SETTINGS
   =========================== */

const settings = {
  thresholdIncrement: 4,
  thickLineThresholdMultiple: 4,
  res: 7,
  baseZOffset: 0.00018,
  lineColor: "rgba(255,138,0,0.92)",
  thickLineWidth: 2.6,
  thinLineWidth: 1.2,
  mouseRadius: 7,
  mouseIncrement: 0.0034,
  mouseDecay: 0.985
};

/* ===========================
   STATE
   =========================== */

const canvas = document.getElementById("res-canvas");
const ctx = canvas.getContext("2d");

let W, H, cols, rows;
let inputValues = [];
let zBoostValues = [];
let zOffset = 0;

let noiseMin = 100;
let noiseMax = 0;
let currentThreshold = 0;

let mousePos = { x: -9999, y: -9999 };
let mouseDown = false;

/* ===========================
   RESIZE
   =========================== */

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W;
  canvas.height = H;

  cols = Math.floor(W / settings.res) + 2;
  rows = Math.floor(H / settings.res) + 2;

  inputValues = Array.from({ length: rows }, () => new Array(cols).fill(0));
  zBoostValues = Array.from({ length: rows }, () => new Array(cols).fill(0));
}

window.addEventListener("resize", resize);

/* ===========================
   INTERACTION
   =========================== */

canvas.addEventListener("pointermove", (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

canvas.addEventListener("pointerdown", () => mouseDown = true);
window.addEventListener("pointerup", () => mouseDown = false);

/* ===========================
   NOISE
   =========================== */

function generateNoise() {
  noiseMin = 100;
  noiseMax = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {

      const value = Perlin.noise(
        x * 0.02,
        y * 0.02,
        zOffset + zBoostValues[y][x]
      ) * 100;

      inputValues[y][x] = value;

      if (value < noiseMin) noiseMin = value;
      if (value > noiseMax) noiseMax = value;

      if (zBoostValues[y][x] > 0)
        zBoostValues[y][x] *= settings.mouseDecay;
    }
  }
}

/* ===========================
   MOUSE BUMP
   =========================== */

function mouseOffset() {
  const x = Math.floor(mousePos.x / settings.res);
  const y = Math.floor(mousePos.y / settings.res);

  const r = settings.mouseRadius;

  for (let i = -r; i <= r; i++) {
    for (let j = -r; j <= r; j++) {

      const d = i * i + j * j;
      if (d > r * r) continue;

      const yy = y + i;
      const xx = x + j;

      if (zBoostValues[yy]?.[xx] === undefined) continue;

      zBoostValues[yy][xx] +=
        settings.mouseIncrement * (1 - d / (r * r));
    }
  }
}

/* ===========================
   MARCHING SQUARES
   =========================== */

function binaryToType(nw, ne, se, sw) {
  return (nw << 3) | (ne << 2) | (se << 1) | sw;
}

function lerp(a, b) {
  if (a === b) return 0;
  return (currentThreshold - a) / (b - a);
}

function line(a, b) {
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
}

function drawCell(x, y) {

  const nw = inputValues[y][x];
  const ne = inputValues[y][x + 1];
  const se = inputValues[y + 1][x + 1];
  const sw = inputValues[y + 1][x];

  const type = binaryToType(
    nw > currentThreshold ? 1 : 0,
    ne > currentThreshold ? 1 : 0,
    se > currentThreshold ? 1 : 0,
    sw > currentThreshold ? 1 : 0
  );

  const r = settings.res;

  const a = [x * r + r * lerp(nw, ne), y * r];
  const b = [x * r + r, y * r + r * lerp(ne, se)];
  const c = [x * r + r * lerp(sw, se), y * r + r];
  const d = [x * r, y * r + r * lerp(nw, sw)];

  switch (type) {
    case 1: case 14: line(d, c); break;
    case 2: case 13: line(b, c); break;
    case 3: case 12: line(d, b); break;
    case 4: case 11: line(a, b); break;
    case 5: line(d, a); line(c, b); break;
    case 6: case 9: line(c, a); break;
    case 7: case 8: line(d, a); break;
    case 10: line(a, b); line(c, d); break;
  }
}

/* ===========================
   RENDER
   =========================== */

function renderThreshold() {

  const major =
    currentThreshold %
    (settings.thresholdIncrement * settings.thickLineThresholdMultiple) === 0;

  ctx.lineWidth = major
    ? settings.thickLineWidth
    : settings.thinLineWidth;

  ctx.strokeStyle = settings.lineColor;

  ctx.beginPath();

  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {

      const v00 = inputValues[y][x];
      const v10 = inputValues[y][x + 1];
      const v11 = inputValues[y + 1][x + 1];
      const v01 = inputValues[y + 1][x];

      if (
        (v00 > currentThreshold &&
         v10 > currentThreshold &&
         v11 > currentThreshold &&
         v01 > currentThreshold) ||
        (v00 < currentThreshold &&
         v10 < currentThreshold &&
         v11 < currentThreshold &&
         v01 < currentThreshold)
      ) continue;

      drawCell(x, y);
    }
  }

  ctx.shadowColor = "rgba(255,138,0,0.35)";
  ctx.shadowBlur = 14;

  ctx.stroke();
  ctx.shadowBlur = 0;
}

/* ===========================
   LOOP
   =========================== */

function animate() {

  if (mouseDown) mouseOffset();

  ctx.clearRect(0, 0, W, H);

  zOffset += settings.baseZOffset;
  generateNoise();

  const inc = settings.thresholdIncrement;
  const min = Math.floor(noiseMin / inc) * inc;
  const max = Math.ceil(noiseMax / inc) * inc;

  for (let t = min; t < max; t += inc) {
    currentThreshold = t;
    renderThreshold();
  }

  requestAnimationFrame(animate);
}

/* ===========================
   START
   =========================== */

resize();
animate();