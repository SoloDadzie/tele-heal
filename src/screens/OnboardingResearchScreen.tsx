import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { theme } from '../theme';
import researchIllustration from '../../assets/illustrations/onboarding-research-deep-testing.png';

const OnboardingResearchScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topContent}>
          <View style={styles.illustrationContainer}>
            <Image
              source={researchIllustration}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <ThemedText
              variant="headline1"
              color="primary"
              style={styles.title}
            >
              Research, deep testing
            </ThemedText>
            <ThemedText variant="body2" color="secondary" style={styles.body}>
              Ensure the most accurate results for you and your family's
              health.
            </ThemedText>
          </View>

          <View style={styles.pagination}>
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button label="Get Started" variant="primary" fullWidth />
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
    paddingBottom: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  topContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  buttonContainer: {
    paddingBottom: theme.spacing.lg,
  },
});

export default OnboardingResearchScreen;
