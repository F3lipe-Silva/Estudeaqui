
import { Alert } from 'react-native';

export const useToast = () => {
  return {
    toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
        // Simple fallback for React Native toast
        // In a real app, use something like react-native-toast-message or Burnt
        console.log(`[TOAST] ${options.title}: ${options.description}`);
        // Optionally show Alert for errors
        if (options.variant === 'destructive') {
            Alert.alert(options.title, options.description);
        }
    }
  };
};
