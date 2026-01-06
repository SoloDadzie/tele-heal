import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { theme } from '../theme';
import type { ProviderProfileDraft } from './ProviderOnboardingScreen';
import type { ProviderInviteContext } from './ProviderInviteScreen';

export interface ProviderPendingScreenProps {
  draft: ProviderProfileDraft;
  inviteContext?: ProviderInviteContext | null;
  onBackToStart?: () => void;
  onViewPatientApp?: () => void;
  onOpenDashboard?: () => void;
}

const ProviderPendingScreen: React.FC<ProviderPendingScreenProps> = ({
  draft,
  inviteContext,
  onBackToStart,
  onViewPatientApp,
  onOpenDashboard,
}) => {
  const licenseCount = draft.licenseDocuments?.length ?? 0;
  const malpracticeCount = draft.malpracticeDocuments?.length ?? 0;
  const completedModules = Object.values(draft.trainingModules ?? {}).filter(Boolean).length;
  const totalModules = Object.keys(draft.trainingModules ?? {}).length;
  const allTrainingDone = draft.trainingAcknowledged && completedModules === totalModules && totalModules > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText variant="headline2" color="primary">
          Thanks, {draft.fullName || 'Provider'}!
        </ThemedText>
        <ThemedText variant="body2" color="secondary">
          Your profile is now with Tele Heal credentialing. We typically review documents within 2–3 business days and
          will notify you via email at {draft.email}.
        </ThemedText>

        <ThemedCard style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary.main} />
            <View style={styles.copy}>
              <ThemedText variant="body2" color="primary">
                Credentialing checklist
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                License verification, malpractice coverage, Tele Heal training module.
              </ThemedText>
            </View>
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary.main} />
            <View style={styles.copy}>
              <ThemedText variant="body2" color="primary">
                Estimated response
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                2–3 business days. You can reply to onboarding@teleheal.com with questions.
              </ThemedText>
            </View>
          </View>
        </ThemedCard>

        <ThemedCard style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="mail-open-outline" size={20} color={theme.colors.primary.main} />
            <View style={styles.copy}>
              <ThemedText variant="body2" color="primary">
                Account verification
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                {inviteContext?.accountVerifiedAt
                  ? `Verified ${new Date(inviteContext.accountVerifiedAt).toLocaleString()}`
                  : 'Pending invite validation'}
              </ThemedText>
            </View>
          </View>
          <View style={styles.row}>
            <Ionicons
              name={licenseCount > 0 ? 'document-text-outline' : 'alert-circle-outline'}
              size={20}
              color={licenseCount > 0 ? theme.colors.primary.main : theme.colors.semantic.warning}
            />
            <View style={styles.copy}>
              <ThemedText variant="body2" color="primary">
                Credentials on file
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                {licenseCount} license · {malpracticeCount} malpractice uploads
              </ThemedText>
            </View>
          </View>
          <View style={styles.row}>
            <Ionicons
              name={allTrainingDone ? 'checkmark-circle-outline' : 'play-circle-outline'}
              size={20}
              color={allTrainingDone ? theme.colors.semantic.success : theme.colors.primary.main}
            />
            <View style={styles.copy}>
              <ThemedText variant="body2" color="primary">
                Training progress
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                {completedModules}/{totalModules || 3} modules complete
              </ThemedText>
            </View>
          </View>
        </ThemedCard>

        <ThemedCard style={styles.summaryCard}>
          <ThemedText variant="body2" color="primary">
            Submitted details
          </ThemedText>
          <View style={styles.summaryList}>
            {[
              { label: 'Email', value: draft.email },
              { label: 'Phone', value: draft.phone || '—' },
              { label: 'License', value: draft.licenseNumber ? `${draft.licenseNumber} (${draft.licenseState})` : '—' },
              { label: 'Specialties', value: draft.specialties.join(', ') || '—' },
              { label: 'Consultation mode', value: draft.consultationMode },
              { label: 'Availability', value: draft.availabilityNote || '—' },
              {
                label: 'Account verified',
                value: inviteContext?.accountVerifiedAt
                  ? new Date(inviteContext.accountVerifiedAt).toLocaleDateString()
                  : 'Pending',
              },
              {
                label: 'Credential uploads',
                value: `${licenseCount} license · ${malpracticeCount} malpractice`,
              },
              {
                label: 'Training modules',
                value: allTrainingDone
                  ? `Completed ${draft.trainingCompletedAt ? new Date(draft.trainingCompletedAt).toLocaleDateString() : ''}`
                  : `${completedModules}/${totalModules || 3} complete`,
              },
            ].map((item) => (
              <View key={item.label} style={styles.summaryRow}>
                <ThemedText variant="caption1" color="secondary">
                  {item.label}
                </ThemedText>
                <ThemedText variant="body3" color="primary">
                  {item.value}
                </ThemedText>
              </View>
            ))}
          </View>
        </ThemedCard>

        <Button label="Return to start" variant="primary" fullWidth onPress={onBackToStart} />
        <View style={{ height: theme.spacing.sm }} />
        <Button label="Preview dashboard" variant="secondary" fullWidth onPress={onOpenDashboard} />
        <View style={{ height: theme.spacing.sm }} />
        <Button label="View patient app" variant="secondary" fullWidth onPress={onViewPatientApp} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  summaryCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  summaryList: {
    gap: theme.spacing.sm,
  },
  summaryRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: theme.spacing.xs,
  },
});

export default ProviderPendingScreen;
