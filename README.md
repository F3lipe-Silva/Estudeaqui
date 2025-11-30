# 📚 Estudaqui PWA

Sistema completo de gestão de estudos para concursos públicos com foco em produtividade e organização.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-✓-green?logo=supabase)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## ✨ Funcionalidades

### 🎯 Gestão Completa de Estudos
- **Dashboard Intuitivo**: Visão geral com estatísticas em tempo real
- **Matérias e Tópicos**: Organização hierárquica com progresso visual
- **Registro de Sessões**: Log detalhado de tempo, páginas e questões
- **Sequências Personalizadas**: Crie fluxos de estudo otimizados

### ⏱️ Timer Pomodoro Avançado
- **Multi-tarefas**: Configure múltiplas etapas de foco (Questões, Anki, Lei Seca)
- **Pausas Inteligentes**: Pausas curtas e longas automáticas
- **Widget Persistente**: Acompanhe o tempo em qualquer aba
- **Logging Automático**: Sessões Pomodoro são registradas automaticamente

### 📊 Análises e Estatísticas
- Tempo estudado (hoje, semana, mês, total)
- Streak de dias consecutivos
- Gráficos de distribuição por matéria
- Taxa de acerto em questões
- Progresso de revisão (sequência otimizada)

### 🔄 Sistema de Revisão
- Sequência fixa baseada em espaçamento crescente
- Acompanhamento automático de revisões pendentes
- Histórico completo de revisões

### 🎨 Design e UX
- **Mobile-first**: Interface responsiva otimizada para celular
- **Dark/Light Mode**: Tema automático ou manual
- **PWA**: Instale como app nativo no celular
- **Offline-first**: Funciona sem conexão (em breve)

## 🚀 Tecnologias

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Charts**: Recharts
- **Formulários**: React Hook Form + Zod
- **PWA**: @ducanh2912/next-pwa

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 20+
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/F3lipe-Silva/Estudeaqui.git
cd Estudeaqui
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Onde encontrar essas informações:**
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings → API**
3. Copie a **URL** e a **anon public** key

### 4. Configure o banco de dados

As migrations já foram aplicadas via MCP Supabase. O schema inclui:
- ✅ Tabelas: `subjects`, `topics`, `study_logs`, `study_sequences`, `pomodoro_settings`, `templates`, `schedule_plans`
- ✅ Row Level Security (RLS) ativado em todas as tabelas
- ✅ Políticas de segurança configuradas

**Opcional - Popular com dados de exemplo:**
1. Acesse o **SQL Editor** no Supabase Dashboard
2. Execute o script `supabase/seed.sql` (substitua `YOUR_USER_ID_HERE` pelo seu user ID)

### 5. Execute em desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📖 Documentação Adicional

- [**SUPABASE_INTEGRATION.md**](./SUPABASE_INTEGRATION.md): Guia completo de integração e troubleshooting
- [**docs/blueprint.md**](./docs/blueprint.md): Blueprint original do projeto

## 🏗️ Estrutura do Projeto

```
Estudeaqui/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Página principal (requer auth)
│   │   ├── login/              # Tela de login
│   │   └── api/                # API routes
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   ├── overview-tab.tsx    # Dashboard
│   │   ├── study-cycle-tab.tsx # Gestão de matérias
│   │   ├── pomodoro-widget.tsx # Timer persistente
│   │   └── ...
│   ├── contexts/               # React Context
│   │   ├── auth-context.tsx    # Autenticação
│   │   └── study-context.tsx   # Estado global + Supabase sync
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts       # Cliente Supabase
│       │   └── database.types.ts # TypeScript types gerados
│       ├── types.ts            # Tipos da aplicação
│       └── utils.ts            # Utilitários
├── supabase/
│   ├── migrations/             # Migrations SQL
│   └── seed.sql                # Script de dados iniciais
└── public/
    └── manifest.json           # PWA manifest
```

## 🔐 Segurança

- ✅ Row Level Security (RLS) ativado em todas as tabelas
- ✅ Políticas baseadas em `auth.uid()` - usuários só veem seus próprios dados
- ✅ Autenticação via Supabase Auth (email/senha + Google OAuth)
- ✅ Tokens JWT gerenciados automaticamente
- ⚠️ **Nunca** commite `.env.local` (já incluído no `.gitignore`)

## 🧪 Testes

```bash
# Type checking
npm run typecheck

# Lint
npm run lint

# Build de produção
npm run build
```

## 📱 PWA (Progressive Web App)

O app pode ser instalado como aplicativo nativo:

### Android/Chrome
1. Acesse o site
2. Toque no menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"

### iOS/Safari
1. Acesse o site
2. Toque no botão de compartilhar
3. "Adicionar à Tela de Início"

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] Modo offline completo (sync quando voltar online)
- [ ] Notificações push (lembretes de revisão)
- [ ] Exportar dados em PDF/Excel
- [ ] Integração com Google Calendar
- [ ] Gráficos avançados de desempenho
- [ ] Sistema de metas e badges
- [ ] Chat com IA para tirar dúvidas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 👤 Autor

**Felipe Silva**
- GitHub: [@F3lipe-Silva](https://github.com/F3lipe-Silva)

---

**Desenvolvido com ❤️ para concurseiros que levam seus estudos a sério**
