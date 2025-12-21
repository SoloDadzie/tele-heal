import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import ThemedText from './ThemedText';
import { theme } from '../theme';

export interface NavigationBarProps extends ViewProps {
  title?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  title,
  leftContent,
  rightContent,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={styles.side}>{leftContent}</View>
      <View style={styles.center}>
        {title && (
          <ThemedText variant="headline2" color="primary">
            {title}
          </ThemedText>
        )}
      </View>
      <View style={styles.sideRight}>{rightContent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  side: {
    width: 48,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  sideRight: {
    width: 48,
    alignItems: 'flex-end',
  },
});

export default NavigationBar;
