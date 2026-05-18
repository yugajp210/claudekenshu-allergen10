"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  ShieldCheck,
  Salad,
  Phone,
  MapPin,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { inferAllergens } from "@/lib/ingredients";
import { SPECIFIED_ALLERGENS } from "@/lib/allergens";
import { MENU_CATEGORY_LABELS, type MenuCategory, type Menu } from "@/lib/menus";
import { MenuImage } from "@/components/menu-image";
import { AllergenBadge } from "@/components/allergen-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: MenuCategory[] = ["main", "side", "soup", "rice", "dessert", "drink"];

export default function PublicMenuPage() {
  const { menus, settings, allergens } = useStore();
  const [q, setQ] = React.useState("");
  const [excluded, setExcluded] = React.useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [activeCat, setActiveCat] = React.useState<MenuCategory | "all">("all");

  const published = React.useMemo(() => menus.filter((m) => m.status === "published"), [menus]);

  const visibleMenus = React.useMemo(() => {
    return published.filter((m) => {
      if (activeCat !== "all" && m.category !== activeCat) return false;
      if (q) {
        const needle = q.toLowerCase();
        if (!(m.name.toLowerCase().includes(needle) || m.description.toLowerCase().includes(needle))) return false;
      }
      if (excluded.size > 0) {
        const allergSet = new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)]);
        for (const a of excluded) {
          if (allergSet.has(a)) return false;
        }
      }
      return true;
    });
  }, [published, activeCat, q, excluded]);

  const byCategory = React.useMemo(() => {
    const grouped: Record<MenuCategory, Menu[]> = {} as Record<MenuCategory, Menu[]>;
    for (const cat of CATEGORY_ORDER) grouped[cat] = [];
    for (const m of visibleMenus) grouped[m.category].push(m);
    return grouped;
  }, [visibleMenus]);

  const toggleExcluded = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAll = () => {
    setExcluded(new Set());
    setQ("");
    setActiveCat("all");
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/m" className="flex items-center gap-2 shrink-0">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Salad className="size-5" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-tight">{settings.store.storeName}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">アレルゲン情報付きメニュー</span>
              </div>
            </Link>
            <div className="flex-1" />
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter className="size-4" />
                  <span className="hidden sm:inline">アレルギー設定</span>
                  <span className="sm:hidden">除外</span>
                  {excluded.size > 0 && (
                    <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">{excluded.size}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto scrollbar-thin p-6">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    アレルギー対応で絞り込み
                  </SheetTitle>
                  <SheetDescription>
                    避けたいアレルゲンを選択すると、そのアレルゲンを含むメニューが非表示になります。
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      特定原材料 8品目（表示義務）
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {SPECIFIED_ALLERGENS.map((a) => {
                        const active = excluded.has(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleExcluded(a.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border-2 p-2.5 transition-colors text-left",
                              active ? "border-destructive bg-destructive/5" : "border-border hover:bg-muted/50"
                            )}
                          >
                            <AllergenBadge id={a.id} size="md" />
                            <span className="text-sm font-medium flex-1">{a.name}</span>
                            {active && <X className="size-4 text-destructive" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      準ずるもの 20品目（推奨表示）
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {allergens.filter((a) => a.level === "recommended").map((a) => {
                        const active = excluded.has(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleExcluded(a.id)}
                            className={cn(
                              "rounded-md border-2 px-2 py-1.5 transition-colors text-xs font-medium",
                              active ? "border-destructive bg-destructive/5 text-destructive" : "border-border hover:bg-muted/50"
                            )}
                          >
                            {a.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <SheetFooter className="mt-6 pt-4 border-t flex-row gap-2">
                  <Button variant="outline" onClick={clearAll} className="flex-1">
                    すべてクリア
                  </Button>
                  <Button onClick={() => setFilterOpen(false)} className="flex-1">
                    {excluded.size > 0 ? `${excluded.size}件を除外して見る` : "閉じる"}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="メニュー名で検索"
                className="pl-9 bg-stone-100 border-stone-200"
              />
            </div>
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <CategoryChip label="すべて" active={activeCat === "all"} onClick={() => setActiveCat("all")} count={visibleMenus.length} />
            {CATEGORY_ORDER.map((cat) => {
              const count = byCategory[cat].length;
              if (count === 0 && activeCat !== cat) return null;
              return (
                <CategoryChip
                  key={cat}
                  label={MENU_CATEGORY_LABELS[cat]}
                  active={activeCat === cat}
                  onClick={() => setActiveCat(cat)}
                  count={count}
                />
              );
            })}
          </div>

          {excluded.size > 0 && (
            <div className="mt-2 flex items-center gap-2 flex-wrap bg-destructive/5 border border-destructive/30 rounded-lg px-3 py-2">
              <ShieldCheck className="size-4 text-destructive shrink-0" />
              <span className="text-xs font-semibold">除外中:</span>
              {Array.from(excluded).map((id) => {
                const a = allergens.find((x) => x.id === id);
                if (!a) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleExcluded(id)}
                    className="inline-flex items-center gap-1 rounded-full bg-destructive text-destructive-foreground px-2 py-0.5 text-[11px] font-medium"
                  >
                    {a.name}
                    <X className="size-2.5" />
                  </button>
                );
              })}
              <button onClick={() => setExcluded(new Set())} className="text-[11px] underline text-muted-foreground hover:text-foreground ml-auto">
                クリア
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-8">
        {visibleMenus.length === 0 ? (
          <EmptyState onClear={clearAll} />
        ) : activeCat === "all" ? (
          CATEGORY_ORDER.map((cat) => {
            const items = byCategory[cat];
            if (items.length === 0) return null;
            return (
              <CategorySection
                key={cat}
                category={cat}
                items={items}
                excluded={excluded}
              />
            );
          })
        ) : (
          <CategorySection
            category={activeCat}
            items={byCategory[activeCat]}
            excluded={excluded}
            hideHeader
          />
        )}
      </main>

      <footer className="border-t bg-white mt-8">
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
          <div>
            <h3 className="text-base font-bold mb-2 flex items-center gap-2">
              <Info className="size-4 text-primary" />
              アレルゲン表示について
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                ・各メニューには使用している原材料に基づき、食品表示法で規定された
                <strong className="text-foreground">特定原材料8品目</strong>と
                <strong className="text-foreground">特定原材料に準ずる20品目</strong>を表示しています。
              </p>
              <p>
                ・同一施設・調理器具で他のアレルゲンを含むメニューを調理しているため、
                <strong className="text-foreground">コンタミネーション</strong>の可能性がございます。
              </p>
              <p>・重度のアレルギーをお持ちの方はスタッフへお声がけください。</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                <MapPin className="size-3" />住所
              </div>
              <p>{settings.store.address}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                <Phone className="size-3" />電話
              </div>
              <p>{settings.store.phone}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                <Clock className="size-3" />営業時間
              </div>
              <p>{settings.store.businessHours}</p>
              <p className="text-xs text-muted-foreground">{settings.store.closedDays}</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            © {new Date().getFullYear()} {settings.store.storeName} · 食品表示法に基づくアレルゲン情報
          </p>
        </div>
      </footer>
    </>
  );
}

function CategoryChip({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-primary text-primary-foreground border-primary" : "bg-white hover:bg-muted/40"
      )}
    >
      {label}
      <span className={cn("text-[10px] tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>
        {count}
      </span>
    </button>
  );
}

function CategorySection({
  category,
  items,
  hideHeader,
}: {
  category: MenuCategory;
  items: Menu[];
  excluded?: Set<string>;
  hideHeader?: boolean;
}) {
  return (
    <section>
      {!hideHeader && (
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">{MENU_CATEGORY_LABELS[category]}</h2>
          <span className="text-xs text-muted-foreground">{items.length}品</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((m) => (
          <PublicMenuCard key={m.id} menu={m} />
        ))}
      </div>
    </section>
  );
}

function PublicMenuCard({ menu }: { menu: Menu; excluded?: Set<string> }) {
  const allergens = Array.from(new Set([...menu.declaredAllergens, ...inferAllergens(menu.ingredients)]));
  const isAllergenFree = allergens.length === 0;

  return (
    <Link
      href={`/m/${menu.id}`}
      className="group flex flex-col rounded-2xl border bg-white overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3]">
        <MenuImage
          src={menu.image}
          alt={menu.name}
          fallback={menu.name.slice(0, 1)}
          className="absolute inset-0"
          imgClassName="group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {isAllergenFree && (
          <Badge variant="success" className="absolute top-2 left-2 gap-1 shadow-md">
            <CheckCircle2 className="size-3" />
            アレルゲン不使用
          </Badge>
        )}
      </div>
      <div className="p-3.5 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-tight">{menu.name}</h3>
          <p className="text-base font-bold tabular-nums whitespace-nowrap text-primary">¥{menu.price.toLocaleString()}</p>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">{menu.description}</p>
        {!isAllergenFree && (
          <div className="border-t pt-2 mt-auto">
            <div className="flex flex-wrap gap-1">
              {allergens.slice(0, 10).map((id) => (
                <AllergenBadge key={id} id={id} size="sm" />
              ))}
              {allergens.length > 10 && (
                <span className="text-[10px] text-muted-foreground self-center ml-1">+{allergens.length - 10}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-300 p-10 text-center bg-white">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-stone-100 mb-3">
        <AlertTriangle className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold">該当するメニューがありません</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">アレルゲン条件を変更してください</p>
      <Button variant="outline" size="sm" onClick={onClear} className="mt-4">
        条件をリセット
      </Button>
    </div>
  );
}
