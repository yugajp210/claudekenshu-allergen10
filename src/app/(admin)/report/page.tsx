"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Download,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { ALLERGENS, SPECIFIED_ALLERGENS } from "@/lib/allergens";
import { inferAllergens } from "@/lib/ingredients";
import { MENU_CATEGORY_LABELS, type MenuCategory } from "@/lib/menus";
import { AllergenBadge } from "@/components/allergen-badge";
import { toast } from "sonner";

export default function ReportPage() {
  const { menus } = useStore();

  const totalMenus = menus.length;

  const byAllergen = React.useMemo(() => {
    return ALLERGENS.map((a) => {
      const declared = menus.filter((m) => m.declaredAllergens.includes(a.id)).length;
      const inferred = menus.filter((m) => inferAllergens(m.ingredients).includes(a.id)).length;
      const missing = menus.filter((m) => {
        const inferredSet = new Set(inferAllergens(m.ingredients));
        return inferredSet.has(a.id) && !m.declaredAllergens.includes(a.id);
      }).length;
      const percentage = totalMenus > 0 ? Math.round((declared / totalMenus) * 100) : 0;
      return { ...a, declared, inferred, missing, percentage };
    });
  }, [menus, totalMenus]);

  const byCategory = React.useMemo(() => {
    const categories: MenuCategory[] = ["main", "side", "soup", "rice", "dessert", "drink"];
    return categories.map((cat) => {
      const list = menus.filter((m) => m.category === cat);
      const allergenCount = list.reduce((acc, m) => acc + new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)]).size, 0);
      const missing = list.filter((m) => {
        const inferred = inferAllergens(m.ingredients);
        const declared = new Set(m.declaredAllergens);
        return inferred.some((a) => !declared.has(a));
      }).length;
      return {
        category: cat,
        label: MENU_CATEGORY_LABELS[cat],
        count: list.length,
        averageAllergens: list.length === 0 ? 0 : Math.round((allergenCount / list.length) * 10) / 10,
        missing,
      };
    });
  }, [menus]);

  const summary = React.useMemo(() => {
    const totalIssues = menus.filter((m) => {
      const inferred = inferAllergens(m.ingredients);
      const declared = new Set(m.declaredAllergens);
      return inferred.some((a) => !declared.has(a));
    }).length;
    const totalIngredients = menus.reduce((acc, m) => acc + m.ingredients.length, 0);
    return { totalIssues, totalIngredients };
  }, [menus]);

  const allergenFreeMenus = menus.filter((m) => new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)]).size === 0);

  const handleExport = () => {
    const headers = ["メニューコード", "メニュー名", "カテゴリ", "価格", ...SPECIFIED_ALLERGENS.map((a) => a.name)];
    const rows = menus.map((m) => {
      const all = new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)]);
      return [
        m.code,
        m.name,
        MENU_CATEGORY_LABELS[m.category],
        m.price.toString(),
        ...SPECIFIED_ALLERGENS.map((a) => (all.has(a.id) ? "●" : "")),
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "allergen-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSVをダウンロードしました");
  };

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">アレルゲンレポート</h2>
          <p className="text-sm text-muted-foreground">
            登録メニュー全体のアレルゲン使用状況を可視化します。
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="size-4" />CSVエクスポート
        </Button>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ReportKpi label="メニュー数" value={totalMenus} icon={<BarChart3 className="size-4" />} accent="text-primary" />
        <ReportKpi
          label="表示漏れあり"
          value={summary.totalIssues}
          icon={<AlertTriangle className="size-4" />}
          accent="text-destructive"
          highlight={summary.totalIssues > 0}
        />
        <ReportKpi label="アレルゲン不使用" value={allergenFreeMenus.length} icon={<CheckCircle2 className="size-4" />} accent="text-success" />
        <ReportKpi label="登録原材料数" value={summary.totalIngredients} icon={<TrendingUp className="size-4" />} accent="text-amber-700" />
      </section>

      <Tabs defaultValue="allergen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="allergen">アレルゲン別</TabsTrigger>
          <TabsTrigger value="menu">メニュー別</TabsTrigger>
          <TabsTrigger value="category">カテゴリ別</TabsTrigger>
        </TabsList>

        <TabsContent value="allergen" className="space-y-4">
          <div className="grid lg:grid-cols-5 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">特定原材料 8品目の使用メニュー数</CardTitle>
                <CardDescription>表示義務のあるアレルゲンの使用状況</CardDescription>
              </CardHeader>
              <CardContent className="h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byAllergen.filter((a) => a.level === "specified")} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <ReTooltip
                      cursor={{ fill: "var(--muted)" }}
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="declared" name="表示済み" radius={[6, 6, 0, 0]}>
                      {byAllergen.filter((a) => a.level === "specified").map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">表示漏れトップ</CardTitle>
                <CardDescription>表示漏れ件数が多いアレルゲン</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {byAllergen
                    .filter((a) => a.missing > 0)
                    .sort((a, b) => b.missing - a.missing)
                    .slice(0, 5)
                    .map((a) => (
                      <li key={a.id} className="flex items-center gap-3">
                        <AllergenBadge id={a.id} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-semibold truncate">{a.name}</span>
                            <span className="text-sm font-bold text-destructive tabular-nums">{a.missing}件</span>
                          </div>
                          <div className="h-1.5 mt-1 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-destructive rounded-full" style={{ width: `${Math.min(100, (a.missing / Math.max(1, totalMenus)) * 100)}%` }} />
                          </div>
                        </div>
                      </li>
                    ))}
                  {byAllergen.filter((a) => a.missing > 0).length === 0 && (
                    <li className="text-sm text-success flex items-center gap-2">
                      <CheckCircle2 className="size-4" />表示漏れはありません
                    </li>
                  )}
                </ul>
                <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
                  <Link href="/check">点検画面へ <ArrowRight className="size-3.5" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">アレルゲン別詳細</CardTitle>
              <CardDescription>全28品目の使用状況</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>アレルゲン</TableHead>
                    <TableHead className="text-center">区分</TableHead>
                    <TableHead className="text-right">表示済み</TableHead>
                    <TableHead className="text-right">原材料検出</TableHead>
                    <TableHead className="text-right">漏れ</TableHead>
                    <TableHead className="hidden sm:table-cell">使用率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byAllergen.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AllergenBadge id={a.id} size="sm" />
                          <span className="font-medium text-sm">{a.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={a.level === "specified" ? "default" : "outline"} className="text-[10px]">
                          {a.level === "specified" ? "義務" : "推奨"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{a.declared}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{a.inferred}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {a.missing > 0 ? (
                          <Badge variant="destructive" className="text-[10px]">{a.missing}</Badge>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${a.percentage}%`, background: a.color }} />
                          </div>
                          <span className="text-[11px] tabular-nums w-10 text-right">{a.percentage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">メニュー別アレルゲン数（多い順）</CardTitle>
              <CardDescription>アレルゲンを多く含むメニューほどリスク管理が重要です</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>メニュー</TableHead>
                    <TableHead className="hidden sm:table-cell">カテゴリ</TableHead>
                    <TableHead className="text-right">アレルゲン数</TableHead>
                    <TableHead className="hidden md:table-cell">構成</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...menus]
                    .map((m) => ({
                      menu: m,
                      allergens: Array.from(new Set([...m.declaredAllergens, ...inferAllergens(m.ingredients)])),
                    }))
                    .sort((a, b) => b.allergens.length - a.allergens.length)
                    .slice(0, 10)
                    .map(({ menu, allergens }) => (
                      <TableRow key={menu.id}>
                        <TableCell>
                          <Link href={`/menus/${menu.id}`} className="block">
                            <span className="text-sm font-semibold hover:underline">{menu.name}</span>
                            <div className="text-[10px] text-muted-foreground">{menu.code}</div>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-[10px]">{MENU_CATEGORY_LABELS[menu.category]}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={allergens.length >= 5 ? "warning" : "secondary"}>{allergens.length}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-0.5">
                            {allergens.slice(0, 8).map((id) => <AllergenBadge key={id} id={id} size="xs" />)}
                            {allergens.length > 8 && <span className="text-[10px] text-muted-foreground self-center ml-1">+{allergens.length - 8}</span>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {allergenFreeMenus.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" />
                  アレルゲン不使用メニュー
                </CardTitle>
                <CardDescription>すべてのアレルギーをお持ちの方にも提供可能</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allergenFreeMenus.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/menus/${m.id}`}
                        className="flex items-center gap-3 rounded-md border bg-success/5 border-success/30 p-3 hover:bg-success/10 transition-colors"
                      >
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{m.name}</div>
                          <div className="text-[10px] text-muted-foreground">{m.code}・{MENU_CATEGORY_LABELS[m.category]}</div>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">カテゴリ別メニュー構成</CardTitle>
                <CardDescription>登録メニューのカテゴリ内訳</CardDescription>
              </CardHeader>
              <CardContent className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory.filter((c) => c.count > 0)}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={["#10b981", "#f59e0b", "#3b82f6", "#a855f7", "#ec4899", "#06b6d4"][i % 6]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <ReTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">カテゴリ別 表示漏れ件数</CardTitle>
                <CardDescription>カテゴリごとの要対応メニュー数</CardDescription>
              </CardHeader>
              <CardContent className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <ReTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="missing" name="表示漏れ" fill="var(--destructive)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">カテゴリ別サマリー</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead className="text-right">メニュー数</TableHead>
                    <TableHead className="text-right">平均アレルゲン数</TableHead>
                    <TableHead className="text-right">表示漏れ</TableHead>
                    <TableHead className="text-right">完了率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCategory.map((c) => {
                    const rate = c.count === 0 ? 100 : Math.round(((c.count - c.missing) / c.count) * 100);
                    return (
                      <TableRow key={c.category}>
                        <TableCell className="font-medium">{c.label}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.count}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.averageAllergens}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {c.missing > 0 ? (
                            <Badge variant="destructive" className="text-[10px]">{c.missing}</Badge>
                          ) : (
                            <span className="text-success">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Progress value={rate} className="h-1.5 w-16" />
                            <span className="text-xs tabular-nums w-9 text-right">{rate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportKpi({ label, value, icon, accent, highlight }: { label: string; value: number | string; icon: React.ReactNode; accent?: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-destructive/30" : undefined}>
      <CardContent className="p-3 sm:p-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{label}</span>
          <span className={accent}>{icon}</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
