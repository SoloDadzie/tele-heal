import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import { theme } from '../theme';

const CODE_LENGTH = 6;

export interface VerifyNumberScreenProps {
  onBack?: () => void;
  onDone?: () => void;
}

const VerifyNumberScreen: React.FC<VerifyNumberScreenProps> = ({
  onBack,
  onDone,
}) => {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const [deliveryStatus, setDeliveryStatus] = useState<'justSent' | 'resent'>('justSent');
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const isCodeComplete = code.every((digit) => digit && digit.length === 1);
  const canResend = resendTimer === 0;

  const handleChange = (value: string, index: number) => {
    const cleaned = value.replace(/\D/g, '');

    // If OS autofills the entire OTP (e.g., from SMS), distribute across boxes
    if (cleaned.length > 1) {
      const next = Array(CODE_LENGTH).fill('');
      for (let i = 0; i < CODE_LENGTH; i += 1) {
        next[i] = cleaned[i] ?? '';
      }
      setCode(next);
      // Move focus to the last box when autofilled
      inputsRef.current[CODE_LENGTH - 1]?.focus();
      return;
    }

    const digit = cleaned.slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const current = code[index];

      if (!current && index > 0) {
        const next = [...code];
        next[index - 1] = '';
        setCode(next);
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  React.useEffect(() => {
    if (resendTimer === 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResendCode = () => {
    if (!canResend) return;
    setCode(Array(CODE_LENGTH).fill(''));
    inputsRef.current[0]?.focus();
    setResendTimer(30);
    setDeliveryStatus('resent');
  };

  const deliveryCopy = useMemo(() => {
    if (deliveryStatus === 'resent') {
      return 'A new code was just sent. Check your latest SMS and autofill suggestions.';
    }
    return 'We sent the code via SMS and push. It usually arrives in under 30 seconds.';
  }, [deliveryStatus]);

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
              Verify code
            </ThemedText>
            <TouchableOpacity style={styles.topBarAction} activeOpacity={0.85}>
              <Ionicons name="help-circle-outline" size={18} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={[theme.colors.primary.dark, theme.colors.primary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.neutral.white} />
              <ThemedText variant="caption1" color="inverse">
                Secure step
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse" style={styles.heroTitle}>
              Confirm your phone
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              We just sent a 6-digit code to your registered number. Enter it below to continue.
            </ThemedText>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaCard}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.neutral.white} />
                <View>
                  <ThemedText variant="headline3" color="inverse">
                    {deliveryStatus === 'resent' ? 'Code resent' : 'SMS delivery'}
                  </ThemedText>
                  <ThemedText variant="caption1" color="inverse">
                    {canResend ? 'Ready to resend again' : `Wait ${resendTimer.toString().padStart(2, '0')}s to resend`}
                  </ThemedText>
                </View>
              </View>
            </View>
          </LinearGradient>

          <ThemedCard style={styles.codeCard}>
            <View style={styles.cardHeader}>
              <ThemedText variant="headline3" color="primary">
                Enter verification code
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                {deliveryCopy}
              </ThemedText>
            </View>

            <View style={styles.codeRow}>
              {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                const digit = code[index] ?? '';

                return (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputsRef.current[index] = ref;
                    }}
                    style={styles.codeInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(value) => handleChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    {...(index === 0 ? { textContentType: 'oneTimeCode' as const } : {})}
                  />
                );
              })}
            </View>

            <Button
              label="Confirm"
              variant="primary"
              fullWidth
              style={!isCodeComplete ? styles.confirmButton : undefined}
              disabled={!isCodeComplete}
              onPress={onDone}
            />

            <View style={styles.inlineActions}>
              <TouchableOpacity
                activeOpacity={canResend ? 0.85 : 1}
                onPress={handleResendCode}
                disabled={!canResend}
              >
                <ThemedText
                  variant="body3"
                  color={canResend ? 'primary' : 'secondary'}
                  style={[styles.resendText, !canResend && styles.resendDisabledText]}
                >
                  {canResend ? 'Resend code' : `Resend in 00:${resendTimer.toString().padStart(2, '0')}`}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7}>
                <ThemedText variant="body3" color="primary">
                  Change number
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedCard>

          <ThemedCard style={styles.deliveryPreviewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="notifications-outline" size={18} color={theme.colors.primary.main} />
              <ThemedText variant="headline3" color="primary">
                How reminders appear
              </ThemedText>
            </View>
            <View style={styles.previewRow}>
              <View style={styles.previewIcon}>
                <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary.main} />
              </View>
              <View style={styles.previewCopy}>
                <ThemedText variant="body3" color="primary">
                  SMS
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  “TeleHeal: 123456 is your verification code.”
                </ThemedText>
              </View>
            </View>
            <View style={styles.previewRow}>
              <View style={styles.previewIcon}>
                <Ionicons name="notifications-outline" size={16} color={theme.colors.primary.main} />
              </View>
              <View style={styles.previewCopy}>
                <ThemedText variant="body3" color="primary">
                  Push notification
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  Appears on every device where you’re signed in.
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          <ThemedCard style={styles.supportCard}>
            <View style={styles.supportRow}>
              <View style={styles.supportIcon}>
                <Ionicons name="chatbubbles-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View style={styles.supportCopy}>
                <ThemedText variant="headline3" color="primary">
                  Didn’t get the code?
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  Contact care support and we’ll help verify your account manually.
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.supportButton} activeOpacity={0.9}>
              <ThemedText variant="caption1" color="inverse" style={styles.supportButtonLabel}>
                Chat with support
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
  topBarAction: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
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
  codeCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  cardHeader: {
    gap: theme.spacing.xs,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border.light,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: theme.colors.background.muted,
  },
  confirmButton: {
    backgroundColor: theme.colors.neutral.medium,
  },
  inlineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resendText: {
    fontWeight: '600',
  },
  resendDisabledText: {
    opacity: 0.6,
  },
  deliveryPreviewCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCopy: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  supportCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
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
});

export default VerifyNumberScreen;
