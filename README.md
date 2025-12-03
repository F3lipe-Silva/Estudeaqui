# 📚 Estudaqui PWA

Sistema completo de gestão de estudos para concursos públicos com foco em produtividade e organização.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
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
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Charts**: Recharts
- **Formulários**: React Hook Form + Zod
- **PWA**: @ducanh2912/next-pwa

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 20+

### 1. Clone o repositório

```bash
git clone https://github.com/F3lipe-Silva/Estudeaqui.git
cd Estudeaqui
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute em desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📖 Documentação Adicional

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
│   │   └── study-context.tsx   # Estado global
│   └── lib/
│       ├── types.ts            # Tipos da aplicação
│       └── utils.ts            # Utilitários
└── public/
    └── manifest.json           # PWA manifest
```

## 🔐 Segurança

- Autenticação local com localStorage
- Dados armazenados localmente no navegador

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

O app pode ser instalado como aplicativo nativo e é otimizado para dispositivos móveis:

### Android/Chrome
1. Acesse o site
2. Toque no menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"

### iOS/Safari
1. Acesse o site
2. Toque no botão de compartilhar
3. "Adicionar à Tela de Início"

## 📱 Otimizações Mobile

O aplicativo inclui diversas otimizações para melhor experiência em dispositivos móveis:
- Design responsivo adaptável a diferentes tamanhos de tela
- Navegação otimizada com barra inferior para fácil acesso com polegar
- Componentes ajustados para toque com áreas de toque adequadas
- Layout mobile-first para melhor experiência em dispositivos móveis
- PWA com suporte offline para funcionalidades essenciais
- Desempenho otimizado para redes lentas e dispositivos com recursos limitados

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
