import React from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import PhoneNumberField from '../components/PhoneNumberField';
import ThemedCard from '../components/ThemedCard';
import ErrorAlert from '../components/ErrorAlert';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

export interface ForgotPasswordScreenProps {
  onBack?: () => void;
  onCodeSent?: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onCodeSent,
}) => {
  const { resetPassword } = useAuth();
  const [phone, setPhone] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const canSendCode = phone.trim().length > 0;

  const handleSendCode = async () => {
    setError(null);
    
    if (!phone.trim()) {
      setError({
        title: 'Invalid Phone',
        message: 'Please enter a valid phone number.',
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await resetPassword(phone);

      if (result.success) {
        onCodeSent?.();
      } else {
        setError({
          title: 'Reset Failed',
          message: result.error || 'Failed to send reset code. Please try again.',
        });
      }
    } catch (err: any) {
      setError({
        title: 'Reset Failed',
        message: err.message || 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Forgot password
            </ThemedText>
            <View style={styles.topBarSpacer} />
          </View>

          <LinearGradient
            colors={[theme.colors.primary.dark, theme.colors.primary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="lock-closed-outline" size={14} color={theme.colors.neutral.white} />
              <ThemedText variant="caption1" color="inverse">
                Secure reset
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse" style={styles.heroTitle}>
              Recover your account
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              We’ll send a verification code to your phone so you can create a new password.
            </ThemedText>
          </LinearGradient>

          <ThemedCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <ThemedText variant="headline3" color="primary">
                Send reset code
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                Enter the phone number linked to your Tele Heal account.
              </ThemedText>
            </View>

            <PhoneNumberField value={phone} onChangeText={setPhone} />

            <Button
              label="Send code"
              variant="primary"
              fullWidth
              style={!canSendCode ? styles.sendButton : undefined}
              disabled={!canSendCode}
              onPress={handleSendCode}
            />

            <View style={styles.formHint}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary.main} />
              <ThemedText variant="caption1" color="secondary">
                You’ll receive a one-time SMS. Standard carrier rates may apply.
              </ThemedText>
            </View>
          </ThemedCard>

          <ThemedCard style={styles.secondaryCard}>
            <ThemedText variant="headline3" color="primary">
              Need another way?
            </ThemedText>
            <View style={styles.optionRow}>
              <Ionicons name="mail-outline" size={16} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="secondary">
                Send magic link to registered email
              </ThemedText>
            </View>
            <View style={styles.optionRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="secondary">
                Chat with care support to recover access
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9}>
              <ThemedText variant="caption1" color="inverse" style={styles.secondaryButtonLabel}>
                Contact support
              </ThemedText>
            </TouchableOpacity>
          </ThemedCard>
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
  topBarSpacer: {
    width: 40,
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
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  heroMetaCard: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  formCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  formHeader: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm / 1.2,
  },
  flagContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialCode: {
    fontWeight: '600',
  },
  phoneInputWrapper: {
    flex: 1,
  },
  sendButton: {
    backgroundColor: theme.colors.neutral.medium,
  },
  formHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  secondaryCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  secondaryButtonLabel: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  modalItem: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
});

export default ForgotPasswordScreen;
