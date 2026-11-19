// News poster for Thursday 19 November 2026, v2.
// Renders a 1024x1024 editorial poster in pure code and writes it to
// $MAKEFUN_OUTPUT_DIR/entry.png (default /output). No network, no assets,
// no fonts on disk: a hand-built 5x7 bitmap font (each glyph is seven
// 5-bit rows), small vector pictograms drawn with lines and circles, and
// a minimal PNG writer (node:zlib + a CRC32 table built at start-up).
// The run is deterministic: identical inputs always give identical bytes.
//
// Layout, top to bottom:
//   masthead (navy band, date + story count)
//   eight lead panels (4 x 2) with pictograms
//   a markets + sport ticker strip
//   a UTC timeline strip of the day's turning points
//   a four-column index of the remaining 132 stories, by region
//   a date-check footer naming the sources
// 140 stories in all, every one first reported on 19 November 2026
// (see stories.ts and the source list in README.md).

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import { GRID, LEADS, MARKS, SOURCE_LINE, TICKER, TOTAL } from './stories.ts';

const W = 1024;
const H = 1024;

type Colour = [number, number, number];

const NAVY: Colour = [16, 24, 64];
const INK: Colour = [18, 18, 22];
const PAPER: Colour = [250, 246, 236];
const PANEL: Colour = [255, 255, 255];
const GOLD: Colour = [196, 148, 44];
const WHITE: Colour = [255, 255, 255];
const PALE: Colour = [210, 214, 230];
const MUTED: Colour = [90, 90, 100];
const FAINT: Colour = [205, 205, 210];
const TINT: Colour = [238, 240, 246];

const HUES: Record<string, Colour> = {
  red: [178, 34, 34],
  blue: [30, 80, 160],
  teal: [0, 128, 128],
  green: [34, 139, 34],
  navy: [16, 24, 64],
  gold: [176, 128, 20],
  purple: [110, 60, 160],
  orange: [200, 100, 20],
};

// ------------------------------------------------------------- PNG out ---

// Build the CRC32 table (polynomial 0xEDB88320) once, at start-up.
function buildCrcTable(): number[] {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table.push(c >>> 0);
  }
  return table;
}

const CRC_TABLE = buildCrcTable();

function crcOf(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crcOf(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

function toPng(rgb: Uint8Array, w: number, h: number): Buffer {
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
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// -------------------------------------------------------------- canvas ---

class Board {
  data = new Uint8Array(W * H * 3);

  fill(x: number, y: number, w: number, h: number, c: Colour): void {
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(W, x + w);
    const y1 = Math.min(H, y + h);
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const o = (yy * W + xx) * 3;
        this.data[o] = c[0];
        this.data[o + 1] = c[1];
        this.data[o + 2] = c[2];
      }
    }
  }

  dot(x: number, y: number, c: Colour): void {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const o = (y * W + x) * 3;
    this.data[o] = c[0];
    this.data[o + 1] = c[1];
    this.data[o + 2] = c[2];
  }

  hline(x: number, y: number, len: number, c: Colour): void {
    this.fill(x, y, len, 1, c);
  }

  vline(x: number, y: number, len: number, c: Colour): void {
    this.fill(x, y, 1, len, c);
  }

  // Bresenham line, any slope.
  line(x0: number, y0: number, x1: number, y1: number, c: Colour): void {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (;;) {
      this.dot(x, y, c);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }

  // Filled disc centred at (cx, cy).
  disc(cx: number, cy: number, r: number, c: Colour): void {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) this.dot(x, y, c);
      }
    }
  }

  // Ring (outline circle) centred at (cx, cy).
  ring(cx: number, cy: number, r: number, c: Colour): void {
    for (let a = 0; a < 360; a += 2) {
      const rad = (a * Math.PI) / 180;
      this.dot(Math.round(cx + r * Math.cos(rad)), Math.round(cy + r * Math.sin(rad)), c);
    }
  }

  // Filled triangle, apex (x1,y1), base (x2,y2)-(x3,y3), scanline fill.
  tri(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, c: Colour): void {
    const minY = Math.min(y1, y2, y3);
    const maxY = Math.max(y1, y2, y3);
    for (let y = minY; y <= maxY; y++) {
      const xs: number[] = [];
      const edges: [number, number, number, number][] = [
        [x1, y1, x2, y2],
        [x2, y2, x3, y3],
        [x3, y3, x1, y1],
      ];
      for (const [ax, ay, bx, by] of edges) {
        if ((ay <= y && by > y) || (by <= y && ay > y)) {
          xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
        }
      }
      if (xs.length >= 2) {
        const lo = Math.min(...xs);
        const hi = Math.max(...xs);
        for (let x = Math.ceil(lo); x <= hi; x++) this.dot(x, y, c);
      }
    }
  }
}

