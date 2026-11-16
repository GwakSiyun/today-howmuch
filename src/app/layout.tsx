import type { Metadata, Viewport } from "next";
import SiteAnalytics from "@/components/SiteAnalytics";
import "./globals.css";

const SITE_URL = "https://today-howmuch.vercel.app";
const TITLE = "오늘얼마 — 월급날까지 하루 생존 금액 | 월급날 계산기";
const DESCRIPTION =
  "월급날 계산기 오늘얼마. 지금 잔액과 다음 월급날·용돈날만 넣으면 오늘 얼마까지 써도 되는지 알려줘요. 앱 설치·지출 기록 없이 웹에서 바로.";

export const metadata: Metadata = {
  // 미리보기 이미지(app/opengraph-image.png) 등을 절대 주소로 만들 기준
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "오늘얼마",
  // 카톡·에타·SNS 링크 미리보기 (이미지는 파일 규칙으로 자동 연결)
  openGraph: {
    type: "website",
    url: "/",
    siteName: "오늘얼마",
    locale: "ko_KR",
    title: "월급날까지 오늘 얼마 써도 될까? — 오늘얼마",
    description: "잔액이랑 월급날만 넣으면 하루에 쓸 수 있는 돈을 알려줘요. 월급날 계산기.",
  },
  twitter: { card: "summary_large_image" },
  // 아이폰 '홈 화면에 추가': 앱 이름·주소창 없이 열기·밝은 상태바 (아이콘은 app/apple-icon.png)
  appleWebApp: {
    capable: true,
    title: "오늘얼마",
    statusBarStyle: "default",
  },
  // 아이폰이 금액 숫자를 전화번호 링크로 바꾸지 않게
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F6F5F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">): React.ReactNode {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
