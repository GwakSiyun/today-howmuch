import type { Metadata, Viewport } from "next";
import SiteAnalytics from "@/components/SiteAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘얼마 — 월급날까지 하루 생존 금액 | 월급날 계산기",
  description:
    "월급날 계산기 오늘얼마. 지금 잔액과 다음 월급날·용돈날만 넣으면 오늘 얼마까지 써도 되는지 알려줘요. 앱 설치·지출 기록 없이 웹에서 바로.",
  applicationName: "오늘얼마",
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
