import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  primaryButton?: {
    text: string;
    action: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  };
  secondaryButton?: {
    text: string;
    action: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  };
  additionalButtons?: {
    text: string;
    action: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  }[];
  onDismiss?: () => void;
}

export function AlertDialog({
  visible,
  title,
  message,
  variant = 'default',
  primaryButton,
  secondaryButton,
  additionalButtons,
  onDismiss,
}: AlertDialogProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const handlePrimaryAction = () => {
    if (primaryButton?.action) {
      primaryButton.action();
    }
    // Automatically hide the alert after action
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryButton?.action) {
      secondaryButton.action();
    }
    // Automatically hide the alert after action
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={visible}
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <Animated.View 
          style={[
            styles.overlay,
            { backgroundColor: 'rgba(0,0,0,0.5)' },
            { opacity: fadeAnim }
          ]}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[
                styles.dialogContainer,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Card style={[styles.dialog, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <CardContent style={styles.dialogContent}>
                  <Text style={[styles.title, { color: theme.cardForeground }]}>
                    {typeof title === 'string' ? title : 'Alert'}
                  </Text>
                  <Text style={[styles.message, { color: theme.mutedForeground }]}>
                    {typeof message === 'string' ? message : 'An error occurred'}
                  </Text>
                  
                  <View style={styles.buttonContainer}>
                    {additionalButtons?.map((btn, index) => (
                      <Button
                        key={index}
                        variant={btn.variant || 'outline'}
                        onPress={() => {
                          btn.action();
                          // Automatically hide the alert after action
                          if (onDismiss) {
                            onDismiss();
                          }
                        }}
                        style={styles.button}
                      >
                        {typeof btn.text === 'string' ? btn.text : 'Button'}
                      </Button>
                    ))}
                    {secondaryButton && (
                      <Button
                        variant={secondaryButton.variant || 'outline'}
                        onPress={handleSecondaryAction}
                        style={styles.button}
                      >
                        {typeof secondaryButton.text === 'string' ? secondaryButton.text : 'Cancel'}
                      </Button>
                    )}
                    {primaryButton && (
                      <Button
                        variant={primaryButton.variant || 'default'}
                        onPress={handlePrimaryAction}
                        style={secondaryButton || (additionalButtons && additionalButtons.length > 0) ? styles.button : styles.singleButton}
                      >
                        {typeof primaryButton.text === 'string' ? primaryButton.text : 'OK'}
                      </Button>
                    )}
                  </View>
                </CardContent>
              </Card>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 400,
  },
  dialog: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  dialogContent: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  singleButton: {
    width: '100%',
  },
});