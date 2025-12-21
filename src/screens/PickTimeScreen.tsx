import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import SectionHeader from '../components/SectionHeader';
import { theme } from '../theme';
import type { HospitalItem } from './SelectHospitalScreen';
import type { VisitDetails, AppointmentType } from './VisitDetailsScreen';

export type PickTimeScreenProps = {
  onBack: () => void;
  hospital: HospitalItem;
  visitDetails?: VisitDetails | null;
  onEditVisitDetails?: () => void;
  onUpdateVisitDetails?: (details: VisitDetails) => void;
  onConfirm: (selection: { appointment: { dayLabel: string; time: string } }) => void;
};

const UPCOMING_DAY_COUNT = 10;
const TIME_SLOTS = [
  { label: '08:00 AM', period: 'Morning' },
  { label: '08:30 AM', period: 'Morning' },
  { label: '09:00 AM', period: 'Morning' },
  { label: '09:30 AM', period: 'Morning' },
  { label: '10:00 AM', period: 'Morning' },
  { label: '10:30 AM', period: 'Morning' },
  { label: '11:00 AM', period: 'Morning' },
  { label: '11:30 AM', period: 'Morning' },
  { label: '12:00 PM', period: 'Afternoon' },
  { label: '12:30 PM', period: 'Afternoon' },
  { label: '01:00 PM', period: 'Afternoon' },
  { label: '01:30 PM', period: 'Afternoon' },
  { label: '02:00 PM', period: 'Afternoon' },
  { label: '02:30 PM', period: 'Afternoon' },
  { label: '03:00 PM', period: 'Afternoon' },
  { label: '03:30 PM', period: 'Afternoon' },
  { label: '04:00 PM', period: 'Evening' },
  { label: '04:30 PM', period: 'Evening' },
  { label: '05:00 PM', period: 'Evening' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type CalendarDay = {
  iso: string;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};

type CalendarWeek = CalendarDay[];

const buildCalendar = (monthStart: Date, todayStart: Date): CalendarWeek[] => {
  const firstOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const todayIso = todayStart.toISOString().split('T')[0];
  const weeks: CalendarWeek[] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    const days: CalendarDay[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + weekIndex * 7 + dayIndex);
      const iso = current.toISOString().split('T')[0];
      const isPast = current < todayStart;
      days.push({
        iso,
        date: current,
        isCurrentMonth: current.getMonth() === monthStart.getMonth(),
        isToday: iso === todayIso,
        isPast,
      });
    }
    weeks.push(days);
  }

  return weeks;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const PickTimeScreen: React.FC<PickTimeScreenProps> = ({
  onBack,
  hospital,
  visitDetails,
  onEditVisitDetails,
  onUpdateVisitDetails,
  onConfirm,
}) => {
  const todayRef = React.useRef(new Date());
  const today = todayRef.current;
  const todayStart = React.useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    [today],
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    () => new Date(todayStart.getFullYear(), todayStart.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = React.useState<Date>(todayStart);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [editableVisitDetails, setEditableVisitDetails] = React.useState<VisitDetails | null>(visitDetails ?? null);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editForm, setEditForm] = React.useState<{ appointmentType: AppointmentType; reason: string }>({
    appointmentType: visitDetails?.appointmentType ?? 'scheduled',
    reason: visitDetails?.reason ?? '',
  });

  React.useEffect(() => {
    setEditableVisitDetails(visitDetails ?? null);
    if (visitDetails) {
      setEditForm({
        appointmentType: visitDetails.appointmentType,
        reason: visitDetails.reason,
      });
    }
  }, [visitDetails]);

  const calendarWeeks = React.useMemo(() => buildCalendar(currentMonth, todayStart), [currentMonth, todayStart]);
  const selectedDateIso = selectedDate.toISOString().split('T')[0];
  const isReady = Boolean(selectedDate && selectedTime);
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const groupedSlots = React.useMemo(() => {
    const map = new Map<string, string[]>();
    TIME_SLOTS.forEach((slot) => {
      if (!map.has(slot.period)) {
        map.set(slot.period, []);
      }
      map.get(slot.period)!.push(slot.label);
    });
    return Array.from(map.entries());
  }, []);

  const handleNext = () => {
    if (!selectedDate || !selectedTime) return;
    onConfirm({
      appointment: {
        dayLabel: formatDateLabel(selectedDate),
        time: selectedTime,
      },
    });
  };

  const handleMonthChange = (delta: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleSelectDate = (day: CalendarDay) => {
    if (day.isPast) return;
    setSelectedDate(day.date);
    if (day.date.getMonth() !== currentMonth.getMonth() || day.date.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
    }
  };

  const canGoPrev =
    currentMonth.getFullYear() > todayStart.getFullYear() ||
    currentMonth.getMonth() > todayStart.getMonth();

  const handleOpenEditModal = () => {
    if (!editableVisitDetails) return;
    setEditForm({
      appointmentType: editableVisitDetails.appointmentType,
      reason: editableVisitDetails.reason,
    });
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editableVisitDetails) {
      setIsEditModalVisible(false);
      return;
    }
    const updated: VisitDetails = {
      ...editableVisitDetails,
      appointmentType: editForm.appointmentType,
      reason: editForm.reason,
    };
    setEditableVisitDetails(updated);
    onUpdateVisitDetails?.(updated);
    setIsEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary" style={styles.headerTitle}>
            Pick a time
          </ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[theme.colors.primary.main, theme.colors.primary.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.neutral.white} />
              <ThemedText variant="caption1" color="inverse">
                Step 2 of 3 · Choose your visit
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse">
              Lock in your virtual visit
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              Select the date and time that work best for you. Everything will sync with reminders automatically.
            </ThemedText>
          </LinearGradient>

          <ThemedCard style={styles.hospitalCard}>
            <SectionHeader
              title={hospital.name}
              subtitle={hospital.address}
              icon="business-outline"
            />
            <View style={styles.hospitalRow}>
              <Image source={{ uri: hospital.image }} style={styles.hospitalImage} />
              <View style={styles.hospitalInfo}>
                <View style={styles.hospitalMetaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="star" size={12} color={theme.colors.accent.main} />
                    <ThemedText variant="caption1" color="primary">
                      {hospital.rating} ({hospital.reviews})
                    </ThemedText>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="location" size={12} color={theme.colors.primary.main} />
                    <ThemedText variant="caption1" color="primary">
                      {hospital.distance}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.hospitalMetaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="shield-checkmark-outline" size={12} color={theme.colors.primary.main} />
                    <ThemedText variant="caption1" color="primary">
                      Certified partner
                    </ThemedText>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.primary.main} />
                    <ThemedText variant="caption1" color="primary">
                      Avg wait 10 min
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </ThemedCard>

          {editableVisitDetails && (
            <ThemedCard style={styles.visitDetailsCard}>
              <View style={styles.visitDetailsHeader}>
                <SectionHeader
                  title="Visit details"
                  subtitle="Review symptoms and files before picking a time."
                  icon="document-text-outline"
                />
                {onEditVisitDetails && (
                  <TouchableOpacity style={styles.editDetailsButton} activeOpacity={0.85} onPress={handleOpenEditModal}>
                    <Ionicons name="create-outline" size={14} color={theme.colors.primary.main} />
                    <ThemedText variant="caption1" color="primary">
                      Edit
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.visitDetailsContent}>
                <View style={styles.visitDetailsRow}>
                  <View style={styles.visitPill}>
                    <Ionicons
                      name={editableVisitDetails.appointmentType === 'urgent' ? 'flash-outline' : 'calendar-outline'}
                      size={12}
                      color={theme.colors.primary.main}
                    />
                    <ThemedText variant="caption1" color="primary">
                      {editableVisitDetails.appointmentType === 'urgent' ? 'Urgent care' : 'Scheduled'}
                    </ThemedText>
                  </View>
                  <View style={styles.visitPill}>
                    <Ionicons name="images-outline" size={12} color={theme.colors.primary.main} />
                    <ThemedText variant="caption1" color="primary">
                      {editableVisitDetails.attachments.length} file
                      {editableVisitDetails.attachments.length === 1 ? '' : 's'}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText variant="body3" color="secondary">
                  {editableVisitDetails.reason}
                </ThemedText>
              </View>
              {editableVisitDetails.attachments.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachmentsRow}>
                  {editableVisitDetails.attachments.map((uri) => (
                    <View key={uri} style={styles.attachmentPreview}>
                      <Ionicons name="document-outline" size={16} color={theme.colors.primary.main} />
                      <ThemedText variant="caption2" color="secondary" numberOfLines={1}>
                        {uri.split('/').pop()}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>
              )}
            </ThemedCard>
          )}

          <ThemedCard style={styles.sectionCard}>
            <SectionHeader
              title="Choose a day"
              subtitle="Pick any date on the calendar."
              icon="calendar-outline"
            />
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={[styles.calendarNavButton, !canGoPrev && styles.calendarNavButtonDisabled]}
                onPress={() => handleMonthChange(-1)}
                disabled={!canGoPrev}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={canGoPrev ? theme.colors.primary.main : theme.colors.text.secondary}
                />
              </TouchableOpacity>
              <ThemedText variant="headline3" color="primary">
                {monthLabel}
              </ThemedText>
              <TouchableOpacity style={styles.calendarNavButton} onPress={() => handleMonthChange(1)}>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.primary.main} />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
              <View style={styles.calendarWeekdayRow}>
                {WEEKDAYS.map((day) => (
                  <ThemedText key={day} variant="caption1" color="secondary" style={styles.calendarWeekday}>
                    {day}
                  </ThemedText>
                ))}
              </View>
              {calendarWeeks.map((week) => (
                <View key={week[0].iso} style={styles.calendarRow}>
                  {week.map((day) => {
                    const isSelected = day.iso === selectedDateIso;
                    const disabled = day.isPast;
                    return (
                      <TouchableOpacity
                        key={day.iso}
                        style={[
                          styles.calendarCell,
                          !day.isCurrentMonth && styles.calendarCellMuted,
                          day.isToday && styles.calendarCellToday,
                          isSelected && styles.calendarCellSelected,
                          disabled && styles.calendarCellDisabled,
                        ]}
                        activeOpacity={disabled ? 1 : 0.85}
                        onPress={() => handleSelectDate(day)}
                      >
                        <ThemedText
                          variant="body3"
                          color={
                            isSelected
                              ? 'inverse'
                              : disabled
                              ? 'secondary'
                              : day.isCurrentMonth
                              ? 'primary'
                              : 'secondary'
                          }
                        >
                          {day.date.getDate()}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ThemedCard>

          <ThemedCard style={styles.sectionCard}>
            <SectionHeader
              title="Pick a time"
              subtitle={`All availability in your local time (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`}
              icon="time-outline"
            />
            {groupedSlots.map(([period, slots]) => (
              <View key={period} style={styles.timeSection}>
                <View style={styles.timeSectionHeader}>
                  <ThemedText variant="caption1" color="secondary">
                    {period}
                  </ThemedText>
                  <View style={styles.timeSectionDivider} />
                </View>
                <View style={styles.timeGrid}>
                  {slots.map((label) => {
                    const isActive = selectedTime === label;
                    return (
                      <TouchableOpacity
                        key={label}
                        style={[styles.timeChip, isActive && styles.timeChipActive]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedTime(label)}
                      >
                        <ThemedText variant="body3" color={isActive ? 'inverse' : 'primary'}>
                          {label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ThemedCard>

          <ThemedCard style={styles.infoCard}>
            <ThemedText variant="headline3" color="primary">
              What happens next?
            </ThemedText>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="secondary">
                We’ll send instant confirmations and reminders before the visit.
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="document-outline" size={16} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="secondary">
                Your visit details and attachments stay visible to your care team.
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="secondary">
                Need to adjust later? You can reschedule from the Schedule tab anytime.
              </ThemedText>
            </View>
          </ThemedCard>
        </ScrollView>

        <TouchableOpacity
          style={[styles.nextButton, !isReady && styles.nextButtonDisabled]}
          disabled={!isReady}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <ThemedText variant="body2" color="inverse">
            Next
          </ThemedText>
        </TouchableOpacity>

        <Modal
          visible={isEditModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <ThemedText variant="headline3" color="primary">
                  Edit visit details
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>
              <ThemedText variant="caption1" color="secondary">
                Appointment type
              </ThemedText>
              <View style={styles.modalChipRow}>
                {(['scheduled', 'urgent'] as AppointmentType[]).map((type) => {
                  const active = editForm.appointmentType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.modalChip, active && styles.modalChipActive]}
                      onPress={() => setEditForm((prev) => ({ ...prev, appointmentType: type }))}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={type === 'urgent' ? 'flash-outline' : 'calendar-outline'}
                        size={14}
                        color={active ? theme.colors.neutral.white : theme.colors.primary.main}
                      />
                      <ThemedText variant="body3" color={active ? 'inverse' : 'primary'}>
                        {type === 'urgent' ? 'Urgent care' : 'Scheduled'}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <ThemedText variant="caption1" color="secondary" style={{ marginTop: theme.spacing.md }}>
                Reason for visit
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                multiline
                value={editForm.reason}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, reason: text }))}
                placeholder="Describe your symptoms or context..."
                placeholderTextColor={theme.colors.text.secondary}
              />
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryButton}
                  onPress={() => setIsEditModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <ThemedText variant="body3" color="primary">
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleSaveEdit} activeOpacity={0.9}>
                  <ThemedText variant="body3" color="inverse">
                    Save changes
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
    gap: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
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
    backgroundColor: 'rgba(0,0,0,0.18)',
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  hospitalCard: {
    gap: theme.spacing.md,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  hospitalImage: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  sectionCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  visitDetailsCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  visitDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  editDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  visitDetailsContent: {
    gap: theme.spacing.sm,
  },
  visitDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  visitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  attachmentsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavButtonDisabled: {
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.muted,
  },
  calendarGrid: {
    gap: theme.spacing.xs,
  },
  calendarWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  calendarWeekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarCell: {
    width: `${100 / 7 - 1}%`,
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  calendarCellMuted: {
    opacity: 0.6,
  },
  calendarCellToday: {
    borderColor: theme.colors.primary.main,
  },
  calendarCellSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  calendarCellDisabled: {
    backgroundColor: theme.colors.background.muted,
  },
  timeSection: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timeSectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timeChip: {
    flexBasis: '48%',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  infoCard: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: theme.borderRadius.xxxl,
    borderTopRightRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalChipRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  modalChipActive: {
    backgroundColor: theme.colors.primary.main,
  },
  modalInput: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    padding: theme.spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    color: theme.colors.text.primary,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    alignItems: 'center',
    paddingVertical: theme.spacing.md / 1.2,
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    paddingVertical: theme.spacing.md / 1.2,
  },
  nextButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.primary.light,
  },
});

export default PickTimeScreen;
