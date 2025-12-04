// app/mongodb-test/page.tsx
import MongoDBTest from '@/components/MongoDBTest';

export default function MongoDBTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Teste MongoDB - Projeto Estudeaqui</h1>

        <MongoDBTest />

        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Instruções de Configuração</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Adicione sua URI do MongoDB no arquivo <code className="bg-gray-100 p-1 rounded">.env.local</code></li>
            <li>Substitua <code className="bg-gray-100 p-1 rounded">your_mongodb_connection_string_here</code> com sua URI real</li>
            <li>Exemplo: <code className="bg-gray-100 p-1 rounded">mongodb+srv://username:password@cluster.mongodb.net/estudeaqui?retryWrites=true&w=majority</code></li>
            <li>Execute o servidor com <code className="bg-gray-100 p-1 rounded">npm run dev</code></li>
            <li>Acesse esta página em <code className="bg-gray-100 p-1 rounded">/mongodb-test</code> para testar a conexão</li>
          </ol>
        </div>
      </div>
    </div>
  );
}