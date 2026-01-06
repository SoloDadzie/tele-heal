import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import TextField from '../components/TextField';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import { theme } from '../theme';

export type ProviderInviteContext = {
  inviteCode: string;
  email: string;
  fullName?: string;
  specialties?: string[];
  accountVerifiedAt?: string;
};

export interface ProviderInviteScreenProps {
  onBack?: () => void;
  onInviteValidated?: (context: ProviderInviteContext) => void;
}

type ValidationState = 'idle' | 'validating' | 'success' | 'error' | 'expired';
type VerificationPhase = 'invite' | 'otp' | 'verified';

const ProviderInviteScreen: React.FC<ProviderInviteScreenProps> = ({
  onBack,
  onInviteValidated,
}) => {
  const [email, setEmail] = React.useState('');
  const [inviteCode, setInviteCode] = React.useState('');
  const [status, setStatus] = React.useState<ValidationState>('idle');
  const [statusMessage, setStatusMessage] = React.useState('');
  const [phase, setPhase] = React.useState<VerificationPhase>('invite');
  const [otp, setOtp] = React.useState('');
  const [otpStatus, setOtpStatus] = React.useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [otpMessage, setOtpMessage] = React.useState('');
  const MOCK_OTP = '000000';

  const isFormValid = email.trim().length > 0 && inviteCode.trim().length > 0;
  const isOtpEnabled = phase === 'otp' || phase === 'verified';
  const isOtpValid = otp.trim().length === MOCK_OTP.length;

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const validateInviteCode = (value: string) => /^TH-[0-9A-Z]{4,}$/.test(value.trim());

  const handleValidate = () => {
    if (!isFormValid) return;

    if (!validateEmail(email)) {
      setStatus('error');
      setStatusMessage('Enter a valid work email (example@clinic.com).');
      return;
    }
    if (!validateInviteCode(inviteCode)) {
      setStatus('error');
      setStatusMessage('Invite codes start with TH- followed by your digits.');
      return;
    }

    setStatus('validating');
    setStatusMessage('');
    setPhase('invite');
    setOtp('');
    setOtpStatus('idle');
    setOtpMessage('');

    setTimeout(() => {
      const normalized = inviteCode.trim().toUpperCase();
      if (normalized.includes('EXPIRE')) {
        setStatus('expired');
        setStatusMessage('This invite has expired. Please ask the Tele Heal team for a new link.');
        return;
      }
      if (!normalized.startsWith('TH-')) {
        setStatus('error');
        setStatusMessage('Invite code not recognized. Double-check the digits or contact support.');
        return;
      }

      setStatus('success');
      setPhase('otp');
      setStatusMessage('Invite verified. Enter the 6-digit code we just sent to your email.');
    }, 900);
  };

  const handleVerifyOtp = () => {
    if (!isOtpValid || phase === 'verified') return;
    setOtpStatus('checking');
    setOtpMessage('');

    setTimeout(() => {
      if (otp.trim() !== MOCK_OTP) {
        setOtpStatus('error');
        setOtpMessage('Code does not match. Please double-check the digits.');
        return;
      }

      setOtpStatus('success');
      setOtpMessage('Account verified. You can continue to onboarding.');
      setPhase('verified');
      onInviteValidated?.({
        inviteCode: inviteCode.trim().toUpperCase(),
        email: email.trim(),
        fullName: 'Dr. Jordan Ama',
        specialties: ['Primary Care', 'Telemedicine'],
        accountVerifiedAt: new Date().toISOString(),
      });
    }, 600);
  };

  const renderStatusIcon = () => {
    if (status === 'validating') {
      return <Ionicons name="time-outline" size={18} color={theme.colors.text.secondary} />;
    }
    if (status === 'success') {
      return <Ionicons name="checkmark-circle" size={18} color={theme.colors.semantic.success} />;
    }
    if (status === 'expired') {
      return <Ionicons name="alert-circle" size={18} color={theme.colors.semantic.warning} />;
    }
    if (status === 'error') {
      return <Ionicons name="close-circle" size={18} color={theme.colors.semantic.danger} />;
    }
    return null;
  };

  const renderStatusColor = () => {
    if (status === 'success') return theme.colors.semantic.success;
    if (status === 'expired') return theme.colors.semantic.warning;
    if (status === 'error') return theme.colors.semantic.danger;
    return theme.colors.text.secondary;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.topButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline3" color="primary">
            Provider access
          </ThemedText>
          <View style={styles.topButtonPlaceholder} />
        </View>

        <LinearSpotlight />

        <ThemedCard style={styles.formCard}>
          <View style={styles.formHeader}>
            <ThemedText variant="headline3" color="primary">
              Enter your invite details
            </ThemedText>
            <ThemedText variant="body3" color="secondary">
              Tele Heal providers are invited directly by our credentialing team. Please supply the
              email and invite code from your welcome message.
            </ThemedText>
          </View>

          <TextField label="Work email" value={email} keyboardType="email-address" onChangeText={setEmail} editable={phase === 'invite'} />
          <View style={styles.fieldSpacing} />
          <TextField
            label="Invite code"
            placeholder="TH-XXXXXX"
            value={inviteCode}
            autoCapitalize="characters"
            onChangeText={setInviteCode}
            editable={phase === 'invite'}
          />

          {!!statusMessage && (
            <View style={styles.statusRow}>
              {renderStatusIcon()}
              <ThemedText variant="caption1" color="secondary" style={[styles.statusText, { color: renderStatusColor() }]}>
                {statusMessage}
              </ThemedText>
            </View>
          )}

          {phase === 'invite' && (
            <Button
              label={status === 'validating' ? 'Validating...' : 'Validate invite'}
              variant="primary"
              fullWidth
              disabled={!isFormValid || status === 'validating'}
              onPress={handleValidate}
            />
          )}
        </ThemedCard>

        {isOtpEnabled && (
          <ThemedCard style={styles.otpCard}>
            <View style={styles.formHeader}>
              <ThemedText variant="headline3" color="primary">
                Secure verification
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                Enter the one-time code we emailed to {email || 'your inbox'} to confirm your identity.
              </ThemedText>
            </View>
            <TextField
              label="6-digit code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              placeholder="••••••"
              maxLength={6}
            />
            <ThemedText variant="caption1" color="secondary">
              Tester hint: use 000000 while backend delivery is pending.
            </ThemedText>
            {!!otpMessage && (
              <ThemedText
                variant="caption1"
                color={otpStatus === 'success' ? 'primary' : 'secondary'}
                style={otpStatus === 'error' ? styles.otpError : undefined}
              >
                {otpMessage}
              </ThemedText>
            )}
            {phase !== 'verified' && (
              <Button
                label={otpStatus === 'checking' ? 'Verifying...' : 'Verify code'}
                variant="primary"
                fullWidth
                disabled={!isOtpValid || otpStatus === 'checking'}
                onPress={handleVerifyOtp}
              />
            )}
            {phase === 'verified' && (
              <Button label="Verified" variant="secondary" fullWidth disabled leftIcon="checkmark-circle-outline" />
            )}
          </ThemedCard>
        )}

        <ThemedCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary.main} />
            </View>
            <View style={styles.infoCopy}>
              <ThemedText variant="body2" color="primary">
                Why we require invites
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Tele Heal vets each clinician’s credentials, malpractice coverage, and availability to maintain a safe
                virtual clinic.
              </ThemedText>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.primary.main} />
            </View>
            <View style={styles.infoCopy}>
              <ThemedText variant="body2" color="primary">
                Need help?
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Email onboarding@teleheal.com if your link expired or details don’t match.
              </ThemedText>
            </View>
          </View>
        </ThemedCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const LinearSpotlight = () => (
  <ThemedCard style={styles.heroCard}>
    <ThemedText variant="caption1" color="secondary" style={styles.heroBadge}>
      Welcome clinicians
    </ThemedText>
    <ThemedText variant="headline2" color="primary">
      Bring your expertise to Tele Heal
    </ThemedText>
    <ThemedText variant="body2" color="secondary">
      Validate your invite to unlock the onboarding walkthrough, share credentials, set availability, and start caring
      for patients virtually.
    </ThemedText>
    <View style={styles.heroHighlights}>
      {['Full control of your schedule', 'Async & live consult options', 'Dedicated care coordinator support'].map(
        (item) => (
          <View key={item} style={styles.heroHighlight}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary.main} />
            <ThemedText variant="caption1" color="primary">
              {item}
            </ThemedText>
          </View>
        ),
      )}
    </View>
  </ThemedCard>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  topButtonPlaceholder: {
    width: 40,
  },
  heroCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxxl,
    gap: theme.spacing.md,
  },
  heroBadge: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroHighlights: {
    gap: theme.spacing.xs,
  },
  heroHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  formCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  formHeader: {
    gap: theme.spacing.xs,
  },
  fieldSpacing: {
    height: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    flex: 1,
  },
  infoCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  otpCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  otpError: {
    color: theme.colors.semantic.danger,
  },
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
});

export default ProviderInviteScreen;