// ---------------------------------------------------------------- font ---

// 5x7 bitmap font: each glyph is seven 5-bit rows, top row first.
// Bit 4 is the leftmost pixel. Only uppercase, digits and the punctuation
// the poster uses; text is uppercased before drawing.
const GLYPHS: Record<string, number[]> = {
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  '0': [14, 17, 19, 21, 25, 17, 14],
  '1': [4, 12, 4, 4, 4, 4, 14],
  '2': [14, 17, 1, 6, 8, 16, 31],
  '3': [31, 2, 4, 2, 1, 17, 14],
  '4': [2, 6, 10, 18, 31, 2, 2],
  '5': [31, 16, 30, 1, 1, 17, 14],
  '6': [6, 8, 16, 30, 17, 17, 14],
  '7': [31, 1, 2, 4, 8, 8, 8],
  '8': [14, 17, 17, 14, 17, 17, 14],
  '9': [14, 17, 17, 15, 1, 2, 12],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0, 12],
  ',': [0, 0, 0, 0, 0, 12, 8],
  ':': [0, 12, 12, 0, 12, 12, 0],
  ';': [0, 12, 12, 0, 12, 4, 8],
  '-': [0, 0, 0, 14, 0, 0, 0],
  "'": [0, 4, 4, 8, 0, 0, 0],
  '/': [1, 2, 2, 4, 8, 8, 16],
  '(': [2, 4, 8, 8, 8, 4, 2],
  ')': [8, 4, 2, 2, 2, 4, 8],
  '%': [24, 25, 2, 4, 8, 19, 3],
  $: [4, 15, 20, 14, 5, 30, 4],
  '&': [12, 18, 20, 8, 21, 18, 13],
  '+': [0, 4, 4, 14, 4, 4, 0],
  '=': [0, 0, 31, 0, 31, 0, 0],
  '?': [14, 17, 1, 2, 4, 0, 4],
  '!': [4, 4, 4, 4, 4, 0, 4],
  '"': [10, 10, 10, 0, 0, 0, 0],
  '*': [0, 4, 21, 14, 21, 4, 0],
};

const ADVANCE = 6; // glyph advance in pixels at scale 1 (5 px + 1 px gap)

function measure(text: string, scale: number): number {
  return text.length * ADVANCE * scale - scale;
}

function putChar(b: Board, ch: string, x: number, y: number, scale: number, c: Colour): void {
  const rows = GLYPHS[ch] ?? GLYPHS['?'];
  for (let r = 0; r < 7; r++) {
    for (let col = 0; col < 5; col++) {
      if ((rows[r] >> (4 - col)) & 1) b.fill(x + col * scale, y + r * scale, scale, scale, c);
    }
  }
}

function putLine(b: Board, s: string, x: number, y: number, scale: number, c: Colour): void {
  const up = s.toUpperCase();
  for (let i = 0; i < up.length; i++) putChar(b, up[i], x + i * ADVANCE * scale, y, scale, c);
}

function putCentred(b: Board, s: string, cx: number, y: number, scale: number, c: Colour): void {
  putLine(b, s, cx - Math.floor(measure(s.toUpperCase(), scale) / 2), y, scale, c);
}

