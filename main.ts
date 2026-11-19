// News image for Thursday 19 November 2026.
// Draws a 1024x1024 front-page poster entirely in code: a 5x7 bitmap font
// written by hand, simple vector pictograms, and a small PNG encoder
// (node:zlib + CRC32). No network, no assets, fully deterministic:
// the same bytes on every run.
//
// 38 stories, all first reported on 19 November 2026 (checked against the
// morning news digests of that day: Jagran Josh, SimpleLife, Newsmriti,
// The Daily Jagran, Peter Lewis Asian briefing, AFF, 112.ua and others;
// every story is listed with its source in README.md). The three hero
// stories are the Shenzhen trilateral summit, the GTA VI global rollout
// and Jeffries' nomination as the first Black House Speaker; the index
// below carries 35 more stories across every region and beat.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- PNG ---

const W = 1024;
const H = 1024;

const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

function encodePng(rgb: Uint8Array, w: number, h: number): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0; // filter: none
    raw.set(rgb.subarray(y * w * 3, (y + 1) * w * 3), y * (1 + w * 3) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------- canvas ---

const px = new Uint8Array(W * H * 3);

type RGB = [number, number, number];
const PAPER: RGB = [246, 241, 231];
const INK: RGB = [26, 26, 26];
const NAVY: RGB = [20, 33, 61];
const GOLD: RGB = [201, 162, 39];
const WHITE: RGB = [255, 255, 255];
const MUTED: RGB = [90, 88, 80];
const LIGHT: RGB = [210, 208, 198];

function fill(x: number, y: number, w: number, h: number, c: RGB): void {
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(W, x + w), y1 = Math.min(H, y + h);
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * W + xx) * 3;
      px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
    }
  }
}

function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
}

function line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 2): void {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, x = x0, y = y0;
  for (;;) {
    fill(x - ((t / 2) | 0), y - ((t / 2) | 0), t, t, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

function circle(cx: number, cy: number, r: number, c: RGB, filled: boolean): void {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (filled ? d <= r : Math.abs(d - r) < 1.1) setPixel(cx + x, cy + y, c);
    }
  }
}

// --------------------------------------------------------------- font ---
// 5x7 bitmap font, uppercase + digits + punctuation. Each glyph is 7 rows
// of 5 characters; '1' is a set pixel.

const FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  $: ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
};

const CHAR_W = 6; // 5 px glyph + 1 px spacing

function textWidth(s: string, scale: number): number {
  return s.length * CHAR_W * scale - scale;
}

function drawChar(ch: string, x: number, y: number, scale: number, c: RGB): void {
  const g = FONT[ch] ?? FONT['?'];
  for (let r = 0; r < 7; r++) {
    for (let col = 0; col < 5; col++) {
      if (g[r][col] === '1') fill(x + col * scale, y + r * scale, scale, scale, c);
    }
  }
}

function drawText(s: string, x: number, y: number, scale: number, c: RGB): void {
  for (let i = 0; i < s.length; i++) drawChar(s[i], x + i * CHAR_W * scale, y, scale, c);
}

function drawTextCentered(s: string, cx: number, y: number, scale: number, c: RGB): void {
  drawText(s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, c);
}

function wrap(s: string, scale: number, maxW: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? cur + ' ' + w : w;
    if (textWidth(trial, scale) <= maxW || !cur) cur = trial;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ------------------------------------------------------------ content ---

interface HeroStory {
  tag: string;
  color: RGB;
  headline: string;
  summary: string;
  icon: (x: number, y: number, c: RGB) => void;
}

interface IndexStory {
  tag: string;
  color: RGB;
  headline: string;
}

// Three flag poles for a summit: three masts, each with a triangular pennant.
function iconSummit(x: number, y: number, c: RGB): void {
  for (const fx of [10, 30, 50]) {
    line(x + fx, y + 8, x + fx, y + 56, c, 3);
    line(x + fx + 1, y + 10, x + fx + 13, y + 15, c, 3);
    line(x + fx + 13, y + 15, x + fx + 1, y + 20, c, 3);
  }
  line(x + 4, y + 56, x + 66, y + 56, c, 3);
}

// Game controller: rounded body, d-pad left, buttons right.
function iconGamepad(x: number, y: number, c: RGB): void {
  fill(x + 8, y + 20, 54, 28, c);
  circle(x + 12, y + 34, 10, c, true);
  circle(x + 58, y + 34, 10, c, true);
  fill(x + 20, y + 28, 4, 12, WHITE);
  fill(x + 16, y + 32, 12, 4, WHITE);
  circle(x + 46, y + 30, 3, WHITE, true);
  circle(x + 54, y + 38, 3, WHITE, true);
}

// Gavel: angled handle, head block, sound block below.
function iconGavel(x: number, y: number, c: RGB): void {
  line(x + 16, y + 52, x + 52, y + 16, c, 5);
  fill(x + 42, y + 8, 22, 12, c);
  fill(x + 8, y + 56, 28, 6, c);
}

const HERO: HeroStory[] = [
  {
    tag: 'SUMMIT', color: [20, 33, 61],
    headline: 'TRUMP, XI AND PUTIN MEET IN SHENZHEN',
    summary: 'FIRST TRILATERAL SUMMIT AT APEC. NUCLEAR ARMS AND IRAN ON THE AGENDA.',
    icon: iconSummit,
  },
  {
    tag: 'CULTURE', color: [176, 58, 46],
    headline: 'GTA VI BEGINS GLOBAL ROLLOUT',
    summary: 'GAMERS ENTER VICE CITY AFTER A 13-YEAR WAIT.',
    icon: iconGamepad,
  },
  {
    tag: 'USA', color: [15, 118, 110],
    headline: 'JEFFRIES SET TO BE FIRST BLACK SPEAKER',
    summary: 'DEMOCRATS NOMINATE HAKEEM JEFFRIES TO LEAD THE HOUSE.',
    icon: iconGavel,
  },
];

const RED: RGB = [176, 58, 46];
const BLUE: RGB = [46, 94, 140];
const TEAL: RGB = [15, 118, 110];
const PURPLE: RGB = [109, 40, 217];
const AMBER: RGB = [180, 83, 9];
const SKY: RGB = [3, 105, 161];
const GREEN: RGB = [21, 101, 52];

const INDEX: IndexStory[] = [
  { tag: 'EUROPE', color: BLUE, headline: 'EU PLANS 45BN UKRAINE LOAN FROM RUSSIAN CASH' },
  { tag: 'EUROPE', color: BLUE, headline: '20+ LEADERS MEET IN BERLIN ON UKRAINE GUARANTEES' },
  { tag: 'MIDEAST', color: RED, headline: 'IRAN WIDENS STRIKES TO KUWAIT AND HORMUZ SHIPS' },
  { tag: 'MIDEAST', color: RED, headline: 'SAUDI ARABIA: ALL-CLEAR IN THREE SOUTHERN CITIES' },
  { tag: 'MIDEAST', color: RED, headline: 'US SANCTIONS 3 FIRMS OVER HEZBOLLAH LINKS' },
  { tag: 'MIDEAST', color: RED, headline: 'TANKER HIT IN HORMUZ, CREW SAFE' },
  { tag: 'MIDEAST', color: RED, headline: 'AUSTRALIA SANCTIONS ISRAELI WEST BANK SETTLERS' },
  { tag: 'EUROPE', color: BLUE, headline: 'LPG TANKER THAT SANK OFF BULGARIA WAS HIT BY SHELLS' },
  { tag: 'MIDEAST', color: RED, headline: 'ISRAELI DRONE STRIKE KILLS TWO IN GAZA JABALIYA' },
  { tag: 'AFRICA', color: GREEN, headline: 'SOMALIA ACCUSES UAE OF SECRET BASES ON ITS SOIL' },
  { tag: 'AFRICA', color: GREEN, headline: 'NIGERIAN TROOPS KILL 21 SUSPECTED ISWAP FIGHTERS' },
  { tag: 'AFRICA', color: GREEN, headline: 'COCAINE AND MILLIONS OF PILLS SEIZED IN EAST LIBYA' },
  { tag: 'AMERICAS', color: PURPLE, headline: 'CANADA RECALIBRATES CHINA TIES, CARNEY SEEKS US DEAL' },
  { tag: 'ASIA', color: TEAL, headline: 'XI OPENS APEC, URGES LOWER TRADE BARRIERS' },
  { tag: 'ASIA', color: TEAL, headline: 'INDIA AND JAPAN REVIEW DEFENCE TIES IN TOKYO' },
  { tag: 'ASIA', color: TEAL, headline: 'MODI MEETS WILLIAM AND KATE, BOOSTS UK TIES' },
  { tag: 'AMERICAS', color: PURPLE, headline: 'LIU YUNPING ELECTED HOUSE DEMOCRATIC CAUCUS CHAIR' },
  { tag: 'AMERICAS', color: PURPLE, headline: 'PELTOLA WINS ALASKA AS DEMS TAKE SENATE 56-44' },
  { tag: 'AMERICAS', color: PURPLE, headline: 'US PLANS TOUGHER GREEN-CARD RULES' },
  { tag: 'BUSINESS', color: AMBER, headline: 'FED MINUTES POINT TO MORE RATE HIKES' },
  { tag: 'BUSINESS', color: AMBER, headline: 'INDONESIA HIKES RATES TO 6.0% TO PROP RUPIAH' },
  { tag: 'BUSINESS', color: AMBER, headline: 'OIL FALLS 3.2% TO $83.26 AS WAR RISK SPOOKS MARKETS' },
  { tag: 'BUSINESS', color: AMBER, headline: 'DOW FALLS 561 AS ROUT SPREADS TO ASIAN SHARES' },
  { tag: 'TECH', color: SKY, headline: 'NVIDIA ACTING CEO PROMISES EARLIER PAY RAISES' },
  { tag: 'TECH', color: SKY, headline: 'NVIDIA HALTS H-SERIES CHIP SHIPMENTS TO CHINA' },
  { tag: 'TECH', color: SKY, headline: 'ANTHROPIC SETS IPO PRICE; EARLY BACKERS UP $100BN' },
  { tag: 'TECH', color: SKY, headline: 'MICROSOFT IN TALKS TO SELL AI SERVICES TO BYTEDANCE' },
  { tag: 'SCIENCE', color: TEAL, headline: 'VOYAGER 1 BELIEVED TO HIT ONE LIGHT-DAY MILESTONE' },
  { tag: 'SCIENCE', color: TEAL, headline: 'WHY EARTH IS MISSING A BILLION YEARS' },
  { tag: 'WORLD', color: NAVY, headline: "ISLAM TO BE WORLD'S LARGEST FAITH BY 2035: PEW" },
  { tag: 'WEATHER', color: SKY, headline: 'CYCLONE AKVAN TO CROSS COAST NEAR PURI' },
  { tag: 'TECH', color: SKY, headline: 'US SENATORS WARN AI CYBER THREATS OUTPACE DEFENCES' },
  { tag: 'SPORT', color: GREEN, headline: 'ENGLAND BEAT AUSTRALIA BY 97 RUNS IN ODI DECIDER' },
  { tag: 'SPORT', color: GREEN, headline: 'INDIA V NEW ZEALAND FIRST TEST BEGINS IN WELLINGTON' },
  { tag: 'SPORT', color: GREEN, headline: 'HO CHI MINH CITY POLICE FC STUN BURIRAM UNITED 1-0' },
];

// -------------------------------------------------------------- draw ----

function drawHero(story: HeroStory, x: number, y: number, w: number, h: number, n: number): void {
  fill(x, y, w, h, WHITE);
  fill(x, y, w, 2, INK); fill(x, y + h - 2, w, 2, INK);
  fill(x, y, 2, h, INK); fill(x + w - 2, y, 2, h, INK);
  // Tag bar.
  fill(x + 2, y + 2, w - 4, 30, story.color);
  drawText(story.tag, x + 14, y + 11, 2, WHITE);
  drawText('TOP ' + n, x + w - 76, y + 11, 2, WHITE);
  // Pictogram box, top right below the tag bar.
  const ix = x + w - 80, iy = y + 42;
  fill(ix, iy, 64, 64, [245, 242, 234]);
  fill(ix, iy, 64, 2, story.color); fill(ix, iy + 62, 64, 2, story.color);
  fill(ix, iy, 2, 64, story.color); fill(ix + 62, iy, 2, 64, story.color);
  story.icon(ix - 3, iy - 3, story.color);
  // Headline beside the pictogram, then summary full width.
  const headLines = wrap(story.headline, 2, 196).slice(0, 4);
  headLines.forEach((ln, i) => drawText(ln, x + 14, y + 44 + i * 17, 2, INK));
  let cy = y + 44 + headLines.length * 17 + 8;
  const sumLines = wrap(story.summary, 2, w - 28).slice(0, 3);
  sumLines.forEach((ln, i) => drawText(ln, x + 14, cy + i * 17, 2, MUTED));
  cy += sumLines.length * 17 + 10;
  // Date rule at the foot; cy stays well above it by construction.
  fill(x + 14, y + h - 30, w - 28, 2, LIGHT);
  drawText('19 NOV 2026', x + 14, y + h - 22, 2, MUTED);
  drawText('NO. ' + n, x + w - 62, y + h - 22, 2, MUTED);
}

function drawIndexRow(story: IndexStory, x: number, y: number, w: number, n: number): void {
  // Tag line (scale 1) then headline, at most 2 lines at scale 2.
  drawText(String(n).padStart(2, '0') + '  ' + story.tag, x, y + 1, 1, story.color);
  const lines = wrap(story.headline, 2, w).slice(0, 2);
  if (wrap(story.headline, 2, w).length > 2) console.warn('headline overflows 2 lines: ' + story.headline);
  lines.forEach((ln, i) => drawText(ln, x, y + 12 + i * 16, 2, INK));
  fill(x, y + 44, w, 1, LIGHT);
}

function draw(): void {
  fill(0, 0, W, H, PAPER);
  // Masthead.
  fill(0, 0, W, 138, NAVY);
  fill(0, 138, W, 4, GOLD);
  drawTextCentered('THE WORLD IN ONE DAY', W / 2, 16, 2, GOLD);
  drawTextCentered('THURSDAY 19 NOVEMBER 2026', W / 2, 46, 4, WHITE);
  drawTextCentered('38 STORIES FROM AROUND THE GLOBE', W / 2, 106, 2, [200, 205, 220]);
  // Hero row: 3 panels.
  const hw = 320, hh = 232, hy = 152;
  HERO.forEach((s, i) => drawHero(s, 16 + i * (hw + 16), hy, hw, hh, i + 1));
  // Index header.
  drawText('THE DAY IN BRIEF', 16, 396, 2, NAVY);
  drawText('35 MORE STORIES', 1024 - 16 - textWidth('35 MORE STORIES', 2), 396, 2, MUTED);
  fill(16, 416, 992, 2, NAVY);
  // Index: 3 columns, 12 rows each, row height 46.
  const colW = 320, rowH = 44, topY = 424;
  const perCol = 12;
  INDEX.forEach((s, i) => {
    const col = Math.floor(i / perCol), row = i % perCol;
    drawIndexRow(s, 16 + col * (colW + 16), topY + row * rowH, colW, i + 4);
  });
  // Footer.
  drawTextCentered('FIRST REPORTED THURSDAY 19 NOVEMBER 2026', W / 2, 972, 2, MUTED);
  drawTextCentered('ASIA - EUROPE - AMERICAS - MIDEAST - AFRICA - TECH - SPORT', W / 2, 996, 1, MUTED);
}

// ---------------------------------------------------------------- main ---

draw();
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePng(px, W, H));
