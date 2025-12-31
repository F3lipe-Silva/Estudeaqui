# Integração com Appwrite

## 🚀 Configuração Concluída

Seu aplicativo EstudeAqui agora está integrado com o Appwrite! A conexão foi testada e está funcionando.

## 📁 Arquivos Criados

- **`src/lib/appwrite.ts`** - Configuração do cliente Appwrite
- **`src/contexts/appwrite-context.tsx`** - Contexto de autenticação
- **`src/hooks/use-appwrite-db.ts`** - Hook para operações de banco de dados
- **`src/components/auth/appwrite-auth.tsx`** - Componente de autenticação
- **`src/app/appwrite-test/page.tsx`** - Página de teste
- **`scripts/setup-appwrite.js`** - Script de configuração

## 🔧 Como Usar

### 1. Autenticação

```tsx
import { useAppwrite } from '@/contexts/appwrite-context';

function MyComponent() {
  const { user, login, logout, register } = useAppwrite();
  
  // Usar as funções de autenticação
}
```

### 2. Banco de Dados

```tsx
import { usersDB, coursesDB } from '@/hooks/use-appwrite-db';

// Criar um documento
const user = await usersDB.create({
  name: 'João Silva',
  email: 'joao@example.com'
});

// Listar documentos
const users = await usersDB.list();

// Atualizar documento
await usersDB.update(userId, { name: 'João Updated' });
```

## 🌐 Acesso ao Painel

- **URL**: http://192.168.1.105/console
- **Projeto**: estudeaqui-fb6e7
- **ID do Projeto**: 695585ac003bbff13197

## 📋 Próximos Passos

1. **Configurar Coleções**
   - Acesse o painel do Appwrite
   - Vá para Database → estudeaqui_db
   - Crie as coleções: users, courses, lessons, progress

2. **Configurar Atributos**
   - Defina os campos para cada coleção
   - Configure índices se necessário

3. **Testar Funcionalidades**
   - Visite `/appwrite-test` para testar autenticação
   - Implemente CRUD nos seus componentes

4. **Integração Avançada**
   - Adicione autenticação social
   - Configure storage para arquivos
   - Implemente funções server-side

## 🔐 Variáveis de Ambiente

As configurações estão diretamente no arquivo `src/lib/appwrite.ts`. Para produção, considere mover para variáveis de ambiente:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://192.168.1.105/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=695585ac003bbff13197
APPWRITE_API_KEY=sua_api_key_aqui
```

## 🚨 Importante

- O servidor Appwrite está rodando localmente em `http://192.168.1.105`
- Para produção, atualize o endpoint para o servidor Appwrite em nuvem
- Mantenha suas API keys seguras e nunca as exponha no frontend

## 📞 Suporte

- Documentação Appwrite: https://appwrite.io/docs
- Console Appwrite: http://192.168.1.105/console
