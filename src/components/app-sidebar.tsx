"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, FilePlus2, ShieldCheck, BarChart3, Salad, Bell, ChevronLeft, Settings, Database, Truck, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/menus", label: "メニュー一覧", icon: UtensilsCrossed },
  { href: "/menus/new", label: "メニュー登録", icon: FilePlus2 },
  { href: "/check", label: "アレルゲン点検", icon: ShieldCheck, badge: "要" },
  { href: "/report", label: "レポート", icon: BarChart3 },
];

export const MASTER_ITEMS: NavItem[] = [
  { href: "/master/allergens", label: "アレルゲンマスタ", icon: Database },
  { href: "/master/ingredients", label: "原材料・仕入先", icon: Truck },
];

export const SYSTEM_ITEMS: NavItem[] = [
  { href: "/settings", label: "設定", icon: Settings },
];

function NavGroup({
  title,
  items,
  pathname,
  onNavigate,
  className,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "")} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">{item.badge}</Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Salad className="size-5" strokeWidth={2.2} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold">AllerCheck</span>
          <span className="text-[11px] text-muted-foreground">アレルゲン表示管理</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <NavGroup title="メニュー管理" items={NAV_ITEMS} pathname={pathname} onNavigate={onNavigate} />
        <NavGroup title="マスタ管理" items={MASTER_ITEMS} pathname={pathname} onNavigate={onNavigate} className="mt-5" />
        <NavGroup title="システム" items={SYSTEM_ITEMS} pathname={pathname} onNavigate={onNavigate} className="mt-5" />

        <div className="mt-5 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          顧客向け
        </div>
        <Link
          href="/m"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
        >
          <ExternalLink className="size-4 shrink-0" />
          <span className="flex-1">公開メニューを開く</span>
        </Link>

        <div className="mt-6 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          通知
        </div>
        <div className="mx-1 rounded-md border bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Bell className="size-3.5 text-warning" />
            食品表示法 改訂情報
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            くるみ追加に伴う再点検期限は <strong className="text-foreground">2026-06-30</strong> です。
          </p>
        </div>
      </nav>

      <ProfileSection onNavigate={onNavigate} />
    </aside>
  );
}

function ProfileSection({ onNavigate }: { onNavigate?: () => void }) {
  const { settings } = useStore();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("ログアウトしますか?")) {
      signOut();
      onNavigate?.();
      router.replace("/login");
    }
  };

  return (
    <div className="border-t border-sidebar-border flex items-stretch">
      <Link
        href="/settings"
        onClick={onNavigate}
        className="px-5 py-3 flex items-center gap-3 hover:bg-sidebar-accent/40 transition-colors flex-1 min-w-0"
      >
        <div className="size-8 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
          {settings.profile.initials}
        </div>
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="text-xs font-semibold truncate">{settings.profile.name}</span>
          <span className="text-[10px] text-muted-foreground truncate">{settings.profile.role}</span>
        </div>
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="px-3 flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors border-l border-sidebar-border"
        aria-label="ログアウト"
        title="ログアウト"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export function MobileSidebarToggle({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute top-3 right-3 inline-flex items-center justify-center size-8 rounded-md hover:bg-muted"
      aria-label="閉じる"
    >
      <ChevronLeft className="size-4" />
    </button>
  );
}
