import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertDialog, AlertDialogProps } from '../components/ui/alert-dialog';

interface AlertContextType {
  showAlert: (options: Omit<AlertDialogProps, 'visible'>) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertProps, setAlertProps] = useState<Omit<AlertDialogProps, 'visible'> | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = (options: Omit<AlertDialogProps, 'visible'>) => {
    setAlertProps(options);
    setIsVisible(true);
  };

  const hideAlert = () => {
    setIsVisible(false);
  };

  const contextValue: AlertContextType = {
    showAlert,
    hideAlert,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alertProps && (
        <AlertDialog
          {...alertProps}
          visible={isVisible}
          onDismiss={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}