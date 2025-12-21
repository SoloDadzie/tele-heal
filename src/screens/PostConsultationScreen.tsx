import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import { theme } from '../theme';
import type { Appointment } from './ScheduleScreen';
import type { PrescriptionItem } from './PrescriptionsScreen';
import type { LabRequest, LabUpload } from './LabsScreen';

export type PostConsultationScreenProps = {
  appointment: Appointment;
  onBack: () => void;
  onDone: () => void;
  onOpenPayment?: () => void;
  onOpenMessages?: () => void;
  prescriptions: PrescriptionItem[];
  labRequests: LabRequest[];
  labUploads: LabUpload[];
  onOpenPrescriptions: () => void;
  onOpenLabs: () => void;
};

const labResultStatuses = [
  { id: 'cbc', name: 'Complete blood count', status: 'Processing', eta: 'ETA 2 hrs' },
  { id: 'electrolyte', name: 'Electrolyte panel', status: 'Ready', eta: 'View now' },
  { id: 'imaging', name: 'Head CT', status: 'Scheduled', eta: 'Tomorrow 9:00' },
];

const PostConsultationScreen: React.FC<PostConsultationScreenProps> = ({
  appointment,
  onBack,
  onDone,
  onOpenPayment,
  onOpenMessages,
  prescriptions,
  labRequests,
  labUploads,
  onOpenPrescriptions,
  onOpenLabs,
}) => {
  const [rating, setRating] = React.useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary">
            Consultation summary
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
              <Ionicons name="sparkles-outline" size={14} color={theme.colors.neutral.white} />
              <ThemedText variant="caption1" color="inverse">
                Visit complete
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse">
              Next steps for your care
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              Keep this summary handy—meds, labs, and follow-up plans are all captured below.
            </ThemedText>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaCard}>
                <Ionicons name="person-outline" size={16} color={theme.colors.neutral.white} />
                <View>
                  <ThemedText variant="headline3" color="inverse">
                    {appointment.doctorName}
                  </ThemedText>
                  <ThemedText variant="caption1" color="inverse">
                    {appointment.serviceLabel}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.heroMetaCard}>
                <Ionicons name="time-outline" size={16} color={theme.colors.neutral.white} />
                <View>
                  <ThemedText variant="headline3" color="inverse">
                    {appointment.timeLabel}
                  </ThemedText>
                  <ThemedText variant="caption1" color="inverse">
                    {appointment.dateLabel}
                  </ThemedText>
                </View>
              </View>
            </View>
          </LinearGradient>

          <ThemedCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <Ionicons name="medkit-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View>
                <ThemedText variant="headline3" color="primary">
                  Visit summary
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {appointment.serviceLabel}
                </ThemedText>
              </View>
            </View>
            <View style={styles.summaryMetaRow}>
              <ThemedText variant="caption1" color="secondary">
                Doctor notes
              </ThemedText>
              <ThemedText variant="body3" color="primary">
                Patient reports dizziness when standing. Hydration improved symptoms. Continue monitoring blood pressure
                twice daily for the next week and report if readings stay elevated.
              </ThemedText>
            </View>
          </ThemedCard>

          <ThemedCard style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.summaryIcon}>
                <Ionicons name="card-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="headline3" color="primary">
                  Payment & insurance
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  TeleHeal Premium • Copay due today
                </ThemedText>
              </View>
              <TouchableOpacity activeOpacity={0.85} onPress={onOpenPayment}>
                <ThemedText variant="caption1" color="primary">
                  View
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.paymentRow}>
              <ThemedText variant="caption1" color="secondary">
                Visit total
              </ThemedText>
              <ThemedText variant="body2" color="primary">
                $250
              </ThemedText>
            </View>
            <View style={styles.paymentRow}>
              <ThemedText variant="caption1" color="secondary">
                Insurance covered
              </ThemedText>
              <ThemedText variant="body2" color="primary">
                - $200
              </ThemedText>
            </View>
            <View style={styles.paymentRow}>
              <ThemedText variant="caption1" color="secondary">
                Amount due
              </ThemedText>
              <ThemedText variant="headline3" color="primary">
                $50
              </ThemedText>
            </View>
            <Button label="Pay $50 now" variant="primary" fullWidth onPress={onOpenPayment} />
          </ThemedCard>

          <ThemedCard style={styles.listCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="clipboard-outline" size={18} color={theme.colors.primary.main} />
              <ThemedText variant="headline3" color="primary">
                Prescriptions
              </ThemedText>
            </View>
            {prescriptions.map((rx) => (
              <View key={rx.id} style={styles.listRow}>
                <View style={styles.listIcon}>
                  <Ionicons name="medical" size={16} color={theme.colors.primary.main} />
                </View>
                <View style={styles.listContent}>
                  <ThemedText variant="body2" color="primary">
                    {rx.name}
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    {rx.instructions}
                  </ThemedText>
                </View>
                <View style={styles.listMeta}>
                  <ThemedText variant="caption1" color="secondary">
                    {rx.dosage}
                  </ThemedText>
                </View>
              </View>
            ))}
            <Button label="View full list" variant="secondary" fullWidth onPress={onOpenPrescriptions} />
          </ThemedCard>

          <ThemedCard style={styles.listCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="flask-outline" size={18} color={theme.colors.primary.main} />
              <ThemedText variant="headline3" color="primary">
                Labs & imaging
              </ThemedText>
            </View>
            {labRequests.map((order) => (
              <View key={order.id} style={styles.listRow}>
                <View style={styles.listIcon}>
                  <Ionicons name="document-text-outline" size={16} color={theme.colors.primary.main} />
                </View>
                <View style={styles.listContent}>
                  <ThemedText variant="body2" color="primary">
                    {order.name}
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    Ordered by {order.orderingDoctor} · {order.orderedOn}
                  </ThemedText>
                </View>
                <View style={[styles.resultStatus, order.status === 'ready' && styles.resultStatusReady]}>
                  <ThemedText variant="caption1" color={order.status === 'ready' ? 'inverse' : 'primary'}>
                    {order.status === 'scheduled' && 'Scheduled'}
                    {order.status === 'processing' && 'Processing'}
                    {order.status === 'ready' && 'Ready'}
                  </ThemedText>
                </View>
              </View>
            ))}
            <Button label="Open labs & scans" variant="secondary" fullWidth onPress={onOpenLabs} />
          </ThemedCard>

          <ThemedCard style={styles.resultsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bar-chart-outline" size={18} color={theme.colors.primary.main} />
              <ThemedText variant="headline3" color="primary">
                Uploaded results
              </ThemedText>
            </View>
            {labUploads.length === 0 ? (
              <ThemedText variant="body3" color="secondary">
                Share completed lab or imaging results so your doctor can review them.
              </ThemedText>
            ) : (
              labUploads.map((result) => (
                <View key={result.id} style={styles.resultRow}>
                  <View>
                    <ThemedText variant="body2" color="primary">
                      {result.name}
                    </ThemedText>
                    <ThemedText variant="caption1" color="secondary">
                      Submitted {result.submittedAt}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.resultStatus,
                      result.status === 'reviewed' && styles.resultStatusReady,
                    ]}
                  >
                    <ThemedText variant="caption1" color={result.status === 'reviewed' ? 'inverse' : 'primary'}>
                      {result.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                    </ThemedText>
                  </View>
                </View>
              ))
            )}
          </ThemedCard>

          <ThemedCard style={styles.followUpCard}>
            <View style={styles.followUpHeader}>
              <View style={styles.summaryIcon}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="headline3" color="primary">
                  Follow-up plan
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  Schedule a follow-up video visit in 2 weeks to review symptoms and lab results.
                </ThemedText>
              </View>
            </View>
            <Button label="Book follow-up" variant="secondary" fullWidth onPress={onDone} />
          </ThemedCard>

          <ThemedCard style={styles.messageCard}>
            <View style={styles.messageRow}>
              <View style={styles.summaryIcon}>
                <Ionicons name="chatbubbles-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="headline3" color="primary">
                  Stay connected
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  Message your provider for 24 hours after this visit.
                </ThemedText>
              </View>
            </View>
            <Button
              label="Message provider"
              variant="secondary"
              fullWidth
              onPress={onOpenMessages}
            />
          </ThemedCard>

          <ThemedCard style={styles.ratingCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="star-outline" size={18} color={theme.colors.primary.main} />
              <ThemedText variant="headline3" color="primary">
                Rate your consultation
              </ThemedText>
            </View>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setRating(value)} activeOpacity={0.85}>
                  <Ionicons
                    name={value <= rating ? 'star' : 'star-outline'}
                    size={30}
                    color={value <= rating ? theme.colors.accent.main : theme.colors.border.medium}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Button label="Submit rating" variant="primary" fullWidth onPress={onDone} />
          </ThemedCard>
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
    paddingBottom: theme.spacing.xxl * 1.5,
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
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    minWidth: 150,
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
  paymentCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    gap: theme.spacing.xs,
  },
  listCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  resultsCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  resultStatus: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  resultStatusReady: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  resultStatusScheduled: {
    borderColor: theme.colors.accent.coral,
  },
  messageCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flex: 1,
  },
  listAction: {
    alignItems: 'flex-end',
  },
  pharmacyRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  secondaryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm / 1.2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  followUpCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  ratingCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default PostConsultationScreen;
