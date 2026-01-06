import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import { theme } from '../theme';

export type ErrorAlertProps = {
  title?: string;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  visible?: boolean;
};

/**
 * ErrorAlert Component
 * Displays user-friendly error messages with optional retry action
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Error',
  message,
  onDismiss,
  onRetry,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons
            name="alert-circle"
            size={20}
            color={theme.colors.semantic.danger}
            accessibilityLabel="Error icon"
          />
          <ThemedText variant="body2" color="primary" style={styles.title}>
            {title}
          </ThemedText>
        </View>
        <ThemedText variant="body3" color="secondary" style={styles.message}>
          {message}
        </ThemedText>
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
              accessibilityLabel="Retry button"
              accessibilityRole="button"
            >
              <ThemedText variant="body3" color="primary">
                Retry
              </ThemedText>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
              accessibilityLabel="Dismiss error"
              accessibilityRole="button"
            >
              <ThemedText variant="body3" color="primary">
                Dismiss
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.semantic.dangerLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.semantic.danger,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  content: {
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  message: {
    marginLeft: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    marginLeft: 28,
  },
  button: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
  },
  retryButton: {
    borderColor: theme.colors.semantic.danger,
    backgroundColor: theme.colors.semantic.danger,
  },
  dismissButton: {
    borderColor: theme.colors.text.secondary,
    backgroundColor: 'transparent',
  },
});

export default ErrorAlert;
