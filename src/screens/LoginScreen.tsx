import React from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import TextField from '../components/TextField';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import PhoneNumberField, { type PhoneCountryOption } from '../components/PhoneNumberField';
import { theme } from '../theme';

const socialProviders: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'google', label: 'Google', icon: 'logo-google' },
];

export interface LoginScreenProps {
  onSignUp?: () => void;
  onLogin?: () => void;
  onForgotPassword?: () => void;
  initialPhone?: string;
  initialCountryCode?: string;
  onPhoneChange?: (phone: string) => void;
  onCountryCodeChange?: (countryCode: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignUp,
  onLogin,
  onForgotPassword,
  initialPhone = '',
  initialCountryCode,
  onPhoneChange,
  onCountryCodeChange,
}) => {
  const [phone, setPhone] = React.useState(initialPhone);
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);

  const [countryCode, setCountryCode] = React.useState(initialCountryCode);

  const isLoginEnabled = phone.trim().length > 0 && password.trim().length > 0;

  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  React.useEffect(() => {
    setCountryCode(initialCountryCode);
  }, [initialCountryCode]);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    onPhoneChange?.(value);
  };

  const handleCountryChange = (country: PhoneCountryOption) => {
    setCountryCode(country.code);
    onCountryCodeChange?.(country.code);
  };

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
          <LinearGradient
            colors={[theme.colors.primary.dark, theme.colors.primary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.neutral.white} />
              <ThemedText variant="caption1" color="inverse">
                Secure access
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse" style={styles.heroTitle}>
              Welcome back
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              Continue managing your visits, care tasks, and chats in the Tele Heal hub.
            </ThemedText>
          </LinearGradient>

          <ThemedCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <ThemedText variant="headline3" color="primary">
                Sign in to continue
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                Use your registered phone number and password.
              </ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <PhoneNumberField
                label="Phone number"
                value={phone}
                onChangeText={handlePhoneChange}
                countryCode={countryCode}
                onCountryChange={handleCountryChange}
              />
            </View>

            <TextField
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              containerProps={{ style: styles.passwordField }}
            />

            <View style={styles.inlineLinks}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe((prev) => !prev)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
                <ThemedText variant="body3" color="secondary" style={styles.rememberLabel}>
                  Remember me
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
                <ThemedText variant="body3" color="primary" style={styles.linkText}>
                  Forgot password?
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.loginButtonWrapper}>
              <Button
                label="Login"
                variant="primary"
                fullWidth
                style={!isLoginEnabled ? styles.loginButton : undefined}
                disabled={!isLoginEnabled}
                onPress={onLogin}
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
                    console.log(`${provider.label} pressed on Login`);
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
            <ThemedCard style={styles.supportCard}>
              <View style={styles.supportRow}>
                <View style={styles.supportIcon}>
                  <Ionicons name="chatbubbles-outline" size={18} color={theme.colors.primary.main} />
                </View>
                <View style={styles.supportCopy}>
                  <ThemedText variant="headline3" color="primary">
                    Need assistance?
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    Contact care support to recover your account 24/7.
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity style={styles.supportButton} onPress={onForgotPassword} activeOpacity={0.9}>
                <ThemedText variant="caption1" color="inverse" style={styles.supportButtonLabel}>
                  Chat with support
                </ThemedText>
              </TouchableOpacity>
            </ThemedCard>

            <View style={styles.accountPrompt}>
              <ThemedText variant="body2" color="secondary">
                Don't have an account?
              </ThemedText>
              <TouchableOpacity onPress={onSignUp} activeOpacity={0.7}>
                <ThemedText variant="body2" color="primary" style={styles.accountLink}>
                  Create an account
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
  heroCard: {
    marginTop: theme.spacing.lg,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    marginBottom: theme.spacing.xs,
    maxWidth: 240,
  },
  heroSubtitle: {
    marginBottom: theme.spacing.lg,
    maxWidth: 320,
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  heroStatCard: {
    flex: 1,
    minWidth: 110,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: theme.spacing.md,
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
  passwordField: {
    marginTop: theme.spacing.md,
  },
  inlineLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1.5,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.card,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  rememberLabel: {
    marginLeft: 0,
  },
  linkText: {
    fontWeight: '600',
  },
  loginButtonWrapper: {
    marginTop: theme.spacing.lg,
  },
  loginButton: {
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
  supportCard: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportCopy: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  supportButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  supportButtonLabel: {
    fontWeight: '600',
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
  accountLink: {
    fontWeight: '600',
  },
  footerText: {
    marginTop: theme.spacing.sm,
  },
});

export default LoginScreen;
