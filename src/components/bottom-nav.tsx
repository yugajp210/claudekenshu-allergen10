"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, ShieldCheck, BarChart3, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { inferAllergens } from "@/lib/ingredients";

type Tab = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isMore?: boolean;
};

const TABS: Tab[] = [
  { href: "/", label: "ホーム", icon: LayoutDashboard },
  { href: "/menus", label: "メニュー", icon: UtensilsCrossed },
  { href: "/check", label: "点検", icon: ShieldCheck },
  { href: "/report", label: "レポート", icon: BarChart3 },
  { label: "その他", icon: MoreHorizontal, isMore: true },
];

export function BottomNav({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const { menus } = useStore();

  // 「点検」タブに警告バッジを出す
  const missingCount = React.useMemo(() => {
    let n = 0;
    for (const m of menus) {
      const inferred = inferAllergens(m.ingredients);
      const declared = new Set(m.declaredAllergens);
      if (inferred.some((a) => !declared.has(a))) n++;
    }
    return n;
  }, [menus]);

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      aria-label="下部ナビゲーション"
    >
      <ul className="flex h-16 items-stretch">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.href
            ? t.href === "/"
              ? pathname === "/"
              : pathname.startsWith(t.href)
            : false;
          const showBadge = t.href === "/check" && missingCount > 0;

          const inner = (
            <span
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative inline-flex">
                <Icon className={cn("size-5", active && "drop-shadow")} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold ring-2 ring-background">
                    {missingCount}
                  </span>
                )}
              </span>
              <span>{t.label}</span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </span>
          );

          return (
            <li key={t.label} className="flex-1 flex">
              {t.isMore ? (
                <button type="button" onClick={onOpenSidebar} className="flex-1 flex" aria-label="その他">
                  {inner}
                </button>
              ) : (
                <Link href={t.href!} className="flex-1 flex">
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
