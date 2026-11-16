// 링크 미리보기 이미지(시안 A: 왼쪽 문구 + 오른쪽 금액 카드) 생성 스크립트
// 사용: node scripts/make-og.mjs   (macOS · Google Chrome · Apple SD Gothic Neo 필요)
// 결과: src/app/opengraph-image.png (Next.js 파일 규칙 → og:image 자동 연결)
// 빌드 때 글꼴을 내려받지 않고 파일로 넣어서, 네트워크 실패로 한글이 빠질 일이 없다.
//
// 카드 금액·환산은 실제 계산과 맞춘다: 20,400원 → 아아(1,500) 13 · 삼각김밥(1,400) 14
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const root = new URL("..", import.meta.url).pathname;
const work = mkdtempSync(join(tmpdir(), "today-howmuch-og-"));
const W = 1200;
const H = 630;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;background:#F6F5F1}
body{font-family:"Apple SD Gothic Neo",sans-serif;color:#111412;display:flex;align-items:center;justify-content:space-between;padding:0 88px;box-sizing:border-box;gap:48px}
.left{display:flex;flex-direction:column;gap:22px;min-width:0}
.brand{display:flex;align-items:center;gap:14px}
.logo{width:56px;height:56px;border-radius:13px;background:#fff;border:2px solid #E6E4DD;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;box-sizing:border-box}
.name{font-size:32px;font-weight:700}
.tag{font-size:26px;color:#7A786F}
h1{margin:0;font-size:62px;line-height:1.22;font-weight:800;letter-spacing:-1.5px}
h1 span{display:block;white-space:nowrap}
.sub{margin:0;font-size:28px;line-height:1.5;color:#7A786F}
.card{flex:none;width:430px;background:#DDF3E5;border-radius:20px;padding:30px 34px;box-sizing:border-box}
.row{display:flex;justify-content:space-between;align-items:center}
.label{font-size:24px;color:#4E7A63}
.badge{font-size:23px;font-weight:700;color:#fff;background:#1F7A4D;border-radius:6px;padding:3px 12px}
.amount{margin:18px 0 0;font-size:76px;font-weight:800;letter-spacing:-2px;line-height:1;white-space:nowrap}
.amount small{font-size:34px;margin-left:4px}
.conv{margin:18px 0 0;font-size:23px;color:#4E7A63}
</style></head><body>
<div class="left">
  <div class="brand"><div class="logo">₩</div><span class="name">오늘얼마</span><span class="tag">· 월급날 계산기</span></div>
  <h1><span>월급날까지</span><span>오늘 얼마 써도 될까?</span></h1>
  <p class="sub">잔액이랑 월급날만 넣으면<br>하루에 쓸 수 있는 돈을 알려줘요</p>
</div>
<div class="card">
  <div class="row"><span class="label">오늘 써도 되는 돈</span><span class="badge">여유</span></div>
  <p class="amount">20,400<small>원</small></p>
  <p class="conv">≈ 아아 13 · 삼각김밥 14</p>
</div>
</body></html>`;

const file = join(work, "og.html");
const out = join(work, "og.png");
writeFileSync(file, html);
execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${W},${H}`,
    `--screenshot=${out}`,
    `file://${file}`,
  ],
  { stdio: "ignore" },
);
const png = readFileSync(out);
const w = png.readUInt32BE(16);
const h = png.readUInt32BE(20);
if (w !== W || h !== H) throw new Error(`og: ${w}x${h} (기대 ${W}x${H})`);
writeFileSync(join(root, "src/app/opengraph-image.png"), png);
writeFileSync(join(root, "src/app/opengraph-image.alt.txt"), "오늘얼마 — 월급날까지 오늘 얼마 써도 될까? 잔액과 월급날로 하루 쓸 수 있는 돈을 알려주는 월급날 계산기");
console.log("미리보기 이미지 생성 완료");
