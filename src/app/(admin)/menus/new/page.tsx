"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  FileCheck2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INGREDIENTS,
  INGREDIENT_CATEGORIES,
  inferAllergens,
  getIngredient,
} from "@/lib/ingredients";
import {
  SPECIFIED_ALLERGENS,
  RECOMMENDED_ALLERGENS,
} from "@/lib/allergens";
import { type MenuCategory, type RecipeItem } from "@/lib/menus";
import { AllergenBadge, AllergenChip } from "@/components/allergen-badge";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: MenuCategory; label: string }[] = [
  { value: "main", label: "主菜" },
  { value: "side", label: "副菜" },
  { value: "soup", label: "汁物" },
  { value: "rice", label: "ご飯・麺" },
  { value: "dessert", label: "デザート" },
  { value: "drink", label: "ドリンク" },
];

export default function NewMenuPage() {
  const router = useRouter();
  const { addMenu } = useStore();

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<MenuCategory>("main");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [servings, setServings] = React.useState<number>(1);
  const [recipe, setRecipe] = React.useState<RecipeItem[]>([]);
  const [manualAllergens, setManualAllergens] = React.useState<Set<string>>(new Set());
  const [removedAllergens, setRemovedAllergens] = React.useState<Set<string>>(new Set());
  const [ingredientSearch, setIngredientSearch] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string>(INGREDIENT_CATEGORIES[0]);

  const ingredients = React.useMemo(() => recipe.map((r) => r.ingredientId), [recipe]);
  const inferred = React.useMemo(() => new Set(inferAllergens(ingredients)), [ingredients]);
  const allDeclared = React.useMemo(() => {
    const set = new Set<string>(inferred);
    for (const a of manualAllergens) set.add(a);
    for (const a of removedAllergens) set.delete(a);
    return set;
  }, [inferred, manualAllergens, removedAllergens]);

  const filteredIngredients = React.useMemo(() => {
    const q = ingredientSearch.toLowerCase();
    if (q) {
      return INGREDIENTS.filter((i) => i.name.toLowerCase().includes(q));
    }
    return INGREDIENTS.filter((i) => i.category === activeCat);
  }, [ingredientSearch, activeCat]);

  const guessUnit = (categoryName: string) => {
    if (categoryName === "卵") return "個";
    if (categoryName === "調味料") return "ml";
    if (categoryName === "乳製品") return "ml";
    return "g";
  };
  const guessQuantity = (categoryName: string) => {
    if (categoryName === "卵") return 1;
    if (categoryName === "調味料") return 10;
    return 100;
  };

  const toggleIngredient = (id: string) => {
    setRecipe((prev) => {
      const existing = prev.find((r) => r.ingredientId === id);
      if (existing) return prev.filter((r) => r.ingredientId !== id);
      const ing = INGREDIENTS.find((i) => i.id === id);
      const cat = ing?.category || "";
      return [...prev, { ingredientId: id, quantity: guessQuantity(cat), unit: guessUnit(cat) }];
    });
  };

  const updateRecipeItem = (id: string, patch: Partial<RecipeItem>) => {
    setRecipe((prev) => prev.map((r) => (r.ingredientId === id ? { ...r, ...patch } : r)));
  };

  const toggleAllergenManual = (id: string) => {
    const isAutoDetected = inferred.has(id);
    if (isAutoDetected) {
      // 自動検出済み: 除外フラグを切り替え
      setRemovedAllergens((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      // 任意追加
      setManualAllergens((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  const canSubmit = name.trim().length > 0 && ingredients.length > 0;

  const handleSubmit = (status: "draft" | "published" | "review") => {
    if (!canSubmit) {
      toast.error("メニュー名と原材料を入力してください");
      return;
    }
    const menu = addMenu({
      name: name.trim(),
      category,
      description: description.trim() || "（説明なし）",
      price: parseInt(price || "0", 10) || 0,
      ingredients,
      recipe,
      servings,
      declaredAllergens: Array.from(allDeclared),
      status,
    });
    toast.success(`メニュー「${menu.name}」を${status === "draft" ? "下書き保存" : status === "review" ? "確認依頼" : "公開"}しました`);
    router.push(`/menus/${menu.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button asChild variant="ghost" size="sm">
          <Link href="/menus"><ArrowLeft className="size-4" />一覧へ戻る</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSubmit("draft")} disabled={!canSubmit}>
            下書き保存
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleSubmit("review")} disabled={!canSubmit}>
            <FileCheck2 className="size-4" />確認依頼
          </Button>
          <Button size="sm" onClick={() => handleSubmit("published")} disabled={!canSubmit}>
            <Save className="size-4" />公開する
          </Button>
        </div>
      </div>

      <header>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">メニューを登録</h2>
        <p className="text-sm text-muted-foreground">原材料を選択すると、アレルゲンが自動で判定されます。</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name">
                    メニュー名 <span className="text-destructive">*</span>
                  </Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 鶏のから揚げ" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as MenuCategory)}>
                    <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">価格（円）</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="980" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="メニューの特徴やこだわりを記入してください" rows={3} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base">原材料 <span className="text-destructive">*</span></CardTitle>
                  <CardDescription>使用する原材料を選択するとアレルゲンが自動判定されます</CardDescription>
                </div>
                <Badge variant="secondary">{ingredients.length}件 選択中</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  placeholder="原材料を検索"
                  className="pl-9"
                />
              </div>

              {recipe.length > 0 && (
                <div className="rounded-md border bg-muted/30 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">
                    <span>レシピ（{servings}人前）</span>
                    <div className="flex items-center gap-1.5 font-normal normal-case">
                      <Label htmlFor="servings-input" className="text-[10px]">人前:</Label>
                      <input
                        id="servings-input"
                        type="number"
                        min={1}
                        max={20}
                        value={servings}
                        onChange={(e) => setServings(Math.max(1, parseInt(e.target.value || "1", 10)))}
                        className="h-6 w-12 rounded border px-1.5 text-xs text-right bg-white tabular-nums"
                      />
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {recipe.map((r) => {
                      const ing = getIngredient(r.ingredientId);
                      if (!ing) return null;
                      return (
                        <li key={r.ingredientId} className="flex items-center gap-2 rounded bg-white border px-2 py-1.5">
                          <span className="text-sm font-medium flex-1 min-w-0 truncate">{ing.name}</span>
                          {ing.allergens.length > 0 && (
                            <div className="flex gap-0.5 shrink-0">
                              {ing.allergens.slice(0, 3).map((a) => <span key={a} className="inline-flex items-center justify-center rounded-full size-4 text-[9px] font-bold" style={{ backgroundColor: ing.allergens.includes(a) ? "#fef3c7" : "" }}>{a.slice(0,1)}</span>)}
                            </div>
                          )}
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            value={r.quantity}
                            onChange={(e) => updateRecipeItem(r.ingredientId, { quantity: parseFloat(e.target.value) || 0 })}
                            className="h-7 w-16 rounded border px-2 text-xs text-right tabular-nums"
                          />
                          <select
                            value={r.unit}
                            onChange={(e) => updateRecipeItem(r.ingredientId, { unit: e.target.value })}
                            className="h-7 rounded border px-1.5 text-xs bg-white"
                          >
                            {["g", "kg", "ml", "L", "個", "本", "枚"].map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <button
                            type="button"
                            onClick={() => toggleIngredient(r.ingredientId)}
                            className="size-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            aria-label="削除"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {!ingredientSearch && (
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCat(cat)}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        activeCat === cat ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredIngredients.map((ing) => {
                  const checked = ingredients.includes(ing.id);
                  return (
                    <li key={ing.id}>
                      <button
                        type="button"
                        onClick={() => toggleIngredient(ing.id)}
                        className={cn(
                          "w-full text-left rounded-md border p-2.5 transition-all",
                          checked ? "border-primary bg-accent ring-1 ring-primary/30" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-medium">{ing.name}</span>
                          {checked && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                        </div>
                        {ing.allergens.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-0.5">
                            {ing.allergens.map((a) => <AllergenBadge key={a} id={a} size="xs" />)}
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {filteredIngredients.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">該当する原材料が見つかりません</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-[72px]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                自動判定アレルゲン
              </CardTitle>
              <CardDescription>原材料から自動で抽出された結果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {inferred.size === 0 ? (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="size-4" />
                  アレルゲンは検出されませんでした
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(inferred).map((id) => <AllergenChip key={id} id={id} />)}
                </div>
              )}

              {ingredients.length === 0 && (
                <Alert>
                  <AlertTriangle />
                  <AlertTitle>原材料を選択してください</AlertTitle>
                  <AlertDescription>原材料を選択すると、含まれるアレルゲンが自動で表示されます。</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">特定原材料 8品目 含有チェックリスト</CardTitle>
          <CardDescription>
            食品表示法で表示が義務付けられている8品目。原材料から自動チェックされますが、コンタミ等で
            手動追加することもできます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SPECIFIED_ALLERGENS.map((a) => {
              const isAuto = inferred.has(a.id);
              const isRemoved = removedAllergens.has(a.id);
              const isManual = manualAllergens.has(a.id);
              const isDeclared = (isAuto && !isRemoved) || isManual;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => toggleAllergenManual(a.id)}
                    className={cn(
                      "w-full rounded-lg border-2 p-3 transition-all text-left",
                      isDeclared ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted/40",
                      isAuto && !isRemoved && "ring-2 ring-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <AllergenBadge id={a.id} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {isAuto ? (isRemoved ? "自動除外" : "自動検出") : isManual ? "手動追加" : "未含有"}
                        </div>
                      </div>
                      <Checkbox checked={isDeclared} className="pointer-events-none" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <Separator className="my-4" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold">特定原材料に準ずるもの（20品目・推奨表示）</h4>
              <Badge variant="outline" className="text-[10px]">推奨</Badge>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-1.5">
              {RECOMMENDED_ALLERGENS.map((a) => {
                const isAuto = inferred.has(a.id);
                const isRemoved = removedAllergens.has(a.id);
                const isManual = manualAllergens.has(a.id);
                const isDeclared = (isAuto && !isRemoved) || isManual;
                return (
                  <li key={a.id}>
                    <label className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer transition-colors",
                      isDeclared ? "bg-accent border-primary/40" : "bg-card hover:bg-muted/50"
                    )}>
                      <Checkbox checked={isDeclared} onCheckedChange={() => toggleAllergenManual(a.id)} />
                      <AllergenBadge id={a.id} size="xs" />
                      <span className="text-xs font-medium truncate">{a.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ChevronRight className="size-4 text-primary" />
            最終表示プレビュー
          </CardTitle>
          <CardDescription>このメニューに表示されるアレルゲン一覧</CardDescription>
        </CardHeader>
        <CardContent>
          {allDeclared.size === 0 ? (
            <div className="rounded-md border bg-success/5 border-success/40 p-4 text-sm text-success font-medium inline-flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              アレルゲンなし
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {Array.from(allDeclared).map((id) => <AllergenChip key={id} id={id} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
