import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  onOpenChange?: (open: boolean) => void;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const toast = (props: ToastProps) => {
    const id = Date.now().toString();
    const newToast = { ...props, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto dismiss after duration
    const duration = props.duration || 3000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <View style={styles.toastContainer}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

interface ToastItemProps extends ToastProps {
  id: string;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  title,
  description,
  variant = 'default',
  onClose
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const toastStyle = {
    backgroundColor: variant === 'destructive' ? theme.error : theme.background,
    borderColor: variant === 'destructive' ? theme.error : theme.border,
    borderWidth: 1,
  };

  const titleStyle = {
    color: variant === 'destructive' ? '#ffffff' : theme.text,
  };

  const descriptionStyle = {
    color: variant === 'destructive' ? '#ffffff' : theme.text,
    opacity: variant === 'destructive' ? 0.9 : 0.7,
  };

  return (
    <View style={[styles.toast, toastStyle]}>
      <View style={styles.content}>
        {title && (
          <ThemedText style={[styles.toastTitle, titleStyle]}>
            {title}
          </ThemedText>
        )}
        {description && (
          <ThemedText style={[styles.toastDescription, descriptionStyle]}>
            {description}
          </ThemedText>
        )}
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <ThemedText style={[styles.closeText, titleStyle]}>✕</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toastDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});