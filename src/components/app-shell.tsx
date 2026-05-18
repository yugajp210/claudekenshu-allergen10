"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, Plus, ChevronDown, AlertTriangle, CheckCircle2, FileCheck2, Salad } from "lucide-react";
import Link from "next/link";
import { AppSidebar, NAV_ITEMS, MASTER_ITEMS, SYSTEM_ITEMS } from "./app-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GlobalSearchProvider, useGlobalSearch } from "@/components/global-search";
import { BottomNav } from "@/components/bottom-nav";
import { useStore } from "@/lib/store";
import { inferAllergens } from "@/lib/ingredients";
import { cn } from "@/lib/utils";

const ALL_NAV = [...NAV_ITEMS, ...MASTER_ITEMS, ...SYSTEM_ITEMS];

function TopBar() {
  const pathname = usePathname();
  const item = ALL_NAV.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)));
  const title = item?.label ?? "ダッシュボード";
  const { menus, settings } = useStore();

  const notifications = React.useMemo(() => {
    const list: { id: string; icon: React.ReactNode; title: string; description: string; href: string; tone: "warning" | "info" | "success" }[] = [];
    let missingCount = 0;
    for (const m of menus) {
      const inferred = inferAllergens(m.ingredients);
      const declared = new Set(m.declaredAllergens);
      if (inferred.some((a) => !declared.has(a))) missingCount++;
    }
    if (missingCount > 0) {
      list.push({
        id: "missing",
        icon: <AlertTriangle className="size-4" />,
        title: `表示漏れ ${missingCount} 件`,
        description: "アレルゲン点検で確認してください",
        href: "/check",
        tone: "warning",
      });
    }
    const reviewCount = menus.filter((m) => m.status === "review").length;
    if (reviewCount > 0) {
      list.push({
        id: "review",
        icon: <FileCheck2 className="size-4" />,
        title: `確認待ち ${reviewCount} 件`,
        description: "承認待ちのメニューがあります",
        href: "/menus",
        tone: "info",
      });
    }
    list.push({
      id: "welcome",
      icon: <CheckCircle2 className="size-4" />,
      title: "今週のサマリー",
      description: "週次レポートが届きました",
      href: "/report",
      tone: "success",
    });
    return list;
  }, [menus]);

  const unread = notifications.filter((n) => n.tone !== "success").length;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 sm:gap-3 border-b bg-background/95 backdrop-blur px-3 sm:px-6 h-14">
      {/* Mobile brand (since hamburger moved to bottom nav) */}
      <Link href="/" className="lg:hidden flex items-center gap-1.5 -ml-1 shrink-0">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Salad className="size-4" strokeWidth={2.4} />
        </span>
      </Link>
      <h1 className="font-bold text-base sm:text-lg truncate flex-1">{title}</h1>

      {/* Search trigger */}
      <SearchTrigger />

      {/* Notifications popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="通知"
            className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold ring-2 ring-background">
                {unread}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b flex items-center justify-between">
            <h3 className="text-sm font-bold">通知</h3>
            <span className="text-[10px] text-muted-foreground">{notifications.length}件</span>
          </div>
          <ul className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                >
                  <span className={cn(
                    "shrink-0 mt-0.5 inline-flex size-7 items-center justify-center rounded-full",
                    n.tone === "warning" && "bg-warning/15 text-warning-foreground",
                    n.tone === "info" && "bg-primary/15 text-primary",
                    n.tone === "success" && "bg-success/15 text-success",
                  )}>
                    {n.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{n.description}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-3 py-2 border-t bg-muted/30">
            <button className="text-xs font-semibold text-primary hover:underline w-full text-center">
              すべての通知を見る
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Divider */}
      <div className="hidden sm:block h-6 w-px bg-border mx-0.5" />

      {/* User pill (lg+) — clickable to settings */}
      <Link
        href="/settings"
        className="hidden lg:inline-flex items-center gap-2 rounded-full hover:bg-muted transition-colors pl-1 pr-2.5 py-1"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[10px] font-bold">
          {settings.profile.initials}
        </span>
        <span className="text-xs font-semibold truncate max-w-[100px]">{settings.profile.name.split(" ")[0]}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </Link>

      {/* Primary CTA */}
      <Button asChild size="sm" className="hidden sm:inline-flex rounded-full shadow-sm">
        <Link href="/menus/new">
          <Plus className="size-4" />
          新規メニュー
        </Link>
      </Button>
      <Button asChild size="icon" className="sm:hidden rounded-full shadow-sm">
        <Link href="/menus/new" aria-label="新規メニュー">
          <Plus className="size-4" />
        </Link>
      </Button>
    </header>
  );
}

function SearchTrigger() {
  const { open } = useGlobalSearch();
  return (
    <>
      <button
        type="button"
        onClick={open}
        className="hidden md:flex items-center gap-2 w-56 lg:w-72 h-9 px-3 rounded-full bg-muted/60 hover:bg-muted border border-transparent hover:border-input text-sm text-muted-foreground transition-colors"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">メニュー・原材料を検索</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 h-5 px-1.5 rounded bg-background border text-[10px] font-mono">
          ⌘ K
        </kbd>
      </button>
      <button
        type="button"
        onClick={open}
        aria-label="検索"
        className="md:hidden inline-flex size-9 items-center justify-center rounded-full hover:bg-muted"
      >
        <Search className="size-4" />
      </button>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <GlobalSearchProvider>
      <div className="flex min-h-screen w-full">
        <div className="hidden lg:block w-[256px] shrink-0">
          <div className="fixed inset-y-0 left-0 w-[256px]">
            <AppSidebar />
          </div>
        </div>

        {/* Mobile sidebar (opened via bottom "その他" button) */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="lg:hidden p-0 h-[85vh] rounded-t-2xl border-t-0">
            <SheetTitle className="sr-only">ナビゲーションメニュー</SheetTitle>
            {/* drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="size-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="h-[calc(85vh-12px)] overflow-y-auto scrollbar-thin">
              <AppSidebar onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 bg-secondary/40 min-w-0 pb-24 lg:pb-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>

        <BottomNav onOpenSidebar={() => setOpen(true)} />
      </div>
    </GlobalSearchProvider>
  );
}
