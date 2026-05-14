import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import logoPath from "@assets/7b7ac791-6c04-4e4f-9e07-44131e4310bb_1778662052573.png";

type Mode = "password" | "otp-request" | "otp-verify";

export default function Login() {
  const [mode, setMode] = useState<Mode>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpId, setOtpId] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const isPhone = identifier.startsWith("+") || /^\d{7,}$/.test(identifier.replace(/\D/g, ""));
    loginMutation.mutate(
      { data: isPhone ? { password, whatsapp_number: identifier } : { password, username: identifier } },
      {
        onSuccess: (data: any) => { login(data.token, data.user); setLocation("/"); },
        onError: () => setError("Invalid credentials. Check your username/number and password."),
      }
    );
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          identifier.startsWith("+") || /^\d{7,}$/.test(identifier.replace(/\D/g, ""))
            ? { whatsapp_number: identifier }
            : { username: identifier }
        ),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP"); return; }
      setOtpId(data.otp_id);
      setMode("otp-verify");
      setInfo("OTP sent! Check your WhatsApp — a bot will send it shortly.");
    } catch {
      setError("Network error. Try again.");
    } finally { setLoading(false); }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp_id: otpId, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid OTP"); return; }
      login(data.token, data.user);
      setLocation("/");
    } catch {
      setError("Network error. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/"><img src={logoPath} alt="Shadow Garden" className="h-16 mx-auto mb-4 cursor-pointer" /></Link>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-white/40 mt-1 text-sm">Sign in to your Shadow Garden account</p>
        </div>

        {/* Mode tabs */}
        <div className="flex mb-6 glass-card rounded-xl p-1 border border-white/[0.06]">
          <button onClick={() => { setMode("password"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "password" ? "bg-red-700 text-white" : "text-white/40 hover:text-white/70"}`}>
            Password
          </button>
          <button onClick={() => { setMode("otp-request"); setError(""); setInfo(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode !== "password" ? "bg-red-700 text-white" : "text-white/40 hover:text-white/70"}`}>
            OTP via WhatsApp
          </button>
        </div>

        <div className="glass-card rounded-2xl p-8 neon-border border border-red-900/20">
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-white/55 mb-2">Username or WhatsApp Number</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="username or +1234567890" required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-white/55 mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 transition-all" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loginMutation.isPending}
                className="w-full py-3 btn-primary rounded-xl font-semibold text-white disabled:opacity-50">
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {mode === "otp-request" && (
            <form onSubmit={handleOtpRequest} className="space-y-5">
              <div>
                <label className="block text-sm text-white/55 mb-2">Username or WhatsApp Number</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="username or +1234567890" required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 transition-all" />
              </div>
              <p className="text-white/40 text-xs">A bot that is currently online will send a one-time code to your WhatsApp.</p>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 btn-primary rounded-xl font-semibold text-white disabled:opacity-50">
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {mode === "otp-verify" && (
            <form onSubmit={handleOtpVerify} className="space-y-5">
              {info && <p className="text-green-400 text-sm text-center">{info}</p>}
              <div>
                <label className="block text-sm text-white/55 mb-2">Enter OTP Code</label>
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-digit code" required maxLength={6}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-white/25 focus:outline-none focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 transition-all" />
              </div>
              <p className="text-white/35 text-xs text-center">Code expires in 5 minutes</p>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 btn-primary rounded-xl font-semibold text-white disabled:opacity-50">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button type="button" onClick={() => { setMode("otp-request"); setOtpCode(""); setError(""); setInfo(""); }}
                className="w-full py-2 text-white/40 text-sm hover:text-white/70 transition-colors">
                Resend OTP
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-white/40">
            New to Shadow Garden?{" "}
            <Link href="/register" className="text-red-400 hover:text-red-300 font-medium">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
