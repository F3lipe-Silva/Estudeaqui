import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useStudyContext } from '@/contexts/study-context';
import { SchedulePlan, Subject } from '@/types';
import { useToast } from '@/components/ui/toast';

interface ScheduleFormData {
  name: string;
  totalHorasSemanais: number;
  duracaoSessao: number;
  subModoPomodoro: 'automatico' | 'manual';
  subjects: Array<{
    subjectId: string;
    sessionsPerWeek: number;
    priority: 'baixa' | 'media' | 'alta';
  }>;
}

export default function ScheduleScreen() {
  const { data, dispatch } = useStudyContext();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SchedulePlan | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    totalHorasSemanais: 20,
    duracaoSessao: 60,
    subModoPomodoro: 'automatico',
    subjects: []
  });

  const initializeFormData = (plan?: SchedulePlan) => {
    if (plan) {
      setFormData({
        name: plan.name,
        totalHorasSemanais: plan.totalHorasSemanais,
        duracaoSessao: plan.duracaoSessao,
        subModoPomodoro: plan.subModoPomodoro,
        subjects: Object.entries(plan.sessoesPorMateria).map(([subjectId, sessions]) => ({
          subjectId,
          sessionsPerWeek: sessions,
          priority: 'media' as const
        }))
      });
    } else {
      setFormData({
        name: '',
        totalHorasSemanais: 20,
        duracaoSessao: 60,
        subModoPomodoro: 'automatico',
        subjects: data.subjects.map(subject => ({
          subjectId: subject.id,
          sessionsPerWeek: 2,
          priority: 'media' as const
        }))
      });
    }
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    initializeFormData();
    setIsCreating(true);
  };

  const handleEdit = (plan: SchedulePlan) => {
    setEditingPlan(plan);
    initializeFormData(plan);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      totalHorasSemanais: 20,
      duracaoSessao: 60,
      subModoPomodoro: 'automatico',
      subjects: []
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do plano é obrigatório');
      return;
    }

    const totalSessions = formData.subjects.reduce((sum, subject) => sum + subject.sessionsPerWeek, 0);
    const totalHours = (totalSessions * formData.duracaoSessao) / 60;

    if (Math.abs(totalHours - formData.totalHorasSemanais) > 2) {
      Alert.alert(
        'Aviso',
        `O total de horas calculado (${totalHours.toFixed(1)}h) é diferente do informado (${formData.totalHorasSemanais}h). Deseja continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: savePlan }
        ]
      );
    } else {
      savePlan();
    }
  };

  const savePlan = () => {
    const sessoesPorMateria: { [subjectId: string]: number } = {};
    formData.subjects.forEach(subject => {
      sessoesPorMateria[subject.subjectId] = subject.sessionsPerWeek;
    });

    const plan: SchedulePlan = {
      id: editingPlan?.id || Date.now().toString(),
      name: formData.name.trim(),
      createdAt: editingPlan?.createdAt || new Date().toISOString(),
      totalHorasSemanais: formData.totalHorasSemanais,
      duracaoSessao: formData.duracaoSessao,
      subModoPomodoro: formData.subModoPomodoro,
      sessoesPorMateria
    };

    if (editingPlan) {
      dispatch({
        type: 'UPDATE_SCHEDULE_PLAN',
        payload: plan
      });
      toast({ title: 'Plano atualizado', description: 'Seu plano de estudos foi atualizado com sucesso!' });
    } else {
      dispatch({
        type: 'ADD_SCHEDULE_PLAN',
        payload: plan
      });
      toast({ title: 'Plano criado', description: 'Seu plano de estudos foi criado com sucesso!' });
    }

    handleCancel();
  };

  const handleDelete = (plan: SchedulePlan) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o plano "${plan.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'DELETE_SCHEDULE_PLAN',
              payload: plan.id
            });
            toast({ title: 'Plano excluído', description: 'O plano foi excluído com sucesso!' });
          }
        }
      ]
    );
  };

  const updateSubjectSessions = (subjectId: string, sessions: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(subject =>
        subject.subjectId === subjectId
          ? { ...subject, sessionsPerWeek: sessions }
          : subject
      )
    }));
  };

  const renderSchedulePlan = (plan: SchedulePlan) => {
    const totalSessions = Object.values(plan.sessoesPorMateria).reduce((sum, sessions) => sum + sessions, 0);
    const totalHours = (totalSessions * plan.duracaoSessao) / 60;

    return (
      <Card key={plan.id} style={styles.planCard}>
        <View style={styles.planHeader}>
          <View>
            <ThemedText style={styles.planName}>{plan.name}</ThemedText>
            <ThemedText style={styles.planDetails}>
              {plan.totalHorasSemanais}h/semana • {plan.duracaoSessao}min/sessão
            </ThemedText>
          </View>
          <View style={styles.planActions}>
            <Button
              variant="outline"
              onPress={() => handleEdit(plan)}
              style={styles.actionButton}
            >
              Editar
            </Button>
            <Button
              variant="outline"
              onPress={() => handleDelete(plan)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              Excluir
            </Button>
          </View>
        </View>

        <View style={styles.subjectsList}>
          {Object.entries(plan.sessoesPorMateria).map(([subjectId, sessions]) => {
            const subject = data.subjects.find(s => s.id === subjectId);
            if (!subject) return null;

            return (
              <View key={subjectId} style={styles.subjectItem}>
                <View style={[styles.subjectColor, { backgroundColor: subject.color }]} />
                <ThemedText style={styles.subjectName}>{subject.name}</ThemedText>
                <ThemedText style={styles.subjectSessions}>
                  {sessions} sessões/semana
                </ThemedText>
              </View>
            );
          })}
        </View>

        <View style={styles.planStats}>
          <ThemedText style={styles.statText}>
            Total: {totalSessions} sessões ({totalHours.toFixed(1)}h)
          </ThemedText>
          <ThemedText style={styles.statText}>
            Modo: {plan.subModoPomodoro === 'automatico' ? 'Automático' : 'Manual'}
          </ThemedText>
        </View>
      </Card>
    );
  };

  const renderForm = () => (
    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.formTitle}>
        {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
      </ThemedText>

      <Input
        label="Nome do Plano"
        value={formData.name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        placeholder="Ex: Plano de Estudos Semanal"
      />

      <View style={styles.row}>
        <Input
          label="Horas Semanais"
          value={formData.totalHorasSemanais.toString()}
          onChangeText={(text) => setFormData(prev => ({ 
            ...prev, 
            totalHorasSemanais: parseInt(text) || 0 
          }))}
          keyboardType="numeric"
          style={styles.halfInput}
        />
        <Input
          label="Duração da Sessão (min)"
          value={formData.duracaoSessao.toString()}
          onChangeText={(text) => setFormData(prev => ({ 
            ...prev, 
            duracaoSessao: parseInt(text) || 0 
          }))}
          keyboardType="numeric"
          style={styles.halfInput}
        />
      </View>

      <View style={styles.switchContainer}>
        <ThemedText style={styles.switchLabel}>Modo Pomodoro Automático</ThemedText>
        <Switch
          checked={formData.subModoPomodoro === 'automatico'}
          onCheckedChange={(checked) => setFormData(prev => ({
            ...prev,
            subModoPomodoro: checked ? 'automatico' : 'manual'
          }))}
        />
      </View>

      <ThemedText style={styles.sectionTitle}>Sessões por Matéria</ThemedText>
      
      {formData.subjects.map((subjectData) => {
        const subject = data.subjects.find(s => s.id === subjectData.subjectId);
        if (!subject) return null;

        return (
          <View key={subjectData.subjectId} style={styles.subjectForm}>
            <View style={styles.subjectHeader}>
              <View style={[styles.subjectColor, { backgroundColor: subject.color }]} />
              <ThemedText style={styles.subjectName}>{subject.name}</ThemedText>
            </View>
            <Input
              label="Sessões por Semana"
              value={subjectData.sessionsPerWeek.toString()}
              onChangeText={(value) => updateSubjectSessions(subjectData.subjectId, parseInt(value) || 0)}
              keyboardType="numeric"
            />
          </View>
        );
      })}

      <View style={styles.formActions}>
        <Button
          variant="outline"
          onPress={handleCancel}
          style={styles.formButton}
        >
          Cancelar
        </Button>
        <Button
          onPress={handleSave}
          style={styles.formButton}
        >
          {editingPlan ? 'Atualizar' : 'Criar'} Plano
        </Button>
      </View>
    </ScrollView>
  );

  if (isCreating) {
    return (
      <ThemedView style={styles.container}>
        {renderForm()}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Planos de Estudo</ThemedText>
        <Button onPress={handleCreateNew}>
          Novo Plano
        </Button>
      </View>

      <ScrollView style={styles.plansList} showsVerticalScrollIndicator={false}>
        {data.schedulePlans.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Nenhum plano de estudo encontrado
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Crie seu primeiro plano para organizar melhor seus estudos
            </ThemedText>
            <Button onPress={handleCreateNew} style={styles.emptyButton}>
              Criar Primeiro Plano
            </Button>
          </View>
        ) : (
          data.schedulePlans.map(renderSchedulePlan)
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  plansList: {
    flex: 1,
    padding: 16,
  },
  planCard: {
    marginBottom: 16,
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  subjectsList: {
    marginBottom: 16,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  subjectName: {
    fontSize: 14,
    flex: 1,
  },
  subjectSessions: {
    fontSize: 14,
    opacity: 0.7,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subjectForm: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 32,
  },
  formButton: {
    flex: 1,
  },
});