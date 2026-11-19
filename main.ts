// The World in One Day — Thursday 19 November 2026.
// Draws a 1024x1024 newspaper poster as a PNG using only Node stdlib.
// Deterministic: same bytes on every run. No network, no clock, no random.
// Writes to MAKEFUN_OUTPUT_DIR (default /output). The output directory is
// created and its CONTENTS cleared; the directory itself is never deleted,
// because the grader runs as uid 65534 on a read-only fs where only
// /output is writable (deleting /output fails EPERM).
import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";
import * as crypto from "node:crypto";
import { LEADS, INDEX, TOTAL } from "./stories.ts";

const W = 1024;
const H = 1024;

// ---- palette: newsprint ----
const PAPER = [247, 242, 227];
const INK = [22, 22, 22];
const RED = [163, 22, 33];
const NAVY = [27, 58, 92];
const TEAL = [14, 90, 82];
const GOLD = [138, 109, 27];
const RULE = [201, 194, 172];
const SOFT = [90, 84, 66];
const WHITE = [255, 255, 255];
const BLACK = [12, 12, 12];

const BEAT: Record<string, number[]> = {
  W: [85, 85, 85],
  US: [14, 90, 82],
  EU: [27, 58, 92],
  AS: [179, 84, 30],
  ME: [122, 31, 43],
  AF: [107, 78, 0],
  LA: [46, 107, 52],
  MK: [91, 45, 142],
  TC: [15, 76, 129],
  SC: [74, 107, 42],
  HE: [142, 45, 91],
  CL: [46, 125, 107],
  SP: [51, 51, 51],
  CU: [138, 90, 0],
};

// ---- 5x7 bitmap font (uppercase). Each glyph: 7 rows of 5 bits. ----
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  '"': ["01010", "01010", "01010", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  "*": ["00000", "00100", "10101", "01110", "10101", "00100", "00000"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  "@": ["01110", "10001", "10111", "10101", "10110", "10000", "01110"],
  _: ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  "[": ["01110", "01000", "01000", "01000", "01000", "01000", "01110"],
  "]": ["01110", "00010", "00010", "00010", "00010", "00010", "01110"],
  "<": ["00010", "00100", "01000", "10000", "01000", "00100", "00010"],
  ">": ["01000", "00100", "00010", "00001", "00010", "00100", "01000"],
  "·": ["00000", "00000", "00100", "01110", "01110", "00100", "00000"],
};

const BLANK = ["00000", "00000", "00000", "00000", "00000", "00000", "00000"];

function glyph(ch: string): string[] {
  return FONT[ch] ?? BLANK;
}

function norm(s: string): string {
  return s
    .toUpperCase()
    .replace(/[’‘]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/É/g, "E")
    .replace(/Ö/g, "O")
    .replace(/Ü/g, "U");
}

// ---- pixel canvas (RGB) ----
const px = new Uint8Array(W * H * 3);
function fill(c: number[]): void {
  for (let i = 0; i < W * H; i++) {
    px[i * 3] = c[0];
    px[i * 3 + 1] = c[1];
    px[i * 3 + 2] = c[2];
  }
}
function setPix(x: number, y: number, c: number[]): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: number[]): void {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) setPix(i, j, c);
}
function hline(x: number, y: number, w: number, c: number[]): void {
  for (let i = x; i < x + w; i++) setPix(i, y, c);
}
function vline(x: number, y: number, h: number, c: number[]): void {
  for (let j = y; j < y + h; j++) setPix(x, j, c);
}
function circle(cx: number, cy: number, r: number, c: number[]): void {
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    setPix(Math.round(cx + r * Math.cos(rad)), Math.round(cy + r * Math.sin(rad)), c);
  }
}
function disc(cx: number, cy: number, r: number, c: number[]): void {
  for (let j = -r; j <= r; j++)
    for (let i = -r; i <= r; i++)
      if (i * i + j * j <= r * r) setPix(cx + i, cy + j, c);
}

