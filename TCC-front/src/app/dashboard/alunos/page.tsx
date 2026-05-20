"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, UserPlus, Filter, MoreVertical, Eye, Pencil, Trash2, ChevronDown } from "lucide-react";

const alunosData = [
  { id: 1, nome: "Isabela Longhi", turma: "2º DS", rfid: "A23F91", status: "Ativo", entrada: "07:15", avatar: "JS" },
  { id: 2, nome: "Maria Oliveira", turma: "3º DS", rfid: "B88K21", status: "Ativo", entrada: "07:18", avatar: "MO" },
  { id: 3, nome: "Carlos Martins", turma: "1º DS", rfid: "C55T77", status: "Inativo", entrada: "—", avatar: "PS" },
  { id: 4, nome: "Ana Minin", turma: "2º DS", rfid: "D91R44", status: "Ativo", entrada: "07:22", avatar: "AL" },
  { id: 5, nome: "Lucas Gregório", turma: "3º DS", rfid: "E07P88", status: "Ativo", entrada: "07:31", avatar: "CM" },
  { id: 6, nome: "Otávio Seidinger", turma: "1º DS", rfid: "F33X12", status: "Ativo", entrada: "07:45", avatar: "BC" },
  { id: 7, nome: "Lucas Ferreira", turma: "2º DS", rfid: "G74Y56", status: "Inativo", entrada: "—", avatar: "LF" },
  { id: 8, nome: "Fernanda Rocha", turma: "3º DS", rfid: "H12Z99", status: "Ativo", entrada: "07:51", avatar: "FR" },
];

export default function AlunosPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtrados = alunosData.filter((a) => {
    const matchBusca = a.nome.toLowerCase().includes(busca.toLowerCase()) || a.rfid.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "Todos" || a.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const ativos = alunosData.filter((a) => a.status === "Ativo").length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Alunos</h2>
          <p className="text-gray-400 text-sm mt-1">{alunosData.length} alunos cadastrados · {ativos} ativos</p>
        </div>
        <Link
          href="/dashboard/alunos/novo"
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          <UserPlus size={16} />
          Novo Aluno
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou TAG RFID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c8102e] transition"
          />
        </div>
        <div className="relative">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#c8102e] transition bg-white cursor-pointer"
          >
            <option value="Todos">Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:border-gray-300 transition">
          <Filter size={14} />
          Filtros
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aluno</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Turma</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">RFID / TAG</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Última entrada</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtrados.map((aluno) => (
              <tr key={aluno.id} className="hover:bg-gray-50 transition group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#c8102e] to-[#6b0016] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {aluno.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{aluno.nome}</p>
                      <p className="text-xs text-gray-400">ID #{aluno.id.toString().padStart(4, "0")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 font-medium">{aluno.turma}</span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-mono">{aluno.rfid}</code>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{aluno.entrada}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      aluno.status === "Ativo"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {aluno.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-500 transition">
                      <Eye size={15} />
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-amber-500 transition">
                      <Pencil size={15} />
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum aluno encontrado</p>
          </div>
        )}

        {/* Pagination hint */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Mostrando {filtrados.length} de {alunosData.length} alunos</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#c8102e] hover:text-[#c8102e] transition">1</button>
            <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs text-gray-400 hover:border-[#c8102e] hover:text-[#c8102e] transition">2</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Users({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
