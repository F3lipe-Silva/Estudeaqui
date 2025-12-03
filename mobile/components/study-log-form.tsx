import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useStudy } from '../contexts/study-context';
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from 'nativewind';
import { StudyLogEntry } from '../lib/types';

interface StudyLogFormProps {
  onSave: () => void;
  onCancel: () => void;
  existingLog?: StudyLogEntry;
  initialData?: { subjectId?: string; topicId?: string; sequenceItemIndex?: number };
}

export default function StudyLogForm({ onSave, onCancel, existingLog, initialData }: StudyLogFormProps) {
  const { data, dispatch } = useStudy();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [subjectId, setSubjectId] = useState(existingLog?.subjectId || initialData?.subjectId || '');
  const [topicId, setTopicId] = useState(existingLog?.topicId || initialData?.topicId || '');
  const [duration, setDuration] = useState(existingLog?.duration?.toString() || '');
  const [startPage, setStartPage] = useState(existingLog?.startPage?.toString() || '');
  const [endPage, setEndPage] = useState(existingLog?.endPage?.toString() || '');
  const [questionsTotal, setQuestionsTotal] = useState(existingLog?.questionsTotal?.toString() || '');
  const [questionsCorrect, setQuestionsCorrect] = useState(existingLog?.questionsCorrect?.toString() || '');
  const [source, setSource] = useState(existingLog?.source || 'site-questoes');

  const availableTopics = data.subjects.find(s => s.id === subjectId)?.topics || [];

  useEffect(() => {
    if (existingLog) {
        setSubjectId(existingLog.subjectId);
        setTopicId(existingLog.topicId);
        setDuration(existingLog.duration?.toString() || '');
        setStartPage(existingLog.startPage?.toString() || '');
        setEndPage(existingLog.endPage?.toString() || '');
        setQuestionsTotal(existingLog.questionsTotal?.toString() || '');
        setQuestionsCorrect(existingLog.questionsCorrect?.toString() || '');
        setSource(existingLog.source || 'site-questoes');
    } else {
        setSubjectId(initialData?.subjectId || '');
        setTopicId(initialData?.topicId || '');
    }
  }, [existingLog, initialData]);

  const handleSubmit = () => {
    const numericDuration = Number(duration);
    if (!subjectId || !topicId || numericDuration <= 0) {
      Alert.alert('Erro', 'Preencha a matéria, o assunto e a duração corretamente.');
      return;
    }
    
    const logData = {
        subjectId,
        topicId,
        duration: numericDuration,
        startPage: Number(startPage) || 0,
        endPage: Number(endPage) || 0,
        questionsTotal: Number(questionsTotal) || 0,
        questionsCorrect: Number(questionsCorrect) || 0,
        source,
        sequenceItemIndex: initialData?.sequenceItemIndex,
    };
    
    if (existingLog) {
      dispatch({
        type: 'UPDATE_STUDY_LOG',
        payload: { ...existingLog, ...logData },
      });
    } else {
        dispatch({
            type: 'ADD_STUDY_LOG',
            payload: logData,
        });
    }
    onSave();
  };

  const inputStyle = `p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} mb-4`;
  const labelStyle = `text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`;

  return (
    <ScrollView className="flex-1">
      <View className="mb-4">
        <Text className={labelStyle}>Matéria</Text>
        <View className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <Picker
                selectedValue={subjectId}
                onValueChange={(itemValue) => {
                    setSubjectId(itemValue);
                    setTopicId(''); // Reset topic when subject changes
                }}
                style={{ color: isDark ? 'white' : 'black' }}
                dropdownIconColor={isDark ? 'white' : 'black'}
            >
                <Picker.Item label="Selecione a matéria" value="" />
                {data.subjects.map(s => (
                    <Picker.Item key={s.id} label={s.name} value={s.id} />
                ))}
            </Picker>
        </View>
      </View>

      <View className="mb-4">
        <Text className={labelStyle}>Assunto</Text>
        <View className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <Picker
                selectedValue={topicId}
                onValueChange={setTopicId}
                enabled={!!subjectId}
                style={{ color: isDark ? 'white' : 'black' }}
                dropdownIconColor={isDark ? 'white' : 'black'}
            >
                <Picker.Item label="Selecione o assunto" value="" />
                {availableTopics.map(t => (
                    <Picker.Item key={t.id} label={t.name} value={t.id} />
                ))}
            </Picker>
        </View>
      </View>

      <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className={labelStyle}>Duração (min)</Text>
            <TextInput
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                className={inputStyle}
                placeholder="Ex: 50"
                placeholderTextColor="#94a3b8"
            />
          </View>
          <View className="flex-1">
             <Text className={labelStyle}>Fonte</Text>
             <View className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} mb-4 h-[50px] justify-center`}>
                <Picker
                    selectedValue={source}
                    onValueChange={setSource}
                    style={{ color: isDark ? 'white' : 'black' }}
                    dropdownIconColor={isDark ? 'white' : 'black'}
                >
                    <Picker.Item label="Questões" value="site-questoes" />
                    <Picker.Item label="Revisão A" value="A" />
                    <Picker.Item label="Revisão B" value="B" />
                    <Picker.Item label="Revisão C" value="C" />
                    <Picker.Item label="Revisão D" value="D" />
                </Picker>
            </View>
          </View>
      </View>

      <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className={labelStyle}>Pág. Início</Text>
            <TextInput
                value={startPage}
                onChangeText={setStartPage}
                keyboardType="numeric"
                className={inputStyle}
                placeholder="0"
                placeholderTextColor="#94a3b8"
            />
          </View>
          <View className="flex-1">
             <Text className={labelStyle}>Pág. Fim</Text>
             <TextInput
                value={endPage}
                onChangeText={setEndPage}
                keyboardType="numeric"
                className={inputStyle}
                placeholder="0"
                placeholderTextColor="#94a3b8"
            />
          </View>
      </View>

      <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className={labelStyle}>Questões Totais</Text>
            <TextInput
                value={questionsTotal}
                onChangeText={setQuestionsTotal}
                keyboardType="numeric"
                className={inputStyle}
                placeholder="0"
                placeholderTextColor="#94a3b8"
            />
          </View>
          <View className="flex-1">
             <Text className={labelStyle}>Acertos</Text>
             <TextInput
                value={questionsCorrect}
                onChangeText={setQuestionsCorrect}
                keyboardType="numeric"
                className={inputStyle}
                placeholder="0"
                placeholderTextColor="#94a3b8"
            />
          </View>
      </View>

      <View className="flex-row gap-3 mt-4">
          <TouchableOpacity 
            onPress={onCancel}
            className={`flex-1 p-4 rounded-xl border items-center justify-center ${isDark ? 'border-slate-700' : 'border-slate-300'}`}
          >
            <Text className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSubmit}
            className="flex-1 bg-blue-600 p-4 rounded-xl items-center justify-center shadow-sm"
          >
            <Text className="text-white font-bold">Salvar</Text>
          </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
