import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCompass,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";
import siteImage from "../assets/image.png";
import logoHorizontal from "../assets/brand/logo-horizontal.svg";
import logoHorizontalOnDark from "../assets/brand/logo-horizontal-on-dark.svg";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@erp.com" },
  { role: "HR", email: "hr@erp.com" },
  { role: "Accountant", email: "accountant@erp.com" },
  { role: "Purchase", email: "purchase@erp.com" },
  { role: "Store", email: "store@erp.com" },
  { role: "Supervisor", email: "supervisor@erp.com" },
];

const redirectFor = (role) => {
  if (role === "hr") return "/hr";
  if (role === "accountant") return "/accountant";
  if (role === "purchase_manager") return "/purchase-manager";
  if (role === "store_manager") return "/store-manager";
  if (role === "site_supervisor") return "/site-supervisor";
  if (role === "employee") return "/employee/leaves";
  return "/";
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(redirectFor(user.role));
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      {/* ---------- Left: full-bleed site visual ---------- */}
      <aside className="relative h-[34vh] min-h-[220px] w-full overflow-hidden lg:h-auto lg:min-h-screen lg:w-[56%]">
        <img
          src={siteImage}
          alt="Site engineer reviewing plans on a live construction site"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#102A36]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102A36]/70 via-transparent to-[#102A36]/20 lg:bg-gradient-to-r lg:from-[#102A36]/35 lg:via-transparent lg:to-canvas/90" />

        <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
          <img
            src={logoHorizontalOnDark}
            alt="Build Flow"
            className="h-8 w-auto max-w-[11rem] object-contain object-left sm:h-9 sm:max-w-[13rem]"
          />
        </div>

        <div className="absolute inset-x-5 bottom-5 z-10 max-w-md text-white sm:inset-x-8 sm:bottom-8 lg:bottom-12">
          <p className="font-display text-xl font-extrabold leading-snug tracking-tight sm:text-2xl lg:text-[1.75rem]">
            Plans, workforce & progress — one site workspace.
          </p>
          <p className="mt-2 max-w-sm text-sm text-white/80">
            Built for project teams running the job from yard to handover.
          </p>
        </div>
      </aside>

      {/* ---------- Right: sign-in column ---------- */}
      <main className="relative flex w-full flex-1 items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:w-[44%] lg:px-12 lg:py-12 xl:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(42,123,155,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(42,123,155,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 85% 70% at 50% 45%, black 25%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 70% at 50% 45%, black 25%, transparent 72%)",
          }}
        />

        <div className="relative w-full max-w-[400px]">
          <div className="mb-7 flex items-start justify-between gap-3 lg:mb-8">
            <div className="min-w-0">
              <img
                src={logoHorizontal}
                alt="Build Flow"
                className="mb-5 h-8 w-auto max-w-[12rem] object-contain object-left"
              />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brand-500">
                Welcome back
              </p>
              <h1 className="mt-1.5 font-display text-[1.55rem] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[1.7rem]">
                Sign in to Build Flow
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Use your work email to open projects, materials, and billing.
              </p>
            </div>
            <span className="mt-1 hidden shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[0.65rem] font-bold text-ink-500 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
              Live
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-[rgba(224,82,82,0.25)] bg-[rgba(224,82,82,0.08)] px-3.5 py-3 text-sm font-medium text-[#c23b3b]"
            >
              <FiShield size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="surface-card space-y-4 p-5 sm:p-6"
          >
            <div>
              <label className="field-label" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <span className="field-icon">
                  <FiMail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input input-with-icon"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="field-icon">
                  <FiLock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="input input-with-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full !py-3 text-[0.9rem]"
            >
              {loading ? "Signing in…" : "Sign in to Build Flow"}
              {!loading && <FiArrowRight size={16} />}
            </button>

            <p className="text-center text-[0.72rem] font-medium text-ink-400">
              Protected by role-based access
            </p>
          </form>

          <div className="mt-5">
            <p className="mb-2.5 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-400">
              <FiCompass size={12} />
              Demo accounts · password{" "}
              <span className="normal-case tracking-normal text-ink-700">
                password123
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword("password123");
                  }}
                  className="flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2.5 text-left text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  {acc.role}
                  <FiArrowRight size={12} className="text-ink-400" />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-ink-400">
            © {new Date().getFullYear()} Build Flow
          </p>
        </div>
      </main>
    </div>
  );
}
