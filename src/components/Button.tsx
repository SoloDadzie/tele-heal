import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from 'react-native';
import ThemedText, { type TextVariant } from './ThemedText';
import { theme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textVariant?: TextVariant;
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  textVariant,
  disabled,
  style,
  accessibilityLabel,
  accessibilityHint,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const computedVariant: TextVariant =
    textVariant ??
    (size === 'sm' ? 'body3' : size === 'lg' ? 'headline2' : 'body2');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      {...rest}
    >
      <View style={styles.content}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <ThemedText
          variant={computedVariant}
          color={variant === 'primary' ? 'inverse' : 'primary'}
          style={
            variant === 'ghost' || variant === 'outline'
              ? { color: theme.colors.text.primary }
              : undefined
          }
        >
          {loading ? ' ' : label}
        </ThemedText>
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator
              size="small"
              color={
                variant === 'primary'
                  ? theme.colors.text.inverse
                  : theme.colors.text.primary
              }
            />
          </View>
        )}
      </View>
    </Pressable>
  );
};

const sizeStyles: Record<ButtonSize, any> = {
  sm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 34,
  },
  md: {
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 48,
  },
  lg: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl + 8,
    minHeight: 56,
  },
};

const variantStyles: Record<ButtonVariant, any> = {
  primary: {
    backgroundColor: theme.colors.primary.main,
  },
  secondary: {
    backgroundColor: theme.colors.primary.light,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary.main,
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.shadows.sm,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
