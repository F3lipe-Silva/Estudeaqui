# Plano de Migração Desktop → Mobile - Estudaqui

## Visão Geral

Este documento detalha o plano completo de migração das funcionalidades da versão desktop (Next.js) para a versão mobile (React Native + Expo). O objetivo é criar uma aplicação mobile nativa com paridade funcional completa com a versão web.

## Arquitetura Atual da Versão Desktop

### Tecnologias Core
- **Frontend**: Next.js 15 + React 18 + TypeScript
- **UI**: Tailwind CSS + Radix UI + Lucide Icons
- **Backend**: Appwrite (Database, Auth, Storage)
- **Estado**: React Context + useReducer
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Funcionalidades Principais
1. **Sistema de Autenticação** (Appwrite Auth + localStorage)
2. **Gestão de Estudos** (Subjects, Topics, Study Logs)
3. **Timer Pomodoro** (Configurável, múltiplas tarefas)
4. **Sistema de Revisão** (Sequência espaçada)
5. **Dashboard** (Estatísticas, gráficos, métricas)
6. **Chat IA** (Integração com Google AI)
7. **PWA** (Instalável, offline-first)

## Arquitetura Proposta para Mobile

### Tecnologias Core
- **Framework**: React Native + Expo
- **Navegação**: Expo Router (file-based routing)
- **Estado**: React Context + AsyncStorage
- **UI**: React Native Paper / NativeWind + Expo Vector Icons
- **Backend**: Appwrite SDK
- **Charts**: react-native-chart-kit / victory-native
- **Forms**: react-hook-form + zod
- **Offline**: AsyncStorage + Appwrite sync

### Estrutura de Navegação Mobile
```
app/
├── _layout.tsx              # Root layout com providers
├── (auth)/                  # Rotas de autenticação
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                  # Navegação principal
│   ├── _layout.tsx          # Bottom tab navigator
│   ├── overview.tsx         # Dashboard
│   ├── planning.tsx         # Planejamento
│   ├── revision.tsx         # Revisão
│   ├── pomodoro.tsx         # Timer
│   └── history.tsx          # Histórico
├── subjects/                # Gestão de matérias
│   ├── index.tsx
│   ├── [id].tsx
│   └── create.tsx
└── settings.tsx             # Configurações
```

## Plano de Migração por Fases

### Fase 1: Infraestrutura Base (Semanas 1-2)

#### 1.1 Configuração do Projeto Mobile
- [ ] Atualizar Expo SDK para versão mais recente
- [ ] Configurar Expo Router com estrutura de navegação
- [ ] Instalar dependências essenciais:
  - `react-native-paper` ou `nativewind`
  - `@react-native-async-storage/async-storage`
  - `react-hook-form` + `zod`
  - `victory-native` para gráficos
  - `expo-notifications` para lembretes

#### 1.2 Sistema de Autenticação
- [ ] Migrar `auth-context.tsx` para mobile
- [ ] Implementar login/cadastro com Appwrite
- [ ] Adicionar OAuth Google
- [ ] Implementar recuperação de senha
- [ ] Persistir sessão com AsyncStorage

#### 1.3 Contextos e Estado Global
- [ ] Migrar `study-context.tsx` com adaptações para AsyncStorage
- [ ] Implementar sincronização offline/online
- [ ] Migrar `theme-provider.tsx` para dark/light mode
- [ ] Configurar toast notifications mobile

### Fase 2: Funcionalidades Core (Semanas 3-6)

#### 2.1 Navegação e Layout
- [ ] Implementar bottom navigation com 5 tabs principais
- [ ] Criar header mobile responsivo
- [ ] Implementar drawer/sidebar opcional
- [ ] Migrar sistema de breadcrumbs (se necessário)

#### 2.2 Gestão de Estudos
- [ ] Migrar CRUD de subjects e topics
- [ ] Implementar formulários otimizados para mobile
- [ ] Adicionar validação com Zod
- [ ] Implementar filtros e busca

#### 2.3 Timer Pomodoro
- [ ] Migrar lógica completa do Pomodoro
- [ ] Implementar widget flutuante (se suportado)
- [ ] Adicionar notificações push para transições
- [ ] Persistir estado entre sessões

#### 2.4 Sistema de Revisão
- [ ] Migrar sequência espaçada
- [ ] Implementar cards de revisão interativos
- [ ] Adicionar estatísticas de progresso
- [ ] Notificações para revisões pendentes

### Fase 3: Dashboard e Análises (Semanas 7-8)

#### 3.1 Dashboard Principal
- [ ] Migrar métricas principais (tempo estudado, streak, etc.)
- [ ] Implementar gráficos responsivos para mobile
- [ ] Otimizar layout para diferentes tamanhos de tela
- [ ] Adicionar cards interativos

#### 3.2 Histórico e Relatórios
- [ ] Migrar visualização de logs de estudo
- [ ] Implementar filtros por data/mês
- [ ] Adicionar exportação de dados (PDF/CSV)
- [ ] Gráficos de distribuição por matéria

