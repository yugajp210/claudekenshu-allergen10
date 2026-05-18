"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { inferAllergens, getIngredient } from "@/lib/ingredients";
import { SPECIFIED_ALLERGENS, RECOMMENDED_ALLERGENS, getAllergen } from "@/lib/allergens";
import { MENU_CATEGORY_LABELS } from "@/lib/menus";
import { AllergenBadge, AllergenChip } from "@/components/allergen-badge";
import { MenuImage } from "@/components/menu-image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MenuDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { menus, setDeclaredAllergens, deleteMenu } = useStore();
  const menu = menus.find((m) => m.id === params.id);

  if (!menu) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/menus"><ArrowLeft className="size-4" />メニュー一覧へ戻る</Link>
        </Button>
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>メニューが見つかりません</AlertTitle>
          <AlertDescription>削除された可能性があります。</AlertDescription>
        </Alert>
      </div>
    );
  }

  const inferred = inferAllergens(menu.ingredients);
  const declared = new Set(menu.declaredAllergens);
  const missing = inferred.filter((a) => !declared.has(a));
  const extra = menu.declaredAllergens.filter((a) => !inferred.includes(a));

  const adoptAllergens = () => {
    const merged = Array.from(new Set([...menu.declaredAllergens, ...inferred]));
    setDeclaredAllergens(menu.id, merged);
    toast.success("自動検出されたアレルゲンを適用しました", { description: `${missing.length}件を追加しました` });
  };

  const handleDelete = () => {
    if (confirm(`「${menu.name}」を削除しますか?`)) {
      deleteMenu(menu.id);
      toast.success("メニューを削除しました");
      router.push("/menus");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/menus"><ArrowLeft className="size-4" />一覧へ戻る</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Pencil className="size-4" />編集
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="size-4" />削除
          </Button>
        </div>
      </div>

      {missing.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>表示漏れの可能性: {missing.length}件</AlertTitle>
          <AlertDescription>
            <p>原材料から検出された次のアレルゲンが、表示に含まれていません:</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {missing.map((id) => <AllergenChip key={id} id={id} />)}
            </div>
            <Button size="sm" variant="destructive" onClick={adoptAllergens} className="mt-3">
              自動検出された{missing.length}件を表示に追加
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="relative aspect-[16/9]">
            <MenuImage
              src={menu.image}
              alt={menu.name}
              fallback={menu.name.slice(0, 1)}
              className="absolute inset-0"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <div className="absolute top-3 left-3 flex gap-1.5 z-10">
              <Badge variant="outline" className="bg-background/90">{MENU_CATEGORY_LABELS[menu.category]}</Badge>
              {menu.status === "draft" && <Badge variant="secondary">下書き</Badge>}
              {menu.status === "review" && <Badge variant="warning">確認待ち</Badge>}
              {menu.status === "published" && <Badge variant="success">公開中</Badge>}
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{menu.name}</h1>
                <span className="text-sm text-muted-foreground">{menu.code}</span>
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-primary">¥{menu.price.toLocaleString()}</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{menu.description}</p>
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">レシピ・原材料</h3>
                {menu.servings && (
                  <Badge variant="outline" className="text-[10px]">{menu.servings}人前</Badge>
                )}
              </div>
              {menu.recipe && menu.recipe.length > 0 ? (
                <ul className="space-y-1.5">
                  {menu.recipe.map((r, i) => {
                    const ing = getIngredient(r.ingredientId);
                    if (!ing) return null;
                    return (
                      <li key={i} className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-muted-foreground">{ing.category}</div>
                          <div className="text-sm font-medium">{ing.name}</div>
                        </div>
                        <div className="text-sm font-bold tabular-nums whitespace-nowrap">
                          {r.quantity} <span className="text-xs text-muted-foreground">{r.unit}</span>
                        </div>
                        {ing.allergens.length > 0 && (
                          <div className="flex gap-0.5 shrink-0">
                            {ing.allergens.map((a) => <AllergenBadge key={a} id={a} size="xs" />)}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {menu.ingredients.map((id) => {
                    const ing = getIngredient(id);
                    if (!ing) return null;
                    return (
                      <li key={id} className="rounded-md border bg-card px-3 py-2">
                        <div className="text-xs text-muted-foreground">{ing.category}</div>
                        <div className="text-sm font-medium">{ing.name}</div>
                        {ing.allergens.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-0.5">
                            {ing.allergens.map((a) => <AllergenBadge key={a} id={a} size="xs" />)}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">アレルゲン表示</CardTitle>
              <CardDescription>
                {missing.length === 0 ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 className="size-3.5" />原材料と一致しています
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-destructive">
                    <AlertTriangle className="size-3.5" />一部に不整合があります
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AllergenSection
                title="特定原材料（8品目・表示義務）"
                allergens={SPECIFIED_ALLERGENS.map((a) => a.id)}
                declared={declared}
                inferred={new Set(inferred)}
              />
              <Separator />
              <AllergenSection
                title="特定原材料に準ずるもの（20品目・推奨）"
                allergens={RECOMMENDED_ALLERGENS.map((a) => a.id)}
                declared={declared}
                inferred={new Set(inferred)}
                compact
              />
            </CardContent>
          </Card>

          {extra.length > 0 && (
            <Alert variant="info">
              <CheckCircle2 />
              <AlertTitle>注意喚起での表示: {extra.length}件</AlertTitle>
              <AlertDescription>
                原材料からは検出されませんが、コンタミネーション等の理由で表示されています。
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {extra.map((id) => <AllergenChip key={id} id={id} />)}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">更新情報</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">最終更新</span><span>{menu.updatedAt}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">更新者</span><span>{menu.updatedBy}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">状態</span>
                <span>
                  {menu.status === "draft" && <Badge variant="secondary">下書き</Badge>}
                  {menu.status === "review" && <Badge variant="warning">確認待ち</Badge>}
                  {menu.status === "published" && <Badge variant="success">公開中</Badge>}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AllergenSection({
  title,
  allergens,
  declared,
  inferred,
  compact,
}: {
  title: string;
  allergens: string[];
  declared: Set<string>;
  inferred: Set<string>;
  compact?: boolean;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</h4>
      <ul className={cn("grid gap-1.5", compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-4")}>
        {allergens.map((id) => {
          const a = getAllergen(id);
          if (!a) return null;
          const isDeclared = declared.has(id);
          const isInferred = inferred.has(id);
          const present = isDeclared || isInferred;
          const isMissing = isInferred && !isDeclared;
          return (
            <li
              key={id}
              className={cn(
                "rounded-md border p-2 flex flex-col items-center text-center gap-1 transition-colors",
                isMissing && "bg-destructive/10 border-destructive/40",
                isDeclared && !isMissing && "bg-success/10 border-success/30",
                !present && "opacity-40"
              )}
            >
              <AllergenBadge id={id} size={compact ? "xs" : "sm"} />
              <span className="text-[10px] sm:text-[11px] font-medium leading-tight">{a.name}</span>
              {isMissing && <span className="text-[9px] font-bold text-destructive">未表示</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
