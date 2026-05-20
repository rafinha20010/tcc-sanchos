"use client";

import { useState } from "react";
import { Search, Download, Filter, Calendar, CreditCard, Camera, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface Registro {
  id: number;
  nome: string;
  turma: string;
  tipo: "RFID" | "Facial";
  status: "Autorizado" | "Negado";
  data: string;
  hora: string;
  local: string;
  avatar: string;
}

const registros: Registro[] = [
  { id: 1, nome: "Carlos Eduardo Silva", turma: "DS-3A", tipo: "RFID", status: "Autorizado", data: "12/03/2025", hora: "08:47", local: "Entrada Principal", avatar: "CE" },
  { id: 2, nome: "Ana Paula Mendes", turma: "RDS-2B", tipo: "Facial", status: "Autorizado", data: "12/03/2025", hora: "08:46", local: "Entrada Principal", avatar: "AP" },
  { id: 3, nome: "Desconhecido", turma: "—", tipo: "Facial", status: "Negado", data: "12/03/2025", hora: "08:45", local: "Entrada Lateral", avatar: "?" },
  { id: 4, nome: "Lucas Ferreira Santos", turma: "DS-1C", tipo: "RFID", status: "Autorizado", data: "12/03/2025", hora: "08:44", local: "Entrada Principal", avatar: "LF" },
  { id: 5, nome: "Beatriz Oliveira", turma: "RDS-3A", tipo: "RFID", status: "Autorizado", data: "12/03/2025", hora: "08:43", local: "Entrada Principal", avatar: "BO" },
  { id: 6, nome: "Rafael Costa Lima", turma: "DS-2A", tipo: "Facial", status: "Autorizado", data: "12/03/2025", hora: "08:41", local: "Laboratório", avatar: "RC" },
  { id: 7, nome: "Juliana Neves", turma: "DS-1A", tipo: "RFID", status: "Negado", data: "12/03/2025", hora: "08:40", local: "Entrada Principal", avatar: "JN" },
  { id: 8, nome: "Thiago Almeida", turma: "RDS-1B", tipo: "Facial", status: "Autorizado", data: "11/03/2025", hora: "07:58", local: "Entrada Principal", avatar: "TA" },
  { id: 9, nome: "Fernanda Rocha", turma: "DS-2B", tipo: "RFID", status: "Autorizado", data: "11/03/2025", hora: "07:55", local: "Entrada Principal", avatar: "FR" },
  { id: 10, nome: "Pedro Henrique", turma: "DS-3A", tipo: "RFID", status: "Autorizado", data: "11/03/2025", hora: "07:53", local: "Entrada Principal", avatar: "PH" },
  { id: 11, nome: "Marina Costa", turma: "RDS-2A", tipo: "Facial", status: "Autorizado", data: "11/03/2025", hora: "07:50", local: "Entrada Principal", avatar: "MC" },
  { id: 12, nome: "Desconhecido", turma: "—", tipo: "Facial", status: "Negado", data: "11/03/2025", hora: "07:48", local: "Laboratório", avatar: "?" },
  { id: 13, nome: "Gustavo Pereira", turma: "DS-1B", tipo: "RFID", status: "Autorizado", data: "10/03/2025", hora: "08:02", local: "Entrada Principal", avatar: "GP" },
  { id: 14, nome: "Isabela Santos", turma: "DS-3A", tipo: "Facial", status: "Autorizado", data: "10/03/2025", hora: "08:00", local: "Entrada Principal", avatar: "IS" },
  { id: 15, nome: "Vinicius Lima", turma: "RDS-1A", tipo: "RFID", status: "Negado", data: "10/03/2025", hora: "07:58", local: "Entrada Lateral", avatar: "VL" },
];

const PER_PAGE = 10;

export default function HistoricoPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [pagina, setPagina] = useState(1);

  const filtrados = registros.filter((r) => {
    const matchBusca = r.nome.toLowerCase().includes(busca.toLowerCase()) || r.turma.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "Todos" || r.status === filtroStatus;
    const matchTipo = filtroTipo === "Todos" || r.tipo === filtroTipo;
    return matchBusca && matchStatus && matchTipo;
  });

  const totalPaginas = Math.ceil(filtrados.length / PER_PAGE);
  const paginados = filtrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Acessos</h1>
          <p className="text-sm text-gray-500 mt-1">{filtrados.length} registros encontrados</p>
        </div>
        <button className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou turma..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c8102e]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filtroStatus}
            onChange={(e) => { setFiltroStatus(e.target.value); setPagina(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#c8102e] bg-white"
          >
            {["Todos", "Autorizado", "Negado"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#c8102e] bg-white"
          >
            {["Todos", "RFID", "Facial"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input type="date" className="text-sm focus:outline-none bg-transparent" />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Aluno", "Turma", "Local", "Método", "Status", "Data", "Hora"].map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginados.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${r.status === "Negado" ? "bg-red-100 text-red-700" : "bg-[#c8102e] text-white"}`}>
                        {r.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{r.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.turma}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.local}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${r.tipo === "RFID" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                      {r.tipo === "RFID" ? <CreditCard className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                      {r.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${r.status === "Autorizado" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {r.status === "Autorizado" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.data}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {r.hora}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Mostrando {Math.min((pagina - 1) * PER_PAGE + 1, filtrados.length)}–{Math.min(pagina * PER_PAGE, filtrados.length)} de {filtrados.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPagina(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === pagina ? "bg-[#c8102e] text-white" : "hover:bg-gray-100 text-gray-600"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
