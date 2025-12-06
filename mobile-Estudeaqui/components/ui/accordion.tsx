import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string[];
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [animation] = useState(new Animated.Value(defaultOpen ? 1 : 0));
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const toggleAccordion = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1000], // Arbitrary large value
  });

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <TouchableOpacity
        style={[styles.header, { backgroundColor: theme.background }]}
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.title}>{title}</ThemedText>
        <Animated.Text
          style={[
            styles.chevron,
            {
              color: theme.text,
              transform: [
                {
                  rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          ▼
        </Animated.Text>
      </TouchableOpacity>
      
      <Animated.View style={[styles.content, { height: contentHeight }]}>
        <View style={styles.contentInner}>{children}</View>
      </Animated.View>
    </View>
  );
};

export const Accordion: React.FC<AccordionProps> = ({
  children,
  type = 'single',
  collapsible = true,
  defaultValue = []
}) => {
  return (
    <View style={styles.accordionContainer}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    width: '100%',
  },
  container: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    overflow: 'hidden',
  },
  contentInner: {
    padding: 16,
    paddingTop: 0,
  },
});