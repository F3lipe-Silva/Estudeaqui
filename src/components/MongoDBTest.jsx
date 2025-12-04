// components/MongoDBTest.jsx
'use client';

import { useState, useEffect } from 'react';

export default function MongoDBTest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-mongodb');

      // Verifica se a resposta é JSON antes de tentar parsear
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Resposta inválida: ${text}`);
      }

      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        setError(`Erro ${response.status}: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Erro de parsing: A resposta não é um JSON válida. Verifique se o servidor está rodando e a rota está configurada corretamente.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const insertTestData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-mongodb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verifica se a resposta é JSON antes de tentar parsear
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Resposta inválida: ${text}`);
      }

      const result = await response.json();

      if (response.ok) {
        setData(result);
        // Após inserir, também podemos buscar os dados atualizados
        testConnection();
      } else {
        setError(`Erro ${response.status}: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Erro de parsing: A resposta não é um JSON válida. Verifique se o servidor está rodando e a rota está configurada corretamente.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Teste MongoDB - Estudeaqui</h2>

      <div className="space-y-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Testar Conexão'}
        </button>

        <button
          onClick={insertTestData}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 ml-2"
        >
          {loading ? 'Processando...' : 'Inserir Dados de Teste'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold mb-2">Erro:</h3>
          <p>{error}</p>
          {error.includes('MONGODB_URI') && (
            <div className="mt-2 p-2 bg-red-200 rounded">
              <p className="text-sm">
                Dica: Certifique-se de que a variável <code className="bg-red-300 p-1 rounded">MONGODB_URI</code> está definida no arquivo <code className="bg-red-300 p-1 rounded">.env.local</code>
              </p>
            </div>
          )}
        </div>
      )}

      {data && !error && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h3 className="font-bold mb-2">Resultado:</h3>
          <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}