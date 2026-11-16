import type { MetadataRoute } from "next";

// 홈 화면에 추가하면 주소창 없이 앱처럼 열리게 (Next.js 파일 규칙 → /manifest.webmanifest)
// 서비스 워커(오프라인)는 이번 범위 아님
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "오늘얼마 — 월급날 계산기",
    short_name: "오늘얼마",
    description: "지금 잔액과 다음 월급날만 넣으면 오늘 얼마까지 써도 되는지 알려줘요.",
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F5F1",
    theme_color: "#F6F5F1",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
