import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

export interface ScreenProps extends ViewProps {
  children: React.ReactNode;
}

const Screen: React.FC<ScreenProps> = ({ children, style, ...rest }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Screen;
