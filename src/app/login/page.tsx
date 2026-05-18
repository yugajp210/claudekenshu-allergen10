"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Salad, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, ready } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    // realistic delay to feel like a network call
    setTimeout(() => {
      const result = signIn(email, password);
      setSubmitting(false);
      if (result.ok) {
        toast.success("ログインしました");
        router.replace("/");
      } else {
        setError(result.reason);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
        <Link href="/" className="inline-flex items-center gap-2 self-start mb-12">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Salad className="size-5" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="text-base font-black tracking-tight">AllerCheck</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">allergen mgmt</div>
          </div>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">ログイン</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              AllerCheck 管理画面にアクセスするには、メールアドレスとパスワードを入力してください。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team@example.com"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <button type="button" className="text-xs text-primary hover:underline">パスワードを忘れた</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              <span className="text-sm">ログイン状態を保持する</span>
            </label>

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" size="lg" className="w-full h-11 font-bold" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="inline-block size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  認証中...
                </>
              ) : (
                <>
                  ログイン
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>
              アカウントをお持ちでない方は{" "}
              <button type="button" className="text-primary font-semibold hover:underline">お問い合わせ</button>
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px]">
              <ExternalLink className="size-3" />
              <Link href="/m" className="hover:underline">顧客向け公開メニューを見る</Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[10px] text-center text-muted-foreground">
          © {new Date().getFullYear()} AllerCheck · 食品表示法準拠
        </p>
      </div>

      {/* Right: photo panel */}
      <div className="hidden lg:block relative isolate overflow-hidden">
        <Image
          src="/menus/login.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        {/* deep gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* top-right badge */}
        <div className="absolute top-10 right-10 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-[11px] font-bold text-white tracking-wide">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          食品表示法 準拠
        </div>

        {/* bottom copy */}
        <div className="absolute inset-x-12 bottom-12 text-white max-w-md">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase opacity-80 mb-4">
            FOR F&amp;B OPERATORS
          </p>
          <h2 className="text-3xl xl:text-4xl font-black leading-[1.2] tracking-tight drop-shadow">
            アレルゲン表示を、<br />
            一元化する。
          </h2>
          <p className="mt-4 text-sm leading-relaxed opacity-90 drop-shadow">
            特定原材料 28 品目の登録・点検・レポート・公開まで、すべてを一つの管理画面で。
          </p>

          <ul className="mt-6 space-y-2.5 text-sm">
            {[
              "原材料から自動でアレルゲンを判定",
              "表示漏れを一括チェック・修正",
              "顧客向け公開ページもワンクリックで",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="shrink-0 mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-white/15 backdrop-blur ring-1 ring-white/30">
                  <ShieldCheck className="size-3" />
                </span>
                <span className="drop-shadow">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["#10b981", "#f59e0b", "#3b82f6"].map((c, i) => (
                <span key={i} className="size-7 rounded-full ring-2 ring-stone-900" style={{ background: c }} />
              ))}
            </div>
            <p className="text-[11px] text-white/80 leading-tight">
              <span className="font-bold text-white">200+</span> の飲食店で<br />
              ご利用いただいています
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
