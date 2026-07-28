# Formosa Grill — Backend (Supabase)

## Configuração

### 1. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha com os valores do seu projeto Supabase:

```bash
cp .env.example .env
```

Valores necessários:
- `VITE_SUPABASE_URL` — URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` — Chave anônima (publishable key)

Pegar em: https://supabase.com/dashboard → Settings → API

### 2. Banco de dados

No painel do Supabase → SQL Editor → cole o conteúdo de `supabase/schema.sql` → Run.

Isso cria:
- **11 tabelas**: profiles, authorized_emails, categories, products, gallery, banners, reservations, contacts, settings, reviews, logs
- **Row Level Security (RLS)** em todas as tabelas
- **Políticas** separadas para admin, manager, employee e público
- **Triggers**: auto-criar profile no primeiro login, auto-primeiro-admin
- **5 buckets** no Storage: products, gallery, banners, avatars, uploads
- **Dados iniciais**: categorias, produtos, galeria, banners, configurações e avaliações de exemplo

### 3. Edge Functions

Deploy das 4 Edge Functions:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref jjtulknvxcqjhltxiasz

# Deploy das funções
supabase functions deploy check-authorization
supabase functions deploy create-profile
supabase functions deploy google-auth-callback
supabase functions deploy log-action
```

Funções:
- **check-authorization** — Verifica se um email está autorizado antes do cadastro
- **create-profile** — Cria o profile do usuário após cadastro/login
- **google-auth-callback** — Callback do OAuth Google
- **log-action** — Registra logs de ações administrativas

### 4. Auth — Google OAuth

No painel do Supabase → Authentication → Providers → Google:
1. Ativar Google provider
2. Adicionar Client ID e Client Secret do Google Cloud Console
3. Configurar redirect URL: `https://jjtulknvxcqjhltxiasz.supabase.co/auth/v1/callback`

### 5. Sistema de permissões

Cargos:
- **admin** — Acesso total a tudo
- **manager** — Produtos, categorias, galeria, banners, reservas, mensagens, avaliações
- **employee** — Dashboard, reservas, mensagens

### 6. Primeiro usuário

O primeiro usuário a se cadastrar automaticamente recebe `role = admin`.
Depois disso, apenas emails previamente autorizados na tabela `authorized_emails` podem criar contas.

## Estrutura

```
supabase/
├── schema.sql              # Schema completo (tabelas, RLS, triggers, buckets, dados)
└── functions/
    ├── check-authorization/  # Verifica email autorizado
    ├── create-profile/       # Cria profile pós-login
    ├── google-auth-callback/ # Callback OAuth Google
    └── log-action/           # Log de ações admin

src/lib/
├── supabase.ts               # Cliente Supabase
├── auth.ts                   # Funções de auth (isAdmin, isManagerOrAbove, isStaff)
├── auth-context.tsx          # AuthProvider (React Context)
├── types.ts                  # TypeScript interfaces
└── api/
    ├── public.ts             # APIs públicas (cardápio, galeria, reservas, settings, reviews)
    ├── admin.ts              # APIs admin (profiles, emails, logs)
    ├── catalog.ts            # APIs admin (categorias, produtos)
    ├── content.ts            # APIs admin (banners, settings, mensagens, reservas, avaliações)
    ├── media.ts              # Upload de imagens (Storage)
    └── storage.ts            # Helpers de Storage
```
