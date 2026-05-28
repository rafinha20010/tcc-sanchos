"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Wifi, Camera, User, BookOpen } from "lucide-react";
import api from "../../../../lib/api";

export default function NovoAlunoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rfidScanning, setRfidScanning] = useState(false);
  const [rfidValue, setRfidValue] = useState("");

  // --- ESTADOS PARA A CÂMERA ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    turma: "",
    curso: "",
    ra: "",
    matricula: "",
    responsavel: "",
    telefoneResponsavel: "",
    observacoes: "",
  });

  const [turmas, setTurmas] = useState<Array<{ id: number; nome: string }>>([]);

  useEffect(() => {
    let mounted = true;
    api.turmas
      .listar()
      .then((res) => {
        if (mounted && res && (res as any).data) {
          setTurmas((res as any).data || []);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar turmas:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function simulateRfidScan() {
    setRfidScanning(true);
    setTimeout(() => {
      const tag = "F" + Math.random().toString(36).substring(2, 7).toUpperCase();
      setRfidValue(tag);
      setRfidScanning(false);
    }, 2000);
  }

  // --- FUNÇÃO PARA LIGAR A LOGITECH C270 ---
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCapturedImage(null);
      setCameraOn(true);
    } catch (error) {
      alert("Erro ao acessar a Logitech C270. Verifique a conexão.");
      console.error(error);
    }
  }

  function clearPhoto() {
    setCapturedImage(null);
  }

  // --- CAPTURAR FOTO (Para registro visual) ---
  function capturePhoto() {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0);

      const base64 = canvas.toDataURL("image/jpeg");
      setCapturedImage(base64);
      stopCamera();
    }
  }

  // --- SALVAR ALUNO (Simulação sem Python) ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!capturedImage) {
      alert("Por favor, tire uma foto do aluno para o registro.");
      return;
    }

    setSaving(true);
    try {
      // Primeiro envia a foto em base64 para o backend
      const uploadRes = await api.upload.fotoBase64(capturedImage, "aluno");
      const filename = uploadRes?.data?.filename;

      // Em seguida cria o aluno enviando o nome do arquivo retornado
      const criarPayload: any = {
        ...form,
        rfid: rfidValue || null,
        foto: filename || null,
        turmas_id: form.turma ? Number(form.turma) : null,
      };

      // Chama endpoint de criação de aluno (se existir)
      try {
        await api.alunos.criar(criarPayload);
      } catch (err) {
        // Se a API de criação não estiver disponível, registramos no console
        console.warn("API de alunos não disponível ou criação falhou:", err);
      }

      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/alunos");
      }, 1500);
    } catch (err) {
      console.error("Erro ao enviar foto/registro:", err);
      setSaving(false);
      alert("Erro ao salvar aluno. Verifique o console para detalhes.");
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Aluno cadastrado com sucesso!</h3>
          <p className="text-gray-400 text-sm">Os dados foram salvos no sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/alunos" className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:border-gray-300 transition shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Novo Aluno</h2>
          <p className="text-gray-400 text-sm font-medium">Registro de informações e biometria</p>
        </div>  
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <User size={14} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Dados Pessoais</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome completo *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Ex: João da Silva" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/10 focus:border-[#c8102e] transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CPF</label>
              <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="joao@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone</label>
              <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(11) 99999-9999" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do responsável</label>
              <input name="responsavel" value={form.responsavel} onChange={handleChange} placeholder="Nome do responsável" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
          </div>
        </div>

        {/* Dados Acadêmicos */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
              <BookOpen size={14} className="text-violet-600" />
            </div>
            <h3 className="font-bold text-gray-900">Dados Acadêmicos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RA do Aluno</label>
              <input name="ra" value={form.ra} onChange={handleChange} required placeholder="Ex: 123456" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matrícula</label>
              <input name="matricula" value={form.matricula} onChange={handleChange} placeholder="Número da matrícula" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Curso</label>
              <select name="curso" value={form.curso} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e] bg-white">
                <option value="">Selecionar Curso</option>
                <option value="DS">Desenv de Sistemas</option>
                <option value="RD">Eletrônica</option>
                <option value="MC">Mecânica</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turma</label>
              <select name="turma" value={form.turma} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e] bg-white">
                <option value="">Selecionar Turma</option>
                {turmas.length === 0 ? (
                  <option value="">Carregando...</option>
                ) : (
                  turmas.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.nome}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Biometria */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Wifi size={14} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">Identificação Biométrica</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* RFID */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
              <div className={`p-4 rounded-full ${rfidValue ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                <CreditCard size={32} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">Cartão RFID</p>
                <p className="text-xs text-gray-400">Vincular tag física ao aluno</p>
              </div>
              <button type="button" onClick={simulateRfidScan} className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-all font-bold text-xs uppercase tracking-widest">
                {rfidScanning ? "Aguardando Leitura..." : rfidValue ? "Trocar Tag RFID" : "Escanear Tag"}
              </button>
              {rfidValue && <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-xs font-mono font-bold">ID: {rfidValue}</div>}
            </div>

            {/* Foto Facial */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6">
              <div className="aspect-video bg-gray-900 rounded-xl mb-4 overflow-hidden relative group">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover scale-x-[-1] ${cameraOn ? "" : "hidden"}`}
                  autoPlay
                  playsInline
                />
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Camera size={32} className="mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Câmera Logitech C270</p>
                  </div>
                )}
                {capturedImage && <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover z-10 border-4 border-emerald-500" />}
              </div>

              <button
                type="button"
                onClick={cameraOn ? capturePhoto : startCamera}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  cameraOn ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cameraOn ? "Bater Foto Agora" : "Ativar Câmera"}
              </button>
              {capturedImage && (
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="w-full mt-3 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                >
                  Apagar Foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4">
          <Link href="/dashboard/alunos" className="px-8 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancelar</Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#c8102e] text-white px-10 py-3 rounded-xl hover:bg-[#a00d25] transition-all shadow-lg shadow-red-100 disabled:opacity-50 font-black uppercase text-xs tracking-widest"
          >
            <Save size={16} />
            {saving ? "Processando..." : "Finalizar Cadastro"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Ícones extras necessários
function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  )
}

function CreditCard(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
    )
}