import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import logoPath from "@assets/7b7ac791-6c04-4e4f-9e07-44131e4310bb_1778662052573.png";

export default function Register() {
  const [form, setForm] = useState({ username: "", display_name: "", whatsapp_number: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    registerMutation.mutate(
      { data: { username: form.username, password: form.password, display_name: form.display_name || undefined, whatsapp_number: form.whatsapp_number || undefined } },
      {
        onSuccess: (data: any) => { login(data.token, data.user); setLocation("/"); },
        onError: (err: any) => setError(err?.data?.error || "Registration failed. Username may be taken."),
      }
    );
  };

  const field = (label: string, key: string, type = "text", placeholder = "", hint?: string) => (
    <div>
      <label className="block text-sm text-white/55 mb-1.5">{label}</label>
      <input type={type} value={(form as any)[key]} onChange={set(key)} placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-red-700/50 focus:ring-1 focus:ring-red-700/20 transition-all" />
      {hint && <p className="text-xs text-white/25 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/"><img src={logoPath} alt="Shadow Garden" className="h-16 mx-auto mb-4 cursor-pointer" /></Link>
          <h1 className="text-2xl font-bold text-white">Join Shadow Garden</h1>
          <p className="text-white/40 mt-1 text-sm">Create your account and enter the universe</p>
        </div>
        <div className="glass-card rounded-2xl p-8 neon-border border border-red-900/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            {field("Username *", "username", "text", "shadowhunter99")}
            {field("Display Name", "display_name", "text", "Shadow Hunter")}
            {field("WhatsApp Number (optional)", "whatsapp_number", "text", "+1234567890", "Link your WhatsApp to use OTP login & receive bot messages")}
            {field("Password *", "password", "password", "Min. 6 characters")}
            {field("Confirm Password *", "confirm", "password", "Repeat password")}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={registerMutation.isPending}
              className="w-full py-3 btn-primary rounded-xl font-semibold text-white disabled:opacity-50 mt-2">
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
