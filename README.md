# TechX Task Manager

Um gerenciador de tarefas (to-do list) full-stack desenvolvido em Node.js, TypeScript, Express, Angular e MySQL com MongoDB para extras opcionais.

## O Projeto

O **TechX Task Manager** é uma aplicação web para gerenciar tarefas do dia a dia com autenticação por JWT e armazenamento de metadados em MongoDB. A aplicação implementa tanto os recursos obrigatórios (API REST completa com CRUD e interface Angular) quanto os extras opcionais (autenticação com JWT e integração com MongoDB).

**Stack:** Node.js, TypeScript, Express 5, TypeORM, MySQL 8, MongoDB, Angular 21, Angular Material, Docker Compose

### Arquitetura

O projeto segue uma arquitetura de três camadas no backend: **Router → Controller → Service → Repository**. Os Controllers são finos (delegam a lógica para os Services). Os Services contêm toda a lógica de negócio e acesso a dados.

**Design Dual-DB:** MySQL via TypeORM é a fonte de verdade para todos os dados de tarefas. MongoDB armazena metadados de `activityLog` por tarefa (entries de criação/atualização/exclusão/toggle). MongoDB é **opcional** — o servidor inicia e funciona normalmente sem ela; o `activityLog` apenas fica vazio nesse caso.

No frontend, Angular 21 utiliza **componentes standalone com state baseado em signals** (change detection OnPush). Angular Router protege a rota `/tasks`. Um `HttpInterceptor` funcional anexa automaticamente o JWT a cada requisição à API.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 20+** (verificar: `node --version`)
- **npm 10+** (verificar: `npm --version`)
- **Docker e Docker Compose** (verificar: `docker --version` e `docker compose --version`)
- **Angular CLI 21** (instalar globalmente: `npm install -g @angular/cli@21`)

---

## Instalação e Configuração

Siga os passos abaixo para clonar o repositório, configurar as variáveis de ambiente, subir os containers e iniciar tanto o backend quanto o frontend.

### Passo 1 — Clone o repositório

```bash
git clone <URL-do-repositorio>
cd desafio-essentia-tecnologies
```

### Passo 2 — Configure as variáveis de ambiente do backend

Copie o arquivo de exemplo para `.env`:

```bash
cp backend/.env.example backend/.env
```

Abra `backend/.env` com seu editor de texto favorito e preencha as variáveis conforme necessário. Os valores padrão abaixo já funcionam com o `docker-compose.yml`:

