// src/lib/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Serviço de comunicação com o backend SENAI Monitor
// Coloque este arquivo em: senai-monitor/src/lib/api.ts
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Pega o token salvo no localStorage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("senai_token");
}

// Headers padrão com autenticação
function headers(isFormData = false): HeadersInit {
  const token = getToken();
  const h: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isFormData && { "Content-Type": "application/json" }),
  };
  return h;
}

// Wrapper para fetch com tratamento de erros
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Erro ${response.status}`);
  }

  return data;
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const auth = {
  login: async (email: string, senha: string) => {
    const data = await request<{ success: boolean; token: string; usuario: any }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, senha }) }
    );
    // Salva o token no localStorage
    if (data.token) {
      localStorage.setItem("senai_token", data.token);
      localStorage.setItem("senai_usuario", JSON.stringify(data.usuario));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem("senai_token");
    localStorage.removeItem("senai_usuario");
  },

  me: () => request("/auth/me"),

  isLoggedIn: () => !!getToken(),

  getUsuario: () => {
    const u = localStorage.getItem("senai_usuario");
    return u ? JSON.parse(u) : null;
  },
};

// ─── ALUNOS ──────────────────────────────────────────────────────────────────

export const alunos = {
  listar: (params?: { busca?: string; turma_id?: number }) => {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return request<{ success: boolean; total: number; data: any[] }>(`/alunos${query}`);
  },

  buscarPorId: (id: number) =>
    request<{ success: boolean; data: any }>(`/alunos/${id}`),

  criar: (aluno: {
    nome: string;
    cpf: string;
    matricula: string;
    rfid: string;
    telefone: string;
    nome_responsavel: string;
    turmas_id: number;
    foto?: string;
  }) =>
    request("/alunos", {
      method: "POST",
      body: JSON.stringify(aluno),
    }),

  atualizar: (id: number, dados: Partial<any>) =>
    request(`/alunos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),

  remover: (id: number) =>
    request(`/alunos/${id}`, { method: "DELETE" }),

  verificarRfid: (rfid: string, excluir_id?: number) =>
    request<{ disponivel: boolean; vinculado_a: string | null }>("/alunos/verificar-rfid", {
      method: "POST",
      body: JSON.stringify({ rfid, excluir_id }),
    }),
};

// ─── PROFESSORES ─────────────────────────────────────────────────────────────

export const professores = {
  listar: (busca?: string) => {
    const query = busca ? `?busca=${busca}` : "";
    return request<{ success: boolean; data: any[] }>(`/professores${query}`);
  },

  criar: (professor: {
    nome: string;
    cpf: string;
    rfid: string;
    telefone: string;
    foto?: string;
  }) =>
    request("/professores", {
      method: "POST",
      body: JSON.stringify(professor),
    }),

  atualizar: (id: number, dados: Partial<any>) =>
    request(`/professores/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),

  remover: (id: number) =>
    request(`/professores/${id}`, { method: "DELETE" }),
};

// ─── TURMAS ──────────────────────────────────────────────────────────────────

export const turmas = {
  listar: () =>
    request<{ success: boolean; data: any[] }>("/turmas"),

  criar: (nome: string) =>
    request("/turmas", {
      method: "POST",
      body: JSON.stringify({ nome }),
    }),

  remover: (id: number) =>
    request(`/turmas/${id}`, { method: "DELETE" }),
};

// ─── REGISTROS DE ACESSO ─────────────────────────────────────────────────────

export const registros = {
  listar: (params?: {
    busca?: string;
    tipo_identificacao?: "rfid" | "facial";
    tipo_acesso?: "entrada" | "saida";
    data_inicio?: string;
    data_fim?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return request<{
      success: boolean;
      total: number;
      total_paginas: number;
      data: any[];
    }>(`/registros${query}`);
  },

  hoje: () =>
    request<{ success: boolean; data: any[]; stats: any }>("/registros/hoje"),

  stats: () =>
    request<{ success: boolean; data: any }>("/registros/stats"),

  // Para registrar acesso via RFID (hardware)
  rfid: (rfid: string, tipo_acesso: "entrada" | "saida" = "entrada") =>
    request("/registros/rfid", {
      method: "POST",
      body: JSON.stringify({ rfid, tipo_acesso }),
    }),

  // Para registrar acesso via reconhecimento facial (câmera + IA)
  facial: (nome_detectado: string, confianca?: number) =>
    request("/registros/facial", {
      method: "POST",
      body: JSON.stringify({ nome_detectado, confianca }),
    }),
};

// ─── UPLOAD DE FOTOS ─────────────────────────────────────────────────────────

export const upload = {
  // Envia foto capturada pela webcam (base64)
  fotoBase64: (imagem_base64: string, prefixo = "aluno") =>
    request<{ success: boolean; data: { filename: string; url: string } }>(
      "/upload/foto-base64",
      {
        method: "POST",
        body: JSON.stringify({ imagem_base64, prefixo }),
      }
    ),
};

// Export default com todos os serviços
const api = { auth, alunos, professores, turmas, registros, upload };
export default api;
