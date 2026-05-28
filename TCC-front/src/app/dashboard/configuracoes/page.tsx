"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Wifi,
  Camera,
  Bell,
  Shield,
  Database,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import api from "../../../lib/api";

export default function ConfiguracoesPage() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    nomeEscola: "SENAI Marília",
    emailAdmin: "admin@sp.senai.br",
    rfidAtivo: true,
    facialAtivo: true,
    notifEntrada: true,
    notifNegado: true,
    notifEmail: false,
    confiancaFacial: 85,
    backupAuto: true,
    retencaoDados: "365",
  });

  // Load config from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("senai_config");
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading config:", e);
        }
      }
    }
  }, []);

  const handleSave = () => {
    // Persist local app config
    if (typeof window !== "undefined") {
      localStorage.setItem("senai_config", JSON.stringify(config));
    }

    // If admin email changed, call backend to update the login email
    try {
      const usuario = typeof window !== "undefined" ? localStorage.getItem("senai_usuario") : null;
      const currentEmail = usuario ? JSON.parse(usuario).email : null;

      if (config.emailAdmin && config.emailAdmin !== currentEmail) {
        api.auth.atualizar({ email: config.emailAdmin })
          .then(() => {
            // Update stored usuario so UI reflects new email
            if (typeof window !== "undefined") {
              const u = localStorage.getItem("senai_usuario");
              if (u) {
                const parsed = JSON.parse(u);
                parsed.email = config.emailAdmin;
                localStorage.setItem("senai_usuario", JSON.stringify(parsed));
              }
            }
          })
          .catch((err: unknown) => {
            console.error("Erro ao atualizar email admin:", err);
          });
      }
    } catch (err) {
      console.error("Erro ao sincronizar email:", err);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key: keyof typeof config) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition ${
        on ? "bg-[#c8102e]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configurações
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gerencie as preferências do sistema
          </p>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
            saved
              ? "bg-green-500 text-white"
              : "bg-[#c8102e] hover:bg-[#a00d24] text-white"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </button>

      </div>

      {/* INFORMAÇÕES GERAIS */}

      <div className="bg-white border border-gray-200 rounded-2xl">

        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#c8102e]" />
            Informações Gerais
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Nome da Unidade
            </label>

            <input
              type="text"
              value={config.nomeEscola}
              onChange={(e) =>
                setConfig({ ...config, nomeEscola: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8102e]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              E-mail do Administrador
            </label>

            <input
              type="email"
              value={config.emailAdmin}
              onChange={(e) =>
                setConfig({ ...config, emailAdmin: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8102e]"
            />
          </div>

        </div>
      </div>

      {/* DISPOSITIVOS */}

      <div className="bg-white border border-gray-200 rounded-2xl">

        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#c8102e]" />
            Dispositivos
          </h2>
        </div>

        <div className="p-6 space-y-5">

          {[
            {
              label: "Leitores RFID",
              desc: "Ativar identificação por cartão RFID",
              key: "rfidAtivo" as const,
            },
            {
              label: "Câmeras de Reconhecimento Facial",
              desc: "Ativar identificação biométrica por câmera",
              key: "facialAtivo" as const,
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-800">
                  {item.label}
                </p>

                <p className="text-xs text-gray-400">
                  {item.desc}
                </p>
              </div>

              <Toggle
                on={config[item.key] as boolean}
                onClick={() => toggle(item.key)}
              />

            </div>
          ))}

          <div>

            <label className="text-sm font-medium text-gray-700 block mb-1">
              Confiança mínima — Reconhecimento Facial:{" "}
              <span className="text-[#c8102e]">
                {config.confiancaFacial}%
              </span>
            </label>

            <input
              type="range"
              min={60}
              max={99}
              value={config.confiancaFacial}
              onChange={(e) =>
                setConfig({
                  ...config,
                  confiancaFacial: Number(e.target.value),
                })
              }
              className="w-full accent-[#c8102e]"
            />

            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>60% (menos restrito)</span>
              <span>99% (mais restrito)</span>
            </div>

          </div>

        </div>
      </div>

      {/* DADOS E BACKUP */}

      <div className="bg-white border border-gray-200 rounded-2xl">

        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#c8102e]" />
            Dados e Backup
          </h2>
        </div>

        <div className="p-6 space-y-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-800">
                Backup automático
              </p>

              <p className="text-xs text-gray-400">
                Backup diário do sistema
              </p>
            </div>

            <Toggle
              on={config.backupAuto}
              onClick={() => toggle("backupAuto")}
            />

          </div>

          <div>

            <label className="text-sm font-medium text-gray-700 block mb-1">
              Retenção de dados
            </label>

            <select
              value={config.retencaoDados}
              onChange={(e) =>
                setConfig({ ...config, retencaoDados: e.target.value })
              }
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white"
            >
              <option value="90">90 dias</option>
              <option value="180">180 dias</option>
              <option value="365">365 dias</option>
              <option value="730">730 dias</option>
            </select>

          </div>

          <div className="flex gap-3 pt-2">

            <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              Fazer Backup
            </button>

            <button className="flex items-center gap-2 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              <Database className="w-4 h-4" />
              Limpar Dados
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}