| Variável | Obrigatória | Padrão | Descrição |
|----------|:-----------:|--------|-----------|
| PORT | Não | 3000 | Porta HTTP do servidor backend |
| DB_HOST | Não | localhost | Host do MySQL |
| DB_PORT | Não | 3306 | Porta do MySQL |
| **DB_USER** | **Sim** | — | Usuário do MySQL (use: `appuser`) |
| **DB_PASS** | **Sim** | — | Senha do MySQL (use: `secret`) |
| **DB_NAME** | **Sim** | — | Nome do banco de dados (use: `techx_tasks`) |
| **JWT_SECRET** | **Sim** | — | Chave secreta para assinar JWT (gerar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| JWT_EXPIRES_IN | Não | 24h | Tempo de expiração do token |
| MONGO_URI | Não | mongodb://localhost:27017/techx_tasks | URI de conexão MongoDB (opcional; servidor funciona sem ela) |

**Exemplo de `.env` para desenvolvimento local:**

```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

DB_HOST=localhost
DB_PORT=3306
DB_USER=appuser
DB_PASS=secret
DB_NAME=techx_tasks

MONGO_URI=mongodb://localhost:27017/techx_tasks

JWT_SECRET=sua_chave_secreta_muito_longa_aqui_com_muitos_caracteres
JWT_EXPIRES_IN=24h
```

### Passo 3 — Suba os containers do Docker

```bash
docker compose up -d
```

Este comando inicia:
- **MySQL 8.4** (container: `techx_mysql`, porta 3306)
- **MongoDB 7.0** (container: `techx_mongo`, porta 27017)

Os containers serão automaticamente aguardados/verificados antes de prosseguir.

### Passo 4 — Instale as dependências do backend

Em um novo terminal (ou no mesmo, com as containers rodando), navegue até o diretório do backend:

```bash
cd backend
npm install
```

### Passo 5 — Execute as migrações do banco de dados

As migrações criam as tabelas `users` e `tasks` no MySQL:

```bash
npm run migration:run
```

Se precisar gerar uma nova migração após alterar uma entidade, execute:

```bash
npm run migration:generate -- src/migrations/MeuNomeMigracao
```

### Passo 6 — Inicie o servidor backend

```bash
npm run dev
```

O servidor backend estará disponível em:

```
http://localhost:3000/api/v1
```

Você verá no terminal:
```
[DB] MySQL connected via TypeORM
[DB] MongoDB connected     (ou "[DB] MongoDB unavailable — activity log features disabled")
[Server] Listening on http://localhost:3000
[Server] API base: http://localhost:3000/api/v1
```

### Passo 7 — Em um novo terminal, instale as dependências do frontend

```bash
cd frontend
npm install
```

### Passo 8 — Inicie o servidor Angular

```bash
ng serve
```

A aplicação estará disponível em:

```
http://localhost:4200
```

Abra seu navegador e veja a página de login. Você pode se registrar com qualquer email/senha e começar a criar tarefas.

---

## Variáveis de Ambiente do Frontend

O frontend lê as variáveis de ambiente de:

- **Development:** `frontend/src/environments/environment.development.ts`
- **Production:** `frontend/src/environments/environment.ts`

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `apiUrl` | http://localhost:3000/api/v1 | URL base da API backend. Altere se o backend rodar em outra porta. |

Se mudar a porta do backend, edite o arquivo de environment correspondente e atualize a URL.

---

## Endpoints da API

A API está prefixada em `/api/v1`. Existem 2 endpoints públicos (autenticação) e 6 endpoints protegidos (tarefas).

### Autenticação (Público)

| Método | Caminho | Auth | Descrição |
|--------|---------|:----:|-----------|
| POST | /api/v1/auth/register | — | Registra novo usuário (requer `email` e `password`) |
| POST | /api/v1/auth/login | — | Autentica usuário e retorna token JWT |

**Resposta do login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Armazene este token. Todos os endpoints protegidos requerem o header:
```
Authorization: Bearer <token>
```

### Tarefas (Protegido por JWT)

| Método | Caminho | Auth | Descrição |
|--------|---------|:----:|-----------|
| GET | /api/v1/tasks | ✓ | Lista todas as tarefas do usuário autenticado |
| POST | /api/v1/tasks | ✓ | Cria nova tarefa (requer `title`; `description`, `priority`, `dueDate` são opcionais) |
| GET | /api/v1/tasks/:id | ✓ | Busca tarefa por ID (apenas se pertence ao usuário autenticado) |
| PUT | /api/v1/tasks/:id | ✓ | Atualiza tarefa completa |
| PATCH | /api/v1/tasks/:id/toggle | ✓ | Alterna o status de conclusão (completed: true/false) |
| DELETE | /api/v1/tasks/:id | ✓ | Remove tarefa (soft delete) |

**Exemplo: Criar tarefa com curl:**

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "title": "Comprar leite",
    "description": "Leite integral 1L no supermercado",
    "priority": 1,
    "dueDate": "2026-05-15"
  }'
```

---

## Fluxo de Autenticação

1. **Registre um novo usuário:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com.br",
    "password": "senha123"
  }'
```

2. **Faça login para obter um JWT:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com.br",
    "password": "senha123"
  }'
```

Você receberá um token JWT. Copie-o e use em todas as requisições protegidas:

```bash
curl -X GET http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

3. **No frontend (Angular):** O `HttpInterceptor` funcional anexa automaticamente o token a todas as requisições. Você não precisa fazer nada — apenas faça login e a autenticação é transparente.

---

## Comandos Úteis

### Backend

```bash
cd backend

npm install              # Instalar dependências
npm run dev             # Iniciar com ts-node-dev (hot reload)
npm run build           # Compilar TypeScript para dist/
npm run start           # Rodar o código compilado
npm run migration:run   # Executar pending migrations
npm run migration:generate -- src/migrations/NomeMigracao  # Gerar migration baseada em entities
npm test                # Rodar testes Jest
```

### Frontend

```bash
cd frontend

npm install             # Instalar dependências
ng serve               # Iniciar dev server (http://localhost:4200)
ng build               # Build production para dist/
ng test                # Rodar testes Vitest
ng lint                # ESLint
```

### Docker

```bash
docker compose up -d     # Subir containers em background
docker compose logs -f   # Ver logs em tempo real
docker compose down      # Parar containers
docker compose down -v   # Parar containers e remover volumes (reset do BD)
```

---

## Solução de Problemas

### "Porta 3306 ou 27017 já em uso"

Se receber um erro sobre a porta já estar em uso, você pode:

1. Verificar se há containers velhos rodando:

```bash
docker ps -a
```

2. Parar e remover containers antigos:

```bash
docker compose down -v
docker compose up -d
```

3. Ou mudar as portas no `docker-compose.yml` e no `.env`.

### "Migration falha com 'Table already exists'"

Se receber este erro ao rodar `npm run migration:run`, o banco pode ter sido inicializado manualmente. Solução:

```bash
# Parar os containers e remover volumes (reset do BD)
docker compose down -v

# Subir novamente
docker compose up -d

# Aguarde 10 segundos e execute a migration
npm run migration:run
```

### "Frontend não conecta à API (erro CORS ou 404)"

1. Verifique que o backend está rodando em `http://localhost:3000`
2. Verifique que o `FRONTEND_URL` no `.env` do backend é `http://localhost:4200`
3. Verifique que o `apiUrl` no `frontend/src/environments/environment.development.ts` aponta para `http://localhost:3000/api/v1`
4. Atualize a página do navegador

### "MongoDB não conecta / activityLog vazio"

MongoDB é **opcional**. Se não conectar:

1. Verifique que o container `techx_mongo` está rodando:

```bash
docker ps | grep mongo
```

2. Se não estiver, execute:

```bash
docker compose up -d
```

3. Se ainda assim falhar, o servidor continuará funcionando normalmente — apenas o `activityLog` ficará desabilitado. Verifique os logs do backend:

```bash
docker logs techx_mongo
```

### "Angular CLI não encontrado"

Se receber `command not found: ng`, instale o Angular CLI globalmente:

```bash
npm install -g @angular/cli@21
```

Depois tente novamente:

```bash
ng serve
```

### "Node.js versão incompatível"

Verifique sua versão:

```bash
node --version
```

Você precisa de **Node.js 20+**. Se tiver uma versão antiga, atualize via [nodejs.org](https://nodejs.org) ou seu gerenciador de pacotes.

### "bcrypt erros de compilação"

Se receber erros relacionados a `bcrypt` ao instalar dependências, tente:

```bash
npm rebuild bcrypt --build-from-source
```

---

## Desenvolvimento

### Hot Reload Backend

O servidor backend usa `ts-node-dev` para hot reload. Altere um arquivo em `backend/src/` e o servidor reiniciará automaticamente.

### Hot Reload Frontend

O Angular dev server também oferece hot reload. Altere um arquivo em `frontend/src/` e o navegador atualizará automaticamente.

### Debugging

Para debug do backend com breakpoints:

```bash
node --inspect-brk ./node_modules/.bin/ts-node-dev src/server.ts
```

Depois abra `chrome://inspect` no Chrome DevTools.

---

## Estrutura do Projeto

```
desafio-essentia-tecnologies/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers (thin, delegam a services)
│   │   ├── services/          # Business logic (task.service.ts)
│   │   ├── repositories/      # Data access (task.repository.ts)
│   │   ├── entities/          # TypeORM entities (Task.entity.ts, User.entity.ts)
│   │   ├── dtos/              # DTOs (create-task.dto.ts, login.dto.ts, etc.)
│   │   ├── routes/            # Express routers (task.routes.ts, auth.routes.ts)
│   │   ├── middlewares/       # Auth, error handling, validation
│   │   ├── config/            # Database, env, MongoDB
│   │   ├── models/            # Mongoose models (TaskMetadataModel)
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Entry point
│   ├── .env.example           # Template de variáveis de ambiente
│   ├── docker-compose.yml     # MySQL e MongoDB containers
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/       # TaskService, AuthService
│   │   │   │   ├── guards/         # Route protection (authGuard)
│   │   │   │   ├── interceptors/   # JWT attachment, error handling
│   │   │   │   └── models/         # TypeScript interfaces
│   │   │   ├── features/
│   │   │   │   ├── tasks/          # Task list, form, item components
│   │   │   │   └── auth/           # Login, register pages
│   │   │   └── shared/             # Reusable UI components
│   │   ├── environments/           # environment.ts, environment.development.ts
│   │   └── main.ts
│   ├── angular.json               # Angular CLI config
│   └── package.json
│
├── README.md                       # Este arquivo
├── docker-compose.yml             # Infrastructure definition
└── .gitignore
```

---

## Submissão

Antes de fazer push para o repositório de avaliação:

1. Verifique que tudo está funcionando localmente
2. Rode os testes (se houver)
3. Faça commit de suas mudanças na branch `agsouza`
4. Push para o repositório

```bash
git checkout -b agsouza
git add .
git commit -m "feat: projeto final TechX Task Manager com JWT e MongoDB"
git push origin agsouza
```

---

## Suporte

Para dúvidas ou problemas, consulte:

- **Backend issues:** Verifique os logs com `npm run dev` e procure por stack traces
- **Frontend issues:** Abra o DevTools (F12) e consulte a aba Console
- **Docker issues:** Execute `docker logs <container_name>` para ver logs específicos
- **Database issues:** Verifique a conexão com `docker ps` e `docker compose logs`

---

## Licença

MIT — Use livremente para fins educacionais.

---

**Desenvolvido para:** Desafio técnico Essentia Group  
**Data:** Maio de 2026  
**Tech Stack:** Node.js + TypeScript + Express + Angular + MySQL + MongoDB
