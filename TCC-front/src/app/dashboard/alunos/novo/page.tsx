"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Wifi, Camera, User, BookOpen } from "lucide-react";
import api from "@/lib/api";

export default function NovoAlunoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rfidScanning, setRfidScanning] = useState(false);
  const [rfidValue, setRfidValue] = useState("");
  const [turmas, setTurmas] = useState<{ id: number; nome: string }[]>([]);
  const [error, setError] = useState("");

  // --- ESTADOS PARA A CÂMERA ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    turma: "",
    curso: "",
    ra: "",
    responsavel: "",
    telefoneResponsavel: "",
    observacoes: "",
  });

  useEffect(() => {
    async function loadTurmas() {
      try {
        const response = await api.turmas.listar();
        setTurmas(response.data || []);
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      }
    }

    loadTurmas();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCapturedImage(objectUrl);
    }
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
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraOn(true);
        };
      } else {
        setCameraOn(true);
      }
    } catch (error) {
      alert("Erro ao acessar a Logitech C270. Verifique a conexão.");
      console.error(error);
    }
  }

  // --- CAPTURAR FOTO (Para registro visual) ---
  function capturePhoto() {
    if (!videoRef.current) {
      alert("Não foi possível capturar a imagem. Verifique se a câmera está ativada e tente novamente.");
      return;
    }

    const width = videoRef.current.videoWidth || 1280;
    const height = videoRef.current.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      alert("Erro ao capturar a imagem. Tente novamente.");
      return;
    }

    ctx.drawImage(videoRef.current, 0, 0, width, height);
    const base64 = canvas.toDataURL("image/jpeg");

    if (!base64.startsWith("data:image/")) {
      alert("A imagem capturada não está em um formato válido.");
      return;
    }

    setSelectedFile(null);
    setCapturedImage(base64);
  }

  // --- SALVAR ALUNO (Simulação sem Python) ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!capturedImage && !selectedFile) {
      alert("Por favor, envie ou tire uma foto do aluno para o registro.");
      return;
    }

    if (!rfidValue) {
      alert("Por favor, vincule uma tag RFID ao aluno.");
      return;
    }

    if (!form.nome || !form.cpf || !form.ra || !form.telefone || !form.responsavel || !form.turma) {
      alert("Preencha todos os campos obrigatórios para cadastrar o aluno.");
      return;
    }

    setSaving(true);

    try {
      let uploadResponse;

      if (selectedFile) {
        uploadResponse = await api.upload.foto(selectedFile);
      } else {
        if (!capturedImage || !capturedImage.startsWith("data:image/")) {
          throw new Error("Imagem capturada inválida. Por favor, tire a foto novamente.");
        }
        uploadResponse = await api.upload.fotoBase64(capturedImage);
      }

      const fotoFilename = uploadResponse.data.filename;

      await api.alunos.criar({
        nome: form.nome,
        cpf: form.cpf,
        matricula: form.ra,
        rfid: rfidValue,
        telefone: form.telefone,
        nome_responsavel: form.responsavel,
        turmas_id: Number(form.turma),
        foto: fotoFilename,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/alunos");
      }, 1500);
    } catch (err: any) {
      console.error("Erro ao cadastrar aluno:", err);
      setError(err?.message || "Erro ao cadastrar aluno. Tente novamente.");
    } finally {
      setSaving(false);
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
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome completo *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Ex: João da Silva" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/10 focus:border-[#c8102e] transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CPF *</label>
              <input name="cpf" value={form.cpf} onChange={handleChange} required placeholder="000.000.000-00" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone *</label>
              <input name="telefone" value={form.telefone} onChange={handleChange} required placeholder="(11) 99999-9999" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Responsável *</label>
              <input name="responsavel" value={form.responsavel} onChange={handleChange} required placeholder="Ex: Maria Silva" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RA do Aluno *</label>
              <input name="ra" value={form.ra} onChange={handleChange} required placeholder="Ex: 123456" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Curso *</label>
              <select name="curso" value={form.curso} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e] bg-white">
                <option value="">Selecionar Curso</option>
                <option value="DS">Desenv de Sistemas</option>
                <option value="RD">Eletrônica</option>
                <option value="MC">Mecânica</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turma *</label>
              <select name="turma" value={form.turma} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8102e] bg-white">
                <option value="">Selecionar Turma</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
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
                {cameraOn ? (
                  <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline />
                ) : (
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
              <div className="mt-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ou faça upload de uma foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {selectedFile && (
                  <p className="mt-2 text-xs text-gray-500">Arquivo selecionado: {selectedFile.name}</p>
                )}
              </div>
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