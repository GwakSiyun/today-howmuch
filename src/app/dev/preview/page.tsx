import { notFound } from "next/navigation";
import PreviewClient from "./PreviewClient";

// 개발 서버(npm run dev)에서만 열리는 화면 확인용 페이지. 배포(프로덕션)에서는 404.
export default function PreviewPage(): React.ReactNode {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="mx-auto w-full max-w-[480px] px-4 pt-5 pb-10">
      <PreviewClient />
    </main>
  );
}
