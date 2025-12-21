import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import { theme } from '../theme';

export type SectionHeaderProps = ViewProps & {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  icon,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.row, style]} {...rest}>
      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          {icon ? (
            <View style={styles.iconWrapper}>
              <Ionicons name={icon} size={16} color={theme.colors.primary.main} />
            </View>
          ) : null}
          <ThemedText variant="headline2" color="primary">
            {title}
          </ThemedText>
        </View>
        {subtitle ? (
          <ThemedText variant="body3" color="secondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress} activeOpacity={0.85}>
          <ThemedText variant="body3" color="secondary">
            {actionLabel}
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: theme.spacing.xs / 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
});

export default SectionHeader;
