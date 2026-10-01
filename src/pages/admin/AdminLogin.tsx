import { useEffect, useState, type FormEvent } from "react";
import { Brand } from "../../components/Brand";
import { checkIsAdmin, useAdminSession } from "../../lib/auth";
import { navigate } from "../../lib/router";
import { supabase } from "../../lib/supabase";
import { inputCls, labelCls } from "./ui";

export function AdminLogin() {
  const auth = useAdminSession();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Admin Login | Metroplex";
    if (auth.status === "admin") navigate("/admin", { replace: true });
  }, [auth.status]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const d = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(d.get("email")),
      password: String(d.get("password")),
    });
    if (signInError) {
      setError("Invalid email or password.");
    } else if (!(await checkIsAdmin())) {
      await supabase.auth.signOut();
      setError("This account is not authorized to access the admin panel.");
    } else {
      navigate("/admin", { replace: true });
      return;
    }
    setBusy(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Brand href="/" /></div>
        <div className="rounded border border-[#e4e2dc] border-t-4 border-t-orange bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage the project gallery.</p>
          {!supabase ? (
            <p className="mt-6 rounded bg-amber/10 p-4 text-sm font-semibold text-charcoal">
              Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
            </p>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
              <label className={labelCls}>Email
                <input className={inputCls} name="email" type="email" autoComplete="username" required />
              </label>
              <label className={labelCls}>Password
                <input className={inputCls} name="password" type="password" autoComplete="current-password" required />
              </label>
              {error && <p className="text-sm font-semibold text-red-700" role="alert">{error}</p>}
              <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
                {busy ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-sm"><a className="font-semibold text-slate-500 hover:text-orange" href="/">&larr; Back to website</a></p>
      </div>
    </main>
  );
}
