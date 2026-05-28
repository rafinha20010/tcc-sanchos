"use client";

import { useEffect, useState } from "react";
import { Download, TrendingUp, Users, ShieldAlert, BarChart2, PieChart, Calendar } from "lucide-react";
import api from "@/lib/api";

const dadosSemana = [
  { dia: "Seg", entradas: 287, negados: 3 },
  { dia: "Ter", entradas: 301, negados: 5 },
  { dia: "Qua", entradas: 295, negados: 2 },
  { dia: "Qui", entradas: 310, negados: 7 },
  { dia: "Sex", entradas: 278, negados: 4 },
  { dia: "Sáb", entradas: 45, negados: 1 },
  { dia: "Dom", entradas: 0, negados: 0 },
];

const dadosTurmas = [
  { turma: "IDEV3", presenca: 96 },
  { turma: "IDEV4", presenca: 92 },
  { turma: "IELE4", presenca: 89 },
  { turma: "IMEC3", presenca: 87 },
  { turma: "IELE5", presenca: 84 },
  { turma: "IMEC5", presenca: 81 },
];

const metodos = [
  { nome: "RFID", valor: 68, cor: "#3b82f6" },
  { nome: "Facial", valor: 32, cor: "#8b5cf6" },
];

const maxEntradas = Math.max(...dadosSemana.map((d) => d.entradas));

export default function RelatoriosPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("Semana");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError("");
      const response = await api.registros.stats();
      setStats(response.data);
    } catch (err: any) {
      console.error("Stats error:", err);
      setError(err?.message || "Erro ao carregar estatísticas. Tente novamente.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  // Prepare data from stats API
  const dadosSemanaAtual = stats?.entradas_por_dia ? stats.entradas_por_dia.map((d: any) => {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    // DAYOFWEEK: 1=Sunday, 2=Monday, ..., 7=Saturday
    const diaIndex = d.dia_semana_num ? (d.dia_semana_num - 1) : 0;
    return {
      dia: dias[diaIndex] || "—",
      entradas: d.total || 0,
      negados: 0
    };
  }) : dadosSemana;

  const dadosTurmasAtual = stats?.por_turma ? stats.por_turma.map((t: any) => ({
    turma: t.turma,
    presenca: t.total_turma > 0 ? Math.round((t.presentes / t.total_turma) * 100) : 0
  })) : dadosTurmas;

  const metodosAtual = stats?.por_metodo ? stats.por_metodo.map((m: any) => {
    const total = stats.por_metodo.reduce((s: number, x: any) => s + x.total, 0);
    const pct = Math.round((m.total / total) * 100);
    return {
      nome: m.tipo_identificacao === 'rfid' ? 'RFID' : 'Facial',
      valor: pct,
      cor: m.tipo_identificacao === 'rfid' ? "#3b82f6" : "#8b5cf6"
    };
  }) : metodos;

  const maxEntradasAtual = Math.max(...dadosSemanaAtual.map((d: any) => d.entradas), 1);

  const total = metodosAtual.reduce((s: number, m: { valor: number }) => s + m.valor, 0);
  let cumulativo = 0;
  const raio = 40;
  const circunferencia = 2 * Math.PI * raio;

  return (
    <div className="p-6 space-y-6">
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Carregando estatísticas...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
              <p className="text-sm text-gray-500 mt-1">Análise de acessos e presença</p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                {["Semana", "Mês", "Trimestre"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodoSelecionado(p)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      periodoSelecionado === p ? "bg-[#c8102e] text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600">
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
            </div>
          </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Média Diária", value: stats?.entradas_por_dia?.length > 0 ? Math.round(stats.entradas_por_dia.reduce((s: number, d: any) => s + d.total, 0) / stats.entradas_por_dia.length) : "—", sub: "entradas nos últimos 7 dias", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total de Alunos", value: stats?.total_alunos || "—", sub: "matriculados ativos", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Taxa de Presença", value: (stats?.taxa_presenca || "—") + "%", sub: "presentes hoje", icon: BarChart2, color: "text-[#c8102e]", bg: "bg-red-50" },
          { label: "Presentes Hoje", value: stats?.presentes_hoje || "—", sub: "alunos registrados", icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Entradas por Dia</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#c8102e] inline-block" /> Autorizadas</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-200 inline-block" /> Negadas</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {dadosSemanaAtual.map((d: any) => (
              <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "120px", justifyContent: "flex-end" }}>
                  {d.negados > 0 && (
                    <div
                      className="w-full bg-red-200 rounded-t-sm"
                      style={{ height: `${(d.negados / maxEntradasAtual) * 100}px` }}
                    />
                  )}
                  <div
                    className="w-full bg-[#c8102e] rounded-t-sm"
                    style={{ height: `${(d.entradas / maxEntradasAtual) * 100}px` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{d.dia}</span>
                <span className="text-xs font-medium text-gray-600">{d.entradas || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Método de Acesso</h2>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 100 100" className="w-32 h-32">
              {metodosAtual.map((m: any) => {
                const pct = m.valor / total;
                const dash = pct * circunferencia;
                const gap = circunferencia - dash;
                const dashOffset = circunferencia * (1 - cumulativo / total);
                cumulativo += m.valor;
                return (
                  <circle
                    key={m.nome}
                    cx="50"
                    cy="50"
                    r={raio}
                    fill="none"
                    stroke={m.cor}
                    strokeWidth="16"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 50 50)"
                  />
                );
              })}
              <text x="50" y="47" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#111">{metodosAtual[0]?.valor || "—"}%</text>
              <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#999">{metodosAtual[0]?.nome || "—"}</text>
            </svg>

            <div className="mt-4 space-y-2 w-full">
              {metodosAtual.map((m: any) => (
                <div key={m.nome} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.cor }} />
                    <span className="text-gray-600">{m.nome}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{m.valor}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Presença */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Taxa de Presença por Turma</h2>
        <div className="space-y-3">
          {dadosTurmasAtual.map((t: any) => (
            <div key={t.turma} className="flex items-center gap-4">
              <span className="w-14 text-sm font-mono font-medium text-gray-700">{t.turma}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`h-full flex items-center justify-end pr-2 ${
                    t.presenca >= 90 ? "bg-green-500" : t.presenca >= 80 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${t.presenca}%` }}
                >
                  <span className="text-xs font-medium text-white">{t.presenca}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}