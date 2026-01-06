import React from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import TabBar from '../components/TabBar';
import ThemedCard from '../components/ThemedCard';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';
import { theme } from '../theme';
import { formatCurrency } from '../utils/currency';
import scheduleIllustration from '../../assets/illustrations/schedule-calendar.png';

export type AppointmentStatus = 'pendingPayment' | 'paid';

export type AppointmentGroup = 'today' | 'upcoming';
export type AppointmentVisitType = 'virtual' | 'inPerson' | 'lab';
export type AppointmentPrepStatus = 'notStarted' | 'inProgress' | 'complete';

export type Appointment = {
  id: string;
  code: string;
  serviceLabel: string;
  total: string;
  amountValue: number;
  currency?: string;
  status: AppointmentStatus;
  doctorName: string;
  dateLabel: string;
  timeLabel: string;
  group: AppointmentGroup;
  visitType?: AppointmentVisitType;
  locationLabel?: string;
  prepStatus?: AppointmentPrepStatus;
  prepNote?: string;
};

export type ScheduleScreenProps = {
  onGoHome: () => void;
  onOpenService: () => void;
  onOpenAppointments?: () => void;
  onOpenProfile?: () => void;
  onOpenChat?: () => void;
  appointments?: Appointment[];
  onCancelAppointment?: (id: string) => void;
  onRescheduleAppointment?: (
    id: string,
    dateLabel: string,
    timeLabel: string,
    group: AppointmentGroup,
  ) => void;
  onOpenPreConsultation?: (appointment: Appointment) => void;
  onPayAppointment?: (appointment: Appointment) => void;
};

const formatAppointmentTotal = (appointment: Appointment) =>
  appointment.amountValue ? formatCurrency(appointment.amountValue) : appointment.total || formatCurrency(0);

const visitTypeMeta: Record<
  AppointmentVisitType,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    backgroundColor: string;
    iconColor: string;
  }
> = {
  virtual: {
    label: 'Virtual video visit',
    icon: 'videocam-outline',
    backgroundColor: 'rgba(99,102,241,0.14)',
    iconColor: theme.colors.primary.main,
  },
  inPerson: {
    label: 'In-person visit',
    icon: 'business-outline',
    backgroundColor: 'rgba(16,185,129,0.14)',
    iconColor: theme.colors.semantic.success,
  },
  lab: {
    label: 'Lab / diagnostics',
    icon: 'flask-outline',
    backgroundColor: 'rgba(14,165,233,0.14)',
    iconColor: theme.colors.accent.main,
  },
};

const prepStatusMeta: Record<
  AppointmentPrepStatus,
  {
    label: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    backgroundColor: string;
    iconColor: string;
  }
