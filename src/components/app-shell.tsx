"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, Search, HelpCircle, Bell, Plus } from "lucide-react";
import Link from "next/link";
import { AppSidebar, NAV_ITEMS } from "./app-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const item = NAV_ITEMS.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)));
  const title = item?.label ?? "ダッシュボード";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 backdrop-blur px-4 sm:px-6 h-14">
      <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={onOpenMenu} aria-label="メニューを開く">
        <MenuIcon className="size-5" />
      </Button>
      <h1 className="font-bold text-lg truncate flex-1">{title}</h1>

      <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="検索">
        <Search className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" className="hidden sm:inline-flex relative" aria-label="通知">
        <Bell className="size-4" />
        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
      </Button>
      <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="ヘルプ">
        <HelpCircle className="size-4" />
      </Button>
      <Button asChild size="sm" className="hidden sm:inline-flex">
        <Link href="/menus/new">
          <Plus className="size-4" />
          新規メニュー
        </Link>
      </Button>
      <Button asChild size="icon" className="sm:hidden">
        <Link href="/menus/new" aria-label="新規メニュー">
          <Plus className="size-4" />
        </Link>
      </Button>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:block w-[256px] shrink-0">
        <div className="fixed inset-y-0 left-0 w-[256px]">
          <AppSidebar />
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-[260px] sm:max-w-[260px]">
          <SheetTitle className="sr-only">ナビゲーションメニュー</SheetTitle>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onOpenMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 bg-secondary/40 min-w-0">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
