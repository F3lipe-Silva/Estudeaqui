/**
 * Design System Tokens for Estudeaqui Web App
 * Centralizes all design tokens for consistent UI/UX
 */

export const designTokens = {
  // Colors - HSL values for CSS custom properties
  colors: {
    // Primary palette
    primary: 'hsl(221 83% 53%)', // #2563EB
    primaryForeground: 'hsl(210 40% 98%)', // #FAFAFA

    // Secondary palette
    secondary: 'hsl(210 40% 96%)', // #F1F5F9
    secondaryForeground: 'hsl(222 84% 5%)', // #0F172A

    // Destructive
    destructive: 'hsl(0 84% 60%)', // #EF4444
    destructiveForeground: 'hsl(210 40% 98%)', // #FAFAFA

    // Muted
    muted: 'hsl(210 40% 96%)', // #F1F5F9
    mutedForeground: 'hsl(215 16% 47%)', // #64748B

    // Accent
    accent: 'hsl(210 40% 96%)', // #F1F5F9
    accentForeground: 'hsl(222 84% 5%)', // #0F172A

    // Background
    background: 'hsl(0 0% 100%)', // #FFFFFF
    foreground: 'hsl(222 84% 5%)', // #0F172A

    // Card
    card: 'hsl(0 0% 100%)', // #FFFFFF
    cardForeground: 'hsl(222 84% 5%)', // #0F172A

    // Border
    border: 'hsl(214 32% 91%)', // #E2E8F0
    input: 'hsl(214 32% 91%)', // #E2E8F0
    ring: 'hsl(221 83% 53%)', // #2563EB

    // Status colors
    success: 'hsl(142 76% 36%)', // #22C55E
    warning: 'hsl(38 92% 50%)', // #F59E0B
    error: 'hsl(0 84% 60%)', // #EF4444
    info: 'hsl(199 89% 48%)', // #3B82F6
  },

  // Dark mode colors
  darkColors: {
    background: 'hsl(222 84% 5%)', // #0F172A
    foreground: 'hsl(210 40% 98%)', // #FAFAFA
    card: 'hsl(222 84% 5%)', // #0F172A
    cardForeground: 'hsl(210 40% 98%)', // #FAFAFA
    muted: 'hsl(217 33% 17%)', // #1E293B
    mutedForeground: 'hsl(215 20% 65%)', // #94A3B8
    border: 'hsl(217 33% 17%)', // #1E293B
    input: 'hsl(217 33% 17%)', // #1E293B
  },

  // Spacing scale
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
  },

  // Typography scale
  typography: {
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    '2xl': '1rem',  // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },

  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },
} as const;

// Utility functions
export const getColor = (color: keyof typeof designTokens.colors, isDark = false) => {
  if (isDark && color in designTokens.darkColors) {
    return designTokens.darkColors[color as keyof typeof designTokens.darkColors];
  }
  return designTokens.colors[color];
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => designTokens.spacing[size];

export const getFontSize = (size: keyof typeof designTokens.typography.fontSize) => designTokens.typography.fontSize[size];

export const getBorderRadius = (size: keyof typeof designTokens.borderRadius) => designTokens.borderRadius[size];

export const getShadow = (size: keyof typeof designTokens.shadows) => designTokens.shadows[size];

// CSS Custom Properties for global use
export const cssVariables = {
  // Colors
  '--color-primary': designTokens.colors.primary,
  '--color-primary-foreground': designTokens.colors.primaryForeground,
  '--color-secondary': designTokens.colors.secondary,
  '--color-secondary-foreground': designTokens.colors.secondaryForeground,
  '--color-destructive': designTokens.colors.destructive,
  '--color-destructive-foreground': designTokens.colors.destructiveForeground,
  '--color-muted': designTokens.colors.muted,
  '--color-muted-foreground': designTokens.colors.mutedForeground,
  '--color-accent': designTokens.colors.accent,
  '--color-accent-foreground': designTokens.colors.accentForeground,
  '--color-background': designTokens.colors.background,
  '--color-foreground': designTokens.colors.foreground,
  '--color-card': designTokens.colors.card,
  '--color-card-foreground': designTokens.colors.cardForeground,
  '--color-border': designTokens.colors.border,
  '--color-input': designTokens.colors.input,
  '--color-ring': designTokens.colors.ring,
  '--color-success': designTokens.colors.success,
  '--color-warning': designTokens.colors.warning,
  '--color-error': designTokens.colors.error,
  '--color-info': designTokens.colors.info,

  // Dark colors
  '--color-background-dark': designTokens.darkColors.background,
  '--color-foreground-dark': designTokens.darkColors.foreground,
  '--color-card-dark': designTokens.darkColors.card,
  '--color-card-foreground-dark': designTokens.darkColors.cardForeground,
  '--color-muted-dark': designTokens.darkColors.muted,
  '--color-muted-foreground-dark': designTokens.darkColors.mutedForeground,
  '--color-border-dark': designTokens.darkColors.border,
  '--color-input-dark': designTokens.darkColors.input,

  // Spacing
  '--spacing-1': designTokens.spacing[1],
  '--spacing-2': designTokens.spacing[2],
  '--spacing-3': designTokens.spacing[3],
  '--spacing-4': designTokens.spacing[4],
  '--spacing-6': designTokens.spacing[6],
  '--spacing-8': designTokens.spacing[8],
  '--spacing-12': designTokens.spacing[12],
  '--spacing-16': designTokens.spacing[16],

  // Typography
  '--font-size-xs': designTokens.typography.fontSize.xs,
  '--font-size-sm': designTokens.typography.fontSize.sm,
  '--font-size-base': designTokens.typography.fontSize.base,
  '--font-size-lg': designTokens.typography.fontSize.lg,
  '--font-size-xl': designTokens.typography.fontSize.xl,
  '--font-size-2xl': designTokens.typography.fontSize['2xl'],
  '--font-size-3xl': designTokens.typography.fontSize['3xl'],

  // Animations
  '--transition-duration-fast': designTokens.animations.duration.fast,
  '--transition-duration-normal': designTokens.animations.duration.normal,
  '--transition-duration-slow': designTokens.animations.duration.slow,
  '--transition-easing': designTokens.animations.easing.ease,

  // Layout
  '--header-height': '4rem', // 64px
  '--sidebar-width': '16rem', // 256px
  '--bottom-nav-height': '5rem', // 80px
} as const;