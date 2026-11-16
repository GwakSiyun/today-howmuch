// 앱 아이콘(A2-1: 가운데 ₩ + 오른쪽 아래 작은 /일) PNG·ICO 생성 스크립트
// 사용: node scripts/make-icons.mjs   (macOS · Google Chrome · Apple SD Gothic Neo 필요)
// 크롬 헤드리스로 HTML을 정확한 크기로 찍는다. 추가 패키지 없음.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const root = new URL("..", import.meta.url).pathname;
const work = mkdtempSync(join(tmpdir(), "today-howmuch-icons-"));

/**
 * size: 출력 px
 * scale: 내용 크기 비율 (maskable은 안드로이드가 가장자리를 잘라서 0.8로 줄임)
 * withDay: "/일" 표시 여부 (16~48px favicon은 너무 작아 ₩만)
 *
 * 캔버스에 직접 그린다. 글꼴 줄 높이(위아래 빈 공간 포함)가 아니라
 * measureText로 잰 "₩" 글자 모양 자체를 정중앙에 놓는다. (이전: 줄 높이 기준이라 약 6% 위로 뜸)
 * "/일"은 ₩ 오른쪽 아래 모서리에 붙인다.
 */
function html(size, { scale = 1, withDay = true } = {}) {
  const s = size * scale;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:#F6F5F1}
canvas{display:block}
</style></head><body><canvas id="c" width="${size}" height="${size}"></canvas><script>
const size = ${size}, s = ${s}, withDay = ${withDay};
const FONT = '"Apple SD Gothic Neo", sans-serif';
const ctx = document.getElementById("c").getContext("2d");
ctx.fillStyle = "#F6F5F1";
ctx.fillRect(0, 0, size, size);

// ₩: 글자 모양 경계 기준 정중앙
ctx.font = "800 " + (s * 0.5625) + "px " + FONT;
const m = ctx.measureText("\u20A9");
const x = size / 2 + (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2;
const y = size / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
ctx.fillStyle = "#111412";
ctx.fillText("\u20A9", x, y);

if (withDay) {
  // /일: ₩ 오른쪽 끝에서 살짝 안쪽, ₩ 아래 끝보다 살짝 아래 (시안 A2-1 비율)
  const right = x + m.actualBoundingBoxRight;
  const bottom = y + m.actualBoundingBoxDescent;
  ctx.font = "700 " + (s * 0.1328) + "px " + FONT;
  const d = ctx.measureText("/\uC77C");
  ctx.fillStyle = "#7A786F";
  ctx.fillText("/\uC77C", right - s * 0.053 + d.actualBoundingBoxLeft, bottom - s * 0.008 + d.actualBoundingBoxAscent);
}
</script></body></html>`;
}

function render(name, size, options) {
  const file = join(work, `${name}.html`);
  const out = join(work, `${name}.png`);
  writeFileSync(file, html(size, options));
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${size},${size}`,
      `--screenshot=${out}`,
      `file://${file}`,
    ],
    { stdio: "ignore" },
  );
  const png = readFileSync(out);
  // PNG IHDR에서 실제 크기 확인 (크롬 창 크기 오차 방지)
  const w = png.readUInt32BE(16);
  const h = png.readUInt32BE(20);
  if (w !== size || h !== size) throw new Error(`${name}: ${w}x${h} (기대 ${size}x${size})`);
  return png;
}

/**
 * 크롬 스크린샷(RGB 8bit) → RGBA PNG. ICO 안의 PNG는 RGBA여야 해서 변환한다.
 * 알파는 전부 255(불투명). 필터는 0(None)으로 다시 저장.
 */
function toRgba(png) {
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const bitDepth = png.readUInt8(24);
  const colorType = png.readUInt8(25);
  if (colorType === 6) return png;
  if (colorType !== 2 || bitDepth !== 8) throw new Error(`지원 안 하는 PNG 형식: type ${colorType}, ${bitDepth}bit`);

  // IDAT 모으기
  const idat = [];
  for (let pos = 8; pos < png.length; ) {
    const len = png.readUInt32BE(pos);
    const type = png.toString("ascii", pos + 4, pos + 8);
    if (type === "IDAT") idat.push(png.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));

  // 스캔라인 필터 풀기 (bpp 3)
  const bpp = 3;
  const stride = width * bpp;
  const rgb = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? rgb[y * stride + x - bpp] : 0;
      const b = y > 0 ? rgb[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? rgb[(y - 1) * stride + x - bpp] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += Math.floor((a + b) / 2);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      rgb[y * stride + x] = value & 0xff;
    }
  }

  const out = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y += 1) {
    out[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x += 1) {
      const o = y * (width * 4 + 1) + 1 + x * 4;
      out[o] = rgb[y * stride + x * 3];
      out[o + 1] = rgb[y * stride + x * 3 + 1];
      out[o + 2] = rgb[y * stride + x * 3 + 2];
      out[o + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  return Buffer.concat([png.subarray(0, 8), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(out)), chunk("IEND", Buffer.alloc(0))]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

/** PNG 여러 장을 담은 .ico (PNG 내장 ICO — 최신 브라우저 지원) */
function toIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach(({ size, png }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

mkdirSync(join(root, "public/icons"), { recursive: true });

// 홈 화면·manifest용
writeFileSync(join(root, "public/icons/icon-192.png"), render("icon-192", 192));
writeFileSync(join(root, "public/icons/icon-512.png"), render("icon-512", 512));
writeFileSync(join(root, "public/icons/icon-maskable-512.png"), render("maskable-512", 512, { scale: 0.8 }));
// 아이폰 '홈 화면에 추가' (Next.js 파일 규칙: app/apple-icon.png)
writeFileSync(join(root, "src/app/apple-icon.png"), render("apple-180", 180));
// 브라우저 탭 (16·32·48 — 너무 작아 ₩만)
const ico = toIco([16, 32, 48].map((size) => ({ size, png: toRgba(render(`fav-${size}`, size, { withDay: false })) })));
writeFileSync(join(root, "src/app/favicon.ico"), ico);

console.log("아이콘 생성 완료:", work);
