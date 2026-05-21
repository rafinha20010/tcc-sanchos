"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Download, Filter, Calendar, CreditCard, Camera, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

interface Registro {
  id: number;
  nome_aluno?: string;
  turma_nome?: string;
  tipo: "RFID" | "Facial";
  status: string;
  data_entrada?: string;
  data: string;
  hora?: string;
  local: string;
}

const PER_PAGE = 10;

export default function HistoricoPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [pagina, setPagina] = useState(1);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRegistros();
  }, []);

  async function fetchRegistros() {
    try {
      setLoading(true);
      const result = await api.registros.listar();
      setRegistros(result.data);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar registros.");
    } finally {
      setLoading(false);
    }
  }

  const filtrados = useMemo(() => {
    return registros.filter((r) => {
      const nome = r.nome_aluno || "";
      const turma = r.turma_nome || "";
      const matchBusca = nome.toLowerCase().includes(busca.toLowerCase()) || turma.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === "Todos" || r.status === filtroStatus;
      const matchTipo = filtroTipo === "Todos" || r.tipo === filtroTipo;
      return matchBusca && matchStatus && matchTipo;
    });
  }, [registros, busca, filtroStatus, filtroTipo]);

  const totalPaginas = Math.ceil(filtrados.length / PER_PAGE);
  const paginados = filtrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  const formatHora = (data?: string) => {
    if (!data) return "—";
    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatData = (data?: string) => {
    if (!data) return "—";
    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR");
  };

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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Carregando registros...</div>
          ) : paginados.length === 0 ? (
            <div className="p-10 text-center text-gray-400">Nenhum registro encontrado</div>
          ) : (
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
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#c8102e] text-white">
                          {(r.nome_aluno || "?").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{r.nome_aluno || "Desconhecido"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.turma_nome || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.local || "—"}</td>
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
                    <td className="px-4 py-3 text-sm text-gray-500">{formatData(r.data_entrada || r.data)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatHora(r.data_entrada || r.data)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Mostrando {paginados.length} de {filtrados.length} registros</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-xs flex items-center justify-center hover:border-[#c8102e] disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${
                    pagina === p ? "bg-[#c8102e] text-white" : "border border-gray-200 hover:border-[#c8102e]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
                className="w-8 h-8 rounded-lg border border-gray-200 text-xs flex items-center justify-center hover:border-[#c8102e] disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
