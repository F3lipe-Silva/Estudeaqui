// src/lib/mongodb-study-service.ts
// Este é o serviço que será usado no contexto de estudo
// Ele faz chamadas para as APIs do servidor para operações MongoDB
// Agora com suporte a operações offline e sincronização
import { offlineSyncService } from './offline-sync-service';

export const mongodbStudyService = {
  // Inicializa o serviço offline com o userId
  initialize: (userId: string) => {
    offlineSyncService.setUserId(userId);
  },

  // Subjects operations
  getSubjects: async (userId: string) => {
    mongodbStudyService.initialize(userId);
    return await offlineSyncService.getSubjects();
  },

  addSubject: async (subjectData: any) => {
    return await offlineSyncService.addSubject(subjectData);
  },

  updateSubject: async (id: string, updates: any) => {
    return await offlineSyncService.updateSubject(id, updates);
  },

  deleteSubject: async (id: string) => {
    return await offlineSyncService.deleteSubject(id);
  },

  // Topics operations
  getTopics: async (subjectId: string) => {
    return await offlineSyncService.getTopics(subjectId);
  },

  addTopic: async (topicData: any) => {
    return await offlineSyncService.addTopic(topicData);
  },

  updateTopic: async (id: string, updates: any, subjectId: string) => {
    // Implementação offline para atualização de tópico
    if (offlineSyncService.isOffline()) {
      // Atualiza no localStorage e agenda para sincronizar
      const currentData = offlineSyncService.getOfflineData();
      const updatedTopics = currentData.topics.map(t => 
        t.id === id ? { ...t, ...updates } : t
      );
      offlineSyncService.saveOfflineData({ topics: updatedTopics });
      
      offlineSyncService.addPendingOperation({
        type: 'UPDATE',
        collection: 'topics',
        idField: id,
        data: updates
      });
      
      return { id, ...updates };
    } else {
      try {
        const response = await fetch(`/api/study/topics/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar tópico no servidor');
        }

        const updatedTopic = await response.json();

        // Atualiza no localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedTopics = currentData.topics.map(t => 
          t.id === id ? { ...t, ...updatedTopic } : t
        );
        offlineSyncService.saveOfflineData({ topics: updatedTopics });

        return updatedTopic;
      } catch (error) {
        console.warn('Erro ao atualizar tópico no servidor, salvando offline:', error);
        // Atualiza no localStorage e agenda para sincronizar
        const currentData = offlineSyncService.getOfflineData();
        const updatedTopics = currentData.topics.map(t => 
          t.id === id ? { ...t, ...updates } : t
        );
        offlineSyncService.saveOfflineData({ topics: updatedTopics });
        
        offlineSyncService.addPendingOperation({
          type: 'UPDATE',
          collection: 'topics',
          idField: id,
          data: updates
        });
        
        return { id, ...updates };
      }
    }
  },

  deleteTopic: async (id: string, subjectId: string) => {
    // Implementação offline para exclusão de tópico
    if (offlineSyncService.isOffline()) {
      // Remove do localStorage e agenda para sincronizar
      const currentData = offlineSyncService.getOfflineData();
      const updatedTopics = currentData.topics.filter(t => t.id !== id);
      offlineSyncService.saveOfflineData({ topics: updatedTopics });
      
      offlineSyncService.addPendingOperation({
        type: 'DELETE',
        collection: 'topics',
        idField: id
      });
      
      return true;
    } else {
      try {
        const response = await fetch(`/api/study/topics/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao deletar tópico no servidor');
        }

        // Remove do localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedTopics = currentData.topics.filter(t => t.id !== id);
        offlineSyncService.saveOfflineData({ topics: updatedTopics });

        return true;
      } catch (error) {
        console.warn('Erro ao deletar tópico no servidor, salvando operação offline:', error);
        // Remove do localStorage e agenda para sincronizar
        const currentData = offlineSyncService.getOfflineData();
        const updatedTopics = currentData.topics.filter(t => t.id !== id);
        offlineSyncService.saveOfflineData({ topics: updatedTopics });
        
        offlineSyncService.addPendingOperation({
          type: 'DELETE',
          collection: 'topics',
          idField: id
        });
        
        return true;
      }
    }
  },

  // Study logs operations
  getStudyLogs: async (userId: string) => {
    mongodbStudyService.initialize(userId);
    return await offlineSyncService.getStudyLogs(userId);
  },

  addStudyLog: async (logData: any) => {
    return await offlineSyncService.addStudyLog(logData);
  },

  updateStudyLog: async (id: string, updates: any) => {
    // Implementação offline para atualização de log
    if (offlineSyncService.isOffline()) {
      // Atualiza no localStorage e agenda para sincronizar
      const currentData = offlineSyncService.getOfflineData();
      const updatedLogs = currentData.studyLogs.map(l => 
        l.id === id ? { ...l, ...updates } : l
      );
      offlineSyncService.saveOfflineData({ studyLogs: updatedLogs });
      
      offlineSyncService.addPendingOperation({
        type: 'UPDATE',
        collection: 'logs',
        idField: id,
        data: updates
      });
      
      return { id, ...updates };
    } else {
      try {
        const response = await fetch(`/api/study/logs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar log de estudo no servidor');
        }

        const updatedLog = await response.json();

        // Atualiza no localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedLogs = currentData.studyLogs.map(l => 
          l.id === id ? { ...l, ...updatedLog } : l
        );
        offlineSyncService.saveOfflineData({ studyLogs: updatedLogs });

        return updatedLog;
      } catch (error) {
        console.warn('Erro ao atualizar log de estudo no servidor, salvando offline:', error);
        // Atualiza no localStorage e agenda para sincronizar
        const currentData = offlineSyncService.getOfflineData();
        const updatedLogs = currentData.studyLogs.map(l => 
          l.id === id ? { ...l, ...updates } : l
        );
        offlineSyncService.saveOfflineData({ studyLogs: updatedLogs });
        
        offlineSyncService.addPendingOperation({
          type: 'UPDATE',
          collection: 'logs',
          idField: id,
          data: updates
        });
        
        return { id, ...updates };
      }
    }
  },

  deleteStudyLog: async (id: string) => {
    // Implementação offline para exclusão de log
    if (offlineSyncService.isOffline()) {
      // Remove do localStorage e agenda para sincronizar
      const currentData = offlineSyncService.getOfflineData();
      const updatedLogs = currentData.studyLogs.filter(l => l.id !== id);
      offlineSyncService.saveOfflineData({ studyLogs: updatedLogs });
      
      offlineSyncService.addPendingOperation({
        type: 'DELETE',
        collection: 'logs',
        idField: id
      });
      
      return true;
    } else {
      try {
        const response = await fetch(`/api/study/logs/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao deletar log de estudo no servidor');
        }

        // Remove do localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedLogs = currentData.studyLogs.filter(l => l.id !== id);
        offlineSyncService.saveOfflineData({ studyLogs: updatedLogs });

        return true;
      } catch (error) {
        console.warn('Erro ao deletar log de estudo no servidor, salvando operação offline:', error);
        // Remove do localStorage e agenda para sincronizar
        const currentData = offlineSyncService.getOfflineData();
        const updatedLogs = currentData.studyLogs.filter(l => l.id !== id);
        offlineSyncService.saveOfflineData({ studyLogs: updatedLogs });
        
        offlineSyncService.addPendingOperation({
          type: 'DELETE',
          collection: 'logs',
          idField: id
        });
        
        return true;
      }
    }
  },

  // Study Sequence
  getStudySequence: async (userId: string) => {
    mongodbStudyService.initialize(userId);
    // Implementação similar para sequência de estudo...
    if (offlineSyncService.isOffline()) {
      // Retorna do localStorage
      const offlineData = offlineSyncService.getOfflineData();
      return offlineData.studySequences.find(seq => seq.userId === userId) || null;
    } else {
      try {
        return await fetch(`/api/study/sequence?userId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json());
      } catch (error) {
        console.warn('Erro ao buscar sequência de estudo do servidor, usando dados offline:', error);
        const offlineData = offlineSyncService.getOfflineData();
        return offlineData.studySequences.find(seq => seq.userId === userId) || null;
      }
    }
  },

  saveStudySequence: async (sequenceData: any) => {
    if (offlineSyncService.isOffline()) {
      // Salva no localStorage e agenda para sincronizar
      const currentData = offlineSyncService.getOfflineData();
      const updatedSequences = [...currentData.studySequences.filter(seq => seq.id !== sequenceData.id), sequenceData];
      offlineSyncService.saveOfflineData({ studySequences: updatedSequences });
      
      offlineSyncService.addPendingOperation({
        type: 'CREATE', // Pode ser CREATE ou UPDATE dependendo do caso
        collection: 'sequence',
        data: sequenceData
      });
      
      return sequenceData;
    } else {
      try {
        const response = await fetch('/api/study/sequence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sequenceData),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar sequência de estudo no servidor');
        }

        const result = await response.json();

        // Atualiza no localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedSequences = [...currentData.studySequences.filter(seq => seq.id !== sequenceData.id), result];
        offlineSyncService.saveOfflineData({ studySequences: updatedSequences });

        return result;
      } catch (error) {
        console.warn('Erro ao salvar sequência de estudo no servidor, salvando offline:', error);
        // Salva no localStorage e agenda para sincronizar
        const currentData = offlineSyncService.getOfflineData();
        const updatedSequences = [...currentData.studySequences.filter(seq => seq.id !== sequenceData.id), sequenceData];
        offlineSyncService.saveOfflineData({ studySequences: updatedSequences });
        
        offlineSyncService.addPendingOperation({
          type: 'CREATE',
          collection: 'sequence',
          data: sequenceData
        });
        
        return sequenceData;
      }
    }
  },

  // Pomodoro Settings
  getPomodoroSettings: async (userId: string) => {
    mongodbStudyService.initialize(userId);
    // Implementação similar para configurações Pomodoro...
    if (offlineSyncService.isOffline()) {
      // Retorna do localStorage
      const offlineData = offlineSyncService.getOfflineData();
      return offlineData.pomodoroSettings || null;
    } else {
      try {
        return await fetch(`/api/study/pomodoro-settings?userId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json());
      } catch (error) {
        console.warn('Erro ao buscar configurações Pomodoro do servidor, usando dados offline:', error);
        const offlineData = offlineSyncService.getOfflineData();
        return offlineData.pomodoroSettings || null;
      }
    }
  },

  savePomodoroSettings: async (settingsData: any) => {
    if (offlineSyncService.isOffline()) {
      // Salva no localStorage e agenda para sincronizar
      offlineSyncService.saveOfflineData({ pomodoroSettings: settingsData });
      
      offlineSyncService.addPendingOperation({
        type: 'CREATE', // Pode ser CREATE ou UPDATE dependendo do caso
        collection: 'pomodoro-settings',
        data: settingsData
      });
      
      return settingsData;
    } else {
      try {
        const response = await fetch('/api/study/pomodoro-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsData),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar configurações Pomodoro no servidor');
        }

        const result = await response.json();

        // Atualiza no localStorage para consistência
        offlineSyncService.saveOfflineData({ pomodoroSettings: result });

        return result;
      } catch (error) {
        console.warn('Erro ao salvar configurações Pomodoro no servidor, salvando offline:', error);
        // Salva no localStorage e agenda para sincronizar
        offlineSyncService.saveOfflineData({ pomodoroSettings: settingsData });
        
        offlineSyncService.addPendingOperation({
          type: 'CREATE',
          collection: 'pomodoro-settings',
          data: settingsData
        });
        
        return settingsData;
      }
    }
  },

  // Templates
  getTemplates: async (userId: string) => {
    mongodbStudyService.initialize(userId);
    // Implementação similar para templates...
    if (offlineSyncService.isOffline()) {
      // Retorna do localStorage
      const offlineData = offlineSyncService.getOfflineData();
      return offlineData.templates;
    } else {
      try {
        return await fetch(`/api/study/templates?userId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json());
      } catch (error) {
        console.warn('Erro ao buscar templates do servidor, usando dados offline:', error);
        const offlineData = offlineSyncService.getOfflineData();
        return offlineData.templates;
      }
    }
  },

  addTemplate: async (templateData: any) => {
    if (offlineSyncService.isOffline()) {
      // Salva no localStorage e agenda para sincronizar
      const newTemplate = {
        ...templateData,
        id: templateData.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      const currentData = offlineSyncService.getOfflineData();
      const updatedTemplates = [...currentData.templates.filter(t => t.id !== newTemplate.id), newTemplate];
      offlineSyncService.saveOfflineData({ templates: updatedTemplates });
      
      offlineSyncService.addPendingOperation({
        type: 'CREATE',
        collection: 'templates',
        data: newTemplate
      });
      
      return newTemplate;
    } else {
      try {
        const response = await fetch('/api/study/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData),
        });

        if (!response.ok) {
          throw new Error('Erro ao adicionar template no servidor');
        }

        const result = await response.json();

        // Atualiza no localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedTemplates = [...currentData.templates.filter(t => t.id !== result.id), result];
        offlineSyncService.saveOfflineData({ templates: updatedTemplates });

        return result;
      } catch (error) {
        console.warn('Erro ao adicionar template no servidor, salvando offline:', error);
        // Salva no localStorage e agenda para sincronizar
        const newTemplate = {
          ...templateData,
          id: templateData.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        const currentData = offlineSyncService.getOfflineData();
        const updatedTemplates = [...currentData.templates.filter(t => t.id !== newTemplate.id), newTemplate];
        offlineSyncService.saveOfflineData({ templates: updatedTemplates });
        
        offlineSyncService.addPendingOperation({
          type: 'CREATE',
          collection: 'templates',
          data: newTemplate
        });
        
        return newTemplate;
      }
    }
  },

  deleteTemplate: async (id: string) => {
    if (offlineSyncService.isOffline()) {
      // Remove do localStorage e agenda para sincronizar
      const currentData = offlineSyncService.getOfflineData();
      const updatedTemplates = currentData.templates.filter(t => t.id !== id);
      offlineSyncService.saveOfflineData({ templates: updatedTemplates });
      
      offlineSyncService.addPendingOperation({
        type: 'DELETE',
        collection: 'templates',
        idField: id
      });
      
      return true;
    } else {
      try {
        const response = await fetch(`/api/study/templates/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao deletar template no servidor');
        }

        // Remove do localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedTemplates = currentData.templates.filter(t => t.id !== id);
        offlineSyncService.saveOfflineData({ templates: updatedTemplates });

        return true;
      } catch (error) {
        console.warn('Erro ao deletar template no servidor, salvando operação offline:', error);
        // Remove do localStorage e agenda para sincronizar
        const currentData = offlineSyncService.getOfflineData();
        const updatedTemplates = currentData.templates.filter(t => t.id !== id);
        offlineSyncService.saveOfflineData({ templates: updatedTemplates });
        
        offlineSyncService.addPendingOperation({
          type: 'DELETE',
          collection: 'templates',
          idField: id
        });
        
        return true;
      }
    }
  },

  // Schedule Plans
  getSchedulePlans: async (userId: string) => {
    mongodbStudyService.initialize(userId);
    // Implementação similar para planos de agenda...
    if (offlineSyncService.isOffline()) {
      // Retorna do localStorage
      const offlineData = offlineSyncService.getOfflineData();
      return offlineData.schedulePlans;
    } else {
      try {
        return await fetch(`/api/study/schedule-plans?userId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json());
      } catch (error) {
        console.warn('Erro ao buscar planos de agenda do servidor, usando dados offline:', error);
        const offlineData = offlineSyncService.getOfflineData();
        return offlineData.schedulePlans;
      }
    }
  },

  addSchedulePlan: async (planData: any) => {
    if (offlineSyncService.isOffline()) {
      // Salva no localStorage e agenda para sincronizar
      const newPlan = {
        ...planData,
        id: planData.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      const currentData = offlineSyncService.getOfflineData();
      const updatedPlans = [...currentData.schedulePlans.filter(p => p.id !== newPlan.id), newPlan];
      offlineSyncService.saveOfflineData({ schedulePlans: updatedPlans });
      
      offlineSyncService.addPendingOperation({
        type: 'CREATE',
        collection: 'schedule-plans',
        data: newPlan
      });
      
      return newPlan;
    } else {
      try {
        const response = await fetch('/api/study/schedule-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData),
        });

        if (!response.ok) {
          throw new Error('Erro ao adicionar plano de agenda no servidor');
        }

        const result = await response.json();

        // Atualiza no localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedPlans = [...currentData.schedulePlans.filter(p => p.id !== result.id), result];
        offlineSyncService.saveOfflineData({ schedulePlans: updatedPlans });

        return result;
      } catch (error) {
        console.warn('Erro ao adicionar plano de agenda no servidor, salvando offline:', error);
        // Salva no localStorage e agenda para sincronizar
        const newPlan = {
          ...planData,
          id: planData.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        const currentData = offlineSyncService.getOfflineData();
        const updatedPlans = [...currentData.schedulePlans.filter(p => p.id !== newPlan.id), newPlan];
        offlineSyncService.saveOfflineData({ schedulePlans: updatedPlans });
        
        offlineSyncService.addPendingOperation({
          type: 'CREATE',
          collection: 'schedule-plans',
          data: newPlan
        });
        
        return newPlan;
      }
    }
  },

  deleteSchedulePlan: async (id: string) => {
    if (offlineSyncService.isOffline()) {
      // Remove do localStorage e agenda para sincronizar
      const currentData = offlineSyncService.getOfflineData();
      const updatedPlans = currentData.schedulePlans.filter(p => p.id !== id);
      offlineSyncService.saveOfflineData({ schedulePlans: updatedPlans });
      
      offlineSyncService.addPendingOperation({
        type: 'DELETE',
        collection: 'schedule-plans',
        idField: id
      });
      
      return true;
    } else {
      try {
        const response = await fetch(`/api/study/schedule-plans/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao deletar plano de agenda no servidor');
        }

        // Remove do localStorage para consistência
        const currentData = offlineSyncService.getOfflineData();
        const updatedPlans = currentData.schedulePlans.filter(p => p.id !== id);
        offlineSyncService.saveOfflineData({ schedulePlans: updatedPlans });

        return true;
      } catch (error) {
        console.warn('Erro ao deletar plano de agenda no servidor, salvando operação offline:', error);
        // Remove do localStorage e agenda para sincronizar
        const currentData = offlineSyncService.getOfflineData();
        const updatedPlans = currentData.schedulePlans.filter(p => p.id !== id);
        offlineSyncService.saveOfflineData({ schedulePlans: updatedPlans });
        
        offlineSyncService.addPendingOperation({
          type: 'DELETE',
          collection: 'schedule-plans',
          idField: id
        });
        
        return true;
      }
    }
  },

  // User Settings
  getUserSettings: async (userId: string) => {
    mongodbStudyService.initialize(userId);
    // Implementação similar para configurações do usuário...
    if (offlineSyncService.isOffline()) {
      // Retorna do localStorage
      const offlineData = offlineSyncService.getOfflineData();
      return offlineData.userSettings || null;
    } else {
      try {
        return await fetch(`/api/study/user-settings?userId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json());
      } catch (error) {
        console.warn('Erro ao buscar configurações do usuário do servidor, usando dados offline:', error);
        const offlineData = offlineSyncService.getOfflineData();
        return offlineData.userSettings || null;
      }
    }
  },

  saveUserSettings: async (settingsData: any) => {
    if (offlineSyncService.isOffline()) {
      // Salva no localStorage e agenda para sincronizar
      offlineSyncService.saveOfflineData({ userSettings: settingsData });
      
      offlineSyncService.addPendingOperation({
        type: 'CREATE', // Pode ser CREATE ou UPDATE dependendo do caso
        collection: 'user-settings',
        data: settingsData
      });
      
      return settingsData;
    } else {
      try {
        const response = await fetch('/api/study/user-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsData),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar configurações do usuário no servidor');
        }

        const result = await response.json();

        // Atualiza no localStorage para consistência
        offlineSyncService.saveOfflineData({ userSettings: result });

        return result;
      } catch (error) {
        console.warn('Erro ao salvar configurações do usuário no servidor, salvando offline:', error);
        // Salva no localStorage e agenda para sincronizar
        offlineSyncService.saveOfflineData({ userSettings: settingsData });
        
        offlineSyncService.addPendingOperation({
          type: 'CREATE',
          collection: 'user-settings',
          data: settingsData
        });
        
        return settingsData;
      }
    }
  },

  // Helper to get all user data at once (for initial load)
  getAllUserData: async (userId: string) => {
    mongodbStudyService.initialize(userId);
    // Implementação similar para todos os dados do usuário...
    if (offlineSyncService.isOffline()) {
      // Retorna do localStorage
      const offlineData = offlineSyncService.getOfflineData();
      return {
        subjects: offlineData.subjects,
        studyLogs: offlineData.studyLogs,
        studySequence: offlineData.studySequences.find(seq => seq.userId === userId) || null,
        pomodoroSettings: offlineData.pomodoroSettings,
        templates: offlineData.templates,
        schedulePlans: offlineData.schedulePlans
      };
    } else {
      try {
        const response = await fetch(`/api/study/all-data?userId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Erro ao obter todos os dados do usuário do servidor');
        }

        const result = await response.json();
        
        // Salva no localStorage para consistência e fallback offline
        offlineSyncService.saveOfflineData({
          subjects: result.subjects,
          studyLogs: result.studyLogs,
          studySequences: result.studySequence ? [result.studySequence] : [],
          pomodoroSettings: result.pomodoroSettings,
          templates: result.templates,
          schedulePlans: result.schedulePlans,
          userSettings: result.userSettings
        });

        return result;
      } catch (error) {
        console.warn('Erro ao obter todos os dados do usuário do servidor, usando dados offline:', error);
        const offlineData = offlineSyncService.getOfflineData();
        return {
          subjects: offlineData.subjects,
          studyLogs: offlineData.studyLogs,
          studySequence: offlineData.studySequences.find(seq => seq.userId === userId) || null,
          pomodoroSettings: offlineData.pomodoroSettings,
          templates: offlineData.templates,
          schedulePlans: offlineData.schedulePlans
        };
      }
    }
  },
  
  // Métodos adicionais para funcionalidade offline
  isOffline: () => offlineSyncService.isOffline(),
  getPendingOperationsCount: () => offlineSyncService.getPendingOperationsCount(),
  syncPendingOperations: () => offlineSyncService.forceSync(),
  checkConnectionStatus: () => offlineSyncService.checkConnectionStatus(),
};