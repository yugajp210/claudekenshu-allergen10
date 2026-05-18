import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "メニュー | アレルゲン管理キッチン",
  description: "アレルギーをお持ちの方も安心してお選びいただけるメニューを公開しています。",
};

export default function PublicMenuLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-stone-50 text-foreground">{children}</div>;
}
