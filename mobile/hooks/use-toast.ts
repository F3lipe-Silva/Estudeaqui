import { Alert, Platform, ToastAndroid } from 'react-native';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export const useToast = () => {
  const toast = ({ title, description, variant }: ToastProps) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${title}\n${description || ''}`, ToastAndroid.SHORT);
    } else {
      // iOS or others
      Alert.alert(title || 'Notificação', description);
    }
  };

  return { toast };
};
