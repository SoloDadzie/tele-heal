import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { theme } from '../theme';

type ProviderVisitWrapUpScreenProps = {
  patientName: string;
  appointmentReason: string;
  scheduledTime: string;
  onBack?: () => void;
  onSubmit?: (payload: {
    notes: string;
    followUp: string;
    billingCode: string;
  }) => void;
};

const BILLING_CODES = ['99213', '99214', '99215', 'Telehealth-extended'];
const FOLLOW_UP_OPTIONS = ['No follow-up needed', 'Schedule video visit', 'Request lab panel', 'Send education pack'];

const ProviderVisitWrapUpScreen: React.FC<ProviderVisitWrapUpScreenProps> = ({
  patientName,
  appointmentReason,
  scheduledTime,
  onBack,
  onSubmit,
}) => {
  const [notes, setNotes] = React.useState('');
  const [billingCode, setBillingCode] = React.useState(BILLING_CODES[0]);
  const [followUp, setFollowUp] = React.useState(FOLLOW_UP_OPTIONS[0]);

  const handleSubmit = () => {
    onSubmit?.({ notes, followUp, billingCode });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View>
          <ThemedText variant="headline3" color="primary">
            Visit wrap-up
          </ThemedText>
          <ThemedText variant="body3" color="secondary">
            {patientName} · {appointmentReason} · {scheduledTime}
          </ThemedText>
        </View>
        <Button label="Back to dashboard" variant="secondary" size="sm" onPress={onBack} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons name="document-text-outline" size={16} color={theme.colors.primary.main} />
            </View>
            <View>
              <ThemedText variant="headline3" color="primary">
                Clinical notes
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Summaries sync to the patient record.
              </ThemedText>
            </View>
          </View>
          <TextField
            multiline
            numberOfLines={6}
            value={notes}
            onChangeText={setNotes}
            placeholder="Key findings, treatment plan, next steps..."
            textAlignVertical="top"
          />
        </ThemedCard>

        <ThemedCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons name="cash-outline" size={16} color={theme.colors.primary.main} />
            </View>
            <View>
              <ThemedText variant="headline3" color="primary">
                Billing & coding
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Choose the code that best matches this visit.
              </ThemedText>
            </View>
          </View>
          <View style={styles.chipRow}>
            {BILLING_CODES.map((code) => {
              const active = billingCode === code;
              return (
                <Button
                  key={code}
                  label={code}
                  variant={active ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => setBillingCode(code)}
                  style={styles.chipButton}
                />
              );
            })}
          </View>
        </ThemedCard>

        <ThemedCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.primary.main} />
            </View>
            <View>
              <ThemedText variant="headline3" color="primary">
                Follow-up
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Let the patient know what happens next.
              </ThemedText>
            </View>
          </View>
          <View style={styles.chipColumn}>
            {FOLLOW_UP_OPTIONS.map((option) => {
              const active = followUp === option;
              return (
                <Button
                  key={option}
                  label={option}
                  variant={active ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => setFollowUp(option)}
                  style={styles.followUpButton}
                />
              );
            })}
          </View>
        </ThemedCard>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save wrap-up" variant="primary" fullWidth onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  topBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chipButton: {
    minWidth: 90,
  },
  chipColumn: {
    gap: theme.spacing.sm,
  },
  followUpButton: {
    justifyContent: 'flex-start',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
  },
});

export default ProviderVisitWrapUpScreen;
