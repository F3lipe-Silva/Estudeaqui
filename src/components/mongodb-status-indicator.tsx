'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Circle, CircleCheck, CircleX, Loader2, Cloud, CloudOff, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MongoDBStatusIndicator() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean | null>(null); // null = loading
  const [pendingOperations, setPendingOperations] = useState<number>(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Função para testar a conexão com o MongoDB
  const checkConnection = async () => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    try {
      // Faz uma chamada para a API de teste do MongoDB
      const response = await fetch('/api/test-mongodb');

      if (!response.ok) {
        setIsConnected(false);
        return;
      }

      const result = await response.json();
      setIsConnected(!!result.message && !result.error);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Erro ao verificar conexão com o MongoDB:', error);
      setIsConnected(false);
      setLastChecked(new Date());
    }
  };

  // Função para obter o número de operações pendentes
  const checkPendingOperations = async () => {
    if (!user) {
      setPendingOperations(0);
      return;
    }

    try {
      // Importa o serviço dinamicamente para evitar problemas de SSR
      const { mongodbStudyService } = await import('@/lib/mongodb-study-service');
      const count = mongodbStudyService.getPendingOperationsCount();
      setPendingOperations(count);
    } catch (error) {
      console.error('Erro ao verificar operações pendentes:', error);
    }
  };

  // Verifica a conexão e operações pendentes periodicamente quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      // Verifica imediatamente
      checkConnection();
      checkPendingOperations();

      // Verifica a cada 30 segundos
      const interval = setInterval(() => {
        checkConnection();
        checkPendingOperations();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setIsConnected(null);
      setPendingOperations(0);
      setLastChecked(null);
    }
  }, [user]);

  // Função para obter o ícone baseado no status
  const getStatusIcon = () => {
    if (isConnected === null) {
      // Indicador de carregamento
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    } else if (isConnected) {
      if (pendingOperations > 0) {
        return <CloudUpload className="h-4 w-4 text-yellow-500" />;
      }
      return <Cloud className="h-4 w-4 text-green-500" />;
    } else {
      return <CloudOff className="h-4 w-4 text-red-500" />;
    }
  };

  // Função para obter o texto baseado no status
  const getStatusText = () => {
    if (isConnected === null) {
      return 'Verificando...';
    } else if (isConnected) {
      if (pendingOperations > 0) {
        return 'Offline, salvando localmente';
      }
      return 'Sincronizado';
    } else {
      return 'Desconectado';
    }
  };

  // Formata a última verificação
  const getLastCheckedText = () => {
    if (!lastChecked) return '';
    return `Última verificação: ${lastChecked.toLocaleTimeString()}`;
  };

  // Texto de status detalhado
  const getDetailedStatus = () => {
    if (isConnected === null) {
      return 'Verificando conexão com o MongoDB...';
    } else if (isConnected) {
      if (pendingOperations > 0) {
        return `Conectado, ${pendingOperations} operações pendentes para sincronizar`;
      }
      return 'Conectado e sincronizado com o MongoDB';
    } else {
      return 'Desconectado do MongoDB. Dados sendo salvos localmente.';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          checkConnection();
          checkPendingOperations();
        }}
        className="h-8 px-2 flex items-center gap-1"
        title={getDetailedStatus()}
      >
        {getStatusIcon()}
        <span className="text-xs hidden md:inline">{getStatusText()}</span>
        {pendingOperations > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {pendingOperations}
          </Badge>
        )}
      </Button>
    </div>
  );
}