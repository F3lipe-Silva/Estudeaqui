# Estudaqui PWA - Guia de Integração Supabase

## 🚀 Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lbmmhjjbimvslmambprr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**⚠️ Importante:** Nunca commit o arquivo `.env.local` no Git. Ele já está incluído no `.gitignore`.

### 2. Instalação de Dependências

```bash
npm install
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📊 Estrutura do Banco de Dados

O aplicativo usa as seguintes tabelas no Supabase:

### Tabelas Principais

- **`subjects`**: Matérias de estudo
  - `id`, `user_id`, `name`, `color`, `description`, `study_duration`, `material_url`, `revision_progress`
  
- **`topics`**: Tópicos de cada matéria
  - `id`, `subject_id`, `name`, `order`, `is_completed`, `description`
  
- **`study_logs`**: Registro de sessões de estudo
  - `id`, `user_id`, `subject_id`, `topic_id`, `date`, `duration`, `start_page`, `end_page`, `questions_total`, `questions_correct`, `source`, `sequence_item_index`
  
- **`study_sequences`**: Sequências de estudo personalizadas
  - `id`, `user_id`, `name`, `sequence` (JSONB)
  
- **`pomodoro_settings`**: Configurações do timer Pomodoro
  - `user_id`, `settings` (JSONB)
  
- **`templates`**: Templates de matérias reutilizáveis
  - `id`, `user_id`, `name`, `subjects` (JSONB)
  
- **`schedule_plans`**: Planos de cronograma de estudos
  - `id`, `user_id`, `name`, `total_horas_semanais`, `duracao_sessao`, `sub_modo_pomodoro`, `sessoes_por_materia` (JSONB)

### Segurança (RLS)

Todas as tabelas possuem **Row Level Security (RLS)** ativado:
- ✅ Usuários só podem ver/editar seus próprios dados
- ✅ Políticas automáticas baseadas em `auth.uid()`

## 🔐 Autenticação

O app suporta:
- ✅ Login com email/senha
- ✅ Cadastro de novos usuários
- ✅ Login com Google OAuth
- ✅ Redirecionamentos automáticos (`/` quando autenticado, `/login` quando não)

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Preenche credenciais ou clica em "Entrar com Google"
3. `AuthProvider` gerencia estado de autenticação
4. Redirecionamento automático para `/` após login bem-sucedido

## 📱 Funcionalidades Integradas

### ✅ Totalmente Integrado com Supabase

- **Overview Dashboard**: Estatísticas em tempo real (tempo hoje/semana, streak, progresso)
- **Matérias e Tópicos**: CRUD completo com sincronização automática
- **Registro de Estudo**: Adicionar/editar/remover logs de sessões
- **Sequências de Estudo**: Criar e gerenciar sequências personalizadas
- **Timer Pomodoro**: Configurações persistentes e automação de logs
- **Templates**: Salvar e carregar conjuntos de matérias
- **Cronogramas**: Planejamento de sessões semanais

### 🔄 Sincronização Automática

Todas as ações do usuário são sincronizadas automaticamente com o Supabase:
- ✅ Adicionar matéria → Insert em `subjects`
- ✅ Completar tópico → Update em `topics`
- ✅ Registrar estudo → Insert em `study_logs`
- ✅ Mudar configuração Pomodoro → Upsert em `pomodoro_settings`

## 🛠️ Desenvolvimento

### Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home (requer auth)
│   └── login/             # Tela de login
├── components/            # Componentes React
│   ├── login-form.tsx     # Formulário de autenticação
│   ├── overview-tab.tsx   # Dashboard principal
│   ├── study-log-form.tsx # Registro de sessões
│   └── ...
├── contexts/              # Context API
│   ├── auth-context.tsx   # Gerenciamento de autenticação
│   └── study-context.tsx  # Estado global de estudos + sync Supabase
└── lib/
    ├── supabase/
    │   ├── client.ts      # Cliente Supabase (browser)
    │   └── database.types.ts # TypeScript types gerados
    └── types.ts           # Tipos da aplicação
```

### Modificar o Schema

Se precisar adicionar/alterar tabelas:

1. Crie uma nova migration via Supabase Dashboard ou CLI
2. Regenere os tipos TypeScript:
   ```bash
   npx supabase gen types typescript --project-id lbmmhjjbimvslmambprr > src/lib/supabase/database.types.ts
   ```
3. Atualize `src/contexts/study-context.tsx` com lógica de sincronização

### Testar Localmente

```bash
# Iniciar dev server
npm run dev

# Acessar
# http://localhost:3000 → redireciona para /login se não autenticado
# http://localhost:3000/login → tela de login
```

## 🐛 Troubleshooting

### Erro: "Missing NEXT_PUBLIC_SUPABASE_URL"

**Solução:** Verifique se `.env.local` existe e contém as variáveis corretas. Reinicie o servidor `npm run dev`.

### Erro: "Failed to load data from Supabase"

**Causas comuns:**
- RLS está bloqueando acesso (verifique se usuário está autenticado)
- Chave anon key está incorreta
- URL do projeto Supabase está errada

**Solução:** Verifique as credenciais no Supabase Dashboard → Settings → API

### Dados não aparecem após login

**Solução:** Abra DevTools (F12), vá em Console e verifique erros. Provavelmente problema de RLS ou falta de dados iniciais.

### Rotacionar Chave Anon (Segurança)

Se a chave anon foi exposta:
1. Acesse [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/lbmmhjjbimvslmambprr/settings/api)
2. Clique em "Regenerate" na Anon Key
3. Atualize `.env.local` com a nova chave
4. Reinicie `npm run dev`

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js 15 Docs](https://nextjs.org/docs)

## 🎯 Próximos Passos

- [ ] Adicionar testes unitários
- [ ] Implementar busca/filtros avançados
- [ ] Adicionar notificações push (PWA)
- [ ] Exportar dados em PDF/Excel
- [ ] Integração com calendários externos
- [ ] Dashboard de estatísticas avançadas (gráficos)

---

**Desenvolvido com ❤️ usando Next.js, Supabase e TypeScript**
