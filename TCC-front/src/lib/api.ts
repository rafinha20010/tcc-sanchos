const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export function getFotoUrl(fotoPath: string | undefined | null): string | null {
  if (!fotoPath) return null;
  const path = String(fotoPath).trim();
  if (!path) return null;
  // Se já tem protocolo, retorna como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Constrói a URL completa
  return `http://localhost:3001/${path}`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("senai_token");
}

function headers(isJson = true): HeadersInit {
  const token = getToken();
  return {
    ...(isJson && { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}, isJson = true): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers(isJson),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Erro ${response.status}`);
  }

  return data;
}

export const auth = {
  login: async (email: string, senha: string) => {
    const response = await request<{ success: boolean; token: string; usuario: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });

    if (response.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("senai_token", response.token);
      }
    }

    return response;
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("senai_token");
    }
  },
  atualizar: (dados: { email?: string; nome?: string; senha?: string }) =>
    request<{ success: boolean; message: string; data?: any }>(
      "/auth",
      { method: "PUT", body: JSON.stringify(dados) }
    ),
};

export const alunos = {
  listar: (params?: { busca?: string; turma_id?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return request<{ success: boolean; total: number; data: any[] }>(`/alunos${query}`);
  },
  criar: (aluno: {
    nome: string;
    cpf: string;
    matricula: string;
    rfid: string;
    telefone: string;
    nome_responsavel: string;
    turmas_id: number;
    foto: string;
  }) =>
    request<{ success: boolean; data: any }>("/alunos", {
      method: "POST",
      body: JSON.stringify(aluno),
    }),
  atualizar: (id: number, aluno: any) =>
    request<{ success: boolean; data: any }>(`/alunos/${id}`, {
      method: "PUT",
      body: JSON.stringify(aluno),
    }),
  remover: (id: number) =>
    request<{ success: boolean }>(`/alunos/${id}`, {
      method: "DELETE",
    }),
};

export const professores = {
  listar: (busca?: string) => {
    const query = busca ? `?busca=${encodeURIComponent(busca)}` : "";
    return request<{ success: boolean; data: any[] }>(`/professores${query}`);
  },
  criar: (professor: { nome: string; cpf: string; rfid: string; telefone: string }) =>
    request("/professores", {
      method: "POST",
      body: JSON.stringify(professor),
    }),
  atualizar: (id: number, professor: { nome: string; cpf: string; rfid: string; telefone: string }) =>
    request(`/professores/${id}`, {
      method: "PUT",
      body: JSON.stringify(professor),
    }),
  remover: (id: number) =>
    request(`/professores/${id}`, {
      method: "DELETE",
    }),
};

export const upload = {
  fotoBase64: (imagem_base64: string, prefixo: string = "aluno") =>
    request<{ success: boolean; data: { filename: string; url: string } }>("/upload/foto-base64", {
      method: "POST",
      body: JSON.stringify({ imagem_base64, prefixo }),
    }),
  foto: (file: File) => {
    const formData = new FormData();
    formData.append("foto", file);
    return request<{ success: boolean; data: { filename: string; url: string } }>("/upload/foto", {
      method: "POST",
      body: formData,
    }, false);
  },
};

export const turmas = {
  listar: () => request<{ success: boolean; data: any[] }>("/turmas"),
  criar: (nome: string) =>
    request("/turmas", {
      method: "POST",
      body: JSON.stringify({ nome }),
    }),
  atualizar: (id: number, nome: string) =>
    request(`/turmas/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nome }),
    }),
  atualizarProfessores: (id: number, professores_ids: number[]) =>
    request(`/turmas/${id}/professores`, {
      method: "POST",
      body: JSON.stringify({ professores_ids }),
    }),
  remover: (id: number) =>
    request(`/turmas/${id}`, {
      method: "DELETE",
    }),
};

export const registros = {
  listar: () => request<{ success: boolean; data: any[] }>("/registros"),
  hoje: () => request<{ success: boolean; data: any[] }>("/registros/hoje"),
  stats: () => request<{ success: boolean; data: any }>("/registros/stats"),
};

const api = { auth, alunos, professores, upload, turmas, registros };
export default api;
