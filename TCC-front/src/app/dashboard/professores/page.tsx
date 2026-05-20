"use client";

import { useState } from "react";
import { Plus, Search, Mail, Phone, BookOpen, Eye, Pencil, Trash2 } from "lucide-react";

interface Professor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  disciplinas: string[];
  turmas: string[];
  status: "Ativo" | "Inativo";
  avatar: string;
}

const professores: Professor[] = [
  { id: 1, nome: "Prof. João Marcos Oliveira", email: "joao.marcos@sp.senai.br", telefone: "(14) 99812-3456", disciplinas: ["Programação Web", "Banco de Dados"], turmas: ["DS-1A", "DS-1B"], status: "Ativo", avatar: "JM" },
  { id: 2, nome: "Profa. Carla Andrade Silva", email: "carla.andrade@sp.senai.br", telefone: "(14) 99823-4567", disciplinas: ["Algoritmos", "Lógica de Programação"], turmas: ["DS-1C", "DS-2A"], status: "Ativo", avatar: "CA" },
  { id: 3, nome: "Prof. Ricardo Souza Lima", email: "ricardo.souza@sp.senai.br", telefone: "(14) 99834-5678", disciplinas: ["POO", "Desenvolvimento Mobile"], turmas: ["DS-2B", "DS-3A"], status: "Ativo", avatar: "RS" },
  { id: 4, nome: "Prof. Marcos Vinicius Costa", email: "marcos.vinicius@sp.senai.br", telefone: "(14) 99845-6789", disciplinas: ["Redes TCP/IP", "Segurança de Redes"], turmas: ["RDS-1A", "RDS-1B", "RDS-3A"], status: "Ativo", avatar: "MV" },
  { id: 5, nome: "Profa. Fernanda Lima Torres", email: "fernanda.lima@sp.senai.br", telefone: "(14) 99856-7890", disciplinas: ["Infraestrutura", "Cabeamento Estruturado"], turmas: ["RDS-2A", "RDS-2B"], status: "Ativo", avatar: "FL" },
  { id: 6, nome: "Prof. Alexandre Rocha", email: "alexandre.rocha@sp.senai.br", telefone: "(14) 99867-8901", disciplinas: ["Eletroeletrônica Básica"], turmas: [], status: "Inativo", avatar: "AR" },
];

export default function ProfessoresPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);

  const filtrados = professores.filter((p) => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.email.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "Todos" || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professores</h1>
          <p className="text-sm text-gray-500 mt-1">{professores.filter(p => p.status === "Ativo").length} professores ativos</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Professor
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c8102e] bg-white"
          />
        </div>
        <div className="flex gap-2">
          {["Todos", "Ativo", "Inativo"].map((f) => (
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

      {/* Grid de Professores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((prof) => (
          <div key={prof.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#c8102e]/30 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#c8102e] flex items-center justify-center text-white font-bold">
                  {prof.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{prof.nome}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${prof.status === "Ativo" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {prof.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{prof.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{prof.telefone}</span>
              </div>
            </div>

            {prof.disciplinas.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Disciplinas</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {prof.disciplinas.map((d) => (
                    <span key={d} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {prof.turmas.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {prof.turmas.map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum professor encontrado</p>
        </div>
      )}

      {/* Modal Simples */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Novo Professor</h2>
            {["Nome completo", "E-mail institucional", "Telefone"].map((label) => (
              <div key={label}>
                <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e]" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalAberto(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => setModalAberto(false)} className="flex-1 bg-[#c8102e] hover:bg-[#a00d24] text-white rounded-lg py-2 text-sm font-medium transition-colors">
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
