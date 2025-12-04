import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/contexts/study-context';

interface AddSubjectToSequenceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (subjectId: string) => void;
}

export default function AddSubjectToSequenceModal({ visible, onClose, onSelect }: AddSubjectToSequenceModalProps) {
  const { data } = useStudy();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeTextColor = isDark ? '#FFF' : '#000';
  const themeCardColor = isDark ? '#1E1E1E' : '#FFF';
  const themeBorderColor = isDark ? '#333' : '#E5E5E5';

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
            <Text style={[styles.modalTitle, { color: themeTextColor }]}>Adicionar Matéria</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={themeTextColor} />
            </Pressable>
          </View>

          <FlatList
            data={data.subjects}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <Pressable
                    style={[styles.item, { borderBottomColor: themeBorderColor }]}
                    onPress={() => onSelect(item.id)}
                >
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.itemName, { color: themeTextColor }]}>{item.name}</Text>
                </Pressable>
            )}
            style={{ width: '100%' }}
          />
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
    width: '80%',
    maxHeight: '60%',
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
  item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
  },
  colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
  },
  itemName: {
      fontSize: 16,
  }
});