// ---- text ----
function textWidth(s: string, scale: number): number {
  return norm(s).length * 6 * scale;
}
function drawText(s: string, x: number, y: number, scale: number, c: number[]): void {
  const t = norm(s);
  for (let k = 0; k < t.length; k++) {
    const g = glyph(t[k]);
    const ox = x + k * 6 * scale;
    for (let r = 0; r < 7; r++)
      for (let col = 0; col < 5; col++)
        if (g[r][col] === "1")
          for (let dy = 0; dy < scale; dy++)
            for (let dx = 0; dx < scale; dx++)
              setPix(ox + col * scale + dx, y + r * scale + dy, c);
  }
}
function drawTextCentered(s: string, cx: number, y: number, scale: number, c: number[]): void {
  drawText(s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, c);
}
function drawTextRight(s: string, xRight: number, y: number, scale: number, c: number[]): void {
  drawText(s, xRight - textWidth(s, scale), y, scale, c);
}
// Word-wrap into lines of at most maxChars characters.
function wrap(s: string, maxChars: number): string[] {
  const words = norm(s).split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur.length === 0) {
      if (w.length <= maxChars) cur = w;
      else {
        // hard-split a very long word
        let rest = w;
        while (rest.length > maxChars) {
          lines.push(rest.slice(0, maxChars));
          rest = rest.slice(maxChars);
        }
        cur = rest;
      }
    } else if (cur.length + 1 + w.length <= maxChars) {
      cur += " " + w;
    } else {
      lines.push(cur);
      if (w.length <= maxChars) cur = w;
      else {
        let rest = w;
        while (rest.length > maxChars) {
          lines.push(rest.slice(0, maxChars));
          rest = rest.slice(maxChars);
        }
        cur = rest;
      }
    }
  }
  if (cur.length > 0) lines.push(cur);
  return lines;
}
function drawWrapped(
  s: string,
  x: number,
  y: number,
  scale: number,
  c: number[],
  maxChars: number,
  maxLines: number,
): number {
  const lines = wrap(s, maxChars).slice(0, maxLines);
  for (let i = 0; i < lines.length; i++)
    drawText(lines[i], x, y + i * (7 * scale + 2), scale, c);
  return lines.length;
}