> = {
  notStarted: {
    label: 'Prep not started',
    subtitle: 'Complete intake checklist',
    icon: 'alert-circle-outline',
    backgroundColor: 'rgba(248,113,113,0.15)',
    iconColor: theme.colors.semantic.danger,
  },
  inProgress: {
    label: 'Prep in progress',
    subtitle: 'Finish pending steps',
    icon: 'time-outline',
    backgroundColor: 'rgba(251,191,36,0.18)',
    iconColor: theme.colors.accent.main,
  },
  complete: {
    label: 'Prep ready',
    subtitle: 'All tasks complete',
    icon: 'checkmark-done-outline',
    backgroundColor: 'rgba(16,185,129,0.18)',
    iconColor: theme.colors.semantic.success,
  },
};

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  onGoHome,
  onOpenService,
  onOpenProfile,
  onOpenChat,
  appointments = [],
  onCancelAppointment,
  onRescheduleAppointment,
  onOpenPreConsultation,
  onPayAppointment,
}) => {
  const [activeTab, setActiveTab] = React.useState('schedule');

  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(
    null,
  );
  const [isDetailsModalVisible, setIsDetailsModalVisible] = React.useState(false);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = React.useState(false);

  const groupedAppointments = React.useMemo(
    () => ({
      today: appointments.filter((appt) => appt.group === 'today'),
      upcoming: appointments.filter((appt) => appt.group === 'upcoming'),
    }),
    [appointments],
  );

  const hasTodayAppointments = groupedAppointments.today.length > 0;
  const hasUpcomingAppointments = groupedAppointments.upcoming.length > 0;
  const hasAppointments = hasTodayAppointments || hasUpcomingAppointments;

  const rescheduleOptions = React.useMemo(
    () => [
      {
        id: 'opt-1',
        dateLabel: 'Tomorrow',
        timeLabel: '11:00 AM',
        group: 'upcoming' as const,
      },
      {
        id: 'opt-2',
        dateLabel: 'Saturday, 16 Dec',
        timeLabel: '09:30 AM',
        group: 'upcoming' as const,
      },
      {
        id: 'opt-3',
        dateLabel: 'Monday, 18 Dec',
        timeLabel: '03:00 PM',
        group: 'upcoming' as const,
      },
    ],
    [],
  );

  const tabItems = React.useMemo(
    () => [
      {
        key: 'home',
        label: 'Home',
        icon: (
          <Ionicons
            name="home-outline"
            size={18}
            color={
              activeTab === 'home'
                ? theme.colors.text.inverse
                : theme.colors.text.secondary
            }
          />
        ),
      },
      {
        key: 'schedule',
        label: 'Schedule',
        icon: (
          <Ionicons
            name="calendar-outline"
            size={18}
            color={
              activeTab === 'schedule'
                ? theme.colors.text.inverse
                : theme.colors.text.secondary
            }
          />
        ),
      },
      {
        key: 'chat',
        label: 'Chat',
        icon: (
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={
              activeTab === 'chat'
                ? theme.colors.text.inverse
                : theme.colors.text.secondary
            }
          />
        ),
      },
      {
        key: 'profile',
        label: 'Profile',
        icon: (
          <Ionicons
            name="person-outline"
            size={18}
            color={
              activeTab === 'profile'
                ? theme.colors.text.inverse
                : theme.colors.text.secondary
            }
          />
        ),
      },
    ],
    [activeTab],
  );

  const handleTabPress = (key: string) => {
    if (key === 'home') {
      setActiveTab('home');
      onGoHome();
    } else if (key === 'chat' && onOpenChat) {
      setActiveTab('chat');
      onOpenChat();
    } else if (key === 'profile' && onOpenProfile) {
      setActiveTab('profile');
      onOpenProfile();
    } else {
      setActiveTab(key);
    }
  };

  const handleCancelPress = (id: string) => {
    if (!onCancelAppointment) return;

    Alert.alert(
      'Cancel appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel appointment', style: 'destructive', onPress: () => onCancelAppointment(id) },
      ],
    );
  };

  const handleConfirmReschedule = (
    option: (typeof rescheduleOptions)[number],
  ) => {
    if (!selectedAppointment || !onRescheduleAppointment) {
      setIsRescheduleModalVisible(false);
      return;
    }

    onRescheduleAppointment(
      selectedAppointment.id,
      option.dateLabel,
      option.timeLabel,
      option.group,
    );
    setIsRescheduleModalVisible(false);
  };

  const selectedStatusText =
    selectedAppointment?.status === 'pendingPayment'
      ? 'Waiting for payment'
      : 'Paid & confirmed';

  const metrics = React.useMemo(() => {
    const pendingCount = appointments.filter((appt) => appt.status === 'pendingPayment').length;
    return [
      { id: 'metric-today', label: 'Today', value: String(groupedAppointments.today.length) },
      { id: 'metric-upcoming', label: 'Upcoming', value: String(groupedAppointments.upcoming.length) },
      { id: 'metric-pending', label: 'Pending payment', value: `${pendingCount}` },
    ];
  }, [appointments, groupedAppointments.today.length, groupedAppointments.upcoming.length]);

  const renderAppointmentCard = (appointment: Appointment) => {
    const isPendingPayment = appointment.status === 'pendingPayment';
    const visitMeta = appointment.visitType ? visitTypeMeta[appointment.visitType] : null;
    const prepMeta = appointment.prepStatus ? prepStatusMeta[appointment.prepStatus] : null;
    const formattedTotal = React.useMemo(() => {
      try {
        return new Intl.NumberFormat('en-GH', {
          style: 'currency',
          currency: appointment.currency ?? 'GHS',
          maximumFractionDigits: 0,
        }).format(appointment.amountValue || 0);
      } catch {
        return appointment.total || 'GH₵0';
      }
    }, [appointment.amountValue, appointment.currency, appointment.total]);

    return (
      <ThemedCard key={appointment.id} style={styles.paymentCard}>
        <View style={styles.paymentHeaderRow}>
          <View style={styles.paymentHeaderInfo}>
            <ThemedText variant="body2" color="primary" style={styles.serviceTitle}>
              {appointment.serviceLabel}
            </ThemedText>
            <ThemedText variant="caption1" color="secondary">
              {appointment.code}
            </ThemedText>
          </View>
          <View
            style={[
              styles.paymentStatusPill,
              isPendingPayment
                ? styles.paymentStatusPillPending
                : styles.paymentStatusPillConfirmed,
            ]}
          >
            <ThemedText
              variant="caption1"
              color={isPendingPayment ? 'primary' : 'inverse'}
            >
              {isPendingPayment ? 'Waiting for payment' : 'Confirmed'}
            </ThemedText>
          </View>
        </View>

        {(visitMeta || appointment.locationLabel) && (
          <View style={styles.visitContextRow}>
            {visitMeta && (
              <View style={[styles.visitTypePill, { backgroundColor: visitMeta.backgroundColor }]}>
                <Ionicons
                  name={visitMeta.icon}
                  size={14}
                  color={visitMeta.iconColor}
                />
                <ThemedText
                  variant="caption1"
                  color="primary"
                  style={[styles.visitTypeText, { color: visitMeta.iconColor }]}
                >
                  {visitMeta.label}
                </ThemedText>
              </View>
            )}
            {appointment.locationLabel && (
              <View style={styles.locationChip}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={theme.colors.text.secondary}
                />
                <ThemedText variant="caption1" color="secondary" style={styles.locationText}>
                  {appointment.locationLabel}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        <View style={styles.appointmentMetaRow}>
          <View style={styles.appointmentMetaItem}>
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={theme.colors.text.secondary}
              style={styles.appointmentMetaIcon}
            />
            <ThemedText variant="body3" color="secondary">
              {appointment.doctorName}
            </ThemedText>
          </View>
          <View style={styles.appointmentMetaItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.colors.text.secondary}
              style={styles.appointmentMetaIcon}
            />
            <ThemedText variant="body3" color="secondary">
              {appointment.dateLabel} {appointment.timeLabel}
            </ThemedText>
          </View>
        </View>

        <View style={styles.paymentMetaRow}>
          <View style={styles.paymentPriceRow}>
            <ThemedText
              variant="body3"
              color="secondary"
              style={styles.priceLabel}
            >
              Total:
            </ThemedText>
            <ThemedText
              variant="headline3"
              color="primary"
              style={styles.priceValue}
            >
              {formattedTotal}
            </ThemedText>
          </View>
        </View>

        {prepMeta && (
          <TouchableOpacity
            style={[styles.prepStatusCard, { backgroundColor: prepMeta.backgroundColor }]}
            activeOpacity={onOpenPreConsultation ? 0.85 : 1}
            onPress={() => onOpenPreConsultation?.(appointment)}
          >
            <Ionicons name={prepMeta.icon} size={18} color={prepMeta.iconColor} />
            <View style={styles.prepStatusCopy}>
              <ThemedText variant="body3" color="primary" style={[styles.prepStatusTitle, { color: prepMeta.iconColor }]}>
                {prepMeta.label}
              </ThemedText>
              <ThemedText variant="caption1" color="primary" style={styles.prepStatusSubtitle}>
                {appointment.prepNote ?? prepMeta.subtitle}
              </ThemedText>
            </View>
            {onOpenPreConsultation && (
              <Ionicons name="arrow-forward" size={16} color={prepMeta.iconColor} />
            )}
          </TouchableOpacity>
        )}

        <View style={styles.appointmentSecondaryRow}>
          <TouchableOpacity
            style={styles.secondaryAction}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedAppointment(appointment);
              setIsDetailsModalVisible(true);
            }}
          >
            <ThemedText variant="body3" color="primary">
              View details
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryAction}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedAppointment(appointment);
              setIsRescheduleModalVisible(true);
            }}
          >
            <ThemedText variant="body3" color="primary">
              Reschedule
            </ThemedText>
          </TouchableOpacity>
          {!!onOpenPreConsultation && (
            <TouchableOpacity
              style={styles.secondaryAction}
              activeOpacity={0.8}
              onPress={() => onOpenPreConsultation(appointment)}
            >
              <ThemedText variant="body3" color="primary">
                Prepare
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {isPendingPayment && (
          <View style={styles.pendingActionsRow}>
            <TouchableOpacity
              style={styles.appointmentActionButton}
              activeOpacity={0.8}
              onPress={() => onPayAppointment?.(appointment)}
            >
              <ThemedText variant="body3" color="primary">
                Pay now
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.appointmentActionButton, styles.cancelActionButton]}
              activeOpacity={0.8}
              onPress={() => handleCancelPress(appointment.id)}
            >
              <ThemedText variant="body3" color="primary">
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedCard>
    );
  };

  const canMessageCareTeam = Boolean(onOpenChat);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <LinearGradient
          colors={[theme.colors.primary.dark, theme.colors.primary.main]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleGroup}>
              <ThemedText variant="caption1" color="inverse">
                Care timeline
              </ThemedText>
              <ThemedText variant="headline1" color="inverse" style={styles.heroTitle}>
                Stay on top of every visit
              </ThemedText>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary.main} />
            </View>
          </View>
          <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
            Confirm details, settle copays, and prepare for upcoming sessions in one place.
          </ThemedText>
          <View style={styles.heroStatsRow}>
            {metrics.map((metric) => (
              <View key={metric.id} style={styles.heroStat}>
                <ThemedText variant="headline3" color="inverse">
                  {metric.value}
                </ThemedText>
                <ThemedText variant="caption1" color="inverse" style={styles.heroStatLabel}>
                  {metric.label}
                </ThemedText>
              </View>
            ))}
          </View>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={[styles.heroActionButton, styles.heroActionLight]}
              activeOpacity={0.9}
              onPress={onOpenService}
            >
              <Ionicons name="flash-outline" size={18} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="primary">
                Book new visit
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.heroActionButton,
                styles.heroActionDark,
                !canMessageCareTeam && styles.heroActionDisabled,
              ]}
              activeOpacity={canMessageCareTeam ? 0.9 : 1}
              onPress={() => {
                if (canMessageCareTeam && onOpenChat) {
                  onOpenChat();
                }
              }}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={theme.colors.neutral.white}
                style={styles.heroActionIcon}
              />
              <ThemedText variant="body3" color="inverse">
                Message care team
              </ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

          {!hasAppointments && (
            <>
              <View style={styles.illustrationWrapper}>
                <Image
                  source={scheduleIllustration}
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>
              <ThemedCard style={styles.emptyStateCard}>
                <ThemedText variant="headline3" color="primary" style={styles.emptyTitle}>
                  No upcoming appointments
                </ThemedText>
                <ThemedText variant="body2" color="secondary" style={styles.emptyBody}>
                  Book a health service right away for you or your family.
                </ThemedText>
                <Button
                  label="Book an appointment"
                  variant="primary"
                  fullWidth
                  onPress={onOpenService}
                  style={styles.emptyButton}
                />
              </ThemedCard>
            </>
          )}

          {hasAppointments && (
            <>
              <SectionHeader
                title="Upcoming appointments"
                subtitle="Manage, prepare, and reschedule"
                style={styles.sectionHeaderSpacing}
              />

              {hasTodayAppointments && (
                <>
                  <SectionHeader title="Today" />
                  {groupedAppointments.today.map(renderAppointmentCard)}
                </>
              )}

              {hasUpcomingAppointments && (
                <>
                  <SectionHeader
                    title="Upcoming"
                    style={[
                      styles.sectionHeaderSpacing,
                      hasTodayAppointments && styles.sectionSubTitleSpacing,
                    ]}
                  />
                  {groupedAppointments.upcoming.map(renderAppointmentCard)}
                </>
              )}
            </>
          )}
        </ScrollView>
        <Modal
          transparent
          visible={isDetailsModalVisible && !!selectedAppointment}
          animationType="slide"
          onRequestClose={() => setIsDetailsModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() => setIsDetailsModalVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHandle} />
                <ThemedText variant="headline3" color="primary" style={styles.modalTitle}>
                  Appointment details
                </ThemedText>

                <View style={styles.modalSection}>
                  <View style={styles.modalRow}>
                    <Ionicons
                      name="medkit-outline"
                      size={18}
                      color={theme.colors.primary.main}
                      style={styles.modalRowIcon}
                    />
                    <ThemedText variant="body2" color="primary">
                      {selectedAppointment?.serviceLabel}
                    </ThemedText>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons
                      name="person-circle-outline"
                      size={18}
                      color={theme.colors.text.secondary}
                      style={styles.modalRowIcon}
                    />
                    <ThemedText variant="body3" color="secondary">
                      {selectedAppointment?.doctorName}
                    </ThemedText>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={theme.colors.text.secondary}
                      style={styles.modalRowIcon}
                    />
                    <ThemedText variant="body3" color="secondary">
                      {selectedAppointment?.dateLabel} {selectedAppointment?.timeLabel}
                    </ThemedText>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons
                      name="card-outline"
                      size={18}
                      color={theme.colors.text.secondary}
                      style={styles.modalRowIcon}
                    />
                    <ThemedText variant="body3" color="secondary">
                      Total: {selectedAppointment?.total}
                    </ThemedText>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color={theme.colors.semantic.success}
                      style={styles.modalRowIcon}
                    />
                    <ThemedText variant="body3" color="secondary">
                      Status: {selectedStatusText}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalSecondaryButton}
                    activeOpacity={0.8}
                    onPress={() => setIsDetailsModalVisible(false)}
                  >
                    <ThemedText variant="body3" color="primary">
                      Close
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>

        <Modal
          transparent
          visible={isRescheduleModalVisible && !!selectedAppointment}
          animationType="slide"
          onRequestClose={() => setIsRescheduleModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() => setIsRescheduleModalVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHandle} />
                <ThemedText variant="headline3" color="primary" style={styles.modalTitle}>
                  Reschedule appointment
                </ThemedText>
                <ThemedText variant="body3" color="secondary" style={styles.modalBodyText}>
                  Choose a new time for {selectedAppointment?.serviceLabel} with{' '}
                  {selectedAppointment?.doctorName}.
                </ThemedText>

                <View style={styles.modalOptionsList}>
                  {rescheduleOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.modalOption}
                      activeOpacity={0.8}
                      onPress={() => handleConfirmReschedule(option)}
                    >
                      <View style={styles.modalOptionMain}>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={theme.colors.primary.main}
                          style={styles.modalRowIcon}
                        />
                        <View style={styles.modalOptionTextContainer}>
                          <ThemedText variant="body2" color="primary">
                            {option.dateLabel}
                          </ThemedText>
                          <ThemedText variant="caption1" color="secondary">
                            {option.timeLabel}
                          </ThemedText>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.text.secondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalSecondaryButton}
                    activeOpacity={0.8}
                    onPress={() => setIsRescheduleModalVisible(false)}
                  >
                    <ThemedText variant="body3" color="primary">
                      Close
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>

        <TabBar items={tabItems} activeKey={activeTab} onTabPress={handleTabPress} />
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
  heroGradient: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxxl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.lg,
  },
  heroTitleGroup: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  heroTitle: {
    lineHeight: 34,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubtitle: {
    opacity: 0.9,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  heroStat: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },
  heroStatLabel: {
    marginTop: theme.spacing.xs / 2,
    opacity: 0.9,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  heroActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  heroActionLight: {
    backgroundColor: theme.colors.neutral.white,
  },
  heroActionDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroActionDisabled: {
    opacity: 0.4,
  },
  heroActionIcon: {
    marginRight: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl * 2,
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  sectionSubTitle: {
    marginBottom: theme.spacing.sm,
  },
  sectionSubTitleSpacing: {
    marginTop: theme.spacing.lg,
  },
  sectionHeaderSpacing: {
    marginBottom: theme.spacing.md,
  },
  paymentCard: {
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  paymentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  paymentHeaderInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  serviceTitle: {
    marginBottom: theme.spacing.xs,
  },
  paymentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  appointmentMetaRow: {
    marginBottom: theme.spacing.md,
  },
  visitContextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  visitTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  visitTypeText: {
    fontWeight: '600',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  locationText: {
    fontWeight: '600',
  },
  appointmentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginBottom: theme.spacing.xs,
  },
  appointmentMetaIcon: {
    marginRight: theme.spacing.xs,
  },
  paymentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    marginRight: theme.spacing.xs,
  },
  priceValue: {
    fontWeight: '700',
  },
  prepStatusCard: {
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  prepStatusCopy: {
    flex: 1,
  },
  prepStatusTitle: {
    fontWeight: '700',
  },
  prepStatusSubtitle: {
    opacity: 0.9,
    marginTop: theme.spacing.xs / 2,
  },
  paymentStatusPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
  },
  paymentStatusPillPending: {
    backgroundColor: theme.colors.primary.light,
  },
  paymentStatusPillConfirmed: {
    backgroundColor: theme.colors.semantic.success,
  },
  appointmentSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  secondaryAction: {
    marginRight: theme.spacing.lg,
  },
  appointmentActionButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelActionButton: {
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  illustration: {
    width: '80%',
    height: 220,
  },
  emptyStateCard: {
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyBody: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    marginTop: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    borderTopLeftRadius: theme.borderRadius.xxxl,
    borderTopRightRadius: theme.borderRadius.xxxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    marginBottom: theme.spacing.sm,
  },
  modalBodyText: {
    marginBottom: theme.spacing.md,
  },
  modalSection: {
    marginTop: theme.spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalRowIcon: {
    marginRight: theme.spacing.sm,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.lg,
  },
  modalSecondaryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  modalOptionsList: {
    marginTop: theme.spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.muted,
    marginBottom: theme.spacing.sm,
  },
  modalOptionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalOptionTextContainer: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});

export default ScheduleScreen;
