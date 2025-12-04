// src/lib/offline-sync-service.ts
// Serviço que lida com operações offline e sincronização com MongoDB

// Chaves do localStorage para armazenamento offline
const OFFLINE_DATA_KEY = 'estudeaqui-offline-data';
const PENDING_OPERATIONS_KEY = 'estudeaqui-pending-operations';

// Tipos para as operações pendentes
type PendingOperation = {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: string;
  data?: any;
  idField?: string;
  timestamp: number;
};

// Interface para os dados offline
interface OfflineData {
  subjects: any[];
  topics: any[];
  studyLogs: any[];
  studySequences: any[];
  pomodoroSettings: any;
  templates: any[];
  schedulePlans: any[];
  userSettings: any;
}

class OfflineSyncService {
  private userId: string | null = null;
  private isOnline: boolean | null = null; // null = desconhecido, true = online, false = offline

  constructor() {
    // Verificar status de conexão inicial
    this.checkConnectionStatus();
    
    // Adicionar listener de online/offline
    window.addEventListener('online', () => this.handleOnlineStatusChange(true));
    window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
  }

  // Define o ID do usuário
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Verifica o status de conexão com o MongoDB
  async checkConnectionStatus(): Promise<boolean> {
    try {
      const response = await fetch('/api/test-mongodb');
      const isConnected = response.ok;
      this.isOnline = isConnected;
      return isConnected;
    } catch (error) {
      console.error('Erro ao verificar conexão com o MongoDB:', error);
      this.isOnline = false;
      return false;
    }
  }

  // Manipula alterações no status de conexão
  private async handleOnlineStatusChange(isOnline: boolean) {
    this.isOnline = isOnline;
    if (isOnline) {
      // Se voltou para online, tenta sincronizar
      await this.syncPendingOperations();
    }
  }

  // Verifica se está offline
  isOffline(): boolean {
    return this.isOnline === false;
  }

  // Verifica se não sabemos o status
  isConnectionStatusUnknown(): boolean {
    return this.isOnline === null;
  }

  // Salva dados no localStorage
  private saveOfflineData(data: Partial<OfflineData>): void {
    if (!this.userId) return;
    
    const key = `${OFFLINE_DATA_KEY}-${this.userId}`;
    const existingData = this.getOfflineData();
    
    const updatedData = {
      ...existingData,
      ...data
    };
    
    localStorage.setItem(key, JSON.stringify(updatedData));
  }

