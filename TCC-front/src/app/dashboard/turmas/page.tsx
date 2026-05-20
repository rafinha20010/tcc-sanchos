"use client";

import { useState } from "react";
import { Plus, Search, Users, BookOpen, GraduationCap, Eye, Pencil, Trash2, ChevronRight } from "lucide-react";

interface Turma {
  id: number;
  codigo: string;
  nome: string;
  curso: string;
  periodo: string;
  alunos: number;
  capacidade: number;
  professor: string;
  status: "Ativa" | "Inativa";
}

const turmas: Turma[] = [
  { id: 1, codigo: "IDEV5", nome: "Desenvolvimento de Sistemas 5", curso: "Técnico em Desenvolvimento de Sistemas", periodo: "Manhã", alunos: 32, capacidade: 32, professor: "Prof. João Marcos", status: "Ativa" },
  { id: 2, codigo: "IDEV5", nome: "Desenvolvimento de Sistemas 5", curso: "Técnico em Desenvolvimento de Sistemas", periodo: "Tarde", alunos: 32, capacidade: 32, professor: "Prof. João Marcos", status: "Ativa" },

  { id: 3, codigo: "IMEC5", nome: "Mecânica 5", curso: "Técnico em Mecânica", periodo: "Manhã", alunos: 16, capacidade: 16, professor: "Profa. Carla Andrade", status: "Ativa" },
  { id: 4, codigo: "IMEC5", nome: "Mecânica 5", curso: "Técnico em Mecânica", periodo: "Tarde", alunos: 16, capacidade: 16, professor: "Prof. Marcos Vinicius", status: "Ativa" },

  { id: 5, codigo: "IELE4", nome: "Eletrônica 4", curso: "Técnico em Eletrônica", periodo: "Manhã", alunos: 16, capacidade: 16, professor: "Profa. Carla Andrade", status: "Ativa" },

  { id: 6, codigo: "IDEV4", nome: "Desenvolvimento de Sistemas 4", curso: "Técnico em Desenvolvimento de Sistemas", periodo: "Manhã", alunos: 32, capacidade: 32, professor: "Profa. Fernanda Lima", status: "Ativa" },
  { id: 7, codigo: "IDEV4", nome: "Desenvolvimento de Sistemas 4", curso: "Técnico em Desenvolvimento de Sistemas", periodo: "Tarde", alunos: 32, capacidade: 32, professor: "Prof. Ricardo Souza", status: "Ativa" },

  { id: 8, codigo: "IDEV3", nome: "Desenvolvimento de Sistemas 3", curso: "Técnico em Desenvolvimento de Sistemas", periodo: "Manhã", alunos: 30, capacidade: 32, professor: "Prof. Ricardo Souza", status: "Ativa" },
  { id: 9, codigo: "IDEV3", nome: "Desenvolvimento de Sistemas 3", curso: "Técnico em Desenvolvimento de Sistemas", periodo: "Tarde", alunos: 25, capacidade: 32, professor: "Profa. Fernanda Lima", status: "Ativa" },

  { id: 10, codigo: "IELE3", nome: "Eletrônica 3", curso: "Técnico em Eletrônica", periodo: "Manhã", alunos: 0, capacidade: 16, professor: "—", status: "Inativa" }
];
export default function TurmasPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todas");

  const filtradas = turmas.filter((t) => {
    const matchBusca = t.codigo.toLowerCase().includes(busca.toLowerCase()) || t.nome.toLowerCase().includes(busca.toLowerCase()) || t.curso.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "Todas" || t.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const totalAlunos = turmas.filter(t => t.status === "Ativa").reduce((sum, t) => sum + t.alunos, 0);
  const turmasAtivas = turmas.filter(t => t.status === "Ativa").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-sm text-gray-500 mt-1">{turmasAtivas} turmas ativas · {totalAlunos} alunos matriculados</p>
        </div>
        <button className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Turmas Ativas", value: turmasAtivas, icon: BookOpen, color: "text-[#c8102e]", bg: "bg-red-50" },
          { label: "Total de Alunos", value: totalAlunos, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Cursos Técnicos", value: 2, icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar turma ou curso..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c8102e] bg-white"
          />
        </div>
        <div className="flex gap-2">
          {["Todas", "Ativa", "Inativa"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroStatus(f)}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${filtroStatus === f ? "bg-[#c8102e] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtradas.map((turma) => {
          const ocupacao = Math.round((turma.alunos / turma.capacidade) * 100);
          return (
            <div key={turma.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#c8102e]/30 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gray-900">{turma.codigo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${turma.status === "Ativa" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {turma.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{turma.curso}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Período:</span> {turma.periodo}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Professor:</span> {turma.professor}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{turma.alunos} alunos</span>
                  <span>{ocupacao}% de {turma.capacidade}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${ocupacao >= 90 ? "bg-red-500" : ocupacao >= 70 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${ocupacao}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtradas.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma turma encontrada</p>
        </div>
      )}
    </div>
  );
}
