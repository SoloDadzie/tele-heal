import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';
import ThemedText from './ThemedText';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  containerProps?: ViewProps;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  error,
  containerProps,
  leftIcon,
  rightIcon,
  style,
  onPress,
  ...rest
}) => {
  const hasError = Boolean(error);

  const fieldContent = (
    <View
      style={[
        styles.fieldContainer,
        hasError && { borderColor: theme.colors.semantic.danger },
      ]}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={theme.colors.text.placeholder}
        {...rest}
      />
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );

  return (
    <View style={styles.wrapper} {...containerProps}>
      {label && (
        <ThemedText
          variant="caption1"
          color="secondary"
          style={styles.label}
        >
          {label}
        </ThemedText>
      )}
      {onPress ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
          {fieldContent}
        </TouchableOpacity>
      ) : (
        fieldContent
      )}
      {!!helperText && !hasError && (
        <ThemedText variant="caption2" color="secondary" style={styles.helper}>
          {helperText}
        </ThemedText>
      )}
      {!!error && (
        <ThemedText variant="caption2" style={styles.error}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
  },
  label: {
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border.light,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: theme.spacing.md,
  },
  rightIcon: {
    marginLeft: theme.spacing.md,
  },
  helper: {
    marginTop: theme.spacing.sm,
  },
  error: {
    marginTop: theme.spacing.sm,
    color: theme.colors.semantic.danger,
    fontWeight: '500',
  },
});

export default TextField;
