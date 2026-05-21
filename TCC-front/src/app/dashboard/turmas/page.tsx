"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Users, BookOpen, GraduationCap, Eye, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";

interface Turma {
  id: number;
  nome: string;
  total_alunos: number;
  professores: { id: number; nome: string }[] | null;
}

export default function TurmasPage() {
    const [loadingProfessores, setLoadingProfessores] = useState(false);
  const [busca, setBusca] = useState("");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [turmaEmEdicao, setTurmaEmEdicao] = useState<number | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [saving, setSaving] = useState(false);
  const [professores, setProfessores] = useState<any[]>([]);
  const [professoresSelecionados, setProfessoresSelecionados] = useState<number[]>([]);

  useEffect(() => {
    if (modalAberto) {
      console.log('Abrindo modal, buscando professores...');
      setLoadingProfessores(true);
      let finished = false;
      const timeout = setTimeout(() => {
        if (!finished) {
          console.warn('Timeout: setando loadingProfessores para false');
          setLoadingProfessores(false);
        }
      }, 5000);
      api.professores.listar()
        .then(res => {
          console.log('Professores recebidos:', res.data);
          setProfessores(res.data);
        })
        .catch((err) => {
          console.error('Erro ao buscar professores:', err);
          setProfessores([]);
        })
        .finally(() => {
          finished = true;
          clearTimeout(timeout);
          setLoadingProfessores(false);
        });
    }
  }, [modalAberto]);

  useEffect(() => {
    fetchTurmas();
  }, []);

  async function fetchTurmas() {
    try {
      setLoading(true);
      setError("");
      const response = await api.turmas.listar();
      setTurmas(response.data);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar turmas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCriarTurma(e: React.FormEvent) {
    e.preventDefault();
    if (!novoNome.trim()) return;

    try {
      setSaving(true);
      let turmaId = turmaEmEdicao;
      if (modoEdicao && turmaEmEdicao) {
        await api.turmas.atualizar(turmaEmEdicao, novoNome.trim());
      } else {
        const res = await api.turmas.criar(novoNome.trim()) as { data: { id: number } };
        turmaId = res.data.id;
      }
      // Salvar professores vinculados
      if (turmaId && professoresSelecionados.length > 0) {
        await api.turmas.atualizarProfessores(turmaId, professoresSelecionados);
      }
      setNovoNome("");
      setProfessoresSelecionados([]);
      setModalAberto(false);
      setModoEdicao(false);
      setTurmaEmEdicao(null);
      await fetchTurmas();
    } catch (err: any) {
      setError(err?.message || "Não foi possível salvar a turma.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditarTurma(turma: Turma) {
    setModoEdicao(true);
    setTurmaEmEdicao(turma.id);
    setNovoNome(turma.nome);
    setModalAberto(true);
  }

  async function handleDeletarTurma(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta turma?")) return;

    try {
      setSaving(true);
      await api.turmas.remover(id);
      await fetchTurmas();
    } catch (err: any) {
      setError(err?.message || "Não foi possível deletar a turma.");
    } finally {
      setSaving(false);
    }
  }

  function abrirModalCriar() {
    console.log('Botão Nova Turma clicado, abrindo modal');
    setModoEdicao(false);
    setTurmaEmEdicao(null);
    setNovoNome("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setModoEdicao(false);
    setTurmaEmEdicao(null);
    setNovoNome("");
  }

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return turmas.filter((turma) => {
      if (!termo) return true;
      const nomesProfessores = turma.professores && Array.isArray(turma.professores)
        ? turma.professores.map((p) => p.nome.toLowerCase()).join(", ")
        : "";
      return (
        turma.nome.toLowerCase().includes(termo) ||
        nomesProfessores.includes(termo)
      );
    });
  }, [busca, turmas]);

  const totalAlunos = turmas.reduce((sum, turma) => sum + Number(turma.total_alunos ?? 0), 0);
  const totalTurmas = turmas.length;
  const totalProfessores = turmas.filter((turma) => !!turma.professores).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-sm text-gray-500 mt-1">{totalTurmas} turmas cadastradas · {totalAlunos} alunos matriculados</p>
        </div>
        <button
          onClick={() => abrirModalCriar()}
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Turmas Cadastradas", value: totalTurmas, icon: BookOpen, color: "text-[#c8102e]", bg: "bg-red-50" },
          { label: "Total de Alunos", value: totalAlunos, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Com professor", value: totalProfessores, icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por turma ou professor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c8102e] bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">Carregando turmas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtradas.map((turma) => (
            <div key={turma.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#c8102e]/30 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gray-900">{turma.nome}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {turma.professores && turma.professores.length > 0
                      ? turma.professores.map((p) => p.nome).join(", ")
                      : "Sem professor vinculado"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handleEditarTurma(turma)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDeletarTurma(turma.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <div className="mb-2">
                  <span className="font-semibold">Alunos:</span> {turma.total_alunos}
                </div>
              </div>
            </div>
          ))}

          {filtradas.length === 0 && (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Nenhuma turma encontrada.
            </div>
          )}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{modoEdicao ? "Editar Turma" : "Nova Turma"}</h2>
                <p className="text-sm text-gray-500">{modoEdicao ? "Altere o nome da turma." : "Informe o nome da turma para cadastrar."}</p>
              </div>
              <button onClick={() => fecharModal()} className="text-gray-400 hover:text-gray-700">Fechar</button>
            </div>
            <form onSubmit={handleCriarTurma} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Nome da turma</label>
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Desenvolvimento de Sistemas 5"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mt-4">Professores da turma</label>
              <select
                multiple
                value={professoresSelecionados.map(String)}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                  setProfessoresSelecionados(options);
                }}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e] h-32"
              >
                {loadingProfessores ? (
                  <option disabled>Carregando professores...</option>
                ) : professores.length === 0 ? (
                  <option disabled>Nenhum professor encontrado</option>
                ) : (
                  professores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))
                )}
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => fecharModal()} className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-[#c8102e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a00d24] disabled:opacity-60">
                  {saving ? "Salvando..." : modoEdicao ? "Atualizar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
