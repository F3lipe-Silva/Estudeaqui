import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, View, ScrollView } from 'react-native';
import { Send, FileText, Repeat, Bot, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudy } from '../contexts/study-context';

import { API_URL } from '@/constants/config';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Olá! Sou seu tutor IA. Como posso te ajudar hoje?', sender: 'ai', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const flatListRef = useRef<FlatList>(null);
  const { data } = useStudy();
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets(); // Hook for safe area insets

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (!customText) setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history,
          message: textToSend
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Desculpe, não consegui entender.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

    } catch (error) {
      console.error("Error calling AI API:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, ocorreu um erro ao conectar com o servidor. Verifique sua conexão.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Função para gerar CSV para Anki
  const generateAnkiCSV = () => {
    const prompt = 'Com base na última resposta que você gerou (contendo as questões no estilo CESPE), transforme-a em flashcards para o Anki no formato CSV (frente;verso;tags), com um cabeçalho. A "frente" do flashcard deve ser a afirmação da questão. O "verso" deve conter o gabarito (Certo ou Errado) e a justificativa completa. Não inclua mais nada na resposta além do conteúdo CSV.';
    sendMessage(prompt);
  };

  // Função para gerar questões CESPE
  const generateCespeQuestions = () => {
    const prompt = 'Com base em nossa discussão detalhada sobre o último tópico, elabore 5 afirmações complexas e aprofundadas no estilo CESPE/Cebraspe (Certo ou Errado). As afirmações devem abordar nuances, exceções e detalhes específicos do assunto, evitando generalidades. Para cada afirmação, forneça um gabarito (Certo ou Errado) e uma justificativa completa e bem fundamentada, explicando o porquê da resposta.';
    sendMessage(prompt);
  };

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    if (messages.length > 0) {
      // Usar timeout para garantir que a UI tenha sido atualizada
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userBubble : styles.aiBubble,
      item.sender === 'user' ? { backgroundColor: theme.primary } : { backgroundColor: theme.muted }
    ]}>
      <View style={styles.messageHeader}>
        <View style={[styles.avatar, { backgroundColor: item.sender === 'user' ? theme.primary : '#4f46e5' }]}>
          {item.sender === 'user' ? (
            <User size={16} color="white" />
          ) : (
            <Bot size={16} color="white" />
          )}
        </View>
        <ThemedText style={styles.senderName}>
          {item.sender === 'user' ? 'Você' : 'Tutor IA'}
        </ThemedText>
      </View>
      <ThemedText style={[
          styles.messageText,
          item.sender === 'user' ? { color: 'white' } : { color: theme.text }
      ]}>
          {item.text}
      </ThemedText>
      <ThemedText style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}> {/* Apply safe area insets to the main container */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">IA Tutor</ThemedText>
        <ThemedText style={styles.subtitle}>Assistente de estudos inteligente</ThemedText>
      </ThemedView>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.actionsContainer}>
        <Button variant="outline" size="sm" onPress={generateAnkiCSV} disabled={isLoading}>
          <FileText size={16} color={theme.icon} />
          <ThemedText style={{ color: theme.text, marginLeft: 8 }}>Gerar CSV para Anki</ThemedText>
        </Button>
        <Button variant="outline" size="sm" onPress={generateCespeQuestions} disabled={isLoading}>
          <Repeat size={16} color={theme.icon} />
          <ThemedText style={{ color: theme.text, marginLeft: 8 }}>Questões CESPE</ThemedText>
        </Button>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 10 : 0} // Adjust offset for safe area
        style={styles.inputContainerWrapper}
      >
        <ThemedView style={[styles.inputContainer, { borderTopColor: theme.border, paddingBottom: insets.bottom }]}> {/* Adjust padding for safe area */}
            <TextInput
                style={[
                    styles.input, 
                    { 
                        color: theme.text, 
                        borderColor: theme.border,
                        backgroundColor: theme.background === '#0f131a' ? theme.muted : '#f9f9f9'
                    }
                ]}
                placeholder="Digite sua dúvida..."
                placeholderTextColor={theme.mutedForeground}
                value={inputText}
                onChangeText={setInputText}
                multiline
                onKeyPress={handleKeyPress}
                maxLength={500}
            />
            <TouchableOpacity 
              onPress={sendMessage} 
              style={[styles.sendButton, { backgroundColor: theme.primary }]}
              disabled={isLoading || !inputText.trim()}
            >
                <Send size={20} color="white" />
            </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // paddingTop: 60, // Removed hardcoded padding
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  messageList: {
    padding: 20,
    paddingBottom: 100, // This needs to be adjusted based on KeyboardAvoidingView and safe area
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    maxWidth: '80%',
    marginBottom: 12,
    minWidth: 120,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.6,
    alignSelf: 'flex-end',
  },
  inputContainerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', 
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16, // This padding will now be combined with insets.bottom
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
});