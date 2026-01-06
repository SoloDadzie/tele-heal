import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { theme } from '../theme';

type AppointmentStatus = 'waiting' | 'inConsult' | 'completed';

type QueueItem = {
  id: string;
  patient: string;
  reason: string;
  startTime: string;
  mode: 'video' | 'async';
  status: AppointmentStatus;
};

type FollowUpTask = {
  id: string;
  title: string;
  due: string;
  priority: 'high' | 'normal';
};

type ScheduleDay = {
  id: string;
  label: string;
  subtitle: string;
};

type ScheduleEntry = {
  id: string;
  patient: string;
  reason: string;
  time: string;
  duration: string;
  mode: 'video' | 'async';
  status: 'upcoming' | 'wrapUp' | 'completed';
};

type ProviderDashboardScreenProps = {
  providerName?: string;
  onBack?: () => void;
  onOpenConsult?: (appointmentId: string) => void;
  onOpenTasks?: () => void;
  onOpenMessages?: () => void;
  onOpenSchedule?: () => void;
  onOpenSettings?: () => void;
  scheduleSettings?: {
    timezone: string;
    availabilityNote: string;
    availabilitySlots: Record<string, string[]>;
    feeCurrency: string;
    feeAmount: string;
  };
  intakePreviews?: {
    id: string;
    patient: string;
    reason: string;
    questionnaire: string;
    medications: string[];
    flags?: string;
  }[];
  wrapUpSummaries?: {
    id: string;
    patientName: string;
    reason: string;
    scheduledTime: string;
    billingCode: string;
    followUp: string;
    followUpDetails: string;
    followUpDate?: string;
    followUpTime?: string;
    followUpScheduled?: boolean;
  }[];
  onScheduleFollowUp?: (wrapId: string) => void;
};

const DAY_OPTIONS: ScheduleDay[] = [
  { id: 'today', label: 'Today', subtitle: 'Mon · Sep 15' },
  { id: 'tomorrow', label: 'Tomorrow', subtitle: 'Tue · Sep 16' },
  { id: 'wed', label: 'Wed', subtitle: 'Sep 17' },
];

const MOCK_SCHEDULE: Record<string, ScheduleEntry[]> = {
  today: [
    {
      id: 'sched-1',
      patient: 'Ama Mensah',
      reason: 'Migraine follow-up',
      time: '09:00 – 09:25',
      duration: '25 min',
      mode: 'video',
      status: 'upcoming',
    },
    {
      id: 'sched-2',
      patient: 'Linda Asare',
      reason: 'Hypertension check-in',
      time: '10:30 – 11:00',
      duration: '30 min',
      mode: 'video',
      status: 'wrapUp',
    },
    {
      id: 'sched-3',
      patient: 'Kwesi Boateng',
      reason: 'Skin rash photo review',
      time: 'Async · due 12:00',
      duration: 'Async',
      mode: 'async',
      status: 'upcoming',
    },
  ],
  tomorrow: [
    {
      id: 'sched-4',
      patient: 'Esi Nyarko',
      reason: 'Prenatal consult',
      time: '08:30 – 09:15',
      duration: '45 min',
      mode: 'video',
      status: 'upcoming',
    },
    {
      id: 'sched-5',
      patient: 'Samuel K.',
      reason: 'Lab review',
      time: '11:00 – 11:20',
      duration: '20 min',
      mode: 'video',
      status: 'upcoming',
    },
  ],
  wed: [
    {
      id: 'sched-6',
      patient: 'Tele Heal training',
      reason: 'New workflow walkthrough',
      time: '09:00 – 10:00',
      duration: '60 min',
      mode: 'video',
      status: 'upcoming',
    },
  ],
};

const MOCK_QUEUE: QueueItem[] = [
  {
    id: 'queue-1',
    patient: 'Ama Mensah',
    reason: 'Migraine follow-up',
    startTime: '09:00',
    mode: 'video',
    status: 'waiting',
  },
  {
    id: 'queue-2',
    patient: 'Kwesi Boateng',
    reason: 'Skin rash photo review',
    startTime: 'Async · 3h ago',
    mode: 'async',
    status: 'waiting',
  },
  {
    id: 'queue-3',
    patient: 'Linda Asare',
    reason: 'Hypertension check-in',
    startTime: '10:30',
    mode: 'video',
    status: 'inConsult',
  },
];

