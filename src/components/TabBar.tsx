import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import ThemedText from './ThemedText';

export interface TabBarItemConfig {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabBarProps {
  items: TabBarItemConfig[];
  activeKey: string;
  onTabPress: (key: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ items, activeKey, onTabPress }) => {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const hasIcon = Boolean(item.icon);

        return (
          <Pressable
            key={item.key}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
            onPress={() => onTabPress(item.key)}
          >
            <View style={styles.tabContent}>
              {hasIcon && (
                <View style={[styles.icon, !isActive && { marginRight: 0 }]}>
                  {item.icon}
                </View>
              )}
              {(!hasIcon || isActive) && (
                <ThemedText
                  variant="body3"
                  color={isActive ? 'primary' : 'secondary'}
                  style={styles.label}
                >
                  {item.label}
                </ThemedText>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    minWidth: 48,
  },
  activeTab: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
});

export default TabBar;
