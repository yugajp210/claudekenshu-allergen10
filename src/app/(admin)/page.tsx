"use client";

import * as React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { inferAllergens } from "@/lib/ingredients";
import { SPECIFIED_ALLERGENS } from "@/lib/allergens";
import { AllergenBadge, AllergenList } from "@/components/allergen-badge";
import { MenuImage } from "@/components/menu-image";
import { MENU_CATEGORY_LABELS } from "@/lib/menus";

export default function Home() {
  const { menus } = useStore();

  const stats = React.useMemo(() => {
    const total = menus.length;
    const published = menus.filter((m) => m.status === "published").length;
    const drafts = menus.filter((m) => m.status === "draft").length;
    const review = menus.filter((m) => m.status === "review").length;

    let missingMenus = 0;
    let missingTotal = 0;
    for (const m of menus) {
      const inferred = inferAllergens(m.ingredients);
      const declared = new Set(m.declaredAllergens);
      const missing = inferred.filter((a) => !declared.has(a));
      if (missing.length) {
        missingMenus++;
        missingTotal += missing.length;
      }
    }
    const completionRate = total === 0 ? 100 : Math.round(((total - missingMenus) / total) * 100);

    const allergenUsage: Record<string, number> = {};
    for (const m of menus) {
      const inferred = new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)]);
      for (const a of inferred) allergenUsage[a] = (allergenUsage[a] || 0) + 1;
    }

    return { total, published, drafts, review, missingMenus, missingTotal, completionRate, allergenUsage };
  }, [menus]);

  const recent = [...menus].slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-gradient-to-br from-primary to-emerald-700 text-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-wider uppercase opacity-80">ようこそ、山田さん</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold">
              本日のアレルゲン点検
            </h2>
            <p className="mt-1 text-sm opacity-90">
              {stats.missingMenus > 0
                ? `${stats.missingMenus}件のメニューに表示漏れの可能性があります。`
                : "すべてのメニューでアレルゲン表示が完了しています。"}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild size="sm" variant="secondary">
              <Link href="/check">
                <ShieldCheck className="size-4" />
                点検を開始
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-white/15 hover:bg-white/25 text-white border border-white/20">
              <Link href="/menus/new">
                <Plus className="size-4" />
                登録
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="登録メニュー"
          value={stats.total}
          unit="件"
          icon={<UtensilsCrossed className="size-4" />}
          accent="text-primary"
          sub={`公開中 ${stats.published}件`}
        />
        <KpiCard
          label="表示漏れ警告"
          value={stats.missingMenus}
          unit="件"
          icon={<AlertTriangle className="size-4" />}
          accent="text-destructive"
          sub={`合計 ${stats.missingTotal} 項目`}
          highlight={stats.missingMenus > 0}
        />
        <KpiCard
          label="承認待ち"
          value={stats.review + stats.drafts}
          unit="件"
          icon={<Clock className="size-4" />}
          accent="text-amber-700"
          sub={`下書き ${stats.drafts} / 確認 ${stats.review}`}
        />
        <KpiCard
          label="表示完了率"
          value={stats.completionRate}
          unit="%"
          icon={<TrendingUp className="size-4" />}
          accent="text-success"
          sub={
            <Progress value={stats.completionRate} className="h-1.5 mt-1.5" />
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">特定原材料 8品目の検出状況</CardTitle>
              <CardDescription>食品表示法で義務付けられた特定原材料の使用メニュー数</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/report">
                詳しく見る <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SPECIFIED_ALLERGENS.map((a) => {
                const count = stats.allergenUsage[a.id] ?? 0;
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <li key={a.id} className="rounded-lg border bg-card p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <AllergenBadge id={a.id} size="md" />
                      <div className="leading-tight">
                        <div className="text-sm font-semibold">{a.name}</div>
                        <div className="text-[11px] text-muted-foreground">{count}件 / {percent}%</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, background: a.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">クイックアクション</CardTitle>
            <CardDescription>よく使う操作にすぐアクセス</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              href="/menus/new"
              title="メニューを新規登録"
              description="原材料からアレルゲンを自動判定"
              icon={<Plus className="size-4" />}
            />
            <QuickAction
              href="/check"
              title="一括点検を実行"
              description="表示漏れがあるメニューを抽出"
              icon={<ShieldCheck className="size-4" />}
              badge={stats.missingMenus > 0 ? `${stats.missingMenus}件要確認` : undefined}
            />
            <QuickAction
              href="/menus"
              title="メニュー一覧"
              description="原材料・アレルゲンで絞り込み"
              icon={<UtensilsCrossed className="size-4" />}
            />
            <QuickAction
              href="/report"
              title="レポートを確認"
              description="アレルゲン別・メニュー別の分析"
              icon={<TrendingUp className="size-4" />}
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">最近の更新</CardTitle>
            <CardDescription>直近で登録・編集されたメニュー</CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/menus">
              すべて見る <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {recent.map((m) => {
              const inferred = inferAllergens(m.ingredients);
              const declared = new Set(m.declaredAllergens);
              const missing = inferred.filter((a) => !declared.has(a));
              return (
                <li key={m.id}>
                  <Link href={`/menus/${m.id}`} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                    <MenuImage
                      src={m.image}
                      alt={m.name}
                      fallback={m.name.slice(0, 1)}
                      className="size-12 shrink-0 rounded-md"
                      sizes="48px"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate max-w-full">{m.name}</span>
                        <Badge variant="outline" className="text-[10px]">{MENU_CATEGORY_LABELS[m.category]}</Badge>
                        <span className="text-[10px] text-muted-foreground">{m.code}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <AllergenList ids={Array.from(new Set([...m.declaredAllergens, ...inferred]))} max={8} size="xs" />
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {m.updatedAt}・{m.updatedBy}
                      </div>
                    </div>
                    {missing.length > 0 && (
                      <Badge variant="destructive" className="shrink-0 self-center text-[10px]">
                        漏れ{missing.length}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  icon,
  accent,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  accent?: string;
  sub?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-destructive/30 ring-1 ring-destructive/10" : undefined}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">{label}</span>
          <span className={accent}>{icon}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent transition-colors group"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{description}</div>
      </div>
      {badge && <Badge variant="destructive" className="text-[10px] shrink-0">{badge}</Badge>}
      <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
