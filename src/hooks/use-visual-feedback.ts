/**
 * Hook for visual feedback (ripple effects, scale animations)
 * Provides haptic-like feedback for web interactions
 */

import { useCallback } from 'react';

export type FeedbackType = 'light' | 'medium' | 'heavy';

export const useVisualFeedback = () => {
  const triggerFeedback = useCallback((type: FeedbackType = 'light') => {
    // Create ripple effect on document body
    const ripple = document.createElement('div');
    ripple.className = `fixed inset-0 pointer-events-none z-50 ${
      type === 'light' ? 'bg-primary/5' :
      type === 'medium' ? 'bg-primary/10' :
      'bg-primary/20'
    } animate-pulse`;

    document.body.appendChild(ripple);

    // Remove after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 200);
  }, []);

  return { triggerFeedback };
};