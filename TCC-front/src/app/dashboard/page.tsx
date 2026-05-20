"use client";

import Link from "next/link";
import {
  Users,
  DoorOpen,
  AlertTriangle,
  TrendingUp,
  Clock,
  Wifi,
  Camera,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

const stats = [
  {
    label: "Total de Alunos",
    value: "320",
    sub: "+12 este mês",
    icon: Users,
    color: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    label: "Entradas Hoje",
    value: "287",
    sub: "89% de presença",
    icon: DoorOpen,
    color: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    label: "Alertas Ativos",
    value: "3",
    sub: "Requer atenção",
    icon: AlertTriangle,
    color: "bg-[#c8102e]",
    light: "bg-red-50",
    text: "text-[#c8102e]",
  },
  {
    label: "Turmas Ativas",
    value: "18",
    sub: "4 cursos",
    icon: TrendingUp,
    color: "bg-violet-500",
    light: "bg-violet-50",
    text: "text-violet-600",
  },
];

const recentActivity = [
  { name: "Otávio Rodrigues", turma: "IDEV3 DS", tipo: "Entrada", metodo: "RFID", hora: "07:28", avatar: "MS" },
  { name: "Isabela Longhi", turma: "IELEMEC3", tipo: "Entrada", metodo: "Facial", hora: "07:31", avatar: "JS" },
  { name: "Maria Santos", turma: "IDEV5", tipo: "Entrada", metodo: "RFID", hora: "07:45", avatar: "AL" },
  { name: "Carlos Martins", turma: "IELEMEC4", tipo: "Saída", metodo: "RFID", hora: "11:50", avatar: "CM" },
  { name: "Maria Hirano", turma: "IDEV2", tipo: "Entrada", metodo: "Facial", hora: "12:05", avatar: "BC" },
];

const systemStatus = [
  { name: "Leitor RFID — Entrada Principal", status: "Operando", ok: true },
  { name: "Câmera Facial — Corredor A", status: "Operando", ok: true },
  { name: "Câmera Facial — Corredor B", status: "Offline", ok: false },
  { name: "Servidor Central", status: "Operando", ok: true },
];

const quickLinks = [
  { name: "Novo Aluno", href: "/dashboard/alunos/novo", icon: Users },
  { name: "Ver Histórico", href: "/dashboard/historico", icon: Clock },
  { name: "Relatório", href: "/dashboard/relatorios", icon: TrendingUp },
];

export default function DashboardHome() {
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Visão Geral</h2>
          <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
            <CalendarDays size={14} />
            <span className="capitalize">{hoje}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#c8102e] hover:text-[#c8102e] text-gray-600 text-sm px-4 py-2 rounded-xl transition-all duration-150"
              >
                <Icon size={14} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className={`w-10 h-10 ${stat.light} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              <p className={`text-xs ${stat.text} mt-1 font-medium`}>{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Atividade Recente</h3>
            <Link href="/dashboard/historico" className="text-xs text-[#c8102e] hover:underline flex items-center gap-1">
              Ver tudo <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition">
                <div className="w-9 h-9 bg-gradient-to-br from-[#c8102e] to-[#6b0016] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.turma}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    item.tipo === "Entrada"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {item.tipo}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  item.metodo === "RFID"
                    ? "bg-violet-50 text-violet-700"
                    : "bg-orange-50 text-orange-700"
                }`}>
                  {item.metodo}
                </span>
                <span className="text-xs text-gray-400 w-12 text-right">{item.hora}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System status */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Status do Sistema</h3>
          </div>
          <div className="p-4 space-y-3">
            {systemStatus.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${item.ok ? "bg-emerald-50" : "bg-red-50"}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.ok ? "bg-emerald-500" : "bg-red-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{item.name}</p>
                  <p className={`text-xs ${item.ok ? "text-emerald-600" : "text-red-600"}`}>{item.status}</p>
                </div>
                {item.ok ? (
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                )}
              </div>
            ))}

            {/* Device icons */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Wifi className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">4 Leitores</p>
                <p className="text-xs font-semibold text-gray-700">RFID</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Camera className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">6 Câmeras</p>
                <p className="text-xs font-semibold text-gray-700">Facial</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
