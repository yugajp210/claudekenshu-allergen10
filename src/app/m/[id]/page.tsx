"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  Salad,
  Utensils,
  Share2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { inferAllergens, getIngredient } from "@/lib/ingredients";
import { SPECIFIED_ALLERGENS, getAllergen } from "@/lib/allergens";
import { MENU_CATEGORY_LABELS } from "@/lib/menus";
import { MenuImage } from "@/components/menu-image";
import { AllergenBadge } from "@/components/allergen-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function PublicMenuDetailPage() {
  const params = useParams<{ id: string }>();
  const { menus, settings } = useStore();
  const menu = menus.find((m) => m.id === params.id && m.status === "published");

  if (!menu) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>メニューが見つかりません</AlertTitle>
          <AlertDescription>削除されたか、公開されていない可能性があります。</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/m"><ArrowLeft className="size-4" />メニュー一覧へ</Link>
        </Button>
      </div>
    );
  }

  const allergens = Array.from(new Set([...menu.declaredAllergens, ...inferAllergens(menu.ingredients)]));
  const isAllergenFree = allergens.length === 0;
  const specifiedContained = allergens.filter((a) => getAllergen(a)?.level === "specified");
  const recommendedContained = allergens.filter((a) => getAllergen(a)?.level === "recommended");
  const allergenSet = new Set(allergens);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/m" aria-label="戻る"><ArrowLeft className="size-5" /></Link>
          </Button>
          <Link href="/m" className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Salad className="size-4" />
            </div>
            <span className="text-sm font-bold truncate">{settings.store.storeName}</span>
          </Link>
          <Button variant="ghost" size="icon" aria-label="シェア" onClick={() => {
            if (navigator.share) {
              navigator.share({ title: menu.name, url: location.href }).catch(() => {});
            }
          }}>
            <Share2 className="size-4" />
          </Button>
        </div>
      </header>

      <article className="mx-auto max-w-3xl pb-12">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-gradient-to-br from-emerald-200 via-emerald-50 to-amber-100">
          <MenuImage
            src={menu.image}
            alt={menu.name}
            fallback={menu.name.slice(0, 1)}
            className="absolute inset-0"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          {isAllergenFree && (
            <Badge variant="success" className="absolute top-3 left-3 gap-1 shadow-md">
              <CheckCircle2 className="size-3.5" />
              アレルゲン不使用メニュー
            </Badge>
          )}
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-[10px]">{MENU_CATEGORY_LABELS[menu.category]}</Badge>
              <span className="text-[10px] text-muted-foreground font-mono">{menu.code}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{menu.name}</h1>
            <p className="mt-2 text-3xl font-bold tabular-nums text-primary">¥{menu.price.toLocaleString()}<span className="text-xs text-muted-foreground ml-1 font-normal">（税込）</span></p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{menu.description}</p>
          </div>

          {isAllergenFree ? (
            <Alert variant="success">
              <CheckCircle2 />
              <AlertTitle>アレルゲン不使用</AlertTitle>
              <AlertDescription>
                このメニューには、特定原材料28品目のいずれも使用していません。
                ただしコンタミネーションの可能性についてはスタッフへご確認ください。
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <h2 className="text-lg font-bold">アレルゲン情報</h2>
                </div>
                {specifiedContained.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-bold">含まれる特定原材料</h3>
                      <Badge variant="destructive" className="text-[10px]">表示義務 8品目</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {specifiedContained.map((id) => {
                        const a = getAllergen(id);
                        if (!a) return null;
                        return (
                          <div
                            key={id}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 ring-2"
                            style={{ backgroundColor: a.bgColor, color: a.color, boxShadow: `inset 0 0 0 2px ${a.color}40` }}
                          >
                            <AllergenBadge id={id} size="md" />
                            <span className="text-sm font-bold">{a.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <ChecklistGrid title="特定原材料 8品目（表示義務）" allergens={SPECIFIED_ALLERGENS.map((a) => a.id)} contained={allergenSet} />

                {recommendedContained.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-bold">含まれる準ずるもの</h3>
                      <Badge variant="warning" className="text-[10px]">推奨表示 20品目</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendedContained.map((id) => {
                        const a = getAllergen(id);
                        if (!a) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ backgroundColor: a.bgColor, color: a.color }}
                          >
                            <AllergenBadge id={id} size="xs" />{a.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {menu.recipe && menu.recipe.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="size-5 text-primary" />
                    <h2 className="text-lg font-bold">原材料</h2>
                  </div>
                  <ul className="space-y-1.5">
                    {menu.recipe.map((r, i) => {
                      const ing = getIngredient(r.ingredientId);
                      if (!ing) return null;
                      return (
                        <li key={i} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
                          <span className="text-sm font-medium flex-1">{ing.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{r.quantity} {r.unit}</span>
                          {ing.allergens.length > 0 && (
                            <div className="flex gap-0.5 shrink-0">
                              {ing.allergens.map((a) => <AllergenBadge key={a} id={a} size="xs" />)}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          )}

          <Alert>
            <Info />
            <AlertTitle>ご注意</AlertTitle>
            <AlertDescription className="space-y-1">
              <p>・同一施設・調理器具で他のアレルゲン含有メニューを調理しているため、ごく微量のコンタミネーションが発生する可能性がございます。</p>
              <p>・重度のアレルギーをお持ちの方は、必ず事前にスタッフへお声がけください。</p>
              <p>・原材料の仕入状況により、表示内容が変更されることがあります。</p>
            </AlertDescription>
          </Alert>
        </div>
      </article>
    </>
  );
}

function ChecklistGrid({ title, allergens, contained }: { title: string; allergens: string[]; contained: Set<string> }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      <ul className="grid grid-cols-4 gap-2">
        {allergens.map((id) => {
          const a = getAllergen(id);
          if (!a) return null;
          const has = contained.has(id);
          return (
            <li
              key={id}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-2 transition-colors",
                has ? "ring-2 ring-destructive/40 bg-destructive/5" : "bg-stone-50 opacity-50"
              )}
            >
              <AllergenBadge id={id} size="md" />
              <span className="text-[11px] font-medium leading-tight text-center">{a.name}</span>
              {has ? (
                <span className="text-[9px] font-bold text-destructive">含有</span>
              ) : (
                <span className="text-[9px] text-muted-foreground">—</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
