import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, CardHeader, CardTitle } from './card';
import { ThemedText } from '@/components/themed-text';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const ExpandableCard = ({ title, children, expandedContent }: any) => {
  const [expanded, setExpanded] = React.useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Card>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <CardHeader style={styles.header}>
          <CardTitle style={styles.title}>{title}</CardTitle>
          {expanded ? (
            <ChevronUp size={20} color={theme.icon} />
          ) : (
            <ChevronDown size={20} color={theme.icon} />
          )}
        </CardHeader>
      </TouchableOpacity>
      {!expanded && children}
      {expanded && expandedContent}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});