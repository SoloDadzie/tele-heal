import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '../components/ThemedText';
import { theme } from '../theme';
import onlineCheckIllustration from '../../assets/illustrations/onboarding-online-health-check.png';

const OnboardingOnlineCheckScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.illustrationContainer}>
          <Image
            source={onlineCheckIllustration}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={styles.separator} />
        </View>

        <View style={styles.textContainer}>
          <ThemedText variant="headline1" color="primary" style={styles.title}>
            Online health check
          </ThemedText>
          <ThemedText variant="body2" color="secondary" style={styles.body}>
            Easy and convenient online check-ups right from your home.
          </ThemedText>
        </View>

        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 1.4,
    paddingBottom: theme.spacing.xl * 1.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 260,
  },
  illustration: {
    width: '80%',
    height: 220,
  },
  separator: {
    marginTop: theme.spacing.lg,
    width: '80%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.background.muted,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl * 2,
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl * 2.1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: theme.colors.primary.main,
  },
  dotInactive: {
    backgroundColor: theme.colors.primary.light,
  },
});

export default OnboardingOnlineCheckScreen;
