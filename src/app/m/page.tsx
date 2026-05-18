"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Menu as MenuIcon,
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
  const [navOpen, setNavOpen] = React.useState(false);
  const menusRef = React.useRef<HTMLDivElement>(null);

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

  const allergenFreeCount = React.useMemo(
    () => published.filter((m) => new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)]).size === 0).length,
    [published]
  );

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

  const scrollToMenus = () => {
    menusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ============ Top navigation ============ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-6">
          <Link href="/m" className="flex items-center gap-2 shrink-0">
            <span className="brand-mark size-10 text-lg">A</span>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="text-base font-black tracking-tight">AllerKitchen</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 mt-0.5">allergen·safe</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 flex-1">
            <a href="#menus" className="nav-link">メニュー</a>
            <a href="#about" className="nav-link">アレルゲン対応について</a>
            <a href="#allergens" className="nav-link">対応アレルゲン</a>
            <a href="#contact" className="nav-link">店舗情報</a>
          </nav>

          <div className="flex-1 lg:flex-none" />

          <div className="hidden md:flex items-center gap-3">
            <a href="#contact" className="nav-link">お問い合わせ</a>
            <button onClick={scrollToMenus} className="btn-brand-sm">
              メニューを見る
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center size-10 rounded-md hover:bg-stone-100"
            aria-label="メニュー"
          >
            <MenuIcon className="size-5" />
          </button>
        </div>

        {navOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2">
              <a href="#menus" onClick={() => setNavOpen(false)} className="py-2 font-semibold">メニュー</a>
              <a href="#about" onClick={() => setNavOpen(false)} className="py-2 font-semibold">アレルゲン対応について</a>
              <a href="#allergens" onClick={() => setNavOpen(false)} className="py-2 font-semibold">対応アレルゲン</a>
              <a href="#contact" onClick={() => setNavOpen(false)} className="py-2 font-semibold">店舗情報</a>
              <button onClick={() => { setNavOpen(false); scrollToMenus(); }} className="btn-brand-sm mt-2 justify-center">
                メニューを見る <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============ Hero ============ */}
      <Hero
        published={published}
        allergenFreeCount={allergenFreeCount}
        storeName={settings.store.storeName}
        onShowMenus={scrollToMenus}
        onOpenFilter={() => setFilterOpen(true)}
      />

      {/* ============ Features / About ============ */}
      <section id="about" className="bg-stone-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--brand-dark)" }}>
              About
            </p>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              すべてのお客様に、<br className="sm:hidden" />正しい情報を。
            </h2>
            <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed">
              当店では食品表示法に基づく特定原材料 28 品目（義務 8 品目 + 推奨 20 品目）を、
              全メニューで表示しています。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              num="01"
              title="完全な原材料表示"
              description="各メニューに含まれる原材料を一つひとつ確認できます。仕入先・ロットまで追跡。"
              icon={<Sparkles className="size-5" />}
            />
            <FeatureCard
              num="02"
              title="ワンタップで絞り込み"
              description="避けたいアレルゲンを選ぶだけで、安心して選べるメニューだけが表示されます。"
              icon={<Filter className="size-5" />}
            />
            <FeatureCard
              num="03"
              title="コンタミ情報も開示"
              description="同一施設・調理器具で扱う他のアレルゲン情報も含めて、正直にお伝えしています。"
              icon={<ShieldCheck className="size-5" />}
            />
          </div>
        </div>
      </section>

      {/* ============ Menus ============ */}
      <section id="menus" ref={menusRef} className="bg-white py-16 sm:py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "var(--brand-dark)" }}>Menu</p>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">メニュー一覧</h2>
              <p className="mt-2 text-sm text-stone-600">{visibleMenus.length} 品 / 全 {published.length} 品</p>
            </div>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="size-4" />
                  アレルギー設定
                  {excluded.size > 0 && (
                    <Badge className="ml-1 h-4 px-1 text-[10px] bg-[--brand] text-white border-0">{excluded.size}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto scrollbar-thin p-6">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShieldCheck className="size-5" style={{ color: "var(--brand)" }} />
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
                              active ? "border-orange-500 bg-orange-50" : "border-border hover:bg-muted/50"
                            )}
                          >
                            <AllergenBadge id={a.id} size="md" />
                            <span className="text-sm font-medium flex-1">{a.name}</span>
                            {active && <X className="size-4" style={{ color: "var(--brand)" }} />}
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
                              active ? "border-orange-500 bg-orange-50" : "border-border hover:bg-muted/50"
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
                  <button onClick={() => setFilterOpen(false)} className="btn-brand-sm flex-1 justify-center">
                    {excluded.size > 0 ? `${excluded.size}件を除外して見る` : "閉じる"}
                  </button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="メニュー名で検索"
                className="pl-9 bg-stone-100 border-stone-200 rounded-full"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <CategoryChip label="すべて" active={activeCat === "all"} onClick={() => setActiveCat("all")} count={published.length} />
              {CATEGORY_ORDER.map((cat) => {
                const count = byCategory[cat].length || published.filter((m) => m.category === cat).length;
                if (count === 0 && activeCat !== cat) return null;
                return (
                  <CategoryChip
                    key={cat}
                    label={MENU_CATEGORY_LABELS[cat]}
                    active={activeCat === cat}
                    onClick={() => setActiveCat(cat)}
                    count={byCategory[cat].length}
                  />
                );
              })}
            </div>
          </div>

          {excluded.size > 0 && (
            <div className="mb-6 flex items-center gap-2 flex-wrap rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
              <ShieldCheck className="size-4 shrink-0" style={{ color: "var(--brand-dark)" }} />
              <span className="text-xs font-bold" style={{ color: "var(--brand-text)" }}>除外中:</span>
              {Array.from(excluded).map((id) => {
                const a = allergens.find((x) => x.id === id);
                if (!a) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleExcluded(id)}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                    style={{ background: "var(--brand)" }}
                  >
                    {a.name}
                    <X className="size-2.5" />
                  </button>
                );
              })}
              <button onClick={() => setExcluded(new Set())} className="text-[11px] underline text-stone-600 hover:text-stone-900 ml-auto">
                クリア
              </button>
            </div>
          )}

          {visibleMenus.length === 0 ? (
            <EmptyState onClear={clearAll} />
          ) : activeCat === "all" ? (
            <div className="space-y-12">
              {CATEGORY_ORDER.map((cat) => {
                const items = byCategory[cat];
                if (items.length === 0) return null;
                return (
                  <CategorySection key={cat} category={cat} items={items} />
                );
              })}
            </div>
          ) : (
            <CategorySection category={activeCat} items={byCategory[activeCat]} hideHeader />
          )}
        </div>
      </section>

      {/* ============ Allergens list ============ */}
      <section id="allergens" className="bg-stone-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--brand-dark)" }}>Allergens</p>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">表示対象の 28 品目</h2>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              食品表示法で定められた特定原材料と、その準ずるものをすべて網羅しています。
            </p>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border p-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-black">特定原材料（表示義務）</h3>
              <Badge className="bg-red-100 text-red-700 border-0">8 品目</Badge>
            </div>
            <ul className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-8">
              {SPECIFIED_ALLERGENS.map((a) => (
                <li key={a.id} className="flex flex-col items-center gap-1.5 text-center">
                  <AllergenBadge id={a.id} size="lg" />
                  <span className="text-xs font-bold">{a.name}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between mb-3 flex-wrap gap-2 border-t pt-6">
              <h3 className="text-sm font-black">特定原材料に準ずるもの（推奨表示）</h3>
              <Badge variant="outline">20 品目</Badge>
            </div>
            <ul className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {allergens.filter((a) => a.level === "recommended").map((a) => (
                <li key={a.id} className="flex flex-col items-center gap-1 text-center">
                  <AllergenBadge id={a.id} size="md" />
                  <span className="text-[10px] font-semibold">{a.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ Contact / Footer ============ */}
      <footer id="contact" className="bg-stone-900 text-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="brand-mark size-10 text-lg">A</span>
                <div>
                  <div className="text-base font-black">AllerKitchen</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase text-stone-500">allergen·safe</div>
                </div>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed">
                {settings.store.storeName}<br />
                すべてのお客様に、正しい情報と安心を。
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <ContactRow icon={<MapPin className="size-4" />} label="所在地" value={settings.store.address} />
              <ContactRow icon={<Phone className="size-4" />} label="電話" value={settings.store.phone} />
              <ContactRow icon={<Clock className="size-4" />} label="営業時間" value={settings.store.businessHours} sub={settings.store.closedDays} />
              <ContactRow icon={<Info className="size-4" />} label="メール" value={settings.store.email} />
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-stone-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-stone-500 leading-relaxed">
              <p>※ 食品表示法に基づき特定原材料 28 品目を表示しています。</p>
              <p>※ 同一施設・調理器具を使用するため、コンタミネーションが発生する可能性があります。</p>
              <p>※ 重度のアレルギーをお持ちの方はスタッフへお声がけください。</p>
            </div>
            <p className="mt-6 text-[10px] text-stone-600 text-center">© {new Date().getFullYear()} {settings.store.storeName}</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function Hero({
  published,
  allergenFreeCount,
  storeName,
  onShowMenus,
  onOpenFilter,
}: {
  published: Menu[];
  allergenFreeCount: number;
  storeName: string;
  onShowMenus: () => void;
  onOpenFilter: () => void;
}) {
  // 表紙に並べる代表メニュー写真を 4 枚抽出（カテゴリの偏りを抑えて）
  const heroMenus = React.useMemo(() => {
    const wanted: MenuCategory[] = ["main", "dessert", "rice", "side"];
    const picks: Menu[] = [];
    for (const c of wanted) {
      const m = published.find((p) => p.category === c && p.image && !picks.includes(p));
      if (m) picks.push(m);
    }
    return picks.slice(0, 4);
  }, [published]);

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      {/* dimmed full-bleed photo backdrop */}
      <div className="absolute inset-0 -z-10">
        <Image src="/menus/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/80 to-stone-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center text-white">
          {/* Left: copy */}
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wide uppercase rounded-full bg-white/10 backdrop-blur px-3 py-1.5 border border-white/20 mb-5">
              <Sparkles className="size-3.5" style={{ color: "var(--brand)" }} />
              特定原材料 28 品目に完全対応
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              <span className="block">アレルギーがあっても、</span>
              <span className="block mt-1.5">食事の<span style={{ color: "var(--brand)" }}>楽しみ</span>を</span>
              <span className="block mt-1.5">諦めない。</span>
            </h1>
            <p className="mt-6 text-sm sm:text-lg leading-relaxed opacity-90 max-w-xl">
              {storeName} では、{published.length} 品すべてのメニューに食品表示法準拠の
              アレルゲン情報を表示。原材料・調理工程まで開示し、安心して食事をお選びいただけます。
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 items-center">
              <button onClick={onShowMenus} className="btn-brand">
                メニューを見る
                <ChevronRight className="size-4" />
              </button>
              <button onClick={onOpenFilter} className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-5 py-3 text-sm font-bold border border-white/30 hover:bg-white/25 transition-colors">
                <ShieldCheck className="size-4" />
                アレルギー設定で絞り込む
              </button>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
              <Stat value={published.length} unit="品" label="登録メニュー" />
              <Stat value={28} unit="種" label="表示対象アレルゲン" />
              <Stat value={allergenFreeCount} unit="品" label="アレルゲン不使用" />
            </dl>
          </div>

          {/* Right: photo collage */}
          <div className="relative w-full lg:w-[420px] xl:w-[480px] aspect-square lg:aspect-auto lg:h-[520px] hidden sm:block">
            {heroMenus[0] && (
              <HeroPhoto
                menu={heroMenus[0]}
                className="absolute top-0 left-0 w-[58%] h-[58%] z-30 rotate-[-4deg]"
                badge="人気"
              />
            )}
            {heroMenus[1] && (
              <HeroPhoto
                menu={heroMenus[1]}
                className="absolute top-4 right-0 w-[48%] h-[42%] z-20 rotate-[3deg]"
              />
            )}
            {heroMenus[2] && (
              <HeroPhoto
                menu={heroMenus[2]}
                className="absolute bottom-0 left-4 w-[44%] h-[42%] z-20 rotate-[2deg]"
              />
            )}
            {heroMenus[3] && (
              <HeroPhoto
                menu={heroMenus[3]}
                className="absolute bottom-8 right-2 w-[52%] h-[46%] z-10 rotate-[-2deg]"
              />
            )}

            {/* floating allergen-free callout chip */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-40 rounded-full bg-white shadow-xl ring-1 ring-black/10 px-4 py-2 flex items-center gap-2 whitespace-nowrap">
              <span className="inline-flex size-7 rounded-full bg-emerald-100 items-center justify-center">
                <CheckCircle2 className="size-4 text-emerald-600" />
              </span>
              <div className="text-left">
                <div className="text-[10px] font-bold text-stone-500 tracking-widest uppercase leading-none">Allergen-free</div>
                <div className="text-sm font-black leading-none mt-1 text-stone-900">{allergenFreeCount} 品をご用意</div>
              </div>
            </div>
          </div>

          {/* mobile-only horizontal scroller below */}
          <div className="sm:hidden -mx-4 mt-2">
            <div className="flex gap-3 overflow-x-auto scrollbar-thin px-4 pb-2">
              {heroMenus.map((m) => (
                <div key={m.id} className="shrink-0 w-32 rounded-xl overflow-hidden bg-white shadow-lg ring-1 ring-white/10">
                  <div className="relative aspect-square">
                    <Image src={m.image || "/menus/hero.jpg"} alt={m.name} fill sizes="128px" className="object-cover" />
                  </div>
                  <div className="p-2">
                    <div className="text-[11px] font-bold text-stone-900 line-clamp-1">{m.name}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">¥{m.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

function HeroPhoto({ menu, className, badge }: { menu: Menu; className?: string; badge?: string }) {
  return (
    <div className={cn("rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/30 bg-white", className)}>
      <div className="relative w-full h-full">
        <Image src={menu.image || "/menus/hero.jpg"} alt={menu.name} fill sizes="(max-width: 1024px) 50vw, 280px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {badge && (
          <span
            className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black text-white shadow-md"
            style={{ background: "var(--brand)" }}
          >
            {badge}
          </span>
        )}
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <div className="text-[11px] font-black leading-tight line-clamp-1 drop-shadow">{menu.name}</div>
          <div className="text-[10px] font-bold mt-0.5 opacity-90 drop-shadow">¥{menu.price.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-black tabular-nums leading-none">
        {value}<span className="text-sm sm:text-base font-bold ml-0.5">{unit}</span>
      </div>
      <div className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function FeatureCard({
  num,
  title,
  description,
  icon,
}: {
  num: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className="text-[40px] font-black leading-none" style={{ color: "var(--brand)" }}>{num}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-orange-100" style={{ color: "var(--brand)" }}>
              {icon}
            </span>
            <h3 className="text-base font-black">{title}</h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function CategoryChip({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors",
        active ? "border-transparent text-white" : "bg-white hover:bg-stone-100 border-stone-200"
      )}
      style={active ? { background: "var(--brand)" } : undefined}
    >
      {label}
      <span className={cn("text-[10px] tabular-nums font-medium", active ? "opacity-80" : "text-stone-500")}>
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
  hideHeader?: boolean;
}) {
  return (
    <section>
      {!hideHeader && (
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-3">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">{MENU_CATEGORY_LABELS[category]}</h3>
            <span className="text-xs text-stone-500">{items.length}品</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map((m) => <PublicMenuCard key={m.id} menu={m} />)}
      </div>
    </section>
  );
}

function PublicMenuCard({ menu }: { menu: Menu }) {
  const allergens = Array.from(new Set([...menu.declaredAllergens, ...inferAllergens(menu.ingredients)]));
  const isAllergenFree = allergens.length === 0;

  return (
    <Link
      href={`/m/${menu.id}`}
      className="group flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3]">
        <MenuImage
          src={menu.image}
          alt={menu.name}
          fallback={menu.name.slice(0, 1)}
          className="absolute inset-0"
          imgClassName="group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {isAllergenFree && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            <CheckCircle2 className="size-3" />
            アレルゲン不使用
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-black leading-tight">{menu.name}</h3>
          <p className="text-base font-black tabular-nums whitespace-nowrap" style={{ color: "var(--brand-dark)" }}>
            ¥{menu.price.toLocaleString()}
          </p>
        </div>
        <p className="text-xs text-stone-600 line-clamp-2 min-h-8">{menu.description}</p>
        {!isAllergenFree && (
          <div className="border-t border-stone-100 pt-2.5 mt-auto">
            <div className="flex flex-wrap gap-1">
              {allergens.slice(0, 10).map((id) => <AllergenBadge key={id} id={id} size="sm" />)}
              {allergens.length > 10 && (
                <span className="text-[10px] text-stone-500 self-center ml-1">+{allergens.length - 10}</span>
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
        <AlertTriangle className="size-6 text-stone-400" />
      </div>
      <h3 className="text-lg font-black">該当するメニューがありません</h3>
      <p className="mt-1.5 text-sm text-stone-600">アレルゲン条件を変更してください</p>
      <button onClick={onClear} className="btn-brand-sm mt-4 justify-center">条件をリセット</button>
    </div>
  );
}

function ContactRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] tracking-wider uppercase text-stone-500 mb-1">
        {icon}{label}
      </div>
      <p className="text-stone-200">{value}</p>
      {sub && <p className="text-stone-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}
