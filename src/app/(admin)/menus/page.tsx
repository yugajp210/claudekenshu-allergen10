"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Plus,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useStore } from "@/lib/store";
import { ALLERGENS, SPECIFIED_ALLERGENS, RECOMMENDED_ALLERGENS } from "@/lib/allergens";
import { INGREDIENTS, INGREDIENT_CATEGORIES, inferAllergens, getIngredient } from "@/lib/ingredients";
import { MENU_CATEGORY_LABELS, type MenuCategory, type Menu } from "@/lib/menus";
import { AllergenBadge, AllergenList } from "@/components/allergen-badge";
import { MenuImage } from "@/components/menu-image";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: { value: MenuCategory | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "main", label: "主菜" },
  { value: "side", label: "副菜" },
  { value: "soup", label: "汁物" },
  { value: "rice", label: "ご飯・麺" },
  { value: "dessert", label: "デザート" },
  { value: "drink", label: "ドリンク" },
];

export default function MenusPage() {
  const { menus } = useStore();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<MenuCategory | "all">("all");
  const [excludeAllergens, setExcludeAllergens] = React.useState<Set<string>>(new Set());
  const [includeIngredients, setIncludeIngredients] = React.useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = React.useState<"all" | "published" | "review" | "draft" | "missing">("all");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return menus.filter((m) => {
      if (cat !== "all" && m.category !== cat) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = (m.name + " " + m.code + " " + m.description).toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      const inferred = new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)]);
      if (excludeAllergens.size > 0) {
        for (const a of excludeAllergens) {
          if (inferred.has(a)) return false;
        }
      }
      if (includeIngredients.size > 0) {
        for (const ing of includeIngredients) {
          if (!m.ingredients.includes(ing)) return false;
        }
      }
      if (statusFilter !== "all") {
        if (statusFilter === "missing") {
          const declared = new Set(m.declaredAllergens);
          const auto = inferAllergens(m.ingredients);
          const hasMissing = auto.some((a) => !declared.has(a));
          if (!hasMissing) return false;
        } else if (m.status !== statusFilter) return false;
      }
      return true;
    });
  }, [menus, q, cat, excludeAllergens, includeIngredients, statusFilter]);

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const resetFilters = () => {
    setQ("");
    setCat("all");
    setExcludeAllergens(new Set());
    setIncludeIngredients(new Set());
    setStatusFilter("all");
  };

  const activeFilterCount =
    (cat !== "all" ? 1 : 0) +
    excludeAllergens.size +
    includeIngredients.size +
    (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">メニュー一覧</h2>
          <p className="text-sm text-muted-foreground">
            登録済みのメニューを原材料・アレルゲンで絞り込めます。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as "grid" | "list")}
            variant="outline"
            size="sm"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="grid" aria-label="グリッド表示">
              <LayoutGrid className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="リスト表示">
              <ListIcon className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button asChild size="sm">
            <Link href="/menus/new"><Plus className="size-4" />新規</Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="メニュー名・コードで検索"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={cat} onValueChange={(v) => setCat(v as MenuCategory | "all")}>
                <SelectTrigger className="w-32 sm:w-40">
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="default" className="shrink-0">
                    <Filter className="size-4" />
                    詳細
                    {activeFilterCount > 0 && (
                      <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px]">{activeFilterCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto scrollbar-thin p-6">
                  <SheetHeader>
                    <SheetTitle>絞り込み条件</SheetTitle>
                    <SheetDescription>
                      除外したいアレルゲン、含む原材料、状態などを指定できます。
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 space-y-6">
                    <FilterSection title="状態">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { v: "all", label: "すべて" },
                          { v: "published", label: "公開中" },
                          { v: "review", label: "確認待ち" },
                          { v: "draft", label: "下書き" },
                          { v: "missing", label: "表示漏れあり" },
                        ].map((s) => (
                          <Button
                            key={s.v}
                            variant={statusFilter === s.v ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(s.v as typeof statusFilter)}
                          >
                            {s.label}
                          </Button>
                        ))}
                      </div>
                    </FilterSection>

                    <FilterSection title="アレルゲンを除外（特定原材料）">
                      <div className="flex flex-wrap gap-2">
                        {SPECIFIED_ALLERGENS.map((a) => {
                          const active = excludeAllergens.has(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => toggleSet(setExcludeAllergens, a.id)}
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                active ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background hover:bg-muted"
                              )}
                            >
                              <AllergenBadge id={a.id} size="xs" />
                              {a.name}
                            </button>
                          );
                        })}
                      </div>
                    </FilterSection>

                    <FilterSection title="アレルゲンを除外（推奨）">
                      <div className="flex flex-wrap gap-1.5">
                        {RECOMMENDED_ALLERGENS.map((a) => {
                          const active = excludeAllergens.has(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => toggleSet(setExcludeAllergens, a.id)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                                active ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background hover:bg-muted"
                              )}
                            >
                              {a.name}
                            </button>
                          );
                        })}
                      </div>
                    </FilterSection>

                    <FilterSection title="原材料を含む">
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                        {INGREDIENT_CATEGORIES.map((cat) => (
                          <div key={cat}>
                            <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">{cat}</div>
                            <div className="flex flex-wrap gap-1.5">
                              {INGREDIENTS.filter((i) => i.category === cat).map((ing) => {
                                const active = includeIngredients.has(ing.id);
                                return (
                                  <button
                                    key={ing.id}
                                    type="button"
                                    onClick={() => toggleSet(setIncludeIngredients, ing.id)}
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors",
                                      active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                                    )}
                                  >
                                    {ing.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </FilterSection>
                  </div>

                  <SheetFooter className="mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={resetFilters} className="flex-1">
                      条件をクリア
                    </Button>
                    <Button onClick={() => setFilterOpen(false)} className="flex-1">適用する</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-muted-foreground">絞り込み:</span>
              {cat !== "all" && (
                <FilterChip onClear={() => setCat("all")}>
                  カテゴリ: {MENU_CATEGORY_LABELS[cat as MenuCategory]}
                </FilterChip>
              )}
              {statusFilter !== "all" && (
                <FilterChip onClear={() => setStatusFilter("all")}>
                  状態: {statusFilter === "missing" ? "表示漏れあり" : statusFilter === "published" ? "公開中" : statusFilter === "review" ? "確認待ち" : "下書き"}
                </FilterChip>
              )}
              {Array.from(excludeAllergens).map((id) => {
                const a = ALLERGENS.find((x) => x.id === id);
                return (
                  <FilterChip key={id} onClear={() => toggleSet(setExcludeAllergens, id)} variant="destructive">
                    {a?.name}除外
                  </FilterChip>
                );
              })}
              {Array.from(includeIngredients).map((id) => {
                const ing = getIngredient(id);
                return (
                  <FilterChip key={id} onClear={() => toggleSet(setIncludeIngredients, id)}>
                    {ing?.name}含む
                  </FilterChip>
                );
              })}
              <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground underline">
                すべてクリア
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          <strong className="text-foreground">{filtered.length}</strong>件 / 全 {menus.length}件
        </p>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <Search className="size-5 text-muted-foreground" />
            </div>
            <div className="font-semibold">該当するメニューがありません</div>
            <p className="text-sm text-muted-foreground">条件を変更してもう一度お試しください。</p>
            <Button variant="outline" size="sm" onClick={resetFilters}>条件をクリア</Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((m) => (
            <MenuGridCard key={m.id} menu={m} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <MenuListRow key={m.id} menu={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</Label>
      {children}
    </div>
  );
}

function FilterChip({
  children,
  onClear,
  variant = "secondary",
}: {
  children: React.ReactNode;
  onClear: () => void;
  variant?: "secondary" | "destructive";
}) {
  return (
    <Badge variant={variant} className="gap-1 pr-1">
      {children}
      <button type="button" onClick={onClear} className="hover:bg-black/10 rounded-full size-3.5 inline-flex items-center justify-center">
        <X className="size-2.5" />
      </button>
    </Badge>
  );
}

function MenuGridCard({ menu }: { menu: Menu }) {
  const inferred = inferAllergens(menu.ingredients);
  const declared = new Set(menu.declaredAllergens);
  const missing = inferred.filter((a) => !declared.has(a));
  const allAllergens = Array.from(new Set([...menu.declaredAllergens, ...inferred]));

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative aspect-[16/9]">
        <MenuImage
          src={menu.image}
          alt={menu.name}
          fallback={menu.name.slice(0, 1)}
          className="absolute inset-0"
          imgClassName="group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          <Badge variant="outline" className="bg-background/90 text-[10px]">{MENU_CATEGORY_LABELS[menu.category]}</Badge>
          {menu.status === "draft" && <Badge variant="secondary" className="text-[10px]">下書き</Badge>}
          {menu.status === "review" && <Badge variant="warning" className="text-[10px]">確認待ち</Badge>}
        </div>
        {missing.length > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 gap-1 z-10">
            <AlertTriangle className="size-3" />
            漏れ {missing.length}
          </Badge>
        )}
      </div>
      <CardContent className="p-3.5 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate">{menu.name}</h3>
            <p className="text-[11px] text-muted-foreground">{menu.code}</p>
          </div>
          <p className="text-sm font-bold whitespace-nowrap">¥{menu.price.toLocaleString()}</p>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">{menu.description}</p>
        <div className="border-t pt-2">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide mb-1.5">アレルゲン</p>
          {allAllergens.length === 0 ? (
            <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
              <CheckCircle2 className="size-3.5" />なし
            </span>
          ) : (
            <AllergenList ids={allAllergens} max={10} size="sm" />
          )}
        </div>
        <Button asChild variant="ghost" size="sm" className="mt-1 self-end">
          <Link href={`/menus/${menu.id}`}>
            <Eye className="size-3.5" />詳細
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function MenuListRow({ menu }: { menu: Menu }) {
  const inferred = inferAllergens(menu.ingredients);
  const declared = new Set(menu.declaredAllergens);
  const missing = inferred.filter((a) => !declared.has(a));
  const allAllergens = Array.from(new Set([...menu.declaredAllergens, ...inferred]));
  return (
    <Link
      href={`/menus/${menu.id}`}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
    >
      <MenuImage
        src={menu.image}
        alt={menu.name}
        fallback={menu.name.slice(0, 1)}
        className="size-14 shrink-0 rounded-md"
        sizes="56px"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{menu.name}</span>
          <Badge variant="outline" className="text-[10px]">{MENU_CATEGORY_LABELS[menu.category]}</Badge>
          {missing.length > 0 && (
            <Badge variant="destructive" className="text-[10px] gap-0.5">
              <AlertTriangle className="size-2.5" />漏れ{missing.length}
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <AllergenList ids={allAllergens} max={10} size="xs" />
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold tabular-nums">¥{menu.price.toLocaleString()}</div>
        <div className="text-[10px] text-muted-foreground">{menu.updatedAt}</div>
      </div>
    </Link>
  );
}
