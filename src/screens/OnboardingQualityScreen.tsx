import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '../components/ThemedText';
import { theme } from '../theme';
import doctorsIllustration from '../../assets/illustrations/onboarding-quality-reputation.png';

const OnboardingQualityScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.illustrationContainer}>
          <Image
            source={doctorsIllustration}
            style={styles.illustration}
            resizeMode="contain"
            onLoad={() => console.log('Onboarding illustration loaded')}
            onError={(e) =>
              console.log('Onboarding illustration error', e.nativeEvent)
            }
          />
        </View>

        <View style={styles.textContainer}>
          <ThemedText variant="headline1" color="primary" style={styles.title}>
            Quality reputation
          </ThemedText>
          <ThemedText variant="body2" color="secondary" style={styles.body}>
            The team of reputable doctors has many years of professional
            experience.
          </ThemedText>
        </View>

        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
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

export default OnboardingQualityScreen;
