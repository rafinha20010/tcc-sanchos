"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Shield, Wifi, Camera } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (email && senha) {
        router.push("/dashboard");
      } else {
        setError("Preencha todos os campos.");
        setLoading(false);
      }
    }, 900);
  }

  return (
    <div className="min-h-screen flex bg-[#0d0d0d] overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-14 bg-gradient-to-br from-[#c8102e] via-[#a00d24] to-[#6b0016]">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-32 left-10 w-48 h-48 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#c8102e]" />
            </div>
            <span className="text-white font-bold text-xl tracking-wide">SENAI Monitor</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-black text-white leading-tight">
            Controle de<br />
            <span className="text-white/50">Acesso</span><br />
            Escolar
          </h1>
          <p className="text-white/60 text-lg max-w-xs leading-relaxed">
            Sistema inteligente com RFID e reconhecimento facial para segurança máxima.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
              <Wifi className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-sm">RFID Ativo</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
              <Camera className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-sm">Câmeras OK</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/30 text-sm">
          © 2026 SENAI — Sistema de Monitoramento Inteligente
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-[#c8102e] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">SENAI Monitor</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-white/40">Faça login para acessar o painel de controle</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-white/50 font-medium">Email institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@senai.br"
                required
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 placeholder-white/20 focus:outline-none focus:border-[#c8102e] transition"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-white/50 font-medium">Senha</label>
                <button type="button" className="text-xs text-[#c8102e] hover:text-red-400 transition">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 pr-12 placeholder-white/20 focus:outline-none focus:border-[#c8102e] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2 border border-red-400/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c8102e] hover:bg-[#a00d24] active:scale-[0.98] text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando acesso...
                </span>
              ) : (
                "Entrar no Sistema"
              )}
            </button>
          </form>

          <p className="text-center text-white/20 text-sm mt-8">
            Acesso restrito a funcionários autorizados pelo SENAI
          </p>
        </div>
      </div>
    </div>
  );
}
