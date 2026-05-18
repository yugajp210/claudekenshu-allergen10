import type { Metadata } from "next";
import "./m.css";

export const metadata: Metadata = {
  title: "メニュー | アレルゲン管理キッチン",
  description: "アレルギーをお持ちの方も安心してお選びいただけるメニューを公開しています。",
};

export default function PublicMenuLayout({ children }: { children: React.ReactNode }) {
  return <div className="m-site min-h-screen bg-white text-foreground">{children}</div>;
}
