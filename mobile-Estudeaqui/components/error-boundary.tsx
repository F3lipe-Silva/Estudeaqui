import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; reset: () => void }> = ({
  error,
  reset
}) => (
  <View style={styles.container}>
    <ThemedText style={styles.title}>Oops! Algo deu errado</ThemedText>
    <ThemedText style={styles.message}>
      {error?.message || 'Ocorreu um erro inesperado no aplicativo.'}
    </ThemedText>
    <ThemedText style={styles.suggestion}>
      Tente recarregar o aplicativo ou contate o suporte se o problema persistir.
    </ThemedText>
    <View style={styles.actions}>
      <ThemedText style={styles.resetButton} onPress={reset}>
        Tentar Novamente
      </ThemedText>
    </View>
  </View>
);

// Performance monitoring component
interface PerformanceMonitorProps {
  children: React.ReactNode;
  onSlowRender?: (duration: number) => void;
  threshold?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  onSlowRender,
  threshold = 100 // 100ms threshold
}) => {
  const startTime = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const duration = Date.now() - startTime.current;
      if (duration > threshold) {
        onSlowRender?.(duration);
      }
    };
  });

  return <>{children}</>;
};

// Component for tracking renders
export const RenderTracker: React.FC<{
  name: string;
  children: React.ReactNode;
}> = ({ name, children }) => {
  React.useEffect(() => {
    console.log(`Component ${name} rendered`);
  });

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  suggestion: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.6,
  },
  actions: {
    alignItems: 'center',
  },
  resetButton: {
    fontSize: 16,
    color: '#4db8a5',
    fontWeight: '600',
  },
});