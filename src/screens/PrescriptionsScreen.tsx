import React from 'react';
import { Alert, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import Button from '../components/Button';
import { theme } from '../theme';

export type PrescriptionItem = {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  issuedOn: string;
  issuedBy: string;
  refillsRemaining: number;
};

type PrescriptionsScreenProps = {
  onBack: () => void;
  prescriptions: PrescriptionItem[];
  onRemovePrescription?: (id: string) => void;
};

const formatPrescription = (rx: PrescriptionItem) =>
  `${rx.name} (${rx.dosage})\nInstructions: ${rx.instructions}\nPrescribed by ${
    rx.issuedBy
  } on ${rx.issuedOn}\nRefills remaining: ${rx.refillsRemaining}`;

const PrescriptionsScreen: React.FC<PrescriptionsScreenProps> = ({ onBack, prescriptions, onRemovePrescription }) => {
  const handleShareSingle = React.useCallback(async (rx: PrescriptionItem) => {
    try {
      await Share.share({
        message: formatPrescription(rx),
      });
    } catch (error) {
      console.error('Failed to share prescription', error);
      Alert.alert('Unable to share', 'Please try again in a moment.');
    }
  }, []);

  const handleShareAll = React.useCallback(async () => {
    if (!prescriptions.length) {
      Alert.alert('No prescriptions', 'There are no prescriptions to share yet.');
      return;
    }
    try {
      const summary = prescriptions.map((rx) => formatPrescription(rx)).join('\n\n');
      await Share.share({
        title: 'TeleHeal prescriptions',
        message: summary,
      });
    } catch (error) {
      console.error('Failed to share all prescriptions', error);
      Alert.alert('Unable to share', 'Please try again in a moment.');
    }
  }, [prescriptions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary">
            Prescriptions
          </ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedCard style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Ionicons name="medkit-outline" size={14} color={theme.colors.neutral.white} />
              <ThemedText variant="caption1" color="inverse">
                Medication list
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse" style={styles.heroTitle}>
              Everything your doctor prescribed in one place
            </ThemedText>
            <ThemedText variant="body3" color="inverse" style={styles.heroSubtitle}>
              Review instructions, refill guidance, and share with your local pharmacy when needed.
            </ThemedText>
          </ThemedCard>

          <ThemedCard style={styles.exportCard}>
            <View style={styles.exportHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="share-social-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="headline3" color="primary">
                  Need a pharmacy copy?
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  Share a digital copy before you head to any pharmacy. They can scan the info straight from your phone.
                </ThemedText>
              </View>
            </View>
            <View style={styles.exportActions}>
              <Button label="Share full list" variant="primary" onPress={handleShareAll} fullWidth />
              <ThemedText variant="caption1" color="secondary" style={{ textAlign: 'center' }}>
                Tip: You can also screenshot this page after sharing for quick reference.
              </ThemedText>
            </View>
          </ThemedCard>

          {prescriptions.map((rx) => (
            <ThemedCard key={rx.id} style={styles.prescriptionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="medical-outline" size={18} color={theme.colors.primary.main} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="headline3" color="primary">
                    {rx.name}
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    {rx.dosage}
                  </ThemedText>
                </View>
                <View style={styles.statusPill}>
                  <ThemedText variant="caption1" color="primary">
                    {rx.refillsRemaining} refills
                  </ThemedText>
                </View>
              </View>
              <View style={styles.detailRow}>
                <ThemedText variant="caption1" color="secondary">
                  Instructions
                </ThemedText>
                <ThemedText variant="body3" color="primary">
                  {rx.instructions}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText variant="caption1" color="secondary">
                  Prescribed by
                </ThemedText>
                <ThemedText variant="body3" color="primary">
                  {rx.issuedBy}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText variant="caption1" color="secondary">
                  Issued
                </ThemedText>
                <ThemedText variant="body3" color="primary">
                  {rx.issuedOn}
                </ThemedText>
              </View>
              <View style={styles.actionRow}>
                <Button label="Share instructions" variant="secondary" fullWidth onPress={() => handleShareSingle(rx)} />
                {onRemovePrescription && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    activeOpacity={0.85}
                    onPress={() => {
                      Alert.alert('Mark as picked up', `Remove ${rx.name} from your list?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => onRemovePrescription(rx.id),
                        },
                      ]);
                    }}
                  >
                    <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.primary.main} />
                    <ThemedText variant="body3" color="primary">
                      Mark as picked up
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </ThemedCard>
          ))}

          {prescriptions.length === 0 && (
            <ThemedCard style={styles.emptyCard}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary.main} />
              <ThemedText variant="body2" color="primary">
                Prescriptions from your doctor will appear here.
              </ThemedText>
            </ThemedCard>
          )}
        </ScrollView>
      </View>
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
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  topBarButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  heroCard: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroTitle: {
    lineHeight: 28,
  },
  heroSubtitle: {
    lineHeight: 20,
  },
  prescriptionCard: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  exportCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  exportActions: {
    gap: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  detailRow: {
    gap: theme.spacing.xs,
  },
  actionRow: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    alignSelf: 'center',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
});

export default PrescriptionsScreen;