const MOCK_TASKS: FollowUpTask[] = [
  { id: 'task-1', title: 'Sign off visit notes · Adu Boakye', due: 'Due in 1h', priority: 'high' },
  { id: 'task-2', title: 'Review lab results · Yaa K.', due: 'Today · 4pm', priority: 'normal' },
  { id: 'task-3', title: 'Send Rx clarification · Mensimah', due: 'Tomorrow', priority: 'normal' },
];

const ProviderDashboardScreen: React.FC<ProviderDashboardScreenProps> = ({
  providerName = 'Dr. Jordan Ama',
  onBack,
  onOpenConsult,
  onOpenTasks,
  onOpenMessages,
  onOpenSchedule,
  onOpenSettings,
  scheduleSettings,
  intakePreviews,
  wrapUpSummaries,
  onScheduleFollowUp,
}) => {
  const [selectedDay, setSelectedDay] = React.useState<string>(DAY_OPTIONS[0].id);
  const scheduleBlocks = MOCK_SCHEDULE[selectedDay] ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          Provider workspace
        </ThemedText>
        <TouchableOpacity style={styles.navButton} onPress={onOpenMessages} activeOpacity={0.85}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <ThemedText variant="headline3" color="primary">
                Good morning
              </ThemedText>
              <ThemedText variant="headline2" color="primary">
                {providerName}
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                You have 3 video visits and 2 async reviews today.
              </ThemedText>
            </View>
            <View style={styles.statusChip}>
              <View style={styles.statusDot} />
              <ThemedText variant="caption1" color="primary">
                Available
              </ThemedText>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <ThemedText variant="caption1" color="secondary">
                Next consult
              </ThemedText>
              <ThemedText variant="headline3" color="primary">
                09:00
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Migraine follow-up
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.heroStat}>
              <ThemedText variant="caption1" color="secondary">
                Payouts
              </ThemedText>
              <ThemedText variant="headline3" color="primary">
                GHS 2,450
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Last 7 days
              </ThemedText>
            </View>
          </View>
        </ThemedCard>

        {intakePreviews && intakePreviews.length > 0 && (
          <ThemedCard style={styles.intakeCard}>
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText variant="headline3" color="primary">
                  Intake previews
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  Skim questionnaires before joining the visit.
                </ThemedText>
              </View>
            </View>
            {intakePreviews.map((preview) => (
              <View key={preview.id} style={styles.intakeRow}>
                <View style={styles.intakeMeta}>
                  <ThemedText variant="body2" color="primary">
                    {preview.patient}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    {preview.reason}
                  </ThemedText>
                  <ThemedText variant="body3" color="primary">
                    Questionnaire
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    {preview.questionnaire}
                  </ThemedText>
                  <ThemedText variant="body3" color="primary">
                    Medications
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    {preview.medications.join(', ')}
                  </ThemedText>
                  {preview.flags && (
                    <View style={styles.flagChip}>
                      <Ionicons name="alert-circle" size={14} color={theme.colors.semantic.warning} />
                      <ThemedText
                        variant="caption1"
                        color="primary"
                        style={{ color: theme.colors.semantic.warning }}
                      >
                        {preview.flags}
                      </ThemedText>
                    </View>
                  )}

        {wrapUpSummaries && wrapUpSummaries.length > 0 && (
          <ThemedCard style={styles.wrapCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderCopy}>
                <ThemedText variant="headline3" color="primary">
                  Wrap-up queue
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  Finalize follow-ups and billing tasks.
                </ThemedText>
              </View>
            </View>
            {wrapUpSummaries.map((wrap) => (
              <View key={wrap.id} style={styles.wrapRow}>
                <View style={styles.wrapMeta}>
                  <ThemedText variant="body2" color="primary">
                    {wrap.patientName}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    {wrap.reason} · {wrap.scheduledTime}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    Billing: {wrap.billingCode}
                  </ThemedText>
                  <ThemedText variant="body3" color="primary">
                    {wrap.followUp}
                  </ThemedText>
                  {wrap.followUpDetails ? (
                    <ThemedText variant="caption1" color="secondary">
                      {wrap.followUpDetails}
                    </ThemedText>
                  ) : null}
                  {(wrap.followUpDate || wrap.followUpTime) && (
                    <ThemedText variant="caption1" color="secondary">
                      Target: {wrap.followUpDate ?? 'Date TBD'} {wrap.followUpTime ?? ''}
                    </ThemedText>
                  )}
                </View>
                <View style={styles.wrapActions}>
                  <View
                    style={[
                      styles.wrapStatusPill,
                      wrap.followUpScheduled ? styles.wrapStatusDone : styles.wrapStatusPending,
                    ]}
                  >
                    <ThemedText
                      variant="caption1"
                      color={wrap.followUpScheduled ? 'primary' : 'secondary'}
                    >
                      {wrap.followUpScheduled ? 'Scheduled' : 'Action needed'}
                    </ThemedText>
                  </View>
                  {!wrap.followUpScheduled && (
                    <Button
                      label="Mark scheduled"
                      variant="secondary"
                      size="sm"
                      onPress={() => onScheduleFollowUp?.(wrap.id)}
                    />
                  )}
                </View>
              </View>
            ))}
          </ThemedCard>
        )}
                </View>
                <Button label="Open intake" variant="secondary" size="sm" style={styles.inlineButton} onPress={onOpenSchedule} />
              </View>
            ))}
          </ThemedCard>
        )}

        <View style={styles.sectionRow}>
          <ThemedCard style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary.main} />
            <ThemedText variant="caption1" color="secondary">
              Today’s visits
            </ThemedText>
            <ThemedText variant="headline2" color="primary">
              5
            </ThemedText>
            <ThemedText variant="caption1" color="secondary">
              3 video · 2 async
            </ThemedText>
          </ThemedCard>
          <ThemedCard style={styles.statCard}>
            <Ionicons name="timer-outline" size={20} color={theme.colors.primary.main} />
            <ThemedText variant="caption1" color="secondary">
              Avg wait time
            </ThemedText>
            <ThemedText variant="headline2" color="primary">
              04m
            </ThemedText>
            <ThemedText variant="caption1" color="secondary">
              under SLA
            </ThemedText>
          </ThemedCard>
        </View>

        {scheduleSettings && (
          <ThemedCard style={styles.settingsCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderCopy}>
                <ThemedText variant="headline3" color="primary">
                  Availability & fees
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {scheduleSettings.timezone} · {scheduleSettings.feeCurrency} {scheduleSettings.feeAmount}/visit
                </ThemedText>
              </View>
              <Button label="Edit" variant="secondary" size="sm" style={styles.headerAction} onPress={onOpenSettings} />
            </View>
            <ThemedText variant="caption1" color="secondary">
              {scheduleSettings.availabilityNote}
            </ThemedText>
            <View style={styles.weekGrid}>
              {Object.entries(scheduleSettings.availabilitySlots).map(([day, slots]) => (
                <View key={day} style={styles.weekRow}>
                  <ThemedText variant="caption1" color="secondary" style={styles.weekDay}>
                    {day}
                  </ThemedText>
                  <ThemedText variant="body3" color="primary">
                    {slots.length ? slots.join(', ') : '—'}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ThemedCard>
        )}

        <ThemedCard style={styles.scheduleCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCopy}>
              <ThemedText variant="headline3" color="primary">
                Today’s schedule
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                Quickly scan what’s booked and what needs wrap-up.
              </ThemedText>
            </View>
            <Button label="Open calendar" variant="secondary" size="sm" style={styles.headerAction} onPress={onOpenSchedule} />
          </View>
          <View style={styles.dayTabRow}>
            {DAY_OPTIONS.map((day) => {
              const selected = selectedDay === day.id;
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[styles.dayChip, selected && styles.dayChipSelected]}
                  onPress={() => setSelectedDay(day.id)}
                  activeOpacity={0.85}
                >
                  <ThemedText variant="caption1" color={selected ? 'primary' : 'secondary'}>
                    {day.label}
                  </ThemedText>
                  <ThemedText variant="caption1" color={selected ? 'primary' : 'secondary'}>
                    {day.subtitle}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.scheduleList}>
            {scheduleBlocks.map((block) => (
              <View key={block.id} style={styles.scheduleRow}>
                <View style={styles.scheduleRowTop}>
                  <View style={styles.scheduleTimeBlock}>
                    <ThemedText variant="headline3" color="primary" style={styles.scheduleTimeLabel}>
                      {block.time}
                    </ThemedText>
                    <ThemedText variant="caption1" color="secondary">
                      {block.duration}
                    </ThemedText>
                  </View>
                  <View style={styles.schedulePills}>
                    <View style={[styles.queueMode, block.mode === 'video' ? styles.queueModeVideo : styles.queueModeAsync]}>
                      <Ionicons
                        name={block.mode === 'video' ? 'videocam' : 'image-outline'}
                        size={14}
                        color={block.mode === 'video' ? theme.colors.primary.main : theme.colors.accent.main}
                      />
                      <ThemedText variant="caption1" color={block.mode === 'video' ? 'primary' : 'accent'}>
                        {block.mode === 'video' ? 'Live video' : 'Async review'}
                      </ThemedText>
                    </View>
                    <ThemedText
                      variant="caption1"
                      color="primary"
                      style={[
                        styles.statusPillText,
                        block.status === 'wrapUp'
                          ? styles.statusPillWarning
                          : block.status === 'completed'
                            ? styles.statusPillNeutral
                            : styles.statusPillSuccess,
                      ]}
                    >
                      {block.status === 'wrapUp' ? 'Wrap-up' : block.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.scheduleMeta}>
                  <ThemedText variant="body2" color="primary" style={styles.clampedText} numberOfLines={1}>
                    {block.patient}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary" style={styles.clampedText} numberOfLines={2}>
                    {block.reason}
                  </ThemedText>
                </View>
                <Button
                  label={block.status === 'wrapUp' ? 'Finish notes' : 'Open'}
                  variant={block.status === 'wrapUp' ? 'secondary' : 'primary'}
                  size="sm"
                  style={styles.scheduleButton}
                  onPress={() => onOpenConsult?.(block.id)}
                />
              </View>
            ))}
          </View>
        </ThemedCard>

        <ThemedCard style={styles.queueCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCopy}>
              <ThemedText variant="headline3" color="primary">
                Patient queue
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                Join video visits or review async submissions.
              </ThemedText>
            </View>
            <Button label="Refresh queue" variant="secondary" size="sm" style={styles.headerAction} onPress={onOpenSchedule} />
          </View>
          {MOCK_QUEUE.map((item) => (
            <View key={item.id} style={styles.queueRow}>
              <View style={styles.queueMeta}>
                <View style={[styles.queueMode, item.mode === 'video' ? styles.queueModeVideo : styles.queueModeAsync]}>
                  <Ionicons
                    name={item.mode === 'video' ? 'videocam' : 'image-outline'}
                    size={14}
                    color={item.mode === 'video' ? theme.colors.primary.main : theme.colors.accent.main}
                  />
                  <ThemedText variant="caption1" color={item.mode === 'video' ? 'primary' : 'accent'}>
                    {item.mode === 'video' ? 'Live video' : 'Async'}
                  </ThemedText>
                </View>
                <ThemedText variant="body2" color="primary" style={styles.clampedText} numberOfLines={1}>
                  {item.patient}
                </ThemedText>
                <ThemedText variant="caption1" color="secondary" style={styles.clampedText} numberOfLines={2}>
                  {item.reason}
                </ThemedText>
              </View>
              <View style={styles.rowButtonSlot}>
                <ThemedText variant="caption1" color="secondary">
                  {item.startTime}
                </ThemedText>
                <Button
                  label={item.mode === 'video' ? (item.status === 'inConsult' ? 'Rejoin' : 'Join consult') : 'Review case'}
                  variant={item.mode === 'video' ? 'primary' : 'secondary'}
                  size="sm"
                  style={styles.inlineButton}
                  onPress={() => onOpenConsult?.(item.id)}
                />
              </View>
            </View>
          ))}
        </ThemedCard>

        <ThemedCard style={styles.tasksCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCopy}>
              <ThemedText variant="headline3" color="primary">
                Follow-up tasks
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                Complete documentation and orders after visits.
              </ThemedText>
            </View>
            <Button label="Open tasks" variant="secondary" size="sm" style={styles.headerAction} onPress={onOpenTasks} />
          </View>
          {MOCK_TASKS.map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <View style={styles.taskCopy}>
                <ThemedText variant="body2" color="primary" style={styles.clampedText} numberOfLines={2}>
                  {task.title}
                </ThemedText>
                <ThemedText
                  variant="caption1"
                  color="secondary"
                  style={task.priority === 'high' ? styles.taskDueHigh : undefined}
                >
                  {task.due}
                </ThemedText>
              </View>
              <View style={styles.rowButtonSlot}>
                <Button label="Mark done" variant="secondary" size="sm" style={styles.inlineButton} onPress={onOpenTasks} />
              </View>
            </View>
          ))}
        </ThemedCard>
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
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  heroCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.main,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  heroStat: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
    backgroundColor: theme.colors.border.light,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  scheduleCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  dayTabRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dayChip: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.xs / 2,
  },
  dayChipSelected: {
    backgroundColor: theme.colors.primary.light,
    borderColor: theme.colors.primary.main,
  },
  scheduleList: {
    gap: theme.spacing.md,
  },
  scheduleRow: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  scheduleRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  scheduleTimeBlock: {
    gap: theme.spacing.xs / 2,
  },
  schedulePills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  scheduleTimeLabel: {
    fontSize: 16,
  },
  scheduleMeta: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs / 2,
  },
  scheduleButton: {
    alignSelf: 'flex-start',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPillText: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.2,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  statusPillWarning: {
    backgroundColor: theme.colors.semantic.warningLight,
    color: theme.colors.semantic.warning,
  },
  statusPillNeutral: {
    backgroundColor: theme.colors.border.light,
    color: theme.colors.text.secondary,
  },
  statusPillSuccess: {
    backgroundColor: theme.colors.semantic.successLight,
    color: theme.colors.semantic.success,
  },
  queueCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  sectionHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs / 2,
  },
  queueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  queueMeta: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs / 2,
  },
  queueMode: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  queueModeVideo: {
    backgroundColor: theme.colors.primary.light,
  },
  queueModeAsync: {
    backgroundColor: theme.colors.accent.light,
  },
  queueActions: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
    minWidth: 110,
  },
  rowButtonSlot: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: theme.spacing.xs,
    minWidth: 120,
  },
  tasksCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  wrapCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  wrapRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  wrapMeta: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  wrapActions: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  wrapStatusPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.2,
    borderRadius: theme.borderRadius.full,
  },
  wrapStatusDone: {
    backgroundColor: theme.colors.semantic.successLight,
  },
  wrapStatusPending: {
    backgroundColor: theme.colors.semantic.warningLight,
  },
  settingsCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  weekGrid: {
    gap: theme.spacing.xs,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    width: 42,
  },
  intakeCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  intakeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.md,
  },
  intakeMeta: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  flagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.semantic.warningLight,
  },
  headerAction: {
    alignSelf: 'flex-start',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: theme.spacing.sm,
  },
  taskCopy: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs / 2,
  },
  taskDueHigh: {
    color: theme.colors.semantic.danger,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    marginLeft: theme.spacing.sm,
  },
  clampedText: {
    flexShrink: 1,
  },
});

export default ProviderDashboardScreen;
