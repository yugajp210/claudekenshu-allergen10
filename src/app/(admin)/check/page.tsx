"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowRight,
  RefreshCcw,
  PlayCircle,
  ListChecks,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { inferAllergens, getIngredient } from "@/lib/ingredients";
import { SPECIFIED_ALLERGENS, ALLERGENS, getAllergen } from "@/lib/allergens";
import { MENU_CATEGORY_LABELS, type Menu } from "@/lib/menus";
import { AllergenBadge, AllergenChip } from "@/components/allergen-badge";
import { MenuImage } from "@/components/menu-image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CheckRow = {
  menu: Menu;
  inferred: string[];
  declared: string[];
  missing: string[];
  extra: string[];
  hasIssue: boolean;
};

export default function CheckPage() {
  const { menus, markReviewed } = useStore();
  const [filterLevel, setFilterLevel] = React.useState<"all" | "specified">("specified");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [scanning, setScanning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const rows: CheckRow[] = React.useMemo(() => {
    return menus.map((m) => {
      const inferred = inferAllergens(m.ingredients).filter((id) => {
        if (filterLevel === "specified") {
          return getAllergen(id)?.level === "specified";
        }
        return true;
      });
      const declared = m.declaredAllergens;
      const declaredSet = new Set(declared);
      const inferredSet = new Set(inferred);
      const missing = inferred.filter((a) => !declaredSet.has(a));
      const extra = declared.filter((a) => {
        if (filterLevel === "specified" && getAllergen(a)?.level !== "specified") return false;
        return !inferredSet.has(a);
      });
      return { menu: m, inferred, declared, missing, extra, hasIssue: missing.length > 0 };
    });
  }, [menus, filterLevel]);

  const issueRows = rows.filter((r) => r.hasIssue);
  const okRows = rows.filter((r) => !r.hasIssue);
  const totalCount = rows.length;
  const issueCount = issueRows.length;
  const okCount = okRows.length;
  const completionRate = totalCount === 0 ? 100 : Math.round((okCount / totalCount) * 100);

  const allSelectableIds = issueRows.map((r) => r.menu.id);
  const allSelected = allSelectableIds.length > 0 && allSelectableIds.every((id) => selected.has(id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allSelectableIds));
  };

  const runScan = () => {
    setScanning(true);
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 7;
      if (p >= 100) {
        setProgress(100);
        clearInterval(t);
        setTimeout(() => {
          setScanning(false);
          toast.success("一括スキャンが完了しました", { description: `${issueCount}件の表示漏れを検出しました` });
        }, 300);
      } else {
        setProgress(p);
      }
    }, 80);
  };

  const applyFix = () => {
    if (selected.size === 0) return;
    markReviewed(Array.from(selected));
    toast.success(`${selected.size}件のメニューを修正しました`, {
      description: "自動検出されたアレルゲンを表示に追加しました",
    });
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">アレルゲン表示点検</h2>
          <p className="text-sm text-muted-foreground">
            原材料から推定したアレルゲンと、表示されているアレルゲンを照合します。
          </p>
        </div>
        <Button onClick={runScan} disabled={scanning} size="sm">
          {scanning ? <RefreshCcw className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
          {scanning ? "スキャン中..." : "一括スキャンを実行"}
        </Button>
      </header>

      {scanning && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">全{totalCount}件をスキャンしています…</span>
              <span className="text-muted-foreground tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={<ListChecks className="size-4" />}
          label="スキャン対象"
          value={totalCount}
          unit="件"
          color="text-primary"
        />
        <SummaryCard
          icon={<AlertTriangle className="size-4" />}
          label="表示漏れ"
          value={issueCount}
          unit="件"
          color="text-destructive"
          highlight={issueCount > 0}
        />
        <SummaryCard
          icon={<CheckCircle2 className="size-4" />}
          label="OK"
          value={okCount}
          unit="件"
          color="text-success"
        />
        <SummaryCard
          icon={<ShieldCheck className="size-4" />}
          label="表示完了率"
          value={completionRate}
          unit="%"
          color="text-primary"
          progress={completionRate}
        />
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base">点検結果</CardTitle>
            <CardDescription>
              {filterLevel === "specified" ? "特定原材料 8品目" : "全28品目"}を対象に表示漏れを検出
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <div className="inline-flex rounded-md border p-0.5">
              <button
                type="button"
                onClick={() => setFilterLevel("specified")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-sm transition-colors",
                  filterLevel === "specified" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                8品目のみ
              </button>
              <button
                type="button"
                onClick={() => setFilterLevel("all")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-sm transition-colors",
                  filterLevel === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                全28品目
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="issues">
            <div className="px-4 pt-2">
              <TabsList>
                <TabsTrigger value="issues" className="gap-2">
                  要修正 <Badge variant="destructive" className="h-4 px-1 text-[10px]">{issueCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="ok" className="gap-2">
                  OK <Badge variant="secondary" className="h-4 px-1 text-[10px]">{okCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="matrix">含有マトリクス</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="issues" className="px-4 pb-4">
              {issueRows.length === 0 ? (
                <Alert variant="success" className="mt-4">
                  <CheckCircle2 />
                  <AlertTitle>表示漏れはありません</AlertTitle>
                  <AlertDescription>すべてのメニューでアレルゲン表示が正しく行われています。</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                      <span>すべて選択 ({selected.size}件選択中)</span>
                    </label>
                    <Button size="sm" onClick={applyFix} disabled={selected.size === 0}>
                      選択した{selected.size}件を一括修正
                    </Button>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {issueRows.map((r) => (
                      <IssueCard
                        key={r.menu.id}
                        row={r}
                        selected={selected.has(r.menu.id)}
                        onToggle={() => toggleSelect(r.menu.id)}
                      />
                    ))}
                  </ul>
                </>
              )}
            </TabsContent>

            <TabsContent value="ok" className="px-4 pb-4">
              {okRows.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-4">OK状態のメニューはありません。</p>
              ) : (
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {okRows.map((r) => (
                    <li key={r.menu.id}>
                      <Link
                        href={`/menus/${r.menu.id}`}
                        className="flex items-center gap-3 rounded-md border bg-card p-3 hover:bg-muted/50 transition-colors"
                      >
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold truncate">{r.menu.name}</span>
                            <Badge variant="outline" className="text-[10px]">{MENU_CATEGORY_LABELS[r.menu.category]}</Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground">{r.menu.code}・{r.declared.length}件のアレルゲンを表示中</div>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="matrix" className="p-0">
              <MatrixView rows={rows} filterLevel={filterLevel} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  unit,
  color,
  progress,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit?: string;
  color?: string;
  progress?: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-destructive/30 ring-1 ring-destructive/10" : undefined}>
      <CardContent className="p-3 sm:p-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{label}</span>
          <span className={color}>{icon}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-bold tabular-nums">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {progress !== undefined && <Progress value={progress} className="h-1.5" />}
      </CardContent>
    </Card>
  );
}

function IssueCard({ row, selected, onToggle }: { row: CheckRow; selected: boolean; onToggle: () => void }) {
  const triggerIngredients = row.missing
    .flatMap((aid) => {
      return row.menu.ingredients
        .map((iid) => getIngredient(iid))
        .filter((i) => i && i.allergens.includes(aid))
        .map((i) => `${i!.name}→${getAllergen(aid)?.name}`);
    })
    .slice(0, 4);

  return (
    <li className={cn(
      "rounded-lg border p-3 transition-colors",
      selected ? "border-destructive bg-destructive/5 ring-1 ring-destructive/20" : "bg-card hover:bg-muted/30"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} onCheckedChange={onToggle} className="mt-1" />
        <MenuImage
          src={row.menu.image}
          alt={row.menu.name}
          fallback={row.menu.name.slice(0, 1)}
          className="size-12 shrink-0 rounded-md"
          sizes="48px"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/menus/${row.menu.id}`} className="text-sm font-bold hover:underline">{row.menu.name}</Link>
            <Badge variant="outline" className="text-[10px]">{MENU_CATEGORY_LABELS[row.menu.category]}</Badge>
            <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="size-2.5 mr-0.5" />未表示{row.missing.length}</Badge>
            <span className="text-[10px] text-muted-foreground">{row.menu.code}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-destructive">追加が必要:</span>
            {row.missing.map((id) => <AllergenChip key={id} id={id} />)}
          </div>
          {triggerIngredients.length > 0 && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              検出根拠: {triggerIngredients.join("、")}
              {triggerIngredients.length >= 4 && "…"}
            </p>
          )}
        </div>
        <Button asChild size="icon" variant="ghost" className="shrink-0">
          <Link href={`/menus/${row.menu.id}`} aria-label="詳細を開く">
            <Eye className="size-4" />
          </Link>
        </Button>
      </div>
    </li>
  );
}

function MatrixView({ rows, filterLevel }: { rows: CheckRow[]; filterLevel: "all" | "specified" }) {
  const allergenList = filterLevel === "specified"
    ? SPECIFIED_ALLERGENS
    : ALLERGENS;

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-20 min-w-[200px]">メニュー</TableHead>
            {allergenList.map((a) => (
              <TableHead key={a.id} className="text-center p-1">
                <div className="flex flex-col items-center gap-1">
                  <AllergenBadge id={a.id} size="xs" />
                  <span className="text-[10px] font-medium leading-tight">{a.name}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const declared = new Set(r.declared);
            const inferred = new Set(inferAllergens(r.menu.ingredients));
            return (
              <TableRow key={r.menu.id}>
                <TableCell className="sticky left-0 bg-card z-10 border-r">
                  <Link href={`/menus/${r.menu.id}`} className="flex items-center gap-2 hover:underline">
                    {r.hasIssue && <AlertTriangle className="size-3.5 text-destructive shrink-0" />}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate max-w-[180px]">{r.menu.name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.menu.code}</div>
                    </div>
                  </Link>
                </TableCell>
                {allergenList.map((a) => {
                  const isDeclared = declared.has(a.id);
                  const isInferred = inferred.has(a.id);
                  const isMissing = isInferred && !isDeclared;
                  const isExtra = isDeclared && !isInferred;
                  return (
                    <TableCell key={a.id} className="text-center p-1">
                      {isDeclared || isInferred ? (
                        <div
                          className={cn(
                            "inline-flex size-7 items-center justify-center rounded-md text-[11px] font-bold mx-auto",
                            isMissing && "bg-destructive/15 text-destructive ring-1 ring-destructive/40",
                            !isMissing && isDeclared && !isExtra && "bg-success/15 text-success ring-1 ring-success/30",
                            isExtra && "bg-warning/20 text-warning-foreground ring-1 ring-warning/40"
                          )}
                          title={isMissing ? "表示漏れ" : isExtra ? "追加表示" : "表示済み"}
                        >
                          {isMissing ? "!" : isExtra ? "+" : "●"}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">·</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="px-4 py-3 border-t flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="inline-flex size-4 items-center justify-center rounded bg-success/15 text-success ring-1 ring-success/30 text-[10px] font-bold">●</span> 表示済み</span>
        <span className="inline-flex items-center gap-1"><span className="inline-flex size-4 items-center justify-center rounded bg-destructive/15 text-destructive ring-1 ring-destructive/40 text-[10px] font-bold">!</span> 表示漏れ</span>
        <span className="inline-flex items-center gap-1"><span className="inline-flex size-4 items-center justify-center rounded bg-warning/20 text-warning-foreground ring-1 ring-warning/40 text-[10px] font-bold">+</span> 追加表示（注意喚起）</span>
      </div>
    </div>
  );
}
