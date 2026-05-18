"use client";

import * as React from "react";
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  X,
  Sparkles,
  BookOpen,
  Tag,
  Save,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { detectAllergensFromText, type Allergen } from "@/lib/allergens";
import { AllergenBadge } from "@/components/allergen-badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMPTY: Allergen = {
  id: "",
  name: "",
  short: "",
  level: "recommended",
  aliases: [],
  notes: "",
  color: "#94a3b8",
  bgColor: "#f1f5f9",
  iconColor: "text-slate-700",
  legalRef: "",
};

export default function AllergenMasterPage() {
  const { allergens, upsertAllergen, deleteAllergen, menus } = useStore();
  const [editing, setEditing] = React.useState<Allergen | null>(null);
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return allergens;
    return allergens.filter((a) => {
      return (
        a.name.toLowerCase().includes(needle) ||
        a.aliases.some((al) => al.toLowerCase().includes(needle)) ||
        a.id.toLowerCase().includes(needle)
      );
    });
  }, [allergens, q]);

  const specified = filtered.filter((a) => a.level === "specified");
  const recommended = filtered.filter((a) => a.level === "recommended");

  const usageCount = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of menus) {
      for (const a of m.declaredAllergens) map[a] = (map[a] || 0) + 1;
    }
    return map;
  }, [menus]);

  const handleDelete = (a: Allergen) => {
    if (a.level === "specified") {
      toast.error("特定原材料は削除できません", { description: "食品表示法で表示義務があります。" });
      return;
    }
    if (confirm(`「${a.name}」を削除しますか? 関連メニューの表示には影響しません。`)) {
      deleteAllergen(a.id);
      toast.success("削除しました");
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="size-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">アレルゲンマスタ</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            食品表示法に基づくアレルゲンの表示名・代替表記を管理します。
          </p>
        </div>
        <div className="flex gap-2">
          <TextDetectionDialog />
          <Button size="sm" onClick={() => setEditing({ ...EMPTY, id: `custom-${Date.now()}` })}>
            <Plus className="size-4" />新規追加
          </Button>
        </div>
      </header>

      <Alert variant="info">
        <BookOpen />
        <AlertTitle>食品表示法に基づく分類</AlertTitle>
        <AlertDescription>
          <p>
            <strong className="text-foreground">特定原材料 8品目</strong>: 表示義務あり (卵・乳・小麦・えび・かに・そば・落花生・くるみ)
          </p>
          <p>
            <strong className="text-foreground">特定原材料に準ずるもの 20品目</strong>: 表示が推奨される (アーモンド・あわび 等)
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="名前・代替表記・IDで検索" className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="specified" className="space-y-3">
        <TabsList>
          <TabsTrigger value="specified" className="gap-2">
            特定原材料 <Badge variant="default" className="h-4 px-1 text-[10px]">{specified.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="recommended" className="gap-2">
            準ずるもの <Badge variant="secondary" className="h-4 px-1 text-[10px]">{recommended.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="specified" className="space-y-2">
          {specified.map((a) => (
            <AllergenRow
              key={a.id}
              allergen={a}
              usage={usageCount[a.id] || 0}
              onEdit={() => setEditing(a)}
              onDelete={() => handleDelete(a)}
            />
          ))}
        </TabsContent>
        <TabsContent value="recommended" className="space-y-2">
          {recommended.map((a) => (
            <AllergenRow
              key={a.id}
              allergen={a}
              usage={usageCount[a.id] || 0}
              onEdit={() => setEditing(a)}
              onDelete={() => handleDelete(a)}
            />
          ))}
        </TabsContent>
      </Tabs>

      {editing && (
        <AllergenEditDialog
          allergen={editing}
          isNew={!allergens.some((a) => a.id === editing.id)}
          onSave={(a) => {
            upsertAllergen(a);
            toast.success(`「${a.name}」を保存しました`);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function AllergenRow({
  allergen,
  usage,
  onEdit,
  onDelete,
}: {
  allergen: Allergen;
  usage: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <AllergenBadge id={allergen.id} size="lg" className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold">{allergen.name}</h3>
              <Badge variant={allergen.level === "specified" ? "default" : "outline"} className="text-[10px]">
                {allergen.level === "specified" ? "義務" : "推奨"}
              </Badge>
              {usage > 0 && <Badge variant="secondary" className="text-[10px]">{usage}メニュー</Badge>}
              <span className="text-[10px] text-muted-foreground font-mono">{allergen.id}</span>
            </div>
            {allergen.legalRef && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{allergen.legalRef}</p>
            )}
            {allergen.aliases.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <Tag className="size-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground mr-1">代替表記:</span>
                {allergen.aliases.map((al) => (
                  <span key={al} className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                    {al}
                  </span>
                ))}
              </div>
            )}
            {allergen.notes && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-warning/10 border border-warning/30 rounded-md p-2">
                <AlertTriangle className="size-3 inline mr-1 text-warning" />
                {allergen.notes}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Button size="icon" variant="ghost" className="size-8" onClick={onEdit} aria-label="編集">
              <Pencil className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              disabled={allergen.level === "specified"}
              aria-label="削除"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AllergenEditDialog({
  allergen,
  isNew,
  onSave,
  onClose,
}: {
  allergen: Allergen;
  isNew: boolean;
  onSave: (a: Allergen) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = React.useState<Allergen>(allergen);
  const [aliasInput, setAliasInput] = React.useState("");

  const addAlias = () => {
    const v = aliasInput.trim();
    if (!v) return;
    if (local.aliases.includes(v)) {
      toast.info("既に登録されています");
      return;
    }
    setLocal({ ...local, aliases: [...local.aliases, v] });
    setAliasInput("");
  };

  const removeAlias = (v: string) => setLocal({ ...local, aliases: local.aliases.filter((a) => a !== v) });

  const handleSave = () => {
    if (!local.name.trim() || !local.short.trim()) {
      toast.error("名称と略称は必須です");
      return;
    }
    onSave(local);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isNew ? <Plus className="size-4" /> : <Pencil className="size-4" />}
            {isNew ? "アレルゲン新規追加" : `「${allergen.name}」を編集`}
          </DialogTitle>
          <DialogDescription>
            食品表示法に準拠した表示名と、原材料表からの自動判定に使う代替表記を設定します。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>表示名 <span className="text-destructive">*</span></Label>
              <Input value={local.name} onChange={(e) => setLocal({ ...local, name: e.target.value })} placeholder="例: 卵" />
            </div>
            <div className="space-y-1.5">
              <Label>略称（バッジ用） <span className="text-destructive">*</span></Label>
              <Input value={local.short} onChange={(e) => setLocal({ ...local, short: e.target.value.slice(0, 2) })} className="font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>区分</Label>
              <Select value={local.level} onValueChange={(v) => setLocal({ ...local, level: v as Allergen["level"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="specified">特定原材料（表示義務）</SelectItem>
                  <SelectItem value="recommended">準ずるもの（推奨）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>法令根拠</Label>
              <Input value={local.legalRef || ""} onChange={(e) => setLocal({ ...local, legalRef: e.target.value })} placeholder="食品表示法 別表第十四" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>代替表記 ({local.aliases.length}件)</Label>
            <div className="flex gap-2">
              <Input
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAlias();
                  }
                }}
                placeholder="例: 玉子、鶏卵、エッグ"
              />
              <Button type="button" size="default" variant="outline" onClick={addAlias}>
                <Plus className="size-4" />追加
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              これらの語が原材料テキストに含まれると、このアレルゲンが自動検出されます。
            </p>
            {local.aliases.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-2 rounded-md border bg-muted/40 p-2.5">
                {local.aliases.map((al) => (
                  <Badge key={al} variant="secondary" className="gap-1 pr-1">
                    {al}
                    <button type="button" onClick={() => removeAlias(al)} className="hover:bg-black/15 rounded-full size-3.5 inline-flex items-center justify-center">
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic mt-1">代替表記が登録されていません</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>注意事項</Label>
            <Textarea
              value={local.notes || ""}
              onChange={(e) => setLocal({ ...local, notes: e.target.value })}
              placeholder="運用上の注意・コンタミネーション対策など"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>テキスト色</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={local.color}
                  onChange={(e) => setLocal({ ...local, color: e.target.value })}
                  className="h-9 w-12 rounded border cursor-pointer"
                />
                <Input value={local.color} onChange={(e) => setLocal({ ...local, color: e.target.value })} className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>背景色</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={local.bgColor}
                  onChange={(e) => setLocal({ ...local, bgColor: e.target.value })}
                  className="h-9 w-12 rounded border cursor-pointer"
                />
                <Input value={local.bgColor} onChange={(e) => setLocal({ ...local, bgColor: e.target.value })} className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>プレビュー</Label>
              <div className="flex items-center h-9 rounded-md border bg-card px-3">
                <span
                  className="inline-flex items-center justify-center rounded-full size-6 text-xs font-bold"
                  style={{ backgroundColor: local.bgColor, color: local.color }}
                >
                  {local.short || "?"}
                </span>
                <span className="ml-2 text-sm font-medium">{local.name || "（未設定）"}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave}>
            <Save className="size-4" />保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TextDetectionDialog() {
  const { allergens } = useStore();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const detected = React.useMemo(() => detectAllergensFromText(text, allergens), [text, allergens]);

  const samples = [
    "牛乳、生クリーム、鶏卵、小麦粉、バター、グラニュー糖",
    "豚もも肉、玉ねぎ、にんじん、醤油、みりん、ごま油",
    "中華麺（小麦・かんすい）、チャーシュー（豚肉・大豆）、煮卵、ねぎ",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Sparkles className="size-4" />原材料テキスト判定
      </Button>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            原材料テキストからアレルゲンを自動判定
          </DialogTitle>
          <DialogDescription>
            メーカーや仕入先の原材料表記をペーストすると、登録された代替表記からアレルゲンを抽出します。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例: 牛乳、生クリーム、グラニュー糖、鶏卵、小麦粉、バター、バニラエッセンス"
            rows={5}
          />
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">サンプル:</p>
            <div className="flex flex-wrap gap-1.5">
              {samples.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setText(s)}
                  className="text-[11px] rounded-md border bg-card px-2 py-1 hover:bg-muted/50 max-w-full truncate"
                  title={s}
                >
                  サンプル{i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">検出結果</span>
              <Badge variant={detected.length > 0 ? "default" : "outline"} className="text-[10px]">
                {detected.length}件
              </Badge>
            </div>
            {detected.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">テキストを入力すると判定結果が表示されます</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {detected.map((id) => {
                  const a = allergens.find((x) => x.id === id);
                  if (!a) return null;
                  return (
                    <div
                      key={id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        a.level === "specified" ? "ring-2" : ""
                      )}
                      style={{ backgroundColor: a.bgColor, color: a.color }}
                    >
                      <AllergenBadge id={id} size="xs" />
                      {a.name}
                      {a.level === "specified" && (
                        <span className="text-[9px] font-bold opacity-70">必</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