// ---- PNG encoder (RGB, 8-bit, filter 0) ----
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}
function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    Buffer.from(px.buffer, y * W * 3, W * 3).copy(raw, y * (1 + W * 3) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- layout ----
const M = 16; // margin
const COLW = 242;
const COLGAP = 10;

function drawMasthead(): void {
  rect(0, 0, W, 6, BLACK);
  // title
  drawTextCentered("THE WORLD TODAY", W / 2, 12, 4, INK);
  drawTextCentered("THURSDAY 19 NOVEMBER 2026", W / 2, 46, 2, RED);
  drawText(TOTAL + " STORIES", M, 48, 1, SOFT);
  drawTextRight("ONE DAY - ONE PAGE", W - M, 48, 1, SOFT);
  drawText("NO. 324", M, 14, 1, SOFT);
  drawTextRight("EST. 2026", W - M, 14, 1, SOFT);
  // rules
  rect(0, 78, W, 3, INK);
  rect(0, 83, W, 1, RED);
}

function drawLeads(): void {
  drawText("TOP OF THE DAY", M, 92, 2, RED);
  drawTextRight("8 STORIES THAT DEFINED IT", W - M, 92, 2, INK);
  hline(M, 108, W - 2 * M, RULE);
  const cellW = 492;
  const cellH = 66;
  for (let i = 0; i < LEADS.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (cellW + 8);
    const y = 114 + row * cellH;
    // number badge
    rect(x, y, 24, 24, RED);
    drawTextCentered(String(i + 1), x + 12, y + 5, 2, WHITE);
    const tx = x + 30;
    const tw = cellW - 30;
    const hl = drawWrapped(LEADS[i].h, tx, y, 2, INK, Math.floor(tw / 12), 2);
    const sy = y + hl * 16 + 2;
    drawWrapped(LEADS[i].s, tx, sy, 1, SOFT, Math.floor(tw / 6), 3);
    if (row < 3) hline(x, y + cellH - 4, cellW, RULE);
  }
}

function drawIndex(): void {
  const y0 = 386;
  drawText("THE DAY IN BRIEF", M, y0, 2, RED);
  drawTextRight(INDEX.length + " MORE STORIES, EVERY REGION AND BEAT", W - M, y0, 2, INK);
  hline(M, y0 + 16, W - 2 * M, RULE);
  const rowsPerCol = Math.ceil(INDEX.length / 4);
  const rowH = 13;
  const startY = y0 + 22;
  for (let c = 0; c < 4; c++) {
    const x = M + c * (COLW + COLGAP);
    for (let r = 0; r < rowsPerCol; r++) {
      const idx = c * rowsPerCol + r;
      if (idx >= INDEX.length) break;
      const s = INDEX[idx];
      const y = startY + r * rowH;
      // number
      drawTextRight(String(idx + 1), x + 18, y, 1, SOFT);
      // beat code
      drawText(s.b, x + 22, y, 1, BEAT[s.b] ?? INK);
      // title, wrapped to at most 2 lines
      const title = s.t + (s.u === 1 ? " *" : "");
      drawWrapped(title, x + 40, y, 1, INK, 33, 1);
    }
    if (c < 3) vline(x + COLW + 5, startY, rowsPerCol * rowH, RULE);
  }
}

function drawTimeline(): void {
  const y0 = 940;
  drawText("19 NOVEMBER IN TIME", M, y0, 1, RED);
  const segs: [string, string][] = [
    ["OVERNIGHT", "IRAN STRIKES GULF STATES"],
    ["MORNING", "SHENZHEN SUMMIT OPENS"],
    ["MIDDAY", "ICJ FINDS MYANMAR GUILTY"],
    ["AFTERNOON", "ANTHROPIC IPO PRICED AT $83"],
    ["EVENING", "US MARKETS CLOSE MIXED"],
  ];
  const bw = 192;
  const gap = 8;
  for (let i = 0; i < segs.length; i++) {
    const x = M + i * (bw + gap);
    rect(x, y0 + 10, bw, 28, NAVY);
    drawText(segs[i][0], x + 6, y0 + 14, 1, GOLD);
    drawWrapped(segs[i][1], x + 6, y0 + 23, 1, WHITE, 30, 1);
  }
}

function drawTicker(): void {
  const y0 = 984;
  rect(0, y0, W, 22, BLACK);
  drawTextCentered(
    "S&P 500 7,324 -0.2% · DOW 50,198 -1.1% · NASDAQ 24,430 +0.4% · FTSE 10,551 -1.3% · GOLD $3,726 -3.6% · BRENT $89 · BITCOIN $63,479 -2.2% · 10Y 5.07%",
    W / 2,
    y0 + 8,
    1,
    WHITE,
  );
}

function drawFooter(): void {
  drawTextCentered(
    "DATE CHECK: EVERY STORY HAPPENED OR WAS FIRST REPORTED ON THURSDAY 19 NOVEMBER 2026 · * = FIRST REPORTED 17-18 NOV · SOURCES: AP, REUTERS, BBC, NYT",
    W / 2,
    1012,
    1,
    SOFT,
  );
}

function main(): void {
  fill(PAPER);
  drawMasthead();
  drawLeads();
  drawIndex();
  drawTimeline();
  drawTicker();
  drawFooter();
  const png = encodePNG();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  fs.mkdirSync(outDir, { recursive: true });
  // Clear only the CONTENTS of the output dir — never the dir itself.
  for (const entry of fs.readdirSync(outDir)) {
    fs.rmSync(path.join(outDir, entry), { recursive: true, force: true });
  }
  const outPath = path.join(outDir, "entry.png");
  fs.writeFileSync(outPath, png);
  const sha = crypto.createHash("sha256").update(png).digest("hex");
  console.log(`WROTE ${outPath} ${png.length} bytes sha256 ${sha} stories ${TOTAL}`);
}

main();
