import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

interface SubjectFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  subject?: any;
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

export default function SubjectFormModal({ visible, onClose, onSave, subject }: SubjectFormModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeTextColor = isDark ? '#FFF' : '#000';
  const themeCardColor = isDark ? '#1E1E1E' : '#FFF';
  const themeBorderColor = isDark ? '#333' : '#E5E5E5';

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState('');
  const [studyDuration, setStudyDuration] = useState('60');
  const [materialUrl, setMaterialUrl] = useState('');

  useEffect(() => {
    if (visible) {
      if (subject) {
        setName(subject.name);
        setColor(subject.color);
        setDescription(subject.description || '');
        setStudyDuration(subject.studyDuration ? String(subject.studyDuration) : '60');
        setMaterialUrl(subject.materialUrl || '');
      } else {
        setName('');
        setColor(COLORS[0]);
        setDescription('');
        setStudyDuration('60');
        setMaterialUrl('');
      }
    }
  }, [visible, subject]); // This one is fine as it sets different values based on the subject prop

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da matéria é obrigatório.');
      return;
    }

    onSave({
      name,
      color,
      description,
      studyDuration: Number(studyDuration),
      materialUrl
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: themeCardColor }]}>
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: themeTextColor }]}>{subject ? 'Editar Matéria' : 'Nova Matéria'}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={themeTextColor} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeTextColor }]}>Nome</Text>
              <TextInput
                style={[styles.input, { color: themeTextColor, borderColor: themeBorderColor }]}
                value={name}
                onChangeText={setName}
                placeholder="Nome da matéria..."
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeTextColor }]}>Tempo (min)</Text>
              <TextInput
                style={[styles.input, { color: themeTextColor, borderColor: themeBorderColor }]}
                value={studyDuration}
                onChangeText={setStudyDuration}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeTextColor }]}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: themeTextColor, borderColor: themeBorderColor }]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholder="Descrição breve..."
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeTextColor }]}>URL do Material</Text>
              <TextInput
                style={[styles.input, { color: themeTextColor, borderColor: themeBorderColor }]}
                value={materialUrl}
                onChangeText={setMaterialUrl}
                placeholder="https://..."
                placeholderTextColor={isDark ? '#666' : '#999'}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeTextColor }]}>Cor</Text>
              <View style={styles.colorContainer}>
                {COLORS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      color === c && styles.selectedColorCircle,
                      color === c && { borderColor: themeTextColor }
                    ]}
                  />
                ))}
              </View>
            </View>

            <Pressable style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} onPress={handleSubmit}>
              <Text style={styles.textStyle}>Salvar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorCircle: {
    borderWidth: 2,
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    marginTop: 10,
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
