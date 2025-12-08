import { useTheme } from '../contexts/theme-context';

export function useColorScheme() {
  const context = useTheme();
  return context.resolvedTheme;
}
