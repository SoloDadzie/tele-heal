import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../theme';

export interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
}

const ThemedCard: React.FC<ThemedCardProps> = ({ children, style, ...rest }) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    ...theme.shadows.md,
  },
});

export default ThemedCard;
