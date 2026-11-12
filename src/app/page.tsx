import HomeApp from "@/components/HomeApp";

// 데이터는 전부 기기 localStorage에 있으므로 화면 분기는 client 섬(HomeApp)에서.
export default function Page(): React.ReactNode {
  return (
    <main className="mx-auto w-full max-w-[480px] px-4 pt-5 pb-10">
      <HomeApp />
    </main>
  );
}
