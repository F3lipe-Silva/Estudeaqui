import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { useRouter } from 'expo-router';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: string;
  maxItems?: number;
  showHome?: boolean;
  homeLabel?: string;
  homeIcon?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = '/',
  maxItems = 3,
  showHome = true,
  homeLabel = 'Início',
  homeIcon = '🏠'
}) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const handlePress = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  // Add home item if requested
  const allItems = showHome 
    ? [{ label: homeLabel, href: '/', icon: homeIcon }, ...items]
    : items;

  // Truncate items if too many
  let displayItems = allItems;
  if (allItems.length > maxItems) {
    const firstItem = allItems[0];
    const lastItems = allItems.slice(-2);
    displayItems = [
      firstItem,
      { label: '...', href: undefined },
      ...lastItems
    ];
  }

  return (
    <View style={[styles.container, { borderColor: resolvedTheme === 'dark' ? '#252d36' : '#dae6e7' }]}>
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const isClickable = !isLast && item.href;

        return (
          <View key={index} style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => handlePress(item.href)}
              disabled={!isClickable}
              activeOpacity={0.7}
            >
              {item.icon && (
                <Text style={[styles.icon, { color: isLast ? (resolvedTheme === 'dark' ? '#eafafb' : '#29333d') : '#4db8a5' }]}>
                  {item.icon}
                </Text>
              )}
              <ThemedText
                style={[
                  styles.label,
                  {
                    color: isLast 
                      ? (resolvedTheme === 'dark' ? '#eafafb' : '#29333d')
                      : '#4db8a5',
                    fontWeight: isLast ? '600' : '400',
                  }
                ]}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
            
            {!isLast && (
              <Text style={[styles.separator, { color: resolvedTheme === 'dark' ? '#64748b' : '#94a3b8' }]}>
                {separator}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

// Hook for generating breadcrumbs from current route
export const useBreadcrumbs = (customItems?: BreadcrumbItem[]) => {
  const router = useRouter();
  
  // This would typically parse the current route to generate breadcrumbs
  // For now, return custom items or default
  const defaultItems: BreadcrumbItem[] = [
    { label: 'Estudos', href: '/(tabs)/' },
    { label: 'Visão Geral', href: '/(tabs)/' },
  ];

  return customItems || defaultItems;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
  },
  separator: {
    fontSize: 16,
    marginHorizontal: 8,
    opacity: 0.6,
  },
});