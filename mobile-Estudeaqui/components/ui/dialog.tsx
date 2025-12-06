import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => onOpenChange(false)}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.content}>
            {children}
          </ThemedView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => (
  <View style={[styles.dialogContent, className]}>
    {children}
  </View>
);

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => (
  <View style={styles.header}>
    {children}
  </View>
);

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => (
  <ThemedText style={styles.title}>{children}</ThemedText>
);

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => (
  <ThemedText style={styles.description}>{children}</ThemedText>
);

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => (
  <View style={styles.footer}>
    {children}
  </View>
);

// Helper component for common dialog patterns
interface AlertDialogProps {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default'
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onPress={() => onOpenChange(false)}
            style={styles.footerButton}
          >
            {cancelText}
          </Button>
          <Button
            onPress={handleConfirm}
            style={[
              styles.footerButton,
              variant === 'destructive' && { backgroundColor: theme.error }
            ]}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
  },
  dialogContent: {
    // Styles applied dynamically
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  footerButton: {
    flex: 1,
  },
});