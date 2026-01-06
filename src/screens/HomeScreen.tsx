import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '../components/ThemedText';
import TabBar from '../components/TabBar';
import { theme } from '../theme';
import type { DocumentRecord } from '../types/documents';

type QuickShortcut = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
};

type CareTask = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  actionLabel?: string;
  action?: () => void;
};

type CareTeamMember = {
  id: string;
  name: string;
  specialty: string;
  availability: string;
};

type CareDocument = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
};

const careTasks: CareTask[] = [
  {
    id: 'task-1',
    title: 'Finish profile setup',
    description: 'Add emergency contact & insurance card',
    status: 'pending',
  },
  {
    id: 'task-2',
    title: 'Pre-consultation questionnaire',
    description: 'Complete before your Monday visit',
    status: 'pending',
  },
  {
    id: 'task-3',
    title: 'Consent forms',
    description: 'Telemedicine & privacy policies signed',
    status: 'completed',
  },
];

const careTeam: CareTeamMember[] = [
  {
    id: 'team-1',
    name: 'Dr. Amina Khan',
    specialty: 'Primary Care',
    availability: 'Replies in < 1 hr',
  },
  {
    id: 'team-2',
    name: 'Dr. Kwame Boateng',
    specialty: 'Cardiology',
    availability: 'Available Tue · Thu',
  },
  {
    id: 'team-3',
    name: 'Emily Sanchez, RN',
    specialty: 'Care Navigator',
    availability: 'Online now',
  },
];

const careDocuments: CareDocument[] = [
  {
    id: 'doc-1',
    title: 'Visit Summary · Aug 28',
    subtitle: 'Dr. Sarah Johnson • PDF · 2 MB',
    date: '2d ago',
  },
  {
    id: 'doc-2',
    title: 'Lab results · Basic panel',
    subtitle: 'Quest Diagnostics • PDF · 640 KB',
    date: '1w ago',
  },
];

