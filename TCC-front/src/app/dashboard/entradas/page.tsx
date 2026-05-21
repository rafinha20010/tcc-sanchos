"use client";

import { useState, useEffect, useRef } from "react";
import * as tmImage from "@teachablemachine/image";
import {
  Wifi, Camera, CreditCard, CheckCircle, XCircle,
  Clock, Activity, ShieldCheck
} from "lucide-react";
import api from "@/lib/api";

// --- CONFIGURAÇÕES DO MODELO ---
// Substitua pelo link que você gerou no Teachable Machine (Upload Model)
const URL_MODELO = "https://teachablemachine.withgoogle.com/models/SEU_ID_AQUI/";

type EntradaTipo = "RFID" | "Facial";
type EntradaStatus = "Autorizado" | "Negado";

interface Entrada {
  id: number;
  nome: string;
  turma: string;
  tipo: EntradaTipo;
  status: EntradaStatus;
  hora: string;
  avatar: string;
  local: string;
}

export default function EntradasPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [pulsar, setPulsar] = useState(false);
  const [filtro, setFiltro] = useState<"Todos" | EntradaTipo | EntradaStatus>("Todos");
  const [loading, setLoading] = useState(true);
  
  // Estados da IA
  const videoRef = useRef<HTMLVideoElement>(null);
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [lastDetected, setLastDetected] = useState("");
  const [cooldown, setCooldown] = useState(false);

  // 1. Carrega dados do backend ao montar
  useEffect(() => {
    async function fetchEntradas() {
      try {
        const response = await api.registros.hoje();
        if (response.data && Array.isArray(response.data)) {
          const entradasFormatadas = response.data.map((reg: any) => ({
            id: reg.id,
            nome: reg.aluno_nome || reg.professor_name || "Desconhecido",
            turma: reg.turma_nome || "N/A",
            tipo: (reg.tipo_identificacao === 'rfid' ? 'RFID' : 'Facial') as EntradaTipo,
            status: "Autorizado" as EntradaStatus,
            hora: new Date(reg.data_hora).toLocaleTimeString("pt-BR"),
            avatar: (reg.aluno_nome || reg.professor_name || "").substring(0, 2).toUpperCase(),
            local: "Portaria Principal"
          }));
          setEntradas(entradasFormatadas.slice(0, 10));
        }
      } catch (err) {
        console.error("Erro ao carregar entradas:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEntradas();
    const interval = setInterval(fetchEntradas, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // 2. Loop de Reconhecimento em Tempo Real
  useEffect(() => {
    let frameId: number;

    async function predictLoop() {
      if (model && videoRef.current && !cooldown) {
        const prediction = await model.predict(videoRef.current);
        const result = prediction.sort((a, b) => b.probability - a.probability)[0];

        // Se a confiança for maior que 85% e for diferente do último detectado (ou se passou tempo)
        if (result.probability > 0.85 && result.className !== "Class 4" && result.className !== lastDetected) {
          registrarEntrada(result.className);
        }
      }
      frameId = requestAnimationFrame(predictLoop);
    }

    if (model) frameId = requestAnimationFrame(predictLoop);
    return () => cancelAnimationFrame(frameId);
  }, [model, lastDetected, cooldown]);

  // 3. Função para Registrar no Log
  const registrarEntrada = (nomeDetectado: string) => {
    const now = new Date();
    const hora = now.toLocaleTimeString("pt-BR");
    
    const novaEntrada: Entrada = {
      id: Date.now(),
      nome: nomeDetectado,
      turma: nomeDetectado === "PROFESSOR" ? "DOCENTE" : "DS-3A", // Lógica simples de turma
      tipo: "Facial",
      status: "Autorizado",
      hora: hora,
      avatar: nomeDetectado.substring(0, 2).toUpperCase(),
      local: "Portaria Principal"
    };

    setEntradas((prev) => [novaEntrada, ...prev.slice(0, 9)]);
    setLastDetected(nomeDetectado);
    setPulsar(true);
    setCooldown(true);

    // Evita registrar a mesma pessoa 50 vezes seguida
    setTimeout(() => setPulsar(false), 1000);
    setTimeout(() => setCooldown(false), 5000); // 5 segundos para poder detectar a mesma pessoa de novo
  };

  const filtradas = entradas.filter((e) => {
    if (filtro === "Todos") return true;
    return e.tipo === filtro || e.status === filtro;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Topo com Monitoramento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel da Câmera Logitech C270 */}
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="text-[#c8102e]" size={20} />
              <h2 className="font-bold text-gray-800">Monitoramento ao Vivo</h2>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-700 uppercase">IA Ativa</span>
            </div>
          </div>
          
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-4 border-gray-100">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs">
              Logitech C270 HD
            </div>
            {pulsar && (
               <div className="absolute inset-0 border-8 border-green-500 animate-in fade-in zoom-in duration-300 flex items-center justify-center">
                  <div className="bg-green-500 text-white px-6 py-2 rounded-full font-black text-xl shadow-xl">
                    ACESSO LIBERADO
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Status Rápido */}
        <div className="space-y-4">
          <div className="bg-[#c8102e] p-6 rounded-2xl text-white shadow-lg shadow-red-100">
            <ShieldCheck size={32} className="mb-2 opacity-80" />
            <p className="text-sm opacity-90">Último Acesso:</p>
            <h3 className="text-2xl font-black">{lastDetected || "Aguardando..."}</h3>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Total de Acessos</span>
              <Activity size={16} className="text-blue-500" />
            </div>
            <p className="text-4xl font-black text-gray-900">{entradas.length}</p>
          </div>
        </div>
      </div>

      {/* Tabela de Logs (Seu Design Original Integrado) */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#c8102e] rounded-full" />
            <h2 className="font-bold text-gray-800">Histórico Recente</h2>
          </div>
          <div className="flex gap-2">
            {(["Todos", "Facial", "Autorizado"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`text-xs px-4 py-2 rounded-xl font-bold transition-all ${
                  filtro === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Aluno", "Local", "Método", "Status", "Horário"].map((col) => (
                  <th key={col} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                    {loading ? "Carregando entradas..." : "Nenhum movimento detectado pela câmera ainda..."}
                  </td>
                </tr>
              ) : (
                filtradas.map((entrada) => (
                  <tr key={entrada.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xs font-black">
                          {entrada.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{entrada.nome}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{entrada.turma}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{entrada.local}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-lg w-fit">
                        <Camera size={12} /> {entrada.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-lg w-fit">
                        <CheckCircle size={12} /> {entrada.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">{entrada.hora}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}