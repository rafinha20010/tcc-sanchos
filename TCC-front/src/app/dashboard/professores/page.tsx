"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Mail, Phone, BookOpen, Eye, Pencil, Trash2, X } from "lucide-react";
import api from "@/lib/api";

interface Professor {
  id: number;
  nome: string;
  cpf: string;
  rfid: string;
  telefone: string;
  turmas: { id: number; nome: string }[];
}

export default function ProfessoresPage() {
  const [busca, setBusca] = useState("");
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [profEmEdicao, setProfEmEdicao] = useState<number | null>(null);
  const [novoProfessor, setNovoProfessor] = useState({ nome: "", cpf: "", rfid: "", telefone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profSelecionado, setProfSelecionado] = useState<Professor | null>(null);
  const [modalView, setModalView] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [formData, setFormData] = useState<Partial<Professor>>({});

  useEffect(() => {
    fetchProfessores();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchProfessores, 300);
    return () => clearTimeout(timeout);
  }, [busca]);

  async function fetchProfessores() {
    try {
      setLoading(true);
      setError("");
      const result = await api.professores.listar(busca.trim() || undefined);
      console.log('Resultado da API de professores:', result);
      setProfessores(result.data);
    } catch (err: any) {
      console.error('Erro ao buscar professores:', err);
      setError(err?.message || "Erro ao carregar professores.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProfessor(e: React.FormEvent) {
    e.preventDefault();
    if (!novoProfessor.nome || !novoProfessor.cpf || !novoProfessor.rfid || !novoProfessor.telefone) {
      return;
    }

    try {
      setSaving(true);
      if (modoEdicao && profEmEdicao) {
        await api.professores.atualizar(profEmEdicao, novoProfessor);
      } else {
        await api.professores.criar(novoProfessor);
      }
      setNovoProfessor({ nome: "", cpf: "", rfid: "", telefone: "" });
      setModalAberto(false);
      setModoEdicao(false);
      setProfEmEdicao(null);
      await fetchProfessores();
    } catch (err: any) {
      setError(err?.message || "Não foi possível salvar professor.");
    } finally {
      setSaving(false);
    }
  }

  function handleEditarProfessor(prof: Professor) {
    setNovoProfessor({
      nome: prof.nome,
      cpf: prof.cpf,
      rfid: "",
      telefone: prof.telefone,
    });
    setProfEmEdicao(prof.id);
    setModoEdicao(true);
    setModalAberto(true);
  }

  async function handleDeletarProfessor(id: number) {
    if (!confirm("Tem certeza que deseja deletar este professor?")) {
      return;
    }
    try {
      setSaving(true);
      await api.professores.remover(id);
      await fetchProfessores();
    } catch (err: any) {
      setError(err?.message || "Não foi possível deletar professor.");
    } finally {
      setSaving(false);
    }
  }

  function handleFecharModal() {
    setModalAberto(false);
    setModoEdicao(false);
    setProfEmEdicao(null);
    setNovoProfessor({ nome: "", cpf: "", rfid: "", telefone: "" });
  }

  function getInitials(nome: string) {
    return nome
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  const handleView = (prof: Professor) => {
    setProfSelecionado(prof);
    setModalView(true);
  };

  const handleEdit = (prof: Professor) => {
    setProfSelecionado(prof);
    setFormData(prof);
    setModalEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!profSelecionado || !formData) return;
    try {
      setSaving(true);
      await api.professores.atualizar(profSelecionado.id, formData as any);
      setModalEdit(false);
      setProfSelecionado(null);
      await fetchProfessores();
    } catch (err: any) {
      setError(err?.message || "Erro ao atualizar professor.");
    } finally {
      setSaving(false);
    }
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return professores.filter((prof) => {
      const nomesTurmas = Array.isArray(prof.turmas)
        ? prof.turmas.map((t) => t.nome.toLowerCase()).join(", ")
        : "";
      return (
        prof.nome.toLowerCase().includes(termo) ||
        prof.cpf.toLowerCase().includes(termo) ||
        nomesTurmas.includes(termo)
      );
    });
  }, [busca, professores]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professores</h1>
          <p className="text-sm text-gray-500 mt-1">{professores.length} professores cadastrados</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Professor
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou turma..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c8102e] bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">Carregando professores...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((prof) => {
            return (
              <div key={prof.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#c8102e]/30 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#c8102e] flex items-center justify-center text-white font-bold">
                      {getInitials(prof.nome)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{prof.nome}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block bg-green-50 text-green-700">Ativo</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleView(prof)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleEdit(prof)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeletarProfessor(prof.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{prof.cpf}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{prof.telefone}</span>
                  </div>
                </div>

                {prof.turmas && prof.turmas.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">Turmas</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {prof.turmas.map((t) => (
                        <span key={t.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">{t.nome}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtrados.length === 0 && (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Nenhum professor encontrado
            </div>
          )}
        </div>
      )}

      {modalView && profSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Detalhes do Professor</h2>
              <button onClick={() => setModalView(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-[#c8102e] flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(profSelecionado.nome)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{profSelecionado.nome}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block bg-green-50 text-green-700">Ativo</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CPF</label>
                <p className="text-sm text-gray-900 mt-1">{profSelecionado.cpf}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tag RFID</label>
                <p className="text-sm text-gray-900 mt-1">{profSelecionado.rfid || "Não cadastrado"}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefone</label>
                <p className="text-sm text-gray-900 mt-1">{profSelecionado.telefone}</p>
              </div>
              
              {profSelecionado.turmas && profSelecionado.turmas.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Turmas</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profSelecionado.turmas.map((t) => (
                      <span key={t.id} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{t.nome}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button onClick={() => setModalView(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Fechar
              </button>
              <button onClick={() => { setModalView(false); handleEdit(profSelecionado); }} className="flex-1 bg-[#c8102e] hover:bg-[#a00d24] text-white rounded-lg py-2 text-sm font-medium transition-colors">
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEdit && profSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Editar Professor</h2>
              <button onClick={() => setModalEdit(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {[
                { label: "Nome completo", name: "nome", type: "text" },
                { label: "CPF", name: "cpf", type: "text" },
                { label: "Tag RFID", name: "rfid", type: "text" },
                { label: "Telefone", name: "telefone", type: "text" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={(formData as any)[field.name] || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e]"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalEdit(false)} type="button" className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#c8102e] hover:bg-[#a00d24] text-white rounded-lg py-2 text-sm font-medium transition-colors">
                  {saving ? "Salvando..." : "Atualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{modoEdicao ? "Editar Professor" : "Novo Professor"}</h2>
            <form onSubmit={handleCreateProfessor} className="space-y-4">
              {[
                { label: "Nome completo", name: "nome", type: "text" },
                { label: "CPF", name: "cpf", type: "text" },
                { label: "Tag RFID", name: "rfid", type: "text" },
                { label: "Telefone", name: "telefone", type: "text" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={(novoProfessor as any)[field.name]}
                    onChange={(e) => setNovoProfessor((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8102e]"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={handleFecharModal} type="button" className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#c8102e] hover:bg-[#a00d24] text-white rounded-lg py-2 text-sm font-medium transition-colors">
                  {saving ? "Salvando..." : (modoEdicao ? "Atualizar" : "Cadastrar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
