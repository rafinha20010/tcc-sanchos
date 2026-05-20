# SENAI Monitor — Backend API

Backend completo para o sistema de controle de acesso escolar com RFID e reconhecimento facial.

---

## 🚀 Como Rodar

### 1. Instale as dependências
```bash
cd senai-backend
npm install
```

### 2. Configure o banco de dados
Execute o SQL do seu projeto no MySQL Workbench para criar o schema `facialtcc`.

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com seus dados do MySQL
```

Preencha no `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA_DO_MYSQL
DB_NAME=facialtcc
JWT_SECRET=qualquer_string_aleatoria_longa
```

### 4. Popule o banco com dados de teste (opcional)
```bash
npm run seed
```

### 5. Inicie o servidor
```bash
# Desenvolvimento (reinicia automaticamente ao salvar)
npm run dev

# Produção
npm start
```

O servidor roda em: **http://localhost:3001**

---

## 🔐 Login Padrão
| Campo | Valor |
|-------|-------|
| E-mail | `admin@senai.br` |
| Senha | `admin123` |

---

## 📡 Rotas da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Faz login, retorna token JWT |
| GET | `/api/auth/me` | Verifica token atual |

### Alunos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/alunos` | Lista todos (filtros: `busca`, `turma_id`) |
| GET | `/api/alunos/:id` | Busca um aluno |
| POST | `/api/alunos` | Cadastra novo aluno |
| PUT | `/api/alunos/:id` | Atualiza aluno |
| DELETE | `/api/alunos/:id` | Remove aluno |
| POST | `/api/alunos/verificar-rfid` | Verifica se RFID está disponível |

### Professores
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/professores` | Lista todos |
| POST | `/api/professores` | Cadastra professor |
| PUT | `/api/professores/:id` | Atualiza |
| DELETE | `/api/professores/:id` | Remove |

### Turmas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/turmas` | Lista com contagem de alunos |
| POST | `/api/turmas` | Cria turma |
| DELETE | `/api/turmas/:id` | Remove (só se vazia) |

### Registros de Acesso
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/registros` | Histórico completo com filtros e paginação |
| GET | `/api/registros/hoje` | Entradas de hoje + estatísticas |
| GET | `/api/registros/stats` | Dados para gráficos |
| POST | `/api/registros/rfid` | **Leitor RFID** registra entrada |
| POST | `/api/registros/facial` | **Câmera/IA** registra entrada |

### Upload de Fotos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/upload/foto-base64` | Salva foto da webcam (base64) |

---

## 🔗 Integração com o Frontend

Copie o arquivo `src/lib/api.ts` para dentro do seu projeto Next.js em `src/lib/api.ts`.

Adicione no `.env.local` do Next.js:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Exemplo de uso no frontend:

```typescript
import api from "@/lib/api";

// Login
const { token, usuario } = await api.auth.login("admin@senai.br", "admin123");

// Listar alunos
const { data: alunos } = await api.alunos.listar({ busca: "João" });

// Cadastrar aluno com foto da webcam
const { data: foto } = await api.upload.fotoBase64(imagemBase64);
await api.alunos.criar({ ...dadosAluno, foto: foto.filename });

// Registrar entrada por RFID
await api.registros.rfid("A23F91", "entrada");

// Registrar via reconhecimento facial (após detectar com Teachable Machine)
await api.registros.facial("João da Silva", 0.92);

// Dashboard - stats
const { data: stats } = await api.registros.stats();
```

---

## 📁 Estrutura do Projeto

```
senai-backend/
├── src/
│   ├── server.js              ← Ponto de entrada
│   ├── config/
│   │   ├── database.js        ← Conexão MySQL
│   │   └── seed.js            ← Dados de teste
│   ├── middleware/
│   │   └── auth.js            ← Verificação JWT
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── alunosController.js
│   │   ├── professoresController.js
│   │   ├── turmasController.js
│   │   ├── registrosController.js
│   │   └── uploadController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── alunos.js
│   │   ├── professores.js
│   │   ├── turmas.js
│   │   ├── registros.js
│   │   └── upload.js
│   └── lib/
│       └── api.ts             ← Copiar para o frontend
├── uploads/                   ← Fotos salvas aqui
├── .env.example
├── package.json
└── README.md
```
