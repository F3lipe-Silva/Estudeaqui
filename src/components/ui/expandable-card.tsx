/**
 * Expandable Card Component
 * Provides collapsible content sections with smooth animations
 * Improves content organization and reduces scrolling
 */

"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpandableCardProps {
  title: string;
  children?: React.ReactNode;
  expandedContent: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
}

export function ExpandableCard({
  title,
  children,
  expandedContent,
  defaultExpanded = false,
  className,
  titleClassName,
  contentClassName,
  icon,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/50',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          titleClassName
        )}
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={`expandable-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label={isExpanded ? 'Recolher' : 'Expandir'}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      </CardHeader>

      {/* Preview content when collapsed */}
      {!isExpanded && children && (
        <CardContent className="pb-4">
          {children}
        </CardContent>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardContent
              id={`expandable-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className={cn('pt-0', contentClassName)}
            >
              {expandedContent}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Animated Button with feedback
interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  feedbackType?: 'light' | 'medium' | 'heavy';
}

export function AnimatedButton({
  feedbackType = 'light',
  onClick,
  ...props
}: AnimatedButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Add visual feedback
    const button = e.currentTarget;
    button.style.transform = 'scale(0.95)';

    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

    onClick?.(e);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        {...props}
        onClick={handleClick}
        className={cn('touch-target', props.className)}
      />
    </motion.div>
  );
}