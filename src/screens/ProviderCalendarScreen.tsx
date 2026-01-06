import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import { theme } from '../theme';

type CalendarEvent = {
  id: string;
  title: string;
  patient: string;
  time: string;
  duration: string;
  type: 'video' | 'async' | 'training';
  status: 'upcoming' | 'inProgress' | 'completed';
};

export type ProviderCalendarScreenProps = {
  onBack?: () => void;
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Migraine follow-up',
    patient: 'Ama Mensah',
    time: '09:00',
    duration: '25 min',
    type: 'video',
    status: 'upcoming',
  },
  {
    id: 'event-2',
    title: 'Hypertension check-in',
    patient: 'Linda Asare',
    time: '10:30',
    duration: '30 min',
    type: 'video',
    status: 'upcoming',
  },
  {
    id: 'event-3',
    title: 'Skin rash photo review',
    patient: 'Kwesi Boateng',
    time: 'Async',
    duration: 'Async',
    type: 'async',
    status: 'upcoming',
  },
  {
    id: 'event-4',
    title: 'Prenatal consult',
    patient: 'Esi Nyarko',
    time: '08:30',
    duration: '45 min',
    type: 'video',
    status: 'upcoming',
  },
  {
    id: 'event-5',
    title: 'Lab review',
    patient: 'Samuel K.',
    time: '11:00',
    duration: '20 min',
    type: 'video',
    status: 'upcoming',
  },
];

const getEventColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'video':
      return theme.colors.primary.main;
    case 'async':
      return theme.colors.accent.main;
    case 'training':
      return theme.colors.semantic.success;
    default:
      return theme.colors.text.secondary;
  }
};

const getEventIcon = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'video':
      return 'videocam-outline';
    case 'async':
      return 'image-outline';
    case 'training':
      return 'school-outline';
    default:
      return 'calendar-outline';
  }
};

const ProviderCalendarScreen: React.FC<ProviderCalendarScreenProps> = ({ onBack }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = React.useState(today.getDate());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days: (number | null)[] = Array(firstDay).fill(null);

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => day === selectedDate;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          Calendar
        </ThemedText>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedCard style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={handlePrevMonth} activeOpacity={0.85}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.primary.main} />
            </TouchableOpacity>
            <ThemedText variant="headline3" color="primary">
              {MONTHS[currentMonth]} {currentYear}
            </ThemedText>
            <TouchableOpacity onPress={handleNextMonth} activeOpacity={0.85}>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRow}>
            {DAYS_OF_WEEK.map((day) => (
              <ThemedText key={day} variant="caption1" color="secondary" style={styles.weekDay}>
                {day}
              </ThemedText>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={
                  day
                    ? [
                        styles.dayCell,
                        isToday(day) ? styles.dayCellToday : undefined,
                        isSelected(day) ? styles.dayCellSelected : undefined,
                      ]
                    : styles.dayCell
                }
                onPress={() => day && setSelectedDate(day)}
                activeOpacity={day ? 0.85 : 1}
                disabled={!day}
              >
                {day && (
                  <ThemedText
                    variant="body3"
                    color={
                      isToday(day) || isSelected(day)
                        ? 'inverse'
                        : 'primary'
                    }
                  >
                    {day}
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ThemedCard>

        <View style={styles.eventsSection}>
          <ThemedText variant="headline3" color="primary">
            {selectedDate === today.getDate() && currentMonth === today.getMonth()
              ? "Today's schedule"
              : `${MONTHS[currentMonth]} ${selectedDate}`}
          </ThemedText>
          <View style={styles.eventsList}>
            {MOCK_EVENTS.map((event) => (
              <ThemedCard key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View
                    style={[
                      styles.eventTypeIcon,
                      { backgroundColor: getEventColor(event.type) },
                    ]}
                  >
                    <Ionicons
                      name={getEventIcon(event.type)}
                      size={16}
                      color={theme.colors.neutral.white}
                    />
                  </View>
                  <View style={styles.eventMeta}>
                    <ThemedText variant="body2" color="primary">
                      {event.title}
                    </ThemedText>
                    <ThemedText variant="caption1" color="secondary">
                      {event.patient}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.eventStatusBadge,
                      event.status === 'upcoming' && styles.statusUpcoming,
                      event.status === 'inProgress' && styles.statusInProgress,
                      event.status === 'completed' && styles.statusCompleted,
                    ]}
                  >
                    <ThemedText
                      variant="caption2"
                      color={event.status === 'completed' ? 'secondary' : 'primary'}
                    >
                      {event.status === 'upcoming'
                        ? 'Upcoming'
                        : event.status === 'inProgress'
                          ? 'In progress'
                          : 'Done'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.eventFooter}>
                  <View style={styles.eventTime}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                    <ThemedText variant="caption1" color="secondary">
                      {event.time}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption1" color="secondary">
                    {event.duration}
                  </ThemedText>
                </View>
              </ThemedCard>
            ))}
          </View>
        </View>
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
  calendarCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  dayCellToday: {
    backgroundColor: theme.colors.primary.light,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  dayCellSelected: {
    backgroundColor: theme.colors.primary.main,
  },
  eventsSection: {
    gap: theme.spacing.md,
  },
  eventsList: {
    gap: theme.spacing.md,
  },
  eventCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  eventTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventMeta: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  eventStatusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  statusUpcoming: {
    backgroundColor: theme.colors.primary.light,
  },
  statusInProgress: {
    backgroundColor: theme.colors.semantic.warningLight,
  },
  statusCompleted: {
    backgroundColor: theme.colors.background.muted,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});

export default ProviderCalendarScreen;
