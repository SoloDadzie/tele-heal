import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { theme } from '../theme';
import type { PrescriptionItem } from './PrescriptionsScreen';

export type PatientPrescriptionSharingScreenProps = {
  prescriptions: PrescriptionItem[];
  onBack?: () => void;
};

const PatientPrescriptionSharingScreen: React.FC<PatientPrescriptionSharingScreenProps> = ({
  prescriptions,
  onBack,
}) => {
  const [selectedPrescriptions, setSelectedPrescriptions] = React.useState<Set<string>>(new Set());
  const [shareStatus, setShareStatus] = React.useState<'idle' | 'sharing' | 'success'>('idle');

  const togglePrescription = (id: string) => {
    setSelectedPrescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleShareSelected = async () => {
    if (selectedPrescriptions.size === 0) return;

    setShareStatus('sharing');
    const selectedRxs = prescriptions.filter((rx) => selectedPrescriptions.has(rx.id));
    const message = selectedRxs
      .map(
        (rx) =>
          `${rx.name} - ${rx.dosage}\nInstructions: ${rx.instructions}\nIssued by: ${rx.issuedBy}`
      )
      .join('\n\n');

    try {
      await Share.share({
        message: `My Prescriptions:\n\n${message}`,
        title: 'Share Prescriptions',
      });
      setShareStatus('success');
      setTimeout(() => {
        setShareStatus('idle');
        setSelectedPrescriptions(new Set());
      }, 2000);
    } catch (error) {
      console.error('Failed to share prescriptions', error);
      setShareStatus('idle');
    }
  };

  const handleShareAll = async () => {
    if (prescriptions.length === 0) return;

    setShareStatus('sharing');
    const message = prescriptions
      .map(
        (rx) =>
          `${rx.name} - ${rx.dosage}\nInstructions: ${rx.instructions}\nIssued by: ${rx.issuedBy}`
      )
      .join('\n\n');

    try {
      await Share.share({
        message: `My Prescriptions:\n\n${message}`,
        title: 'Share All Prescriptions',
      });
      setShareStatus('success');
      setTimeout(() => {
        setShareStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to share all prescriptions', error);
      setShareStatus('idle');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          Share prescriptions
        </ThemedText>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {prescriptions.length === 0 ? (
          <ThemedCard style={styles.emptyCard}>
            <Ionicons
              name="medical-outline"
              size={48}
              color={theme.colors.primary.light}
              style={styles.emptyIcon}
            />
            <ThemedText variant="headline3" color="primary">
              No prescriptions
            </ThemedText>
            <ThemedText variant="body3" color="secondary" style={styles.emptyText}>
              You don't have any prescriptions to share yet.
            </ThemedText>
          </ThemedCard>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText variant="headline3" color="primary">
                  Your prescriptions
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  {selectedPrescriptions.size} selected
                </ThemedText>
              </View>

              <View style={styles.prescriptionsList}>
                {prescriptions.map((rx) => {
                  const isSelected = selectedPrescriptions.has(rx.id);
                  return (
                    <TouchableOpacity
                      key={rx.id}
                      style={[styles.prescriptionCard, isSelected && styles.prescriptionCardSelected]}
                      onPress={() => togglePrescription(rx.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.checkboxContainer}>
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={theme.colors.neutral.white}
                            />
                          )}
                        </View>
                      </View>

                      <View style={styles.prescriptionInfo}>
                        <ThemedText variant="body2" color="primary">
                          {rx.name}
                        </ThemedText>
                        <ThemedText variant="caption1" color="secondary">
                          {rx.dosage}
                        </ThemedText>
                        <ThemedText variant="caption1" color="secondary" style={styles.instructions}>
                          {rx.instructions}
                        </ThemedText>
                        <View style={styles.prescriptionMeta}>
                          <ThemedText variant="caption2" color="secondary">
                            {rx.issuedBy}
                          </ThemedText>
                          <ThemedText variant="caption2" color="secondary">
                            {rx.refillsRemaining} refills
                          </ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.actionsSection}>
              <Button
                label={shareStatus === 'success' ? 'Shared!' : 'Share selected'}
                variant="primary"
                disabled={selectedPrescriptions.size === 0 || shareStatus === 'sharing'}
                onPress={handleShareSelected}
              />
              <Button
                label={shareStatus === 'success' ? 'Shared!' : 'Share all'}
                variant="secondary"
                disabled={shareStatus === 'sharing'}
                onPress={handleShareAll}
              />
            </View>

            {shareStatus === 'success' && (
              <ThemedCard style={styles.successCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.semantic.success}
                />
                <ThemedText variant="body3" color="primary">
                  Prescriptions shared successfully
                </ThemedText>
              </ThemedCard>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prescriptionsList: {
    gap: theme.spacing.md,
  },
  prescriptionCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  prescriptionCardSelected: {
    backgroundColor: theme.colors.primary.light,
    borderColor: theme.colors.primary.main,
  },
  checkboxContainer: {
    justifyContent: 'flex-start',
    paddingTop: theme.spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  prescriptionInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  instructions: {
    marginTop: theme.spacing.xs,
  },
  prescriptionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  actionsSection: {
    gap: theme.spacing.md,
  },
  emptyCard: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.semantic.successLight,
  },
});

export default PatientPrescriptionSharingScreen;
