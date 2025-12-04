// src/services/study-service.ts
import { getDatabase } from '@/lib/db';
import { 
  Subject, 
  Topic, 
  StudyLogEntry, 
  StudySequence, 
  PomodoroSettings, 
  SubjectTemplate, 
  SchedulePlan, 
  UserSettings 
} from '@/models/StudyModels';
import { ObjectId } from 'mongodb';

export class StudyService {
  
  private static createIdFilter(id: string) {
    // Try to create ObjectId, if it fails, treat as string (UUID)
    try {
      return { _id: new ObjectId(id) };
    } catch {
      // If it's not a valid ObjectId, search by string id field
      return { id: id };
    }
  }
  // Operações de Matérias
  static async getSubjects(userId: string): Promise<Subject[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection('subjects');
      
      const subjects = await collection.find({ userId }).toArray();
      
      return subjects.map(subject => {
        // Converter ObjectId para string e renomear _id para id
        const { _id, ...rest } = subject;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      });
    } catch (error) {
      console.error('Erro ao obter matérias:', error);
      throw error;
    }
  }

  static async addSubject(subjectData: Omit<Subject, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<Subject> {
    try {
      const db = await getDatabase();
      const collection = db.collection('subjects');
      
      const now = new Date();
      const newSubject = {
        ...subjectData,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newSubject);
      const insertedSubject = await collection.findOne({ _id: result.insertedId });
      
      if (!insertedSubject) {
        throw new Error('Erro ao adicionar matéria');
      }
      
      const { _id, ...rest } = insertedSubject;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao adicionar matéria:', error);
      throw error;
    }
  }

  static async updateSubject(id: string, updates: Partial<Omit<Subject, 'id' | '_id' | 'userId' | 'createdAt'>>): Promise<Subject> {
    try {
      const db = await getDatabase();
      const collection = db.collection('subjects');
      
      const idFilter = this.createIdFilter(id);
      console.log('Updating subject with ID:', id, 'Filter:', idFilter);
      
      const result = await collection.updateOne(
        idFilter,
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date() 
          } 
        }
      );
      
      console.log('Subject update result:', result);
      
      if (result.modifiedCount === 0) {
        throw new Error('Matéria não encontrada ou nenhuma alteração realizada');
      }
      
      const updatedSubject = await collection.findOne(idFilter);
      
      if (!updatedSubject) {
        throw new Error('Erro ao obter matéria atualizada');
      }
      
      const { _id, ...rest } = updatedSubject;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao atualizar matéria:', error);
      throw error;
    }
  }

  static async deleteSubject(id: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection('subjects');
      
      const idFilter = this.createIdFilter(id);
      const result = await collection.deleteOne(idFilter);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar matéria:', error);
      throw error;
    }
  }

  // Operações de Tópicos
  static async getTopics(subjectId: string): Promise<Topic[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection('topics');
      
      const topics = await collection.find({ subjectId }).sort({ order: 1 }).toArray();
      
      return topics.map(topic => {
        const { _id, ...rest } = topic;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      });
    } catch (error) {
      console.error('Erro ao obter tópicos:', error);
      throw error;
    }
  }

  static async addTopic(topicData: Omit<Topic, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<Topic> {
    try {
      const db = await getDatabase();
      const collection = db.collection('topics');
      
      const now = new Date();
      const newTopic = {
        ...topicData,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newTopic);
      const insertedTopic = await collection.findOne({ _id: result.insertedId });
      
      if (!insertedTopic) {
        throw new Error('Erro ao adicionar tópico');
      }
      
      const { _id, ...rest } = insertedTopic;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao adicionar tópico:', error);
      throw error;
    }
  }

  static async updateTopic(id: string, updates: Partial<Omit<Topic, 'id' | '_id' | 'createdAt'>>): Promise<Topic> {
    try {
      const db = await getDatabase();
      const collection = db.collection('topics');
      
      const idFilter = this.createIdFilter(id);
      console.log('Updating topic with ID:', id, 'Filter:', idFilter);
      
      const result = await collection.updateOne(
        idFilter,
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date() 
          } 
        }
      );
      
      console.log('Update result:', result);
      
      if (result.modifiedCount === 0) {
        throw new Error('Tópico não encontrado ou nenhuma alteração realizada');
      }
      
      const updatedTopic = await collection.findOne(idFilter);
      
      if (!updatedTopic) {
        throw new Error('Erro ao obter tópico atualizado');
      }
      
      const { _id, ...rest } = updatedTopic;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao atualizar tópico:', error);
      throw error;
    }
  }

  static async deleteTopic(id: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection('topics');
      
      const idFilter = this.createIdFilter(id);
      const result = await collection.deleteOne(idFilter);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar tópico:', error);
      throw error;
    }
  }

  // Operações de Registros de Estudo
  static async getStudyLogs(userId: string): Promise<StudyLogEntry[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection('study_logs');
      
      const logs = await collection.find({ userId }).sort({ date: -1 }).toArray();
      
      return logs.map(log => {
        const { _id, ...rest } = log;
        return {
          ...rest,
          id: _id.toString(),
          date: new Date(rest.date),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      });
    } catch (error) {
      console.error('Erro ao obter registros de estudo:', error);
      throw error;
    }
  }

  static async addStudyLog(logData: Omit<StudyLogEntry, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<StudyLogEntry> {
    try {
      const db = await getDatabase();
      const collection = db.collection('study_logs');
      
      const now = new Date();
      const newLog = {
        ...logData,
        date: new Date(logData.date), // Certificar que é um objeto Date
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newLog);
      const insertedLog = await collection.findOne({ _id: result.insertedId });
      
      if (!insertedLog) {
        throw new Error('Erro ao adicionar registro de estudo');
      }
      
      const { _id, ...rest } = insertedLog;
      return {
        ...rest,
        id: _id.toString(),
        date: new Date(rest.date),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao adicionar registro de estudo:', error);
      throw error;
    }
  }

  static async updateStudyLog(id: string, updates: Partial<Omit<StudyLogEntry, 'id' | '_id' | 'userId' | 'createdAt'>>): Promise<StudyLogEntry> {
    try {
      const db = await getDatabase();
      const collection = db.collection('study_logs');
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date() 
          } 
        }
      );
      
      if (result.modifiedCount === 0) {
        throw new Error('Registro de estudo não encontrado ou nenhuma alteração realizada');
      }
      
      const updatedLog = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!updatedLog) {
        throw new Error('Erro ao obter registro de estudo atualizado');
      }
      
      const { _id, ...rest } = updatedLog;
      return {
        ...rest,
        id: _id.toString(),
        date: new Date(rest.date),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao atualizar registro de estudo:', error);
      throw error;
    }
  }

  static async deleteStudyLog(id: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection('study_logs');
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar registro de estudo:', error);
      throw error;
    }
  }

  // Operações de Sequência de Estudo
  static async getStudySequence(userId: string): Promise<StudySequence | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection('study_sequences');
      
      const sequence = await collection.findOne({ userId }, { sort: { createdAt: -1 } });
      
      if (!sequence) return null;
      
      const { _id, ...rest } = sequence;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao obter sequência de estudo:', error);
      throw error;
    }
  }

  static async saveStudySequence(sequenceData: Omit<StudySequence, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<StudySequence> {
    try {
      const db = await getDatabase();
      const collection = db.collection('study_sequences');
      
      const now = new Date();
      let result;
      
      if (sequenceData._id) {
        // Atualizar sequência existente
        result = await collection.updateOne(
          { _id: new ObjectId(sequenceData._id) },
          { 
            $set: { 
              ...sequenceData, 
              updatedAt: now 
            } 
          }
        );
        
        if (result.modifiedCount === 0) {
          throw new Error('Sequência de estudo não encontrada');
        }
        
        const updatedSequence = await collection.findOne({ _id: new ObjectId(sequenceData._id) });
        
        if (!updatedSequence) {
          throw new Error('Erro ao obter sequência de estudo atualizada');
        }
        
        const { _id, ...rest } = updatedSequence;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      } else {
        // Criar nova sequência
        const newSequence = {
          ...sequenceData,
          createdAt: now,
          updatedAt: now
        };
        
        const insertResult = await collection.insertOne(newSequence);
        const insertedSequence = await collection.findOne({ _id: insertResult.insertedId });
        
        if (!insertedSequence) {
          throw new Error('Erro ao criar sequência de estudo');
        }
        
        const { _id, ...rest } = insertedSequence;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      }
    } catch (error) {
      console.error('Erro ao salvar sequência de estudo:', error);
      throw error;
    }
  }

  // Operações de Configurações Pomodoro
  static async getPomodoroSettings(userId: string): Promise<PomodoroSettings | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection('pomodoro_settings');
      
      const settings = await collection.findOne({ userId });
      
      if (!settings) return null;
      
      const { _id, ...rest } = settings;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao obter configurações Pomodoro:', error);
      throw error;
    }
  }

  static async savePomodoroSettings(settingsData: Omit<PomodoroSettings, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<PomodoroSettings> {
    try {
      const db = await getDatabase();
      const collection = db.collection('pomodoro_settings');
      
      const now = new Date();
      let result;
      
      if (settingsData._id) {
        // Atualizar configurações existentes
        result = await collection.updateOne(
          { _id: new ObjectId(settingsData._id) },
          { 
            $set: { 
              ...settingsData, 
              updatedAt: now 
            } 
          }
        );
        
        if (result.modifiedCount === 0) {
          throw new Error('Configurações Pomodoro não encontradas');
        }
        
        const updatedSettings = await collection.findOne({ _id: new ObjectId(settingsData._id) });
        
        if (!updatedSettings) {
          throw new Error('Erro ao obter configurações Pomodoro atualizadas');
        }
        
        const { _id, ...rest } = updatedSettings;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      } else {
        // Criar novas configurações
        const newSettings = {
          ...settingsData,
          createdAt: now,
          updatedAt: now
        };
        
        const insertResult = await collection.insertOne(newSettings);
        const insertedSettings = await collection.findOne({ _id: insertResult.insertedId });
        
        if (!insertedSettings) {
          throw new Error('Erro ao criar configurações Pomodoro');
        }
        
        const { _id, ...rest } = insertedSettings;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      }
    } catch (error) {
      console.error('Erro ao salvar configurações Pomodoro:', error);
      throw error;
    }
  }

  // Operações de Templates
  static async getTemplates(userId: string): Promise<SubjectTemplate[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection('templates');
      
      const templates = await collection.find({ userId }).toArray();
      
      return templates.map(template => {
        const { _id, ...rest } = template;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      });
    } catch (error) {
      console.error('Erro ao obter templates:', error);
      throw error;
    }
  }

  static async addTemplate(templateData: Omit<SubjectTemplate, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<SubjectTemplate> {
    try {
      const db = await getDatabase();
      const collection = db.collection('templates');
      
      const now = new Date();
      const newTemplate = {
        ...templateData,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newTemplate);
      const insertedTemplate = await collection.findOne({ _id: result.insertedId });
      
      if (!insertedTemplate) {
        throw new Error('Erro ao adicionar template');
      }
      
      const { _id, ...rest } = insertedTemplate;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao adicionar template:', error);
      throw error;
    }
  }

  static async deleteTemplate(id: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection('templates');
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  }

  // Operações de Planos de Agendamento
  static async getSchedulePlans(userId: string): Promise<SchedulePlan[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection('schedule_plans');
      
      const plans = await collection.find({ userId }).toArray();
      
      return plans.map(plan => {
        const { _id, ...rest } = plan;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      });
    } catch (error) {
      console.error('Erro ao obter planos de agendamento:', error);
      throw error;
    }
  }

  static async addSchedulePlan(planData: Omit<SchedulePlan, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<SchedulePlan> {
    try {
      const db = await getDatabase();
      const collection = db.collection('schedule_plans');
      
      const now = new Date();
      const newPlan = {
        ...planData,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newPlan);
      const insertedPlan = await collection.findOne({ _id: result.insertedId });
      
      if (!insertedPlan) {
        throw new Error('Erro ao adicionar plano de agendamento');
      }
      
      const { _id, ...rest } = insertedPlan;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao adicionar plano de agendamento:', error);
      throw error;
    }
  }

  static async deleteSchedulePlan(id: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection('schedule_plans');
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar plano de agendamento:', error);
      throw error;
    }
  }

  // Operações de Configurações do Usuário
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection('user_settings');
      
      const settings = await collection.findOne({ userId });
      
      if (!settings) return null;
      
      const { _id, ...rest } = settings;
      return {
        ...rest,
        id: _id.toString(),
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao obter configurações do usuário:', error);
      throw error;
    }
  }

  static async saveUserSettings(settingsData: Omit<UserSettings, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<UserSettings> {
    try {
      const db = await getDatabase();
      const collection = db.collection('user_settings');
      
      const now = new Date();
      let result;
      
      if (settingsData._id) {
        // Atualizar configurações existentes
        result = await collection.updateOne(
          { _id: new ObjectId(settingsData._id) },
          { 
            $set: { 
              ...settingsData, 
              updatedAt: now 
            } 
          }
        );
        
        if (result.modifiedCount === 0) {
          throw new Error('Configurações do usuário não encontradas');
        }
        
        const updatedSettings = await collection.findOne({ _id: new ObjectId(settingsData._id) });
        
        if (!updatedSettings) {
          throw new Error('Erro ao obter configurações do usuário atualizadas');
        }
        
        const { _id, ...rest } = updatedSettings;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      } else {
        // Criar novas configurações
        const newSettings = {
          ...settingsData,
          createdAt: now,
          updatedAt: now
        };
        
        const insertResult = await collection.insertOne(newSettings);
        const insertedSettings = await collection.findOne({ _id: insertResult.insertedId });
        
        if (!insertedSettings) {
          throw new Error('Erro ao criar configurações do usuário');
        }
        
        const { _id, ...rest } = insertedSettings;
        return {
          ...rest,
          id: _id.toString(),
          createdAt: new Date(rest.createdAt),
          updatedAt: new Date(rest.updatedAt)
        };
      }
    } catch (error) {
      console.error('Erro ao salvar configurações do usuário:', error);
      throw error;
    }
  }

  // Helper para obter todos os dados do usuário (usado para carregamento inicial)
  static async getAllUserData(userId: string) {
    try {
      const [
        subjects,
        studyLogs,
        studySequence,
        pomodoroSettings,
        templates,
        schedulePlans,
        userSettings
      ] = await Promise.all([
        StudyService.getSubjects(userId),
        StudyService.getStudyLogs(userId),
        StudyService.getStudySequence(userId),
        StudyService.getPomodoroSettings(userId),
        StudyService.getTemplates(userId),
        StudyService.getSchedulePlans(userId),
        StudyService.getUserSettings(userId)
      ]);

      // Obter tópicos para todas as matérias
      const subjectsWithTopics = await Promise.all(
        subjects.map(async (subject) => {
          const topics = await StudyService.getTopics(subject.id);
          return { ...subject, topics };
        })
      );

      return {
        subjects: subjectsWithTopics,
        studyLogs,
        studySequence,
        pomodoroSettings,
        templates,
        schedulePlans,
        userSettings
      };
    } catch (error) {
      console.error('Erro ao obter todos os dados do usuário:', error);
      throw error;
    }
  }
}