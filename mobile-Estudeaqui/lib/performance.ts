import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Lazy loaded components for code splitting
const LazyCharts = lazy(() => import('@/components/ui/study-charts'));
const LazyTemplateForm = lazy(() => import('@/components/template/template-form'));
const LazyTemplateSelector = lazy(() => import('@/components/template/template-selector'));
const LazyKeyboardHelp = lazy(() => import('@/components/keyboard-shortcuts-help'));
const LazyScheduleForm = lazy(() => import('@/app/(tabs)/schedule'));

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback
}) => {
  const defaultFallback = (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4db8a5" />
      <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
    </View>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Predefined lazy components
export const LazyStudyCharts = (props: any) => (
  <LazyWrapper>
    <LazyCharts {...props} />
  </LazyWrapper>
);

export const LazyTemplateFormComponent = (props: any) => (
  <LazyWrapper>
    <LazyTemplateForm {...props} />
  </LazyWrapper>
);

export const LazyTemplateSelectorComponent = (props: any) => (
  <LazyWrapper>
    <LazyTemplateSelector {...props} />
  </LazyWrapper>
);

export const LazyKeyboardHelpComponent = (props: any) => (
  <LazyWrapper>
    <LazyKeyboardHelp {...props} />
  </LazyWrapper>
);

export const LazyScheduleFormComponent = (props: any) => (
  <LazyWrapper>
    <LazyScheduleForm {...props} />
  </LazyWrapper>
);

// Hook for lazy loading with error boundary
export const useLazyLoad = <T,>(
  loader: () => Promise<{ default: T }>,
  dependencies: any[] = []
) => {
  const [component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const module = await loader();
        if (isMounted) {
          setComponent(module.default);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { component, loading, error };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
  });

  const startTiming = React.useCallback(() => {
    return performance.now();
  }, []);

  const endTiming = React.useCallback((startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: duration,
    }));
    
    return duration;
  }, []);

  const trackComponentRender = React.useCallback((componentName: string) => {
    setMetrics(prev => ({
      ...prev,
      componentCount: prev.componentCount + 1,
    }));
  }, []);

  return {
    metrics,
    startTiming,
    endTiming,
    trackComponentRender,
  };
};

// Memoized component wrapper
export const MemoizedComponent = React.memo(({ children, ...props }: any) => {
  return React.cloneElement(children as React.ReactElement, props);
});

// Virtualized list helper
export const createVirtualizedList = (
  data: any[],
  renderItem: (item: any, index: number) => React.ReactNode,
  keyExtractor: (item: any, index: number) => string,
  itemHeight: number = 50
) => {
  // This would integrate with react-native-virtualized-lists
  // For now, return basic implementation
  return {
    data,
    renderItem,
    keyExtractor,
    getItemLayout: (data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
  };
};

// Image optimization helper
export const optimizedImageProps = (source: any, options: {
  width?: number;
  height?: number;
  quality?: number;
} = {}) => {
  return {
    source,
    resizeMode: 'cover' as const,
    fadeDuration: 0,
    ...options,
  };
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
};