// Greedy word wrap into lines no wider than maxW pixels.
function splitLines(s: string, scale: number, maxW: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? cur + ' ' + w : w;
    if (measure(trial.toUpperCase(), scale) <= maxW || !cur) cur = trial;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------------------------------------------------------- pictograms ---

// Each icon is drawn inside a 48x48 box at (x, y) in colour c.
function paintGlyph(b: Board, name: string, x: number, y: number, c: Colour): void {
  const cx = x + 24;
  const cy = y + 24;
  if (name === 'summit') {
    // Three heads around a table: three-way talks.
    b.disc(cx - 13, cy - 8, 7, c);
    b.disc(cx + 13, cy - 8, 7, c);
    b.disc(cx, cy - 14, 7, c);
    b.fill(cx - 20, cy + 4, 40, 4, c);
    b.fill(cx - 20, cy + 8, 4, 12, c);
    b.fill(cx + 16, cy + 8, 4, 12, c);
  } else if (name === 'game') {
    // Gamepad: rounded body, d-pad, two buttons.
    b.fill(cx - 18, cy - 10, 36, 20, c);
    b.disc(cx - 18, cy, 10, c);
    b.disc(cx + 18, cy, 10, c);
    b.fill(cx - 12, cy - 3, 3, 8, WHITE);
    b.fill(cx - 14, cy - 1, 7, 3, WHITE);
    b.disc(cx + 9, cy - 4, 2, WHITE);
    b.disc(cx + 14, cy + 3, 2, WHITE);
  } else if (name === 'gavel') {
    // Gavel: diagonal handle, head, sounding block.
    b.line(cx - 12, cy + 12, cx + 10, cy - 10, c);
    b.line(cx - 11, cy + 13, cx + 11, cy - 9, c);
    b.fill(cx + 6, cy - 16, 16, 8, c);
    b.fill(cx - 2, cy - 14, 4, 4, c);
    b.fill(cx - 16, cy + 12, 24, 4, c);
  } else if (name === 'missile') {
    // Missile rising with flame.
    b.tri(cx, cy - 20, cx - 6, cy - 4, cx + 6, cy - 4, c);
    b.fill(cx - 6, cy - 4, 12, 14, c);
    b.tri(cx - 6, cy + 2, cx - 12, cy + 8, cx - 6, cy + 10, c);
    b.tri(cx + 6, cy + 2, cx + 12, cy + 8, cx + 6, cy + 10, c);
    b.tri(cx - 4, cy + 10, cx + 4, cy + 10, cx, cy + 20, GOLD);
  } else if (name === 'cloud') {
    // Cloud with a cross: the outage.
    b.disc(cx - 10, cy - 2, 9, c);
    b.disc(cx + 6, cy - 6, 11, c);
    b.disc(cx + 12, cy + 2, 7, c);
    b.fill(cx - 18, cy - 2, 36, 10, c);
    b.line(cx - 6, cy + 12, cx + 8, cy + 20, WHITE);
    b.line(cx + 8, cy + 12, cx - 6, cy + 20, WHITE);
  } else if (name === 'chart') {
    // Rising bars with an arrow.
    b.fill(cx - 18, cy + 6, 7, 12, c);
    b.fill(cx - 7, cy - 2, 7, 20, c);
    b.fill(cx + 4, cy - 10, 7, 28, c);
    b.line(cx - 18, cy - 12, cx + 16, cy - 16, c);
    b.line(cx + 16, cy - 16, cx + 10, cy - 10, c);
    b.line(cx + 16, cy - 16, cx + 8, cy - 16, c);
  } else if (name === 'euro') {
    // Coin ring with euro bars.
    b.ring(cx, cy, 17, c);
    b.fill(cx - 8, cy - 8, 16, 3, c);
    b.fill(cx - 8, cy - 1, 16, 3, c);
    b.fill(cx - 8, cy + 6, 16, 3, c);
    b.fill(cx - 8, cy - 8, 3, 17, c);
  } else if (name === 'scales') {
    // Scales of justice.
    b.vline(cx, cy - 16, 30, c);
    b.hline(cx - 16, cy - 16, 32, c);
    b.hline(cx - 8, cy + 14, 16, c);
    b.line(cx - 16, cy - 16, cx - 20, cy - 2, c);
    b.line(cx - 16, cy - 16, cx - 12, cy - 2, c);
    b.tri(cx - 22, cy - 2, cx - 10, cy - 2, cx - 16, cy + 8, c);
    b.line(cx + 16, cy - 16, cx + 12, cy - 2, c);
    b.line(cx + 16, cy - 16, cx + 20, cy - 2, c);
    b.tri(cx + 10, cy - 2, cx + 22, cy - 2, cx + 16, cy + 8, c);
  }
}

// -------------------------------------------------------------- layout ---

function paintMasthead(b: Board): void {
  b.fill(0, 0, W, 100, NAVY);
  b.fill(0, 100, W, 4, GOLD);
  putCentred(b, 'THE WORLD IN ONE DAY', W / 2, 12, 2, GOLD);
  putCentred(b, 'THURSDAY 19 NOVEMBER 2026', W / 2, 38, 4, WHITE);
  putCentred(b, TOTAL + ' STORIES FROM EVERY REGION - FIRST REPORTED TODAY', W / 2, 84, 2, PALE);
}

function paintLead(
  b: Board,
  lead: (typeof LEADS)[number],
  x: number,
  y: number,
  w: number,
  h: number,
  n: number,
): void {
  const hue = HUES[lead.hue];
  b.fill(x, y, w, h, PANEL);
  b.fill(x, y, w, 2, INK);
  b.fill(x, y + h - 2, w, 2, INK);
  b.fill(x, y, 2, h, INK);
  b.fill(x + w - 2, y, 2, h, INK);
  // Kicker bar.
  b.fill(x + 2, y + 2, w - 4, 18, hue);
  putLine(b, lead.kicker, x + 10, y + 8, 1, WHITE);
  putLine(b, '0' + n, x + w - 28, y + 8, 1, WHITE);
  // Pictogram, top right, in a tinted square.
  const ix = x + w - 58;
  const iy = y + 26;
  b.fill(ix, iy, 48, 48, TINT);
  b.fill(ix, iy, 48, 2, hue);
  b.fill(ix, iy + 46, 48, 2, hue);
  b.fill(ix, iy, 2, 48, hue);
  b.fill(ix + 46, iy, 2, 48, hue);
  paintGlyph(b, lead.glyph, ix, iy, hue);
  // Headline, scale 2, up to 3 lines, left of the pictogram.
  const heads = splitLines(lead.head, 2, w - 24 - 48 - 6);
  heads.slice(0, 3).forEach((ln, i) => putLine(b, ln, x + 10, y + 28 + i * 16, 2, INK));
  // Deck, full width, scale 2, up to 3 lines.
  const decks = splitLines(lead.deck, 2, w - 20);
  decks.slice(0, 3).forEach((ln, i) => putLine(b, ln, x + 10, y + 84 + i * 16, 2, MUTED));
  // Foot rule + date.
  b.fill(x + 10, y + h - 18, w - 20, 2, FAINT);
  putLine(b, '19 NOV 2026', x + 10, y + h - 12, 1, MUTED);
}

function paintTicker(b: Board): void {
  const y0 = 432;
  b.fill(0, y0, W, 24, NAVY);
  putCentred(b, TICKER, W / 2, y0 + 8, 1, GOLD);
}

function paintTimeline(b: Board): void {
  const y0 = 464;
  b.fill(0, y0, W, 44, NAVY);
  putLine(b, 'UTC', 14, y0 + 8, 2, GOLD);
  putLine(b, 'TIMELINE', 14, y0 + 26, 1, PALE);
  const slot = (W - 130) / MARKS.length;
  MARKS.forEach((ev, i) => {
    const cx = 130 + slot * i + slot / 2;
    b.ring(Math.round(cx), y0 + 10, 3, GOLD);
    putCentred(b, ev.at, cx, y0 + 17, 1, WHITE);
    const label = splitLines(ev.what, 1, Math.floor(slot) - 8);
    label.slice(0, 2).forEach((ln, j) => putCentred(b, ln, cx, y0 + 26 + j * 9, 1, PALE));
  });
}

function paintIndex(b: Board): void {
  const y0 = 516;
  const colW = 242;
  const gap = 10;
  const x0 = 12;
  putLine(b, 'THE REST OF THE DAY - 132 MORE STORIES', x0, y0, 2, INK);
  b.fill(x0, y0 + 20, W - 24, 2, INK);
  // Two region blocks per column, four columns.
  const columns: (typeof GRID)[] = [
    [GRID[0], GRID[1]],
    [GRID[2], GRID[3]],
    [GRID[4], GRID[5]],
    [GRID[6], GRID[7]],
  ];
  columns.forEach((blocks, ci) => {
    const cx = x0 + ci * (colW + gap);
    let y = y0 + 32;
    let num = 0;
    for (const block of blocks) {
      const hue = HUES[block.hue];
      putLine(b, block.name, cx, y, 1, hue);
      b.fill(cx, y + 10, colW, 2, hue);
      y += 15;
      for (const item of block.lines) {
        num++;
        const label = String(num).padStart(2, '0') + ' ' + item;
        putLine(b, label, cx, y, 1, INK);
        y += 10;
      }
      y += 6;
    }
  });
}

function paintFooter(b: Board): void {
  const y0 = 964;
  b.fill(0, y0, W, 2, GOLD);
  putCentred(b, 'DATE CHECK: EVERY STORY FIRST REPORTED THU 19 NOV 2026', W / 2, y0 + 10, 2, INK);
  putCentred(b, 'SOURCES: ' + SOURCE_LINE, W / 2, y0 + 32, 1, MUTED);
  putCentred(b, 'DRAWN IN CODE - 1024 X 1024 - NO PHOTOS, NO NETWORK', W / 2, y0 + 44, 1, MUTED);
}

function paintPoster(): Board {
  const b = new Board();
  b.fill(0, 0, W, H, PAPER);
  paintMasthead(b);
  // Lead grid: 4 columns x 2 rows.
  const pw = 244;
  const ph = 152;
  LEADS.forEach((lead, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    paintLead(b, lead, 12 + col * (pw + 8), 112 + row * (ph + 8), pw, ph, i + 1);
  });
  paintTicker(b);
  paintTimeline(b);
  paintIndex(b);
  paintFooter(b);
  return b;
}

// ---------------------------------------------------------------- main ---

const board = paintPoster();
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'entry.png'), toPng(board.data, W, H));