  // Obtém dados do localStorage
  private getOfflineData(): OfflineData {
    if (!this.userId) {
      return {
        subjects: [],
        topics: [],
        studyLogs: [],
        studySequences: [],
        pomodoroSettings: null,
        templates: [],
        schedulePlans: [],
        userSettings: null
      };
    }
    
    const key = `${OFFLINE_DATA_KEY}-${this.userId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return {
        subjects: [],
        topics: [],
        studyLogs: [],
        studySequences: [],
        pomodoroSettings: null,
        templates: [],
        schedulePlans: [],
        userSettings: null
      };
    }
    
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Erro ao parsear dados offline:', e);
      return {
        subjects: [],
        topics: [],
        studyLogs: [],
        studySequences: [],
        pomodoroSettings: null,
        templates: [],
        schedulePlans: [],
        userSettings: null
      };
    }
  }

  // Adiciona uma operação pendente
  private addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp'>): string {
    if (!this.userId) return '';
    
    const key = `${PENDING_OPERATIONS_KEY}-${this.userId}`;
    const existingOperations: PendingOperation[] = JSON.parse(localStorage.getItem(key) || '[]');
    
    const newOperation: PendingOperation = {
      id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...operation,
      timestamp: Date.now()
    };
    
    existingOperations.push(newOperation);
    localStorage.setItem(key, JSON.stringify(existingOperations));
    
    return newOperation.id;
  }

  // Remove uma operação pendente
  private removePendingOperation(operationId: string): void {
    if (!this.userId) return;
    
    const key = `${PENDING_OPERATIONS_KEY}-${this.userId}`;
    const existingOperations: PendingOperation[] = JSON.parse(localStorage.getItem(key) || '[]');
    
    const updatedOperations = existingOperations.filter(op => op.id !== operationId);
    localStorage.setItem(key, JSON.stringify(updatedOperations));
  }

  // Obtém operações pendentes
  getPendingOperations(): PendingOperation[] {
    if (!this.userId) return [];
    
    const key = `${PENDING_OPERATIONS_KEY}-${this.userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  // Sincroniza operações pendentes com MongoDB
  async syncPendingOperations(): Promise<void> {
    if (!this.userId) return;
    if (this.isOffline()) return; // Apenas sincroniza quando online

    const pendingOperations = this.getPendingOperations();
    if (pendingOperations.length === 0) return;

    // Classifica operações por tipo e ordem de execução
    // Primeiro CREATE, depois UPDATE, depois DELETE para evitar conflitos
    const sortedOperations = [...pendingOperations].sort((a, b) => {
      const order = { 'CREATE': 1, 'UPDATE': 2, 'DELETE': 3 };
      return order[a.type] - order[b.type];
    });

    // Processa operações pendentes
    for (const operation of sortedOperations) {
      try {
        const result = await this.executeOperation(operation);

        // Atualiza o localStorage com o resultado da operação para manter consistência
        await this.updateLocalDataAfterSync(operation, result);

        this.removePendingOperation(operation.id);
        console.log(`Operação ${operation.id} sincronizada com sucesso`);
      } catch (error) {
        console.error(`Erro ao sincronizar operação ${operation.id}:`, error);
        // Pode ser útil manter a operação para tentar novamente mais tarde
        // Em um sistema real, poderíamos implementar lógica de retry
      }
    }
  }

  // Atualiza dados locais após sincronizar operação
  private async updateLocalDataAfterSync(operation: PendingOperation, result: any): Promise<void> {
    const currentData = this.getOfflineData();

    switch (operation.collection) {
      case 'subjects':
        if (operation.type === 'CREATE' || operation.type === 'UPDATE') {
          // Atualiza ou adiciona o assunto sincronizado
          const updatedSubjects = currentData.subjects.filter(s => s.id !== result.id);
          this.saveOfflineData({
            subjects: [...updatedSubjects, result]
          });
        } else if (operation.type === 'DELETE') {
          // Remove o assunto sincronizado
          this.saveOfflineData({
            subjects: currentData.subjects.filter(s => s.id !== operation.idField)
          });
        }
        break;

      case 'topics':
        if (operation.type === 'CREATE' || operation.type === 'UPDATE') {
          // Atualiza ou adiciona o tópico sincronizado
          const updatedTopics = currentData.topics.filter(t => t.id !== result.id);
          this.saveOfflineData({
            topics: [...updatedTopics, result]
          });
        } else if (operation.type === 'DELETE') {
          // Remove o tópico sincronizado
          this.saveOfflineData({
            topics: currentData.topics.filter(t => t.id !== operation.idField)
          });
        }
        break;

      case 'logs':
        if (operation.type === 'CREATE' || operation.type === 'UPDATE') {
          // Atualiza ou adiciona o log sincronizado
          const updatedLogs = currentData.studyLogs.filter(l => l.id !== result.id);
          this.saveOfflineData({
            studyLogs: [...updatedLogs, result]
          });
        } else if (operation.type === 'DELETE') {
          // Remove o log sincronizado
          this.saveOfflineData({
            studyLogs: currentData.studyLogs.filter(l => l.id !== operation.idField)
          });
        }
        break;

      // Adiciona casos para outros tipos de dados conforme necessário
      default:
        // Atualiza o tipo de dados genérico
        break;
    }
  }

  // Executa uma operação (CREATE, UPDATE, DELETE) via API
  private async executeOperation(operation: PendingOperation): Promise<any> {
    let response;
    
    switch (operation.type) {
      case 'CREATE':
        response = await fetch(`/api/study/${operation.collection}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation.data)
        });
        break;
        
      case 'UPDATE':
        response = await fetch(`/api/study/${operation.collection}/${operation.idField}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation.data)
        });
        break;
        
      case 'DELETE':
        response = await fetch(`/api/study/${operation.collection}/${operation.idField}`, {
          method: 'DELETE'
        });
        break;
    }
    
    if (!response.ok) {
      throw new Error(`Erro na sincronização: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Métodos para operações offline
  async getSubjects(): Promise<any[]> {
    if (this.isOnline) {
      // Tenta buscar do servidor, mas se falhar, retorna do localStorage
      try {
        return await fetch(`/api/study/subjects?userId=${this.userId}`).then(res => res.json());
      } catch (error) {
        console.warn('Erro ao buscar matérias do servidor, usando dados offline:', error);
        return this.getOfflineData().subjects;
      }
    } else {
      // Offline: retorna do localStorage
      return this.getOfflineData().subjects;
    }
  }

  async addSubject(subjectData: any): Promise<any> {
    const newSubject = {
      ...subjectData,
      id: subjectData.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (this.isOnline) {
      try {
        // Salva no servidor
        const result = await fetch('/api/study/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSubject)
        }).then(res => res.json());

        // Atualiza no localStorage para consistência
        const currentData = this.getOfflineData();
        this.saveOfflineData({
          subjects: [...currentData.subjects.filter(s => s.id !== newSubject.id), result]
        });

        return result;
      } catch (error) {
        console.warn('Erro ao adicionar matéria no servidor, salvando offline:', error);
        // Falhou, salva offline e agenda para sincronizar
        const currentData = this.getOfflineData();
        this.saveOfflineData({
          subjects: [...currentData.subjects.filter(s => s.id !== newSubject.id), newSubject]
        });
        this.addPendingOperation({
          type: 'CREATE',
          collection: 'subjects',
          data: newSubject
        });
        return newSubject;
      }
    } else {
      // Offline: salva no localStorage e agenda para sincronizar
      const currentData = this.getOfflineData();
      this.saveOfflineData({
        subjects: [...currentData.subjects.filter(s => s.id !== newSubject.id), newSubject]
      });
      this.addPendingOperation({
        type: 'CREATE',
        collection: 'subjects',
        data: newSubject
      });
      return newSubject;
    }
  }

  async updateSubject(id: string, updates: any): Promise<any> {
    if (this.isOnline) {
      try {
        // Atualiza no servidor
        const response = await fetch(`/api/study/subjects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar matéria no servidor');
        }

        const updatedSubject = await response.json();

        // Atualiza no localStorage para consistência
        const currentData = this.getOfflineData();
        const updatedSubjects = currentData.subjects.map(s => 
          s.id === id ? { ...s, ...updatedSubject } : s
        );
        this.saveOfflineData({ subjects: updatedSubjects });

        return updatedSubject;
      } catch (error) {
        console.warn('Erro ao atualizar matéria no servidor, salvando offline:', error);
        // Atualiza no localStorage e agenda para sincronizar
        const currentData = this.getOfflineData();
        const updatedSubjects = currentData.subjects.map(s => 
          s.id === id ? { ...s, ...updates } : s
        );
        this.saveOfflineData({ subjects: updatedSubjects });
        
        this.addPendingOperation({
          type: 'UPDATE',
          collection: 'subjects',
          idField: id,
          data: updates
        });
        
        return { id, ...updates };
      }
    } else {
      // Offline: atualiza no localStorage e agenda para sincronizar
      const currentData = this.getOfflineData();
      const updatedSubjects = currentData.subjects.map(s => 
        s.id === id ? { ...s, ...updates } : s
      );
      this.saveOfflineData({ subjects: updatedSubjects });
      
      this.addPendingOperation({
        type: 'UPDATE',
        collection: 'subjects',
        idField: id,
        data: updates
      });
      
      return { id, ...updates };
    }
  }

  async deleteSubject(id: string): Promise<boolean> {
    if (this.isOnline) {
      try {
        // Deleta no servidor
        const response = await fetch(`/api/study/subjects/${id}`, { method: 'DELETE' });
        
        if (!response.ok) {
          throw new Error('Erro ao deletar matéria no servidor');
        }

        // Remove do localStorage para consistência
        const currentData = this.getOfflineData();
        this.saveOfflineData({
          subjects: currentData.subjects.filter(s => s.id !== id)
        });

        return true;
      } catch (error) {
        console.warn('Erro ao deletar matéria no servidor, salvando operação offline:', error);
        // Remove do localStorage e agenda para sincronizar
        const currentData = this.getOfflineData();
        this.saveOfflineData({
          subjects: currentData.subjects.filter(s => s.id !== id)
        });
        
        this.addPendingOperation({
          type: 'DELETE',
          collection: 'subjects',
          idField: id
        });
        
        return true;
      }
    } else {
      // Offline: remove do localStorage e agenda para sincronizar
      const currentData = this.getOfflineData();
      this.saveOfflineData({
        subjects: currentData.subjects.filter(s => s.id !== id)
      });
      
      this.addPendingOperation({
        type: 'DELETE',
        collection: 'subjects',
        idField: id
      });
      
      return true;
    }
  }

  // Similar para outras operações...
  // Por brevidade, vou implementar apenas o esqueleto para os principais métodos
  async getTopics(subjectId: string): Promise<any[]> {
    // Implementação similar para topics...
    if (this.isOnline) {
      try {
        return await fetch(`/api/study/topics?subjectId=${subjectId}`).then(res => res.json());
      } catch (error) {
        console.warn('Erro ao buscar tópicos do servidor, usando dados offline:', error);
        const offlineData = this.getOfflineData();
        return offlineData.topics.filter(t => t.subjectId === subjectId);
      }
    } else {
      const offlineData = this.getOfflineData();
      return offlineData.topics.filter(t => t.subjectId === subjectId);
    }
  }

  async addTopic(topicData: any): Promise<any> {
    const newTopic = {
      ...topicData,
      id: topicData.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (this.isOnline) {
      try {
        const result = await fetch('/api/study/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTopic)
        }).then(res => res.json());

        const currentData = this.getOfflineData();
        this.saveOfflineData({
          topics: [...currentData.topics.filter(t => t.id !== newTopic.id), result]
        });

        return result;
      } catch (error) {
        console.warn('Erro ao adicionar tópico no servidor, salvando offline:', error);
        const currentData = this.getOfflineData();
        this.saveOfflineData({
          topics: [...currentData.topics.filter(t => t.id !== newTopic.id), newTopic]
        });
        this.addPendingOperation({
          type: 'CREATE',
          collection: 'topics',
          data: newTopic
        });
        return newTopic;
      }
    } else {
      const currentData = this.getOfflineData();
      this.saveOfflineData({
        topics: [...currentData.topics.filter(t => t.id !== newTopic.id), newTopic]
      });
      this.addPendingOperation({
        type: 'CREATE',
        collection: 'topics',
        data: newTopic
      });
      return newTopic;
    }
  }

  async getStudyLogs(userId: string): Promise<any[]> {
    if (this.isOnline) {
      try {
        return await fetch(`/api/study/logs?userId=${userId}`).then(res => res.json());
      } catch (error) {
        console.warn('Erro ao buscar logs de estudo do servidor, usando dados offline:', error);
        return this.getOfflineData().studyLogs;
      }
    } else {
      return this.getOfflineData().studyLogs;
    }
  }

  async addStudyLog(logData: any): Promise<any> {
    const newLog = {
      ...logData,
      id: logData.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (this.isOnline) {
      try {
        const result = await fetch('/api/study/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLog)
        }).then(res => res.json());

        const currentData = this.getOfflineData();
        this.saveOfflineData({
          studyLogs: [...currentData.studyLogs.filter(l => l.id !== newLog.id), result]
        });

        return result;
      } catch (error) {
        console.warn('Erro ao adicionar log de estudo no servidor, salvando offline:', error);
        const currentData = this.getOfflineData();
        this.saveOfflineData({
          studyLogs: [...currentData.studyLogs.filter(l => l.id !== newLog.id), newLog]
        });
        this.addPendingOperation({
          type: 'CREATE',
          collection: 'logs',
          data: newLog
        });
        return newLog;
      }
    } else {
      const currentData = this.getOfflineData();
      this.saveOfflineData({
        studyLogs: [...currentData.studyLogs.filter(l => l.id !== newLog.id), newLog]
      });
      this.addPendingOperation({
        type: 'CREATE',
        collection: 'logs',
        data: newLog
      });
      return newLog;
    }
  }

  // Obtém o número de operações pendentes (para indicador visual)
  getPendingOperationsCount(): number {
    if (!this.userId) return 0;
    const key = `${PENDING_OPERATIONS_KEY}-${this.userId}`;
    const operations: PendingOperation[] = JSON.parse(localStorage.getItem(key) || '[]');
    return operations.length;
  }

  // Força sincronização completa
  async forceSync(): Promise<boolean> {
    if (this.isOnline) {
      await this.syncPendingOperations();
      return true;
    }
    return false;
  }
}

export const offlineSyncService = new OfflineSyncService();