import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.table, { borderColor: theme.border }, className]}>
      {children}
    </View>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <View style={[styles.tableHeader, className]}>
    {children}
  </View>
);

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
  <View style={[styles.tableBody, className]}>
    {children}
  </View>
);

export const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.tableRow, { borderColor: theme.border }, className]}>
      {children}
    </View>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className,
  header = false 
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.tableCell, { flex: 1 }, className]}>
      <ThemedText
        style={[
          styles.cellText,
          header && styles.headerText,
          { color: header ? theme.text : theme.text }
        ]}
      >
        {children}
      </ThemedText>
    </View>
  );
};

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => (
  <TableCell header className={className}>
    {children}
  </TableCell>
);

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tableBody: {
    // Container for body rows
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tableCell: {
    padding: 12,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
  },
  headerText: {
    fontWeight: '600',
  },
});