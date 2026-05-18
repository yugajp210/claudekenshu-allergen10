"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  UtensilsCrossed,
  Package,
  Database,
  LayoutDashboard,
  FilePlus2,
  ShieldCheck,
  BarChart3,
  Truck,
  Settings,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useStore } from "@/lib/store";
import { inferAllergens } from "@/lib/ingredients";
import { MENU_CATEGORY_LABELS } from "@/lib/menus";
import { AllergenBadge } from "@/components/allergen-badge";
import { Badge } from "@/components/ui/badge";

type SearchContext = {
  open: () => void;
  close: () => void;
};

const Ctx = React.createContext<SearchContext | null>(null);

export function useGlobalSearch() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
  return ctx;
}

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(
    () => ({ open: () => setOpen(true), close: () => setOpen(false) }),
    []
  );

  // ⌘K / Ctrl+K to toggle
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <GlobalSearchDialog open={open} onOpenChange={setOpen} />
    </Ctx.Provider>
  );
}

const QUICK_LINKS = [
  { label: "ダッシュボード", href: "/", icon: LayoutDashboard, keywords: "dashboard home トップ" },
  { label: "メニュー一覧", href: "/menus", icon: UtensilsCrossed, keywords: "menu list 一覧" },
  { label: "メニュー登録", href: "/menus/new", icon: FilePlus2, keywords: "新規 register add 追加" },
  { label: "アレルゲン点検", href: "/check", icon: ShieldCheck, keywords: "check audit 確認" },
  { label: "レポート", href: "/report", icon: BarChart3, keywords: "report stats 統計 分析" },
  { label: "アレルゲンマスタ", href: "/master/allergens", icon: Database, keywords: "master 28品目" },
  { label: "原材料・仕入先", href: "/master/ingredients", icon: Truck, keywords: "ingredient supplier lot ロット" },
  { label: "設定", href: "/settings", icon: Settings, keywords: "setting profile 設定" },
];

function GlobalSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { menus, ingredients, allergens, suppliers } = useStore();

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="メニュー・原材料・アレルゲンを検索..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <Search className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">該当する結果が見つかりません</p>
            <p className="text-xs text-muted-foreground">メニュー名・原材料・コード・アレルゲン名で検索できます</p>
          </div>
        </CommandEmpty>

        <CommandGroup heading="クイックジャンプ">
          {QUICK_LINKS.map((q) => {
            const Icon = q.icon;
            return (
              <CommandItem
                key={q.href}
                value={`page-${q.label}-${q.keywords}`}
                onSelect={() => go(q.href)}
              >
                <Icon className="text-muted-foreground" />
                <span>{q.label}</span>
                <CommandShortcut>
                  <ChevronRight className="size-3" />
                </CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={`メニュー (${menus.length})`}>
          {menus.map((m) => {
            const allergSet = Array.from(new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)]));
            const ingNames = m.ingredients.map((id) => ingredients.find((i) => i.id === id)?.name || "").join(" ");
            const searchValue = `menu-${m.name}-${m.code}-${m.description}-${ingNames}-${MENU_CATEGORY_LABELS[m.category]}-${m.status}-${allergSet.join(" ")}`;
            return (
              <CommandItem
                key={m.id}
                value={searchValue}
                onSelect={() => go(`/menus/${m.id}`)}
              >
                <div className="size-9 shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-emerald-100 to-amber-50 relative">
                  {m.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={m.image} alt="" className="absolute inset-0 size-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold truncate">{m.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{m.code}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">{MENU_CATEGORY_LABELS[m.category]}</Badge>
                    {m.status === "draft" && <Badge variant="secondary" className="text-[10px] h-4 px-1.5">下書き</Badge>}
                    {m.status === "review" && <Badge variant="warning" className="text-[10px] h-4 px-1.5">確認待ち</Badge>}
                    <span className="text-[10px] tabular-nums text-muted-foreground">¥{m.price.toLocaleString()}</span>
                    {allergSet.length > 0 && (
                      <div className="flex gap-0.5">
                        {allergSet.slice(0, 5).map((a) => <AllergenBadge key={a} id={a} size="xs" />)}
                        {allergSet.length > 5 && (
                          <span className="text-[9px] text-muted-foreground self-center">+{allergSet.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={`原材料 (${ingredients.length})`}>
          {ingredients.map((i) => {
            const supplier = i.primarySupplierId ? suppliers.find((s) => s.id === i.primarySupplierId)?.name : "";
            const searchValue = `ing-${i.name}-${i.id}-${i.category}-${i.allergens.join(" ")}-${supplier || ""}`;
            return (
              <CommandItem
                key={i.id}
                value={searchValue}
                onSelect={() => go(`/master/ingredients`)}
              >
                <Package className="text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{i.name}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">{i.category}</Badge>
                  </div>
                  {i.allergens.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {i.allergens.map((a) => <AllergenBadge key={a} id={a} size="xs" />)}
                    </div>
                  )}
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={`アレルゲン (${allergens.length})`}>
          {allergens.map((a) => {
            const usageCount = menus.filter((m) => m.declaredAllergens.includes(a.id)).length;
            const aliasesText = a.aliases.join(" ");
            const searchValue = `allerg-${a.name}-${a.id}-${aliasesText}-${a.level}`;
            return (
              <CommandItem
                key={a.id}
                value={searchValue}
                onSelect={() => go(`/master/allergens`)}
              >
                <AllergenBadge id={a.id} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{a.name}</span>
                    {a.level === "specified" ? (
                      <Badge variant="default" className="text-[10px] h-4 px-1.5">義務</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">推奨</Badge>
                    )}
                    {usageCount > 0 && (
                      <span className="text-[10px] text-muted-foreground">{usageCount}メニュー</span>
                    )}
                  </div>
                  {a.aliases.length > 0 && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      別名: {a.aliases.slice(0, 4).join("、")}{a.aliases.length > 4 ? "…" : ""}
                    </p>
                  )}
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>

      <div className="border-t px-3 py-2 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="px-1 rounded bg-muted font-mono">↑↓</kbd>選択
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 rounded bg-muted font-mono">↵</kbd>開く
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 rounded bg-muted font-mono">esc</kbd>閉じる
        </span>
        <span className="ml-auto flex items-center gap-1">
          <kbd className="px-1 rounded bg-muted font-mono">⌘K</kbd>でいつでも
        </span>
      </div>
    </CommandDialog>
  );
}
