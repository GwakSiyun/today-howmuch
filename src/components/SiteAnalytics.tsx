"use client";

// Vercel Web Analytics — beforeSend 함수를 넘겨야 해서 client 잎사귀로 분리
// (서버 컴포넌트 layout에서는 함수를 props로 못 넘김)
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { analyticsUrl } from "@/lib/source";

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type !== "pageview") return event;
  return { ...event, url: analyticsUrl(event.url) };
}

export default function SiteAnalytics(): React.ReactNode {
  return <Analytics beforeSend={beforeSend} />;
}
