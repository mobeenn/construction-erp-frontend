import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiClipboard,
  FiCompass,
  FiLock,
  FiMail,
  FiShield,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import { BrandMark } from "../components/layout/AppSidebar";
import siteImage from "../assets/image.png";

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

const STATS = [
  { icon: FiClipboard, value: "240+", label: "Projects delivered" },
  { icon: FiUsers, value: "1,800+", label: "Site workforce" },
  { icon: FiAward, value: "98%", label: "On-time handover" },
];

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
    <div className="flex min-h-screen bg-canvas">
      {/* ---------- Left: form panel ---------- */}
      <div className="relative flex w-full items-center justify-center overflow-hidden p-6 sm:p-10 lg:w-[46%]">
        {/* faint blueprint grid behind the form */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(42,123,155,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(42,123,155,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)",
          }}
        />
        {/* mobile banner */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)] lg:hidden">
          <img
            src={siteImage}
            alt="Construction site with engineers reviewing blueprints"
            className="h-40 w-full object-cover sm:h-48"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102A36]/85 via-[#102A36]/25 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
              BuildFlow · Construction ERP
            </p>
            <span className="badge border-white/30 bg-white/15 text-white">
              Live sites
            </span>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="font-display text-lg font-extrabold text-ink-900">
                BuildFlow
              </p>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                <FiCompass size={12} />
                Construction ERP
              </p>
            </div>
            <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[0.7rem] font-bold text-ink-500 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint-500" />
              Site portal
            </span>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">
              Welcome back, builder
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900 sm:text-[1.7rem]">
              Sign in to your site workspace
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Projects, workforce, materials and billing — one login for the
              whole site team.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[rgba(224,82,82,0.25)] bg-[rgba(224,82,82,0.08)] px-3.5 py-3 text-sm font-medium text-[#c23b3b]">
              <FiShield size={16} />
              {error}
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
              {loading ? "Signing in…" : "Sign in to BuildFlow"}
              {!loading && <FiArrowRight size={16} />}
            </button>

            <div className="flex items-center gap-3 text-[0.72rem] font-medium text-ink-400">
              <span className="h-px flex-1 bg-line" />
              Protected by role-based access
              <span className="h-px flex-1 bg-line" />
            </div>
          </form>

          <div className="mt-4 rounded-2xl border border-line bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Demo accounts · password{" "}
              <span className="text-ink-700">password123</span>
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
                  className="flex items-center justify-between rounded-xl border border-line bg-canvas/60 px-3 py-2 text-left text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  {acc.role}
                  <FiArrowRight size={13} className="text-ink-400" />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-ink-400">
            © {new Date().getFullYear()} BuildFlow ERP · Plans, workforce &
            progress in one place
          </p>
        </div>
      </div>

      {/* ---------- Right: construction visual ---------- */}
      <div className="relative hidden w-[54%] overflow-hidden lg:block">
        <img
          src={siteImage}
          alt="Site engineer in hard hat reviewing floor plans with tower cranes and high-rise construction behind"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* brand-tinted legibility gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#102A36]/55 via-[#102A36]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102A36]/80 via-transparent to-[#102A36]/30" />
        {/* blueprint grid overlay */}
        <div
          className="absolute inset-0 opacity-25"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(200deg, black 20%, transparent 70%)",
            WebkitMaskImage:
              "linear-gradient(200deg, black 20%, transparent 70%)",
          }}
        />
        {/* architectural line motifs */}
        <svg
          className="absolute right-8 top-8 h-28 w-28 text-white/40"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 5"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M50 4v14M50 82v14M4 50h14M82 50h14"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M50 38l10 18H40l10-18z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          className="absolute bottom-40 right-10 hidden h-24 w-56 text-white/30 xl:block"
          viewBox="0 0 220 90"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="6"
            y="10"
            width="60"
            height="44"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="72"
            y="10"
            width="40"
            height="44"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="118"
            y="10"
            width="96"
            height="70"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M6 66h106M150 22v58M182 22v58"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <path d="M6 86h208" stroke="currentColor" strokeWidth="1" />
          <path
            d="M20 86v-6M60 86v-6M150 86v-6M200 86v-6"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <div className="absolute left-10 top-10 flex items-center gap-2 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
            <FiTruck size={17} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold">BuildFlow</p>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              Field operations
            </p>
          </div>
        </div>

        <div className="absolute inset-x-10 bottom-10">
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
              >
                <s.icon size={17} className="text-[#EDDD53]" />
                <p className="mt-2 font-display text-xl font-extrabold text-white">
                  {s.value}
                </p>
                <p className="mt-0.5 text-[0.7rem] font-medium text-white/75">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/20 bg-[#102A36]/55 p-4 backdrop-blur-md">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient font-display text-xs font-extrabold text-[#0d222b]">
              78%
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                Green Valley Apartments · Tower B slab cycle
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[78%] rounded-full bg-brand-gradient" />
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-mint-400/20 px-2.5 py-1 text-[0.68rem] font-bold text-mint-200">
              On track
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
