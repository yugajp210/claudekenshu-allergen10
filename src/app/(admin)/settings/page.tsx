"use client";

import * as React from "react";
import {
  Store,
  User,
  Palette,
  ShieldCheck,
  Bell,
  Users,
  Database,
  Save,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Download,
  Upload,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  ChevronRight,
  Building2,
  Coffee,
  Cake,
  Beer,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore, type Settings as SettingsType, type TeamMember } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "store", label: "店舗情報", icon: Store, description: "店舗の基本情報" },
  { id: "profile", label: "プロフィール", icon: User, description: "あなたの情報" },
  { id: "display", label: "表示設定", icon: Palette, description: "テーマと表示" },
  { id: "check", label: "アレルゲン点検", icon: ShieldCheck, description: "点検のデフォルト" },
  { id: "notifications", label: "通知", icon: Bell, description: "メール・プッシュ" },
  { id: "team", label: "メンバー管理", icon: Users, description: "スタッフと権限" },
  { id: "data", label: "データ管理", icon: Database, description: "エクスポート・取込" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function SettingsPage() {
  const [section, setSection] = React.useState<SectionId>("store");

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">設定</h2>
        <p className="text-sm text-muted-foreground">店舗・プロフィール・通知・点検ポリシーを管理します。</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="lg:sticky lg:top-[72px] lg:self-start">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = section === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={cn(
                      "w-full text-left flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate font-normal">{s.description}</div>
                    </div>
                    {active && <ChevronRight className="size-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        <div>
          {section === "store" && <StoreSection />}
          {section === "profile" && <ProfileSection />}
          {section === "display" && <DisplaySection />}
          {section === "check" && <CheckSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "team" && <TeamSection />}
          {section === "data" && <DataSection />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 店舗情報
// ============================================================================

function StoreSection() {
  const { settings, updateStore } = useStore();
  const [local, setLocal] = React.useState(settings.store);
  const dirty = JSON.stringify(local) !== JSON.stringify(settings.store);

  const save = () => {
    updateStore(local);
    toast.success("店舗情報を保存しました");
  };
  const reset = () => setLocal(settings.store);

  const CATEGORIES = [
    { value: "restaurant", label: "レストラン", icon: Building2 },
    { value: "cafe", label: "カフェ", icon: Coffee },
    { value: "deli", label: "デリ・惣菜", icon: Store },
    { value: "bakery", label: "ベーカリー", icon: Cake },
    { value: "izakaya", label: "居酒屋", icon: Beer },
  ] as const;

  return (
    <SectionWrapper
      title="店舗情報"
      description="お客様への表示や請求書に使用される基本情報です。"
      onSave={save}
      onReset={reset}
      dirty={dirty}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow>
            <FieldGroup label="店舗名" required>
              <Input value={local.storeName} onChange={(e) => setLocal({ ...local, storeName: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="店舗コード" hint="変更不可">
              <Input value={local.storeCode} disabled />
            </FieldGroup>
          </FieldRow>

          <div className="space-y-1.5">
            <Label>業態</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = local.category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setLocal({ ...local, category: c.value })}
                    className={cn(
                      "rounded-md border-2 p-3 flex flex-col items-center gap-1.5 transition-colors",
                      active ? "border-primary bg-accent" : "border-border hover:bg-muted/40"
                    )}
                  >
                    <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">所在地・連絡先</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow>
            <FieldGroup label="郵便番号" className="sm:max-w-[180px]">
              <Input value={local.postalCode} onChange={(e) => setLocal({ ...local, postalCode: e.target.value })} placeholder="160-0023" />
            </FieldGroup>
            <FieldGroup label="住所" icon={<MapPin className="size-3.5" />}>
              <Input value={local.address} onChange={(e) => setLocal({ ...local, address: e.target.value })} />
            </FieldGroup>
          </FieldRow>
          <FieldRow>
            <FieldGroup label="電話番号" icon={<Phone className="size-3.5" />}>
              <Input value={local.phone} onChange={(e) => setLocal({ ...local, phone: e.target.value })} placeholder="03-0000-0000" />
            </FieldGroup>
            <FieldGroup label="メールアドレス" icon={<Mail className="size-3.5" />}>
              <Input type="email" value={local.email} onChange={(e) => setLocal({ ...local, email: e.target.value })} />
            </FieldGroup>
          </FieldRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">営業情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow>
            <FieldGroup label="営業時間">
              <Input value={local.businessHours} onChange={(e) => setLocal({ ...local, businessHours: e.target.value })} placeholder="11:00 〜 23:00" />
            </FieldGroup>
            <FieldGroup label="定休日">
              <Input value={local.closedDays} onChange={(e) => setLocal({ ...local, closedDays: e.target.value })} placeholder="毎週水曜日" />
            </FieldGroup>
          </FieldRow>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}

// ============================================================================
// プロフィール
// ============================================================================

function ProfileSection() {
  const { settings, updateProfile } = useStore();
  const [local, setLocal] = React.useState(settings.profile);
  const dirty = JSON.stringify(local) !== JSON.stringify(settings.profile);

  const save = () => {
    updateProfile(local);
    toast.success("プロフィールを更新しました");
  };
  const reset = () => setLocal(settings.profile);

  return (
    <SectionWrapper title="プロフィール" description="メニュー登録時の更新者として記録されます。" onSave={save} onReset={reset} dirty={dirty}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 sm:gap-6 flex-wrap">
            <div className="relative">
              <Avatar className="size-20 bg-gradient-to-br from-emerald-400 to-emerald-700 text-white">
                <AvatarFallback className="bg-transparent text-white text-xl font-bold">{local.initials}</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" className="absolute -bottom-1 -right-1 size-7 p-0 rounded-full" aria-label="変更">
                <Upload className="size-3" />
              </Button>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-lg font-bold">{local.name}</div>
              <div className="text-sm text-muted-foreground">{local.role}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="success" className="gap-1"><CheckCircle2 className="size-3" />メール認証済み</Badge>
                <Badge variant="outline">2段階認証 OFF</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow>
            <FieldGroup label="氏名" required>
              <Input value={local.name} onChange={(e) => setLocal({ ...local, name: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="イニシャル" hint="2文字推奨">
              <Input value={local.initials} onChange={(e) => setLocal({ ...local, initials: e.target.value.slice(0, 3).toUpperCase() })} className="font-mono" />
            </FieldGroup>
          </FieldRow>
          <FieldRow>
            <FieldGroup label="役職">
              <Select value={local.role} onValueChange={(v) => setLocal({ ...local, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="店舗管理者">店舗管理者</SelectItem>
                  <SelectItem value="副店長">副店長</SelectItem>
                  <SelectItem value="シェフ">シェフ</SelectItem>
                  <SelectItem value="スタッフ">スタッフ</SelectItem>
                  <SelectItem value="エリアマネージャー">エリアマネージャー</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="電話番号">
              <Input value={local.phone} onChange={(e) => setLocal({ ...local, phone: e.target.value })} />
            </FieldGroup>
          </FieldRow>
          <FieldGroup label="メールアドレス" icon={<Mail className="size-3.5" />}>
            <Input type="email" value={local.email} onChange={(e) => setLocal({ ...local, email: e.target.value })} />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">セキュリティ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow
            title="パスワード"
            description="最終更新: 2026-03-12"
            action={<Button size="sm" variant="outline">変更</Button>}
          />
          <Separator />
          <SettingRow
            title="2段階認証"
            description="認証アプリで保護を強化"
            action={<Button size="sm" variant="outline">設定する</Button>}
          />
          <Separator />
          <SettingRow
            title="ログイン履歴"
            description="直近30日間のログインを確認"
            action={<Button size="sm" variant="ghost">表示 <ChevronRight className="size-3.5" /></Button>}
          />
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}

// ============================================================================
// 表示設定
// ============================================================================

function DisplaySection() {
  const { settings, updateDisplay } = useStore();
  const [local, setLocal] = React.useState(settings.display);
  const dirty = JSON.stringify(local) !== JSON.stringify(settings.display);

  const save = () => {
    updateDisplay(local);
    toast.success("表示設定を保存しました");
  };
  const reset = () => setLocal(settings.display);

  return (
    <SectionWrapper title="表示設定" description="アプリの外観と表示項目を調整します。" onSave={save} onReset={reset} dirty={dirty}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">テーマ</CardTitle>
          <CardDescription>明暗のモードを選択します</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={local.theme}
            onValueChange={(v) => setLocal({ ...local, theme: v as SettingsType["display"]["theme"] })}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { value: "light", label: "ライト", icon: Sun, preview: "bg-white" },
              { value: "dark", label: "ダーク", icon: Moon, preview: "bg-zinc-900" },
              { value: "system", label: "システム", icon: Monitor, preview: "bg-gradient-to-r from-white to-zinc-900" },
            ].map((t) => {
              const Icon = t.icon;
              const active = local.theme === t.value;
              return (
                <label
                  key={t.value}
                  className={cn(
                    "rounded-md border-2 p-3 cursor-pointer transition-colors flex flex-col items-center gap-2",
                    active ? "border-primary bg-accent" : "border-border hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem value={t.value} className="sr-only" />
                  <div className={cn("w-full h-12 rounded border", t.preview)} />
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">アレルゲン表示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow
            title="特定原材料に準ずる20品目を表示"
            description="メニュー詳細・チェックリストに推奨表示を含める"
            action={<Switch checked={local.showRecommendedAllergens} onCheckedChange={(v) => setLocal({ ...local, showRecommendedAllergens: v })} />}
          />
          <Separator />
          <SettingRow
            title="アレルゲン不使用バッジを表示"
            description="該当メニューに「不使用」バッジを付与"
            action={<Switch checked={local.showAllergenFreeBadge} onCheckedChange={(v) => setLocal({ ...local, showAllergenFreeBadge: v })} />}
          />
          <Separator />
          <SettingRow
            title="コンパクト表示"
            description="リスト密度を上げて一度に多く表示"
            action={<Switch checked={local.compactMode} onCheckedChange={(v) => setLocal({ ...local, compactMode: v })} />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">バッジ形状</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={local.iconStyle}
            onValueChange={(v) => setLocal({ ...local, iconStyle: v as SettingsType["display"]["iconStyle"] })}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: "circle", label: "円形", className: "rounded-full" },
              { value: "square", label: "角丸", className: "rounded-md" },
            ].map((s) => {
              const active = local.iconStyle === s.value;
              return (
                <label
                  key={s.value}
                  className={cn(
                    "rounded-md border-2 p-3 cursor-pointer transition-colors flex items-center gap-3",
                    active ? "border-primary bg-accent" : "border-border hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem value={s.value} className="sr-only" />
                  <div className="flex gap-1.5">
                    {["卵", "乳", "麦", "蝦"].map((t, i) => (
                      <span
                        key={i}
                        className={cn(
                          "inline-flex items-center justify-center size-7 text-[11px] font-bold",
                          s.className
                        )}
                        style={{
                          backgroundColor: ["#fef3c7", "#dbeafe", "#fef3c7", "#fee2e2"][i],
                          color: ["#a16207", "#1e40af", "#a16207", "#b91c1c"][i],
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium">{s.label}</span>
                </label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}

// ============================================================================
// アレルゲン点検
// ============================================================================

function CheckSection() {
  const { settings, updateCheck } = useStore();
  const [local, setLocal] = React.useState(settings.check);
  const dirty = JSON.stringify(local) !== JSON.stringify(settings.check);

  const save = () => {
    updateCheck(local);
    toast.success("点検設定を保存しました");
  };
  const reset = () => setLocal(settings.check);

  return (
    <SectionWrapper title="アレルゲン点検" description="点検画面のデフォルト動作と運用ポリシー" onSave={save} onReset={reset} dirty={dirty}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">点検対象</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup
            value={local.defaultLevel}
            onValueChange={(v) => setLocal({ ...local, defaultLevel: v as SettingsType["check"]["defaultLevel"] })}
            className="space-y-2"
          >
            {[
              { value: "specified", label: "特定原材料 8品目のみ", description: "食品表示法で表示義務のある8品目を対象" },
              { value: "all", label: "全 28品目", description: "推奨表示の20品目を含めて厳密に点検" },
            ].map((opt) => {
              const active = local.defaultLevel === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-start gap-3 rounded-md border-2 p-3 cursor-pointer transition-colors",
                    active ? "border-primary bg-accent" : "border-border hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem value={opt.value} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.description}</div>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">運用ポリシー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow
            title="厳密モード"
            description="原材料との不整合がある場合、公開を一時停止"
            action={<Switch checked={local.strictMode} onCheckedChange={(v) => setLocal({ ...local, strictMode: v })} />}
          />
          <Separator />
          <SettingRow
            title="管理者承認を必須にする"
            description="新規メニューと変更は承認後に公開"
            action={<Switch checked={local.requireApproval} onCheckedChange={(v) => setLocal({ ...local, requireApproval: v })} />}
          />
          <Separator />
          <SettingRow
            title="保存時に自動で表示漏れを修正"
            description="原材料から検出されたアレルゲンを表示へ自動追加"
            action={<Switch checked={local.autoApplyOnSave} onCheckedChange={(v) => setLocal({ ...local, autoApplyOnSave: v })} />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">再点検リマインダー</CardTitle>
          <CardDescription>最終更新から指定日数経過すると再点検を促します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={365}
              value={local.remindDays}
              onChange={(e) => setLocal({ ...local, remindDays: Math.max(1, Math.min(365, parseInt(e.target.value || "1", 10))) })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">日経過後にリマインド</span>
          </div>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}

// ============================================================================
// 通知
// ============================================================================

function NotificationsSection() {
  const { settings, updateNotifications } = useStore();
  const [local, setLocal] = React.useState(settings.notifications);
  const dirty = JSON.stringify(local) !== JSON.stringify(settings.notifications);

  const save = () => {
    updateNotifications(local);
    toast.success("通知設定を保存しました");
  };
  const reset = () => setLocal(settings.notifications);

  return (
    <SectionWrapper title="通知" description="重要なイベントの通知方法を選択します。" onSave={save} onReset={reset} dirty={dirty}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="size-4 text-primary" />メール通知
          </CardTitle>
          <CardDescription>{settings.profile.email} に届きます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow
            title="表示漏れの検出時"
            description="自動スキャンで表示漏れが見つかった時"
            action={<Switch checked={local.emailMissing} onCheckedChange={(v) => setLocal({ ...local, emailMissing: v })} />}
          />
          <Separator />
          <SettingRow
            title="承認依頼"
            description="他のスタッフから承認依頼があった時"
            action={<Switch checked={local.emailReviewRequest} onCheckedChange={(v) => setLocal({ ...local, emailReviewRequest: v })} />}
          />
          <Separator />
          <SettingRow
            title="週次サマリー"
            description="毎週月曜日に先週の状況を配信"
            action={<Switch checked={local.weeklyDigest} onCheckedChange={(v) => setLocal({ ...local, weeklyDigest: v })} />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-4 text-primary" />プッシュ通知
          </CardTitle>
          <CardDescription>ブラウザ・モバイルアプリでお知らせ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow
            title="表示漏れの即時通知"
            description="メニュー保存直後に検知"
            action={<Switch checked={local.pushMissing} onCheckedChange={(v) => setLocal({ ...local, pushMissing: v })} />}
          />
          <Separator />
          <SettingRow
            title="日次レポート"
            description="毎日 9:00 に当日の状況"
            action={<Switch checked={local.pushDailyReport} onCheckedChange={(v) => setLocal({ ...local, pushDailyReport: v })} />}
          />
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}

// ============================================================================
// メンバー管理
// ============================================================================

const ROLE_LABELS: Record<TeamMember["role"], { label: string; description: string; color: "default" | "secondary" | "outline" | "warning" }> = {
  owner: { label: "オーナー", description: "全権限", color: "default" },
  manager: { label: "管理者", description: "メニュー・点検・メンバー管理", color: "warning" },
  staff: { label: "スタッフ", description: "メニュー編集・点検", color: "secondary" },
  viewer: { label: "閲覧のみ", description: "閲覧のみ可能", color: "outline" },
};

function TeamSection() {
  const { settings, addTeamMember, removeTeamMember, updateTeamRole } = useStore();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState<TeamMember["role"]>("staff");

  const handleInvite = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("氏名とメールアドレスを入力してください");
      return;
    }
    addTeamMember({ name: newName.trim(), email: newEmail.trim(), role: newRole });
    toast.success(`${newName} を招待しました`);
    setNewName("");
    setNewEmail("");
    setNewRole("staff");
    setInviteOpen(false);
  };

  const handleRemove = (m: TeamMember) => {
    if (m.role === "owner") {
      toast.error("オーナーは削除できません");
      return;
    }
    if (confirm(`${m.name} さんを削除しますか?`)) {
      removeTeamMember(m.id);
      toast.success("メンバーを削除しました");
    }
  };

  return (
    <SectionWrapper title="メンバー管理" description={`${settings.team.length}名のメンバーがこの店舗にアクセスできます。`}>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base">メンバー一覧</CardTitle>
            <CardDescription>権限はオーナーのみ変更可能です</CardDescription>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="size-4" />招待</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>メンバーを招待</DialogTitle>
                <DialogDescription>登録メールアドレスに招待リンクを送信します。</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <FieldGroup label="氏名" required>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例: 田中 太郎" />
                </FieldGroup>
                <FieldGroup label="メールアドレス" required>
                  <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="example@allercheck.jp" />
                </FieldGroup>
                <FieldGroup label="権限">
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as TeamMember["role"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["manager", "staff", "viewer"] as const).map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r].label} — {ROLE_LABELS[r].description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>キャンセル</Button>
                <Button onClick={handleInvite}>招待を送る</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>メンバー</TableHead>
                <TableHead className="hidden md:table-cell">参加日</TableHead>
                <TableHead className="hidden sm:table-cell">最終アクセス</TableHead>
                <TableHead>権限</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.team.map((m) => {
                const initials = m.name.split(" ").map((s) => s[0]).join("").slice(0, 2);
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 bg-gradient-to-br from-emerald-400 to-emerald-600">
                          <AvatarFallback className="bg-transparent text-white text-xs font-bold">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{m.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{m.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground tabular-nums">{m.joinedAt}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground tabular-nums">{m.lastActive}</TableCell>
                    <TableCell>
                      {m.role === "owner" ? (
                        <Badge variant="default">オーナー</Badge>
                      ) : (
                        <Select value={m.role} onValueChange={(v) => updateTeamRole(m.id, v as TeamMember["role"])}>
                          <SelectTrigger size="sm" className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(["manager", "staff", "viewer"] as const).map((r) => (
                              <SelectItem key={r} value={r}>{ROLE_LABELS[r].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        disabled={m.role === "owner"}
                        onClick={() => handleRemove(m)}
                        aria-label="削除"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">権限ロール</CardTitle>
          <CardDescription>各ロールの権限内容</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(["owner", "manager", "staff", "viewer"] as const).map((r) => {
              const role = ROLE_LABELS[r];
              return (
                <li key={r} className="rounded-md border p-3 bg-card">
                  <Badge variant={role.color}>{role.label}</Badge>
                  <p className="mt-1.5 text-xs text-muted-foreground">{role.description}</p>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}

// ============================================================================
// データ管理
// ============================================================================

function DataSection() {
  const { menus, settings } = useStore();

  const handleExport = (type: "csv" | "json") => {
    if (type === "csv") {
      const headers = ["コード", "メニュー名", "カテゴリ", "価格", "状態", "原材料", "表示アレルゲン"];
      const rows = menus.map((m) => [m.code, m.name, m.category, m.price.toString(), m.status, m.ingredients.join(";"), m.declaredAllergens.join(";")]);
      const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
      downloadFile(`menus-${Date.now()}.csv`, "﻿" + csv, "text/csv;charset=utf-8");
    } else {
      downloadFile(`allercheck-backup-${Date.now()}.json`, JSON.stringify({ menus, settings }, null, 2), "application/json");
    }
    toast.success(type.toUpperCase() + " をエクスポートしました");
  };

  const handleImport = () => {
    toast.info("インポート機能は近日対応予定です");
  };

  return (
    <SectionWrapper title="データ管理" description="バックアップ・データ移行・初期化を行えます。">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">エクスポート</CardTitle>
          <CardDescription>登録メニューと設定を外部ファイルに出力</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard
            icon={<Download className="size-4" />}
            title="CSV (メニュー一覧)"
            description="表計算ソフトで開ける形式"
            buttonLabel="ダウンロード"
            onClick={() => handleExport("csv")}
          />
          <ActionCard
            icon={<Download className="size-4" />}
            title="JSON (完全バックアップ)"
            description="メニュー + 設定をすべて含む"
            buttonLabel="ダウンロード"
            onClick={() => handleExport("json")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">インポート</CardTitle>
          <CardDescription>過去のバックアップから復元</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <Upload className="size-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">CSV または JSON ファイルをドラッグ&ドロップ</p>
            <p className="text-xs text-muted-foreground mt-1">または下のボタンから選択</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleImport}>
              ファイルを選択
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">危険な操作</CardTitle>
          <CardDescription>取り消しできない操作です</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow
            title="すべてのメニューを削除"
            description="登録された全メニューと履歴を削除"
            action={<Button size="sm" variant="outline" className="text-destructive border-destructive/40">削除...</Button>}
          />
          <Separator />
          <SettingRow
            title="店舗を解約"
            description="アカウントを完全に削除します"
            action={<Button size="sm" variant="destructive">解約手続き</Button>}
          />
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}

// ============================================================================
// 共通レイアウト部品
// ============================================================================

function SectionWrapper({
  title,
  description,
  children,
  onSave,
  onReset,
  dirty,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  dirty?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {onSave && (
          <div className="flex gap-2 items-center">
            {dirty && (
              <Badge variant="warning" className="gap-1">
                <span className="size-1.5 rounded-full bg-current animate-pulse" />未保存
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onReset} disabled={!dirty}>
              <RotateCcw className="size-3.5" />リセット
            </Button>
            <Button size="sm" onClick={onSave} disabled={!dirty}>
              <Save className="size-3.5" />保存
            </Button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function FieldGroup({
  label,
  required,
  hint,
  icon,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold">
        {icon}
        {label}
        {required && <span className="text-destructive">*</span>}
        {hint && <span className="text-muted-foreground font-normal ml-1">({hint})</span>}
      </Label>
      {children}
    </div>
  );
}

function SettingRow({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
      <div className="size-9 rounded-md bg-accent text-primary flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Button size="sm" variant="outline" className="mt-1 self-start" onClick={onClick}>
        {buttonLabel}
      </Button>
    </div>
  );
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
