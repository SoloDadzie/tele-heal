import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import { theme } from '../theme';
import type { HospitalItem } from './SelectHospitalScreen';
import type { VisitDetails } from './VisitDetailsScreen';
import type { DoctorListItem } from './DoctorListScreen';

export type BookingConfirmationScreenProps = {
  hospital: HospitalItem;
  appointmentTime: { dayLabel: string; time: string };
  visitDetails?: VisitDetails | null;
  doctor?: DoctorListItem | null;
  onConfirm: () => void;
  onBack: () => void;
};

const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  hospital,
  appointmentTime,
  visitDetails,
  doctor,
  onConfirm,
  onBack,
}) => {
  const appointmentTypeLabel =
    visitDetails?.appointmentType === 'urgent'
      ? 'Urgent care'
      : visitDetails?.appointmentType === 'scheduled'
      ? 'Scheduled'
      : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary">
            Confirm booking
          </ThemedText>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
                Appointment secured
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse">
              Last step before we lock it in
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              Review the hospital, doctor, and timing to make sure everything looks correct.
            </ThemedText>
          </LinearGradient>

          <ThemedCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <Ionicons name="location-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View>
                <ThemedText variant="headline3" color="primary">
                  {hospital.name}
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {hospital.address}
                </ThemedText>
              </View>
            </View>
            <View style={styles.summaryMetaRow}>
              <View style={styles.detailRow}>
                <ThemedText variant="caption1" color="secondary">
                  Rating
                </ThemedText>
                <ThemedText variant="body2" color="primary">
                  {hospital.rating} ★ ({hospital.reviews})
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText variant="caption1" color="secondary">
                  Distance
                </ThemedText>
                <ThemedText variant="body2" color="primary">
                  {hospital.distance}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          <ThemedCard style={styles.timelineCard}>
            <ThemedText variant="headline3" color="primary">
              Appointment overview
            </ThemedText>
            <View style={styles.timelineRowSingle}>
              <View style={styles.timelineIconWrapper}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body2" color="primary" style={styles.timelineValue}>
                  {appointmentTime.dayLabel}
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {appointmentTime.time}
                </ThemedText>
              </View>
            </View>
            <View style={styles.timelineHintRow}>
              <Ionicons name="time-outline" size={14} color={theme.colors.primary.main} />
              <ThemedText variant="caption1" color="secondary">
                This is shown in your local time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </ThemedText>
            </View>
          </ThemedCard>

          {doctor && (
            <ThemedCard style={styles.secondaryCard}>
              <View style={styles.secondaryHeader}>
                <View style={styles.summaryIcon}>
                  <Ionicons name="person-outline" size={18} color={theme.colors.primary.main} />
                </View>
                <View>
                  <ThemedText variant="headline3" color="primary">
                    {doctor.name}
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    {doctor.specialty} · {doctor.rating} ★ ({doctor.reviews})
                  </ThemedText>
                </View>
              </View>
              <View style={styles.detailRow}>
                <ThemedText variant="caption1" color="secondary">
                  Response time
                </ThemedText>
                <ThemedText variant="body2" color="primary">
                  {doctor.responseTime}
                </ThemedText>
              </View>
            </ThemedCard>
          )}

          {visitDetails && (
            <ThemedCard style={styles.secondaryCard}>
              <View style={styles.secondaryHeader}>
                <View style={styles.summaryIcon}>
                  <Ionicons name="document-text-outline" size={18} color={theme.colors.primary.main} />
                </View>
                <View>
                  <ThemedText variant="headline3" color="primary">
                    Visit details
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    {visitDetails.reason}
                  </ThemedText>
                </View>
              </View>
              {appointmentTypeLabel && (
                <View style={styles.detailRow}>
                  <ThemedText variant="caption1" color="secondary">
                    Appointment type
                  </ThemedText>
                  <ThemedText variant="body2" color="primary">
                    {appointmentTypeLabel}
                  </ThemedText>
                </View>
              )}
              <View style={styles.attachmentsHeader}>
                <ThemedText variant="caption1" color="secondary">
                  Attachments
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  {visitDetails.attachments.length}
                </ThemedText>
              </View>
              {visitDetails.attachments.length > 0 ? (
                <View style={styles.attachmentsList}>
                  {visitDetails.attachments.map((file) => (
                    <View key={file} style={styles.attachmentItem}>
                      <Ionicons name="document-outline" size={14} color={theme.colors.primary.main} />
                      <ThemedText variant="caption1" color="primary" numberOfLines={1}>
                        {file.split('/').pop()}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ) : (
                <ThemedText variant="caption1" color="secondary">
                  None provided
                </ThemedText>
              )}
            </ThemedCard>
          )}

          <ThemedCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-unread-outline" size={18} color={theme.colors.primary.main} />
              <ThemedText variant="body2" color="primary" style={styles.infoText}>
                Confirmation will arrive via email and SMS as soon as you submit.
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9}>
              <ThemedText variant="caption1" color="primary">
                Need to change something? Contact support
              </ThemedText>
            </TouchableOpacity>
          </ThemedCard>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} activeOpacity={0.9}>
            <ThemedText variant="body2" color="inverse">
              Confirm appointment
            </ThemedText>
          </TouchableOpacity>
        </View>
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
    backgroundColor: theme.colors.background.muted,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
    gap: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.lg,
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
  heroSubtitle: {
    opacity: 0.9,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  heroMetaCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  summaryCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  timelineCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  timelineRowSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  timelineIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineValue: {
    fontWeight: '600',
  },
  timelineHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.muted,
  },
  secondaryCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  secondaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCard: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
  },
  attachmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  attachmentsList: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.lg,
  },
  confirmButton: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
});

export default BookingConfirmationScreen;