type HomeScreenProps = {
  onSeeAllDoctors: () => void;
  onOpenService: () => void;
  onOpenSchedule: () => void;
  onOpenProfile: () => void;
  onOpenChat: () => void;
  onOpenNotifications: () => void;
  onOpenPrescriptions: () => void;
  onOpenLabs: () => void;
  onOpenDocuments: (documentId?: string | null) => void;
  prescriptionCount?: number;
  labRequestCount?: number;
  pendingLabUploads?: number;
  documents?: DocumentRecord[];
  unreadCount?: number;
  userName?: string | null;
  isProfileComplete?: boolean;
  hasConsented?: boolean;
  hasPendingPreConsult?: boolean;
  onOpenAppointments?: () => void;
  onOpenProfileSetup?: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({
  onSeeAllDoctors,
  onOpenService,
  onOpenSchedule,
  onOpenProfile,
  onOpenChat,
  onOpenNotifications,
  onOpenPrescriptions,
  onOpenLabs,
  onOpenDocuments,
  prescriptionCount = 0,
  labRequestCount = 0,
  pendingLabUploads = 0,
  documents = [],
  unreadCount,
  userName,
  isProfileComplete = false,
  hasConsented = false,
  hasPendingPreConsult = false,
  onOpenAppointments,
  onOpenProfileSetup,
}) => {
  const [activeTab, setActiveTab] = React.useState('home');

  const userDisplayName = React.useMemo(() => {
    const trimmed = userName?.trim();
    if (trimmed && trimmed.length > 0) {
      return trimmed;
    }
    return 'Tele Heal Patient';
  }, [userName]);

  const todayLabel = React.useMemo(() => {
    const now = new Date();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    return `${weekday}, ${day} ${month}`;
  }, []);

  const userInitials = React.useMemo(() => {
    const parts = userDisplayName.split(/\s+/).filter(Boolean);
    if (!parts.length) return 'TP';
    return parts
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [userDisplayName]);

  const quickShortcuts: QuickShortcut[] = React.useMemo(
    () => [
      {
        id: 'shortcut-visit',
        label: 'Book visit',
        description: 'Find a doctor now',
        icon: 'medkit-outline',
        action: onOpenService,
      },
      {
        id: 'shortcut-schedule',
        label: 'My schedule',
        description: 'Upcoming + history',
        icon: 'calendar-outline',
        action: onOpenSchedule,
      },
      {
        id: 'shortcut-chat',
        label: 'Messages',
        description: 'Care team chat',
        icon: 'chatbubble-ellipses-outline',
        action: onOpenChat,
      },
      {
        id: 'shortcut-profile',
        label: 'Patient profile',
        description: 'Coverage & preferences',
        icon: 'person-circle-outline',
        action: onOpenProfile,
      },
    ],
    [onOpenChat, onOpenProfile, onOpenSchedule, onOpenService],
  );

  const essentials = React.useMemo(
    () => [
      {
        id: 'essentials-prescriptions',
        title: 'Prescriptions',
        description: `${prescriptionCount} active`,
        icon: 'medical-outline' as keyof typeof Ionicons.glyphMap,
        action: onOpenPrescriptions,
      },
      {
        id: 'essentials-labs',
        title: 'Labs & scans',
        description: `${labRequestCount} orders · ${pendingLabUploads} pending uploads`,
        icon: 'flask-outline' as keyof typeof Ionicons.glyphMap,
        action: onOpenLabs,
      },
    ],
    [labRequestCount, onOpenLabs, onOpenPrescriptions, pendingLabUploads, prescriptionCount],
  );

  const nextAppointment = {
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    date: 'Mon, Sep 9',
    time: '09:30 AM',
    location: 'Virtual visit · Tele Heal',
  };

  const healthHighlights = [
    { id: 'metric-1', label: 'Coverage', value: 'Active', meta: 'Blue Shield' },
    { id: 'metric-2', label: 'Last visit', value: 'Aug 28', meta: 'Follow-up in 3 wks' },
    { id: 'metric-3', label: 'Tasks', value: '2 pending', meta: 'Due before Mon' },
  ];

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
    if (key === 'schedule') {
      setActiveTab('schedule');
      onOpenSchedule();
    } else if (key === 'chat') {
      setActiveTab('chat');
      onOpenChat();
    } else if (key === 'profile') {
      setActiveTab('profile');
      onOpenProfile();
    } else {
      setActiveTab(key);
    }
  };

  const careTasks: CareTask[] = React.useMemo(() => {
    const tasks: CareTask[] = [];

    if (!isProfileComplete) {
      tasks.push({
        id: 'task-profile',
        title: 'Complete your profile',
        description: 'Add personal info, medical history, insurance & consent forms',
        status: 'pending',
        actionLabel: 'Start setup',
        action: onOpenProfileSetup,
      });
    }

    if (hasPendingPreConsult) {
      tasks.push({
        id: 'task-prep',
        title: 'Pre-visit checklist',
        description: 'Complete intake questionnaire before your appointment',
        status: 'pending',
        actionLabel: 'Start now',
        action: onOpenSchedule,
      });
    }

    return tasks;
  }, [hasPendingPreConsult, isProfileComplete, onOpenProfileSetup, onOpenSchedule]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={styles.greetingBlock}>
              <ThemedText variant="caption2" color="secondary">
                {todayLabel}
              </ThemedText>
              <ThemedText variant="body2" color="secondary" style={styles.greetingSubtitle}>
                Welcome back
              </ThemedText>
              <View style={styles.greetingNameRow}>
                <Ionicons name="person-outline" size={18} color={theme.colors.primary.main} />
                <ThemedText
                  variant="headline1"
                  color="primary"
                  style={styles.greetingNameLarge}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {userDisplayName}
                </ThemedText>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconButton}
                activeOpacity={0.85}
                onPress={onOpenNotifications}
              >
                <Ionicons name="notifications-outline" size={20} color={theme.colors.primary.main} />
                {!!unreadCount && unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <ThemedText variant="caption2" color="inverse" style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : String(unreadCount)}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconButton}>
                <Ionicons name="search-outline" size={20} color={theme.colors.primary.main} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.avatar}>
                  <ThemedText variant="body3" color="inverse">
                    {userInitials}
                  </ThemedText>
                </View>
              <View>
                <ThemedText variant="caption1" color="inverse">
                  Care plan
                </ThemedText>
                <ThemedText variant="headline2" color="inverse">
                  Keep your recovery on track
                </ThemedText>
              </View>
            </View>
            <View style={styles.heroFooter}>
              <TouchableOpacity style={styles.heroButton} activeOpacity={0.9} onPress={onOpenService}>
                <Ionicons name="flash-outline" size={18} color={theme.colors.primary.main} />
                <ThemedText variant="body3" color="primary" style={styles.heroButtonText}>
                  Book same-day visit
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroGhostButton} onPress={onSeeAllDoctors}>
                <ThemedText variant="body3" color="inverse">
                  Browse doctors
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
            {healthHighlights.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <ThemedText variant="caption2" color="secondary">
                  {metric.label}
                </ThemedText>
                <ThemedText variant="headline2" color="primary" style={styles.metricValue}>
                  {metric.value}
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {metric.meta}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sectionHeaderRow}>
            <ThemedText variant="headline2" color="primary">
              Next appointment
            </ThemedText>
            <TouchableOpacity onPress={onOpenSchedule}>
              <ThemedText variant="body3" color="secondary">
                See schedule
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.appointmentCard}>
            <View style={styles.appointmentDoctorRow}>
              <View style={styles.doctorBadge}>
                <Ionicons name="medical-outline" size={20} color={theme.colors.primary.main} />
              </View>
              <View style={styles.appointmentDoctorText}>
                <ThemedText variant="headline3" color="primary">
                  {nextAppointment.doctor}
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {nextAppointment.specialty}
                </ThemedText>
              </View>
            </View>
            <View style={styles.appointmentDetailsRow}>
              <View style={styles.appointmentDetail}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="body3" color="primary">
                  {nextAppointment.date}
                </ThemedText>
              </View>
              <View style={styles.appointmentDetail}>
                <Ionicons name="time-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="body3" color="primary">
                  {nextAppointment.time}
                </ThemedText>
              </View>
            </View>
            <ThemedText variant="body3" color="secondary" style={styles.appointmentLocation}>
              {nextAppointment.location}
            </ThemedText>
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={onOpenSchedule}>
                <ThemedText variant="body3" color="primary">
                  Reschedule
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={onOpenSchedule}>
                <ThemedText variant="body3" color="inverse">
                  Prepare checklist
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText variant="headline2" color="primary">
              Quick shortcuts
            </ThemedText>
          </View>
          <View style={styles.shortcutsGrid}>
            {quickShortcuts.map((shortcut) => (
              <TouchableOpacity
                key={shortcut.id}
                style={styles.shortcutCard}
                activeOpacity={0.9}
                onPress={shortcut.action}
              >
                <View style={styles.shortcutIconWrapper}>
                  <Ionicons name={shortcut.icon} size={20} color={theme.colors.primary.main} />
                </View>
                <ThemedText variant="body2" color="primary">
                  {shortcut.label}
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {shortcut.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.essentialsGrid}>
            {essentials.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.essentialCard}
                activeOpacity={0.9}
                onPress={item.action}
              >
                <View style={styles.essentialIcon}>
                  <Ionicons name={item.icon} size={20} color={theme.colors.primary.main} />
                </View>
                <ThemedText variant="body2" color="primary">
                  {item.title}
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {item.description}
                </ThemedText>
                <View style={styles.essentialFooter}>
                  <ThemedText variant="caption1" color="primary">
                    Open
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.primary.main} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText variant="headline2" color="primary">
              Care tasks
            </ThemedText>
            <TouchableOpacity onPress={onOpenProfile}>
              <ThemedText variant="body3" color="secondary">
                View all
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.taskList}>
            {careTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  task.status === 'completed' ? styles.taskCardCompleted : undefined,
                ]}
              >
                <View style={styles.taskStatusBadge}>
                  <Ionicons
                    name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={
                      task.status === 'completed'
                        ? theme.colors.semantic.success
                        : theme.colors.primary.main
                    }
                  />
                </View>
                <View style={styles.taskText}>
                  <ThemedText variant="body2" color="primary">
                    {task.title}
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    {task.description}
                  </ThemedText>
                </View>
                {task.action && (
                  <TouchableOpacity activeOpacity={0.8} onPress={task.action}>
                    <ThemedText variant="body3" color="primary">
                      {task.actionLabel ?? (task.status === 'completed' ? 'View' : 'Open')}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText variant="headline2" color="primary">
              Care team
            </ThemedText>
            <TouchableOpacity onPress={onSeeAllDoctors}>
              <ThemedText variant="body3" color="secondary">
                Manage
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.careTeamRow}>
            {careTeam.map((member) => (
              <TouchableOpacity key={member.id} style={styles.careTeamCard} activeOpacity={0.9} onPress={onOpenChat}>
                <View style={styles.careTeamAvatar}>
                  <Ionicons name="person-outline" size={24} color={theme.colors.primary.main} />
                </View>
                <ThemedText variant="body2" color="primary" style={styles.careTeamName}>
                  {member.name}
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {member.specialty}
                </ThemedText>
                <View style={styles.careTeamChip}>
                  <Ionicons name="flash-outline" size={14} color={theme.colors.semantic.success} />
                  <ThemedText variant="caption2" color="primary">
                    {member.availability}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeaderRow}>
            <ThemedText variant="headline2" color="primary">
              Documents & results
            </ThemedText>
            <TouchableOpacity onPress={() => onOpenDocuments()}>
              <ThemedText variant="body3" color="secondary">
                View archive
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.documentsList}>
            {documents.map((doc) => (
              <View key={doc.id} style={styles.documentCard}>
                <View style={styles.documentIcon}>
                  <Ionicons name="document-text-outline" size={20} color={theme.colors.primary.main} />
                </View>
                <View style={styles.documentText}>
                  <ThemedText variant="body2" color="primary">
                    {doc.title}
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    {doc.subtitle}
                  </ThemedText>
                </View>
                <View style={styles.documentMeta}>
                  <ThemedText variant="caption2" color="secondary">
                    {doc.date}
                  </ThemedText>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => onOpenDocuments(doc.id)}>
                    <ThemedText variant="body3" color="primary">
                      Open
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

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
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 4,
    gap: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingBlock: {
    maxWidth: '70%',
  },
  greetingSubtitle: {
    marginTop: theme.spacing.xs / 2,
  },
  greetingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  greetingNameLarge: {
    flexShrink: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
    position: 'relative',
    ...theme.shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.semantic.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.background.card,
  },
  notificationBadgeText: {
    fontSize: 9,
  },
  heroCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.neutral.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  heroButtonText: {
    fontWeight: '600',
  },
  heroGhostButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  metricsRow: {
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  metricCard: {
    width: 180,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  metricValue: {
    marginVertical: theme.spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  appointmentCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.md,
  },
  appointmentDoctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  doctorBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentDoctorText: {
    flex: 1,
  },
  appointmentDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  appointmentLocation: {
    marginBottom: theme.spacing.md,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  primaryButton: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  shortcutCard: {
    flexBasis: '48%',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  shortcutIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  essentialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  essentialCard: {
    flexBasis: '48%',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.sm,
  },
  essentialIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  essentialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  taskList: {
    gap: theme.spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    flex: 1,
  },
  careTeamRow: {
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  careTeamCard: {
    width: 200,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  careTeamAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  careTeamName: {
    marginBottom: theme.spacing.xs,
  },
  careTeamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    marginTop: theme.spacing.sm,
  },
  documentsList: {
    gap: theme.spacing.sm,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentText: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  documentMeta: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs / 2,
  },
});

export default HomeScreen;