### Fase 4: Funcionalidades Avançadas (Semanas 9-10)

#### 4.1 Chat com IA
- [ ] Migrar integração com Google AI
- [ ] Otimizar interface de chat para mobile
- [ ] Implementar histórico de conversas
- [ ] Adicionar funcionalidades offline

#### 4.2 Sistema de Templates e Planos
- [ ] Migrar templates de estudo
- [ ] Implementar planos de cronograma
- [ ] Adicionar personalização avançada
- [ ] Sincronização entre dispositivos

### Fase 5: Otimizações e PWA Nativa (Semanas 11-12)

#### 5.1 PWA Nativa
- [ ] Configurar manifest.json para mobile
- [ ] Implementar service worker para offline
- [ ] Adicionar splash screen e ícones
- [ ] Otimizar performance e bundle size

#### 5.2 Funcionalidades Offline-First
- [ ] Implementar cache inteligente de dados
- [ ] Sincronização automática ao reconectar
- [ ] Queue de operações offline
- [ ] Indicadores de status de conexão

#### 5.3 Otimizações de Performance
- [ ] Lazy loading de componentes
- [ ] Otimização de imagens e assets
- [ ] Memoização de componentes pesados
- [ ] Monitoramento de performance

## Componentes a Migrar

### Core Components
- [ ] `login-form.tsx` → Formulário de login mobile
- [ ] `study-log-form.tsx` → Formulário de registro mobile
- [ ] `pomodoro-widget.tsx` → Timer Pomodoro mobile
- [ ] `overview-tab.tsx` → Dashboard mobile
- [ ] `study-cycle-tab.tsx` → Gestão de matérias mobile
- [ ] `revision-tab.tsx` → Sistema de revisão mobile
- [ ] `chat-tab.tsx` → Chat IA mobile

### UI Components (Adaptar para RN)
- [ ] Cards, Buttons, Inputs, Dialogs
- [ ] Charts e gráficos
- [ ] Loading states e skeletons
- [ ] Toast notifications

## Dependências a Instalar

### Essenciais
```json
{
  "react-native-paper": "^5.x.x",
  "react-native-vector-icons": "^10.x.x",
  "@react-native-async-storage/async-storage": "^1.x.x",
  "react-hook-form": "^7.x.x",
  "zod": "^3.x.x",
  "victory-native": "^36.x.x",
  "expo-notifications": "~0.x.x"
}
```

### Opcionais (para funcionalidades avançadas)
```json
{
  "expo-location": "~16.x.x",
  "expo-calendar": "~12.x.x",
  "expo-sharing": "~12.x.x",
  "react-native-gesture-handler": "~2.x.x"
}
```

## Estratégias de Migração

### 1. Componentes Compartilhados
- Criar biblioteca de componentes compartilhados
- Utilizar lógica de negócio compartilhada
- Abstrair diferenças entre plataformas

### 2. Estado e Dados
- Manter mesma estrutura de dados
- Adaptar persistência (localStorage → AsyncStorage)
- Implementar sync inteligente

### 3. UI/UX Adaptations
- Mobile-first design principles
- Touch-friendly interactions
- Native platform conventions
- Performance optimizations

## Testes e Qualidade

### Estratégia de Testes
- Unit tests para lógica de negócio
- Integration tests para contextos
- E2E tests com Detox
- Device testing em diferentes tamanhos

### QA Checklist
- [ ] Funcionalidades desktop vs mobile parity
- [ ] Performance benchmarks
- [ ] Offline functionality
- [ ] Cross-platform compatibility
- [ ] Accessibility compliance

## Timeline Estimado

| Fase | Duração | Entregáveis |
|------|---------|-------------|
| 1. Infraestrutura | 2 semanas | Autenticação, navegação básica, estado |
| 2. Core Features | 4 semanas | CRUD estudos, Pomodoro, revisão |
| 3. Dashboard | 2 semanas | Métricas, gráficos, histórico |
| 4. Advanced | 2 semanas | Chat IA, templates, planos |
| 5. Optimization | 2 semanas | PWA, offline, performance |

**Total estimado: 12 semanas** para migração completa com testes.

## Riscos e Mitigações

### Riscos Técnicos
- **Compatibilidade RN vs Web**: Criar abstrações para APIs diferentes
- **Performance Mobile**: Otimizações específicas, lazy loading
- **Offline Sync**: Estratégia robusta de sincronização

### Riscos de Projeto
- **Complexidade**: Dividir em fases menores e testáveis
- **Dependências**: Usar versões estáveis e bem testadas
- **Compatibilidade**: Testes regulares em múltiplos dispositivos

## Próximos Passos

1. **Revisar e aprovar plano**: Validar escopo e timeline
2. **Setup inicial**: Configurar projeto mobile com arquitetura base
3. **Piloto**: Migrar uma funcionalidade completa (ex: autenticação)
4. **Iteração**: Migrar funcionalidades por prioridade
5. **Testes**: QA completo antes do lançamento

---

**Status Atual**: Planejamento completo ✅
**Próxima Ação**: Iniciar implementação da Fase 1
