import React from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import TextField from '../components/TextField';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import PhoneNumberField from '../components/PhoneNumberField';
import { theme } from '../theme';

const heroSteps: { id: string; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: 'verify', icon: 'shield-checkmark-outline', label: 'Secure identity' },
  { id: 'care', icon: 'medkit-outline', label: 'Match with doctors' },
  { id: 'chat', icon: 'chatbubble-ellipses-outline', label: 'Open chat channel' },
];

const socialProviders: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'google', label: 'Google', icon: 'logo-google' },
];

export interface SignUpScreenProps {
  onBack?: () => void;
  onVerified?: () => void;
  onLogin?: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onBack,
  onVerified,
  onLogin,
}) => {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [phoneCountryCode, setPhoneCountryCode] = React.useState<string | undefined>('GH');

  const isConfirmEnabled = fullName.trim().length > 0 && phone.trim().length > 0;

  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.root,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBarButton} onPress={onBack} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
            </TouchableOpacity>
            <ThemedText variant="headline2" color="primary">
              Create account
            </ThemedText>
            <TouchableOpacity style={styles.topBarAction} onPress={onLogin} activeOpacity={0.85}>
              <ThemedText variant="caption1" color="primary">
                Sign in
              </ThemedText>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={[theme.colors.primary.dark, theme.colors.primary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="flash-outline" size={14} color={theme.colors.neutral.white} />
              <ThemedText variant="caption1" color="inverse">
                Takes 2 minutes
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse" style={styles.heroTitle}>
              Start your care plan
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              Tell us who you are and we’ll connect you to the right doctors, services, and support team.
            </ThemedText>

            <View style={styles.heroStepsRow}>
              {heroSteps.map((step) => (
                <View key={step.id} style={styles.heroStep}>
                  <View style={styles.heroStepIcon}>
                    <Ionicons name={step.icon} size={14} color={theme.colors.primary.main} />
                  </View>
                  <ThemedText variant="caption1" color="inverse">
                    {step.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </LinearGradient>

          <ThemedCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <ThemedText variant="headline3" color="primary">
                Your details
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                We’ll use this to secure your profile and personalize your experience.
              </ThemedText>
            </View>

            <TextField
              label="Full name"
              placeholder="Enter full name"
              value={fullName}
              onChangeText={setFullName}
              containerProps={{ style: styles.fieldSpacing }}
            />

            <TextField
              label="Email address (optional)"
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              containerProps={{ style: styles.fieldSpacing }}
            />

            <View style={styles.fieldGroup}>
              <ThemedText variant="caption1" color="secondary" style={styles.fieldLabel}>
                Phone number
              </ThemedText>
              <PhoneNumberField
                value={phone}
                onChangeText={setPhone}
                countryCode={phoneCountryCode}
                onCountryChange={(country) => setPhoneCountryCode(country.code)}
              />
            </View>

            <View style={styles.confirmButtonWrapper}>
              <Button
                label="Confirm"
                variant="primary"
                fullWidth
                style={!isConfirmEnabled ? styles.confirmButton : undefined}
                disabled={!isConfirmEnabled}
                onPress={onVerified}
              />
            </View>

            <View style={styles.formDivider}>
              <View style={styles.dividerLine} />
              <ThemedText variant="caption1" color="secondary">
                Or continue with
              </ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsRow}>
              {socialProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={styles.socialButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    console.log(`${provider.label} pressed on Sign Up`);
                  }}
                >
                  <Ionicons name={provider.icon as keyof typeof Ionicons} size={18} color={theme.colors.primary.main} />
                  <ThemedText variant="body3" color="primary">
                    {provider.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedCard>

          <View style={styles.secondarySection}>
            <ThemedCard style={styles.infoCard}>
              <ThemedText variant="headline3" color="primary">
                Why we verify
              </ThemedText>
              <View style={styles.infoList}>
                <View style={styles.infoListItem}>
                  <Ionicons name="lock-closed-outline" size={16} color={theme.colors.primary.main} />
                  <ThemedText variant="body3" color="secondary">
                    Keep your medical history secure.
                  </ThemedText>
                </View>
                <View style={styles.infoListItem}>
                  <Ionicons name="medal-outline" size={16} color={theme.colors.primary.main} />
                  <ThemedText variant="body3" color="secondary">
                    Match with verified Tele Heal clinicians.
                  </ThemedText>
                </View>
                <View style={styles.infoListItem}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.colors.primary.main} />
                  <ThemedText variant="body3" color="secondary">
                    Unlock 24/7 care team chat.
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            <View style={styles.accountPrompt}>
              <View>
                <ThemedText variant="body2" color="primary">
                  Already have an account?
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  Sign in to pick up where you left off.
                </ThemedText>
              </View>
              <TouchableOpacity onPress={onLogin} activeOpacity={0.85} style={styles.accountButton}>
                <ThemedText variant="caption1" color="inverse">
                  Sign in
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  root: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.lg,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  topBarAction: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  heroCard: {
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    marginBottom: theme.spacing.xs,
    maxWidth: 260,
  },
  heroSubtitle: {
    marginBottom: theme.spacing.lg,
    maxWidth: 320,
  },
  heroStepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  heroStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroStepIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  formHeader: {
    gap: theme.spacing.xs,
  },
  fieldGroup: {
    gap: theme.spacing.sm,
  },
  fieldLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldSpacing: {
    marginBottom: theme.spacing.md,
  },
  confirmButtonWrapper: {
    marginTop: theme.spacing.md,
  },
  confirmButton: {
    backgroundColor: theme.colors.border.medium,
  },
  formDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  socialButton: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  secondarySection: {
    gap: theme.spacing.md,
  },
  infoCard: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  infoList: {
    gap: theme.spacing.sm,
  },
  infoListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  accountPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
  },
  accountButton: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
});

export default SignUpScreen;
