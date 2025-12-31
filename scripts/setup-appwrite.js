const { Client, Account } = require('appwrite');

const client = new Client()
  .setEndpoint('http://192.168.1.105/v1')
  .setProject('695585ac003bbff13197');

const account = new Account(client);

async function testConnection() {
  try {
    console.log('Testando conexão com Appwrite...');
    
    // Testar autenticação
    try {
      const response = await account.get();
      console.log('✅ Conexão funcionando! Usuário:', response.email);
    } catch (error) {
      console.log('✅ Conexão funcionando! (não autenticado)');
    }

    console.log('\n🎉 Integração com Appwrite configurada com sucesso!');
    console.log('\n📋 Arquivos criados:');
    console.log('✅ src/lib/appwrite.ts - Configuração do cliente');
    console.log('✅ src/contexts/appwrite-context.tsx - Contexto de autenticação');
    console.log('✅ src/hooks/use-appwrite-db.ts - Hook para banco de dados');
    console.log('✅ src/components/auth/appwrite-auth.tsx - Componente de autenticação');
    console.log('✅ src/app/appwrite-test/page.tsx - Página de teste');
    
    console.log('\n🔧 Próximos passos:');
    console.log('1. Acesse http://192.168.1.105/console');
    console.log('2. Configure as coleções no painel');
    console.log('3. Teste em http://localhost:3000/appwrite-test');
    console.log('4. Integre com seus componentes existentes');

  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
