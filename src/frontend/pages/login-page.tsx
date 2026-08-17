import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Eye, EyeOff, Loader2, Radio, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { appConfig } from "../lib/config";
import { sites } from "../lib/mock-data";
import { useAuth } from "../store/auth";
import { Field } from "../components/common/field";
import { StatusBadge } from "../components/common/status-badge";

export function LoginPage() {
  const { signIn, session, hydrated, timedOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("operator1");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [siteId, setSiteId] = useState(sites[0]!.id);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && session) navigate({ to: "/dashboard", replace: true });
  }, [hydrated, session, navigate]);

  const detectedRole =
    username.trim().toLowerCase().startsWith("admin")
      ? "admin"
      : username.trim().toLowerCase().startsWith("viewer")
        ? "viewer"
        : "operator";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!username.trim()) nextErrors.username = "Operator ID is required.";
    if (password.length < 4) nextErrors.password = "Password must be at least 4 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setBanner(null);
    const result = await signIn({ username, password, siteId, rememberDevice: remember });
    setLoading(false);
    if (!result.ok) {
      setBanner(result.error ?? "Login failed.");
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="hero-glow grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden flex-col justify-between border-r-2 border-border p-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center border-2 border-signal bg-signal text-signal-foreground">
            <Radio className="size-5" aria-hidden />
          </span>
          <div>
            <p className="slab text-lg leading-none">{appConfig.appName}</p>
            <p className="mono-caps text-muted-foreground">{appConfig.appTagline}</p>
          </div>
        </div>

        <div>
          <h1 className="text-5xl leading-[0.92] xl:text-6xl">
            Count every
            <br />
            <span className="gradient-signal-text">axle, lane</span>
            <br />
            and second.
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            YOLO detection, multi-object tracking and lane-level counting for toll plazas —
            streamed to one hardened control room dashboard.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { k: "Lanes online", v: "3/4" },
              { k: "Median latency", v: "62ms" },
              { k: "Tracker", v: "ByteTrack" },
            ].map((s) => (
              <div key={s.k} className="panel px-3 py-2">
                <p className="mono-caps text-muted-foreground">{s.k}</p>
                <p className="slab text-lg">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mono-caps text-muted-foreground">
          Document 1 of 3 — front end · component & field checklist complete
        </p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="panel-hard w-full max-w-md space-y-4 p-6" noValidate>
          <div>
            <p className="mono-caps text-signal">Secure access</p>
            <h2 className="mt-1 text-2xl">Operator sign in</h2>
          </div>

          {timedOut && (
            <div
              role="status"
              className="flex items-start gap-2 border-2 border-warning bg-warning/15 px-3 py-2 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 text-warning" aria-hidden />
              Session timed out after inactivity. Please sign in again.
            </div>
          )}

          {banner && (
            <div
              role="alert"
              className="flex items-start gap-2 border-2 border-destructive bg-destructive/15 px-3 py-2 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 text-destructive" aria-hidden />
              {banner}
            </div>
          )}

          <Field label="Username / operator ID" required error={errors.username}>
            {(p) => (
              <Input
                {...p}
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                className="border-2 bg-surface-2 font-mono"
                placeholder="operator1"
              />
            )}
          </Field>

          <Field label="Password" required error={errors.password} hint="Demo: any 4+ characters">
            {(p) => (
              <div className="flex gap-2">
                <Input
                  {...p}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 bg-surface-2 font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            )}
          </Field>

          <Field label="Site / toll plaza" hint="Multi-site deployments">
            {(p) => (
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger id={p.id} className="w-full border-2 bg-surface-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          <div className="flex items-center justify-between gap-3 border-2 border-border bg-surface-2 px-3 py-2">
            <p className="mono-caps text-muted-foreground">Detected role</p>
            <StatusBadge tone="info">
              <ShieldCheck className="size-3" aria-hidden /> {detectedRole}
            </StatusBadge>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(Boolean(v))}
            />
            <Label htmlFor="remember" className="text-sm">
              Remember this device
            </Label>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {loading ? "Authenticating…" : "Sign in"}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="mono-caps w-full text-signal underline">
                Forgot password?
              </button>
            </DialogTrigger>
            <DialogContent className="panel-hard">
              <DialogHeader>
                <DialogTitle>Password reset</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Enter your operator ID — the plaza administrator receives a reset request and a
                one-time link is emailed to your registered address.
              </p>
              <Input placeholder="operator ID" className="border-2 bg-surface-2 font-mono" />
              <Button>Send reset request</Button>
            </DialogContent>
          </Dialog>

          <p className="mono-caps text-center text-muted-foreground">
            Try admin · operator1 · viewer1
          </p>
        </form>
      </section>
    </div>
  );
}
