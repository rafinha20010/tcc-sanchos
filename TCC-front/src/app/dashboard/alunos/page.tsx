"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Filter, MoreVertical, Eye, Pencil, Trash2, ChevronDown, Users } from "lucide-react";
import api, { getFotoUrl } from "@/lib/api";

interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  turma_nome: string;
  rfid: string;
  matricula: string;
  telefone: string;
  foto: string;
  nome_responsavel: string;
  turmas_id: number;
  ultimo_acesso: string | null;
}

export default function AlunosPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [modalView, setModalView] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Aluno>>({});
  const [fotoCarregadaMap, setFotoCarregadaMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchAlunos();
  }, []);

  async function fetchAlunos() {
    try {
      setLoading(true);
      setError("");
      const result = await api.alunos.listar();
      setAlunos(result.data);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar alunos.");
    } finally {
      setLoading(false);
    }
  }

  const formatHorario = (data?: string | null) => {
    if (!data) return "—";
    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return alunos.filter((aluno) => {
      const status = aluno.ultimo_acesso ? "Ativo" : "Inativo";
      const matchBusca =
        aluno.nome.toLowerCase().includes(termo) ||
        aluno.rfid.toLowerCase().includes(termo) ||
        aluno.matricula.toLowerCase().includes(termo);
      const matchStatus = filtroStatus === "Todos" || status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [alunos, busca, filtroStatus]);

  const ativos = alunos.filter((aluno) => aluno.ultimo_acesso).length;

  const handleView = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setModalView(true);
  };

  const handleEdit = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setFormData(aluno);
    setModalEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!alunoSelecionado || !formData) return;
    try {
      setSaving(true);
      await api.alunos.atualizar(alunoSelecionado.id, formData);
      setModalEdit(false);
      setAlunoSelecionado(null);
      await fetchAlunos();
    } catch (err: any) {
      setError(err?.message || "Erro ao atualizar aluno.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este aluno?")) return;
    try {
      await api.alunos.remover(id);
      await fetchAlunos();
    } catch (err: any) {
      setError(err?.message || "Erro ao deletar aluno.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Alunos</h2>
          <p className="text-gray-400 text-sm mt-1">{alunos.length} alunos cadastrados · {ativos} ativos</p>
        </div>
        <Link
          href="/dashboard/alunos/novo"
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          <UserPlus size={16} />
          Novo Aluno
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou TAG RFID..."
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

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">Carregando alunos...</div>
      ) : (
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
              {filtrados.map((aluno) => {
                const status = aluno.ultimo_acesso ? "Ativo" : "Inativo";
                const entrada = formatHorario(aluno.ultimo_acesso);
                return (
                  <tr key={aluno.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {aluno.foto && fotoCarregadaMap[aluno.id] ? (
                          <img
                            src={getFotoUrl(aluno.foto) || ""}
                            alt={aluno.nome}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            onError={() => setFotoCarregadaMap((prev) => ({ ...prev, [aluno.id]: false }))}
                            onLoad={() => setFotoCarregadaMap((prev) => ({ ...prev, [aluno.id]: true }))}
                          />
                        ) : null}
                        {!aluno.foto || !fotoCarregadaMap[aluno.id] ? (
                          <div className="w-9 h-9 bg-gradient-to-br from-[#c8102e] to-[#6b0016] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {aluno.nome.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                          </div>
                        ) : null}
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{aluno.nome}</p>
                          <p className="text-xs text-gray-400">ID #{aluno.id.toString().padStart(4, "0")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">{aluno.turma_nome}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-mono">{aluno.rfid}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{entrada}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                          status === "Ativo"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => handleView(aluno)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-500 transition">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleEdit(aluno)} className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-amber-500 transition">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(aluno.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum aluno encontrado</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Mostrando {filtrados.length} de {alunos.length} alunos</p>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#c8102e] hover:text-[#c8102e] transition">1</button>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs text-gray-400 hover:border-[#c8102e] hover:text-[#c8102e] transition">2</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal View */}
      {modalView && alunoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Informações do Aluno</h2>
              <button onClick={() => setModalView(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-6">
                {alunoSelecionado.foto && fotoCarregadaMap[alunoSelecionado.id] ? (
                  <img
                    src={getFotoUrl(alunoSelecionado.foto) || ""}
                    alt={alunoSelecionado.nome}
                    className="w-32 h-32 rounded-xl object-cover"
                    onError={() => setFotoCarregadaMap((prev) => ({ ...prev, [alunoSelecionado.id]: false }))}
                    onLoad={() => setFotoCarregadaMap((prev) => ({ ...prev, [alunoSelecionado.id]: true }))}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-[#c8102e] to-[#6b0016] rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                    {alunoSelecionado.nome.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{alunoSelecionado.nome}</h3>
                  <p className="text-sm text-gray-500 mb-4">ID #{alunoSelecionado.id.toString().padStart(4, "0")}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Turma</p>
                      <p className="text-sm font-semibold text-gray-900">{alunoSelecionado.turma_nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Matrícula</p>
                      <p className="text-sm font-semibold text-gray-900">{alunoSelecionado.matricula}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">CPF</p>
                      <p className="text-sm font-semibold text-gray-900">{alunoSelecionado.cpf}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Telefone</p>
                      <p className="text-sm font-semibold text-gray-900">{alunoSelecionado.telefone || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">RFID / TAG</p>
                  <code className="text-sm font-mono text-gray-900">{alunoSelecionado.rfid}</code>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Responsável</p>
                  <p className="text-sm font-semibold text-gray-900">{alunoSelecionado.nome_responsavel || "—"}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModalView(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {modalEdit && alunoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Editar Aluno</h2>
              <button onClick={() => setModalEdit(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome || ""}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e] transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf || ""}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                  <input
                    type="text"
                    value={formData.matricula || ""}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e] transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RFID / TAG</label>
                  <input
                    type="text"
                    value={formData.rfid || ""}
                    onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone || ""}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <input
                  type="text"
                  value={formData.nome_responsavel || ""}
                  onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e] transition"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModalEdit(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#c8102e] text-sm font-medium text-white hover:bg-[#a00d24] disabled:opacity-60 transition"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
