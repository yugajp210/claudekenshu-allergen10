"use client";

import * as React from "react";
import {
  Truck,
  Package,
  Boxes,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  CalendarClock,
  Building2,
  Save,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { type Ingredient } from "@/lib/ingredients";
import { type Supplier, type IngredientLot, LOT_STATUS_LABEL, LOT_STATUS_VARIANT, daysUntilExpiry } from "@/lib/suppliers";
import { AllergenBadge } from "@/components/allergen-badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function IngredientMasterPage() {
  const { suppliers, ingredients, lots } = useStore();

  const expiringSoon = lots.filter((l) => l.status === "active" && daysUntilExpiry(l.expiresAt) <= 3);
  const expired = lots.filter((l) => l.status === "expired" || (l.status === "active" && daysUntilExpiry(l.expiresAt) < 0));

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Truck className="size-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">原材料・仕入管理</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          原材料・仕入先・ロット情報を一元管理し、賞味期限とアレルゲンを追跡します。
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="原材料" value={ingredients.length} icon={<Package className="size-4" />} color="text-primary" />
        <StatCard label="仕入先" value={suppliers.length} icon={<Building2 className="size-4" />} color="text-blue-600" />
        <StatCard label="ロット" value={lots.length} icon={<Boxes className="size-4" />} color="text-emerald-600" />
        <StatCard
          label="期限切れ・直前"
          value={expiringSoon.length + expired.length}
          icon={<AlertTriangle className="size-4" />}
          color="text-destructive"
          highlight={expiringSoon.length + expired.length > 0}
        />
      </section>

      {(expiringSoon.length > 0 || expired.length > 0) && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>賞味期限のアラート</AlertTitle>
          <AlertDescription>
            <p>
              {expired.length > 0 && <><strong>期限切れ {expired.length}件</strong>・</>}
              <strong>3日以内に期限到来 {expiringSoon.length}件</strong>のロットがあります。下の「ロット」タブで確認してください。
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="ingredients" className="space-y-3">
        <TabsList>
          <TabsTrigger value="ingredients" className="gap-2">
            <Package className="size-3.5" />原材料 <Badge variant="secondary" className="h-4 px-1 text-[10px]">{ingredients.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Building2 className="size-3.5" />仕入先 <Badge variant="secondary" className="h-4 px-1 text-[10px]">{suppliers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="lots" className="gap-2">
            <Boxes className="size-3.5" />ロット <Badge variant="secondary" className="h-4 px-1 text-[10px]">{lots.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients">
          <IngredientsTab />
        </TabsContent>
        <TabsContent value="suppliers">
          <SuppliersTab />
        </TabsContent>
        <TabsContent value="lots">
          <LotsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-destructive/30 ring-1 ring-destructive/10" : undefined}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium">{label}</span>
          <span className={color}>{icon}</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 原材料タブ
// ============================================================================

function IngredientsTab() {
  const { ingredients, lots, menus, allergens, suppliers, upsertIngredient, deleteIngredient } = useStore();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string>("all");
  const [editing, setEditing] = React.useState<Ingredient | null>(null);

  const categories = Array.from(new Set(ingredients.map((i) => i.category)));

  const filtered = React.useMemo(() => {
    let list = ingredients;
    if (cat !== "all") list = list.filter((i) => i.category === cat);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(needle) || i.id.toLowerCase().includes(needle));
    }
    return list;
  }, [ingredients, cat, q]);

  const lotCountByIngredient = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of lots) {
      if (l.status === "active" || l.status === "stock") {
        map[l.ingredientId] = (map[l.ingredientId] || 0) + 1;
      }
    }
    return map;
  }, [lots]);

  const usageByIngredient = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of menus) {
      for (const id of m.ingredients) {
        map[id] = (map[id] || 0) + 1;
      }
    }
    return map;
  }, [menus]);

  const handleDelete = (i: Ingredient) => {
    if ((usageByIngredient[i.id] || 0) > 0) {
      toast.error("使用中の原材料は削除できません", {
        description: `${usageByIngredient[i.id]}件のメニューで使用されています`,
      });
      return;
    }
    if (confirm(`「${i.name}」を削除しますか?`)) {
      deleteIngredient(i.id);
      toast.success("削除しました");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base">原材料一覧</CardTitle>
            <CardDescription>分類別の原材料とアレルゲン情報</CardDescription>
          </div>
          <Button size="sm" onClick={() => setEditing({ id: `ing-${Date.now()}`, name: "", category: categories[0] || "その他", allergens: [] })}>
            <Plus className="size-4" />新規登録
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="原材料名で検索" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-32 sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての分類</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>原材料</TableHead>
              <TableHead className="hidden sm:table-cell">分類</TableHead>
              <TableHead>アレルゲン</TableHead>
              <TableHead className="text-right hidden md:table-cell">使用メニュー</TableHead>
              <TableHead className="text-right hidden md:table-cell">在庫ロット</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <div className="font-medium text-sm">{i.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{i.id}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="text-[10px]">{i.category}</Badge>
                </TableCell>
                <TableCell>
                  {i.allergens.length === 0 ? (
                    <span className="text-xs text-success font-medium">なし</span>
                  ) : (
                    <div className="flex flex-wrap gap-0.5">
                      {i.allergens.map((a) => <AllergenBadge key={a} id={a} size="xs" />)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  <Badge variant="secondary">{usageByIngredient[i.id] || 0}</Badge>
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  <Badge variant={(lotCountByIngredient[i.id] || 0) > 0 ? "success" : "outline"}>
                    {lotCountByIngredient[i.id] || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(i)} aria-label="編集">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(i)}
                      aria-label="削除"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">該当する原材料がありません</p>
        )}
      </CardContent>

      {editing && (
        <IngredientEditDialog
          ingredient={editing}
          isNew={!ingredients.some((i) => i.id === editing.id)}
          allergens={allergens}
          suppliers={suppliers}
          categories={categories}
          onSave={(i) => {
            upsertIngredient(i);
            toast.success(`「${i.name}」を保存しました`);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </Card>
  );
}

function IngredientEditDialog({
  ingredient,
  isNew,
  allergens,
  suppliers,
  categories,
  onSave,
  onClose,
}: {
  ingredient: Ingredient;
  isNew: boolean;
  allergens: { id: string; name: string; level: string }[];
  suppliers: Supplier[];
  categories: string[];
  onSave: (i: Ingredient) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = React.useState<Ingredient>(ingredient);

  const toggleAllergen = (id: string) => {
    setLocal({
      ...local,
      allergens: local.allergens.includes(id)
        ? local.allergens.filter((a) => a !== id)
        : [...local.allergens, id],
    });
  };

  const handleSave = () => {
    if (!local.name.trim()) {
      toast.error("名称は必須です");
      return;
    }
    onSave(local);
  };

  const specified = allergens.filter((a) => a.level === "specified");
  const recommended = allergens.filter((a) => a.level === "recommended");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{isNew ? "原材料を新規登録" : `「${ingredient.name}」を編集`}</DialogTitle>
          <DialogDescription>原材料の基本情報とアレルゲンを設定します。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>原材料名 <span className="text-destructive">*</span></Label>
              <Input value={local.name} onChange={(e) => setLocal({ ...local, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>分類</Label>
              <Select value={local.category} onValueChange={(v) => setLocal({ ...local, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>単位</Label>
              <Select value={local.unit || ""} onValueChange={(v) => setLocal({ ...local, unit: v })}>
                <SelectTrigger><SelectValue placeholder="単位を選択" /></SelectTrigger>
                <SelectContent>
                  {["g", "kg", "ml", "L", "個", "本", "枚"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>主要仕入先</Label>
              <Select value={local.primarySupplierId || "none"} onValueChange={(v) => setLocal({ ...local, primarySupplierId: v === "none" ? undefined : v })}>
                <SelectTrigger><SelectValue placeholder="未設定" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未設定</SelectItem>
                  {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>含まれるアレルゲン</Label>
            <div className="space-y-2">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-1">特定原材料</p>
                <div className="flex flex-wrap gap-1.5">
                  {specified.map((a) => {
                    const active = local.allergens.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAllergen(a.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                        )}
                      >
                        <AllergenBadge id={a.id} size="xs" />{a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-1">準ずるもの</p>
                <div className="flex flex-wrap gap-1">
                  {recommended.map((a) => {
                    const active = local.allergens.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAllergen(a.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] transition-colors",
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                        )}
                      >
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>備考</Label>
            <Textarea
              value={local.notes || ""}
              onChange={(e) => setLocal({ ...local, notes: e.target.value })}
              placeholder="調達上の注意・代替品など"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave}><Save className="size-4" />保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// 仕入先タブ
// ============================================================================

function SuppliersTab() {
  const { suppliers, lots, upsertSupplier, deleteSupplier } = useStore();
  const [editing, setEditing] = React.useState<Supplier | null>(null);

  const handleDelete = (s: Supplier) => {
    const inUse = lots.some((l) => l.supplierId === s.id);
    if (inUse) {
      toast.error("ロット履歴がある仕入先は削除できません");
      return;
    }
    if (confirm(`仕入先「${s.name}」を削除しますか?`)) {
      deleteSupplier(s.id);
      toast.success("削除しました");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">仕入先一覧</h3>
        <Button size="sm" onClick={() => setEditing({ id: `sup-${Date.now()}`, code: "", name: "", contact: "", phone: "", email: "", address: "" })}>
          <Plus className="size-4" />新規登録
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suppliers.map((s) => {
          const lotCount = lots.filter((l) => l.supplierId === s.id).length;
          return (
            <Card key={s.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-md bg-accent text-primary flex items-center justify-center shrink-0">
                      <Building2 className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold truncate">{s.name}</h4>
                        <Badge variant="outline" className="text-[10px] font-mono">{s.code}</Badge>
                      </div>
                      <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                        {s.contact && <div className="truncate">担当: {s.contact}</div>}
                        {s.phone && (
                          <div className="flex items-center gap-1"><Phone className="size-3" />{s.phone}</div>
                        )}
                        {s.email && (
                          <div className="flex items-center gap-1 truncate"><Mail className="size-3" />{s.email}</div>
                        )}
                        {s.address && (
                          <div className="flex items-start gap-1"><MapPin className="size-3 mt-0.5 shrink-0" /><span className="line-clamp-1">{s.address}</span></div>
                        )}
                      </div>
                      {s.notes && (
                        <p className="mt-2 text-[11px] text-muted-foreground bg-muted/40 rounded-md p-2 line-clamp-2">{s.notes}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">ロット {lotCount}件</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(s)} aria-label="編集">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(s)}
                      aria-label="削除"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editing && (
        <SupplierEditDialog
          supplier={editing}
          isNew={!suppliers.some((s) => s.id === editing.id)}
          onSave={(s) => {
            upsertSupplier(s);
            toast.success(`「${s.name}」を保存しました`);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function SupplierEditDialog({
  supplier,
  isNew,
  onSave,
  onClose,
}: {
  supplier: Supplier;
  isNew: boolean;
  onSave: (s: Supplier) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = React.useState<Supplier>(supplier);
  const handleSave = () => {
    if (!local.name.trim() || !local.code.trim()) {
      toast.error("名称とコードは必須です");
      return;
    }
    onSave(local);
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{isNew ? "仕入先を新規登録" : `「${supplier.name}」を編集`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>仕入先コード <span className="text-destructive">*</span></Label>
              <Input value={local.code} onChange={(e) => setLocal({ ...local, code: e.target.value })} placeholder="S-001" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>名称 <span className="text-destructive">*</span></Label>
              <Input value={local.name} onChange={(e) => setLocal({ ...local, name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>担当者</Label>
              <Input value={local.contact} onChange={(e) => setLocal({ ...local, contact: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>電話番号</Label>
              <Input value={local.phone} onChange={(e) => setLocal({ ...local, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>メールアドレス</Label>
            <Input type="email" value={local.email} onChange={(e) => setLocal({ ...local, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>住所</Label>
            <Input value={local.address} onChange={(e) => setLocal({ ...local, address: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>備考</Label>
            <Textarea value={local.notes || ""} onChange={(e) => setLocal({ ...local, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave}><Save className="size-4" />保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// ロット タブ
// ============================================================================

function LotsTab() {
  const { lots, ingredients, suppliers, upsertLot, deleteLot } = useStore();
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | IngredientLot["status"]>("all");
  const [editing, setEditing] = React.useState<IngredientLot | null>(null);

  const ingMap = React.useMemo(() => Object.fromEntries(ingredients.map((i) => [i.id, i])), [ingredients]);
  const supMap = React.useMemo(() => Object.fromEntries(suppliers.map((s) => [s.id, s])), [suppliers]);

  const filtered = React.useMemo(() => {
    let list = lots;
    if (statusFilter !== "all") list = list.filter((l) => l.status === statusFilter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((l) => {
        const ing = ingMap[l.ingredientId];
        const sup = supMap[l.supplierId];
        return (
          l.lotNumber.toLowerCase().includes(needle) ||
          ing?.name.toLowerCase().includes(needle) ||
          sup?.name.toLowerCase().includes(needle)
        );
      });
    }
    return list.sort((a, b) => daysUntilExpiry(a.expiresAt) - daysUntilExpiry(b.expiresAt));
  }, [lots, statusFilter, q, ingMap, supMap]);

  const handleDelete = (l: IngredientLot) => {
    if (confirm(`ロット「${l.lotNumber}」を削除しますか?`)) {
      deleteLot(l.id);
      toast.success("削除しました");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base">ロット履歴</CardTitle>
            <CardDescription>仕入ロットの番号・賞味期限・在庫を管理</CardDescription>
          </div>
          <Button size="sm" onClick={() => setEditing({
            id: `lot-${Date.now()}`, ingredientId: ingredients[0]?.id || "", supplierId: suppliers[0]?.id || "",
            lotNumber: "", receivedAt: "2026-05-18", expiresAt: "2026-05-25",
            quantity: 0, unit: "kg", status: "active",
          })}>
            <Plus className="size-4" />新規入荷
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ロット番号・原材料・仕入先で検索" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-32 sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての状態</SelectItem>
              <SelectItem value="active">使用中</SelectItem>
              <SelectItem value="stock">在庫</SelectItem>
              <SelectItem value="consumed">使い切り</SelectItem>
              <SelectItem value="expired">期限切れ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ロット番号</TableHead>
              <TableHead>原材料</TableHead>
              <TableHead className="hidden md:table-cell">仕入先</TableHead>
              <TableHead className="hidden sm:table-cell">在庫</TableHead>
              <TableHead>賞味期限</TableHead>
              <TableHead>状態</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => {
              const ing = ingMap[l.ingredientId];
              const sup = supMap[l.supplierId];
              const days = daysUntilExpiry(l.expiresAt);
              const expired = days < 0;
              const soon = days >= 0 && days <= 3;
              return (
                <TableRow key={l.id} className={expired ? "bg-destructive/5" : soon ? "bg-warning/10" : ""}>
                  <TableCell className="font-mono text-xs">{l.lotNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{ing?.name || "不明"}</div>
                        {ing && ing.allergens.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {ing.allergens.slice(0, 4).map((a) => <AllergenBadge key={a} id={a} size="xs" />)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{sup?.name || "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell tabular-nums text-xs">{l.quantity}{l.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className={cn("size-3.5", expired ? "text-destructive" : soon ? "text-warning" : "text-muted-foreground")} />
                      <div>
                        <div className="text-xs font-medium tabular-nums">{l.expiresAt}</div>
                        <div className={cn(
                          "text-[10px]",
                          expired ? "text-destructive font-bold" : soon ? "text-warning font-semibold" : "text-muted-foreground"
                        )}>
                          {expired ? `${Math.abs(days)}日経過` : days === 0 ? "本日" : `あと${days}日`}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={LOT_STATUS_VARIANT[l.status]} className="text-[10px]">
                      {LOT_STATUS_LABEL[l.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(l)} aria-label="編集">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(l)}
                        aria-label="削除"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">該当するロットがありません</p>
        )}
      </CardContent>

      {editing && (
        <LotEditDialog
          lot={editing}
          isNew={!lots.some((l) => l.id === editing.id)}
          ingredients={ingredients}
          suppliers={suppliers}
          onSave={(l) => {
            upsertLot(l);
            toast.success(`ロット「${l.lotNumber}」を保存しました`);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </Card>
  );
}

function LotEditDialog({
  lot,
  isNew,
  ingredients,
  suppliers,
  onSave,
  onClose,
}: {
  lot: IngredientLot;
  isNew: boolean;
  ingredients: Ingredient[];
  suppliers: Supplier[];
  onSave: (l: IngredientLot) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = React.useState<IngredientLot>(lot);
  const handleSave = () => {
    if (!local.lotNumber.trim() || !local.ingredientId || !local.supplierId) {
      toast.error("ロット番号・原材料・仕入先は必須です");
      return;
    }
    onSave(local);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{isNew ? "ロットを新規入荷" : `ロット「${lot.lotNumber}」を編集`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>ロット番号 <span className="text-destructive">*</span></Label>
              <Input value={local.lotNumber} onChange={(e) => setLocal({ ...local, lotNumber: e.target.value })} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>状態</Label>
              <Select value={local.status} onValueChange={(v) => setLocal({ ...local, status: v as IngredientLot["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">使用中</SelectItem>
                  <SelectItem value="stock">在庫</SelectItem>
                  <SelectItem value="consumed">使い切り</SelectItem>
                  <SelectItem value="expired">期限切れ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>原材料 <span className="text-destructive">*</span></Label>
            <Select value={local.ingredientId} onValueChange={(v) => setLocal({ ...local, ingredientId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ingredients.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}（{i.category}）</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>仕入先 <span className="text-destructive">*</span></Label>
            <Select value={local.supplierId} onValueChange={(v) => setLocal({ ...local, supplierId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>入荷日</Label>
              <Input type="date" value={local.receivedAt} onChange={(e) => setLocal({ ...local, receivedAt: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>賞味期限</Label>
              <Input type="date" value={local.expiresAt} onChange={(e) => setLocal({ ...local, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>数量</Label>
              <Input
                type="number"
                step="0.1"
                value={local.quantity}
                onChange={(e) => setLocal({ ...local, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>単位</Label>
              <Select value={local.unit} onValueChange={(v) => setLocal({ ...local, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["g", "kg", "ml", "L", "個", "本", "枚"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>単価 (円・任意)</Label>
            <Input
              type="number"
              value={local.pricePerUnit || ""}
              onChange={(e) => setLocal({ ...local, pricePerUnit: parseInt(e.target.value, 10) || undefined })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave}><Save className="size-4" />保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
