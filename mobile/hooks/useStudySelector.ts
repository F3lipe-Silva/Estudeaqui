import { useMemo } from 'react';
import { useStudy } from '@/contexts/study-context';
import { StudyData } from '@/lib/types';

// Define selector function type
type Selector<T> = (state: StudyData) => T;

/**
 * Custom hook that allows components to subscribe to only specific parts of the study context state
 * This prevents unnecessary re-renders when other parts of the state change
 */
export function useStudySelector<T>(selector: Selector<T>): T {
  const { data } = useStudy();
  
  // Memoize the selected data to prevent unnecessary recalculations
  const selectedData = useMemo(() => {
    return selector(data);
  }, [data, selector]);

  return selectedData;
}