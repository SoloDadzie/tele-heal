import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import { theme } from '../theme';
import type { Appointment } from './ScheduleScreen';

export type PreConsultationScreenProps = {
  appointment: Appointment;
  onBack: () => void;
  onEnterWaitingRoom?: () => void;
  onJoinConsultation?: (appointment: Appointment) => void;
};

const REMINDERS = [
  'Have your ID and insurance card ready',
  'Find a quiet, well-lit place for your call',
  'Keep any recent lab results nearby',
];

const QUESTIONNAIRE_ITEMS = [
  'Updated symptoms and notes',
  'Medication list confirmed',
  'Allergies reviewed',
];

const DEVICE_TEST_ITEMS = [
  { key: 'camera', label: 'Camera working' },
  { key: 'microphone', label: 'Microphone working' },
  { key: 'connection', label: 'Internet connection stable' },
];

type DeviceTestKey = (typeof DEVICE_TEST_ITEMS)[number]['key'];

type TaskState = {
  [key in DeviceTestKey]: boolean;
};

const PreConsultationScreen: React.FC<PreConsultationScreenProps> = ({
  appointment,
  onBack,
  onEnterWaitingRoom,
  onJoinConsultation,
}) => {
  const [questionnaire, setQuestionnaire] = React.useState<Record<string, boolean>>({});
  const [deviceTests, setDeviceTests] = React.useState<TaskState>({
    camera: false,
    microphone: false,
    connection: false,
  });
  const [inWaitingRoom, setInWaitingRoom] = React.useState(false);
  const [waitingTimer, setWaitingTimer] = React.useState(5);
  const [reminders, setReminders] = React.useState({
    push: true,
    sms: true,
    email: false,
  });
  const [extraDocs, setExtraDocs] = React.useState<string[]>([]);

  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (inWaitingRoom && waitingTimer > 0) {
      timer = setInterval(() => {
        setWaitingTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [inWaitingRoom, waitingTimer]);

  const toggleQuestionnaireItem = (label: string) => {
    setQuestionnaire((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleDeviceTest = (key: DeviceTestKey) => {
    setDeviceTests((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const questionnaireComplete = QUESTIONNAIRE_ITEMS.every((item) => questionnaire[item]);
  const deviceTestsComplete = Object.values(deviceTests).every(Boolean);
  const canEnterWaitingRoom = questionnaireComplete && deviceTestsComplete;

  const handleEnterWaitingRoom = () => {
    if (!canEnterWaitingRoom) return;
    setInWaitingRoom(true);
    setWaitingTimer(5);
    if (onEnterWaitingRoom) onEnterWaitingRoom();
  };

  const handleJoinConsultation = () => {
    if (waitingTimer > 0 || !inWaitingRoom) return;
    onJoinConsultation?.(appointment);
  };

  const toggleReminder = (channel: keyof typeof reminders) => {
    setReminders((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const getImageMediaType = () =>
    (ImagePicker as any).MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;

  const handleAddExtraDoc = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: getImageMediaType(),
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    const uris = (result.assets ?? []).map((asset) => asset.uri).filter(Boolean);
    if (!uris.length) return;
    setExtraDocs((prev) => [...prev, ...uris]);
  };

  const handleRemoveExtraDoc = (uri: string) => {
    setExtraDocs((prev) => prev.filter((item) => item !== uri));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary">
            Pre-consultation
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
                Prep checklist
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse">
              You’re one step away
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              Complete the quick tasks below so Dr. {appointment.doctorName} has everything needed before the call.
            </ThemedText>
          </LinearGradient>

          <ThemedCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary.main} />
              </View>
              <View>
                <ThemedText variant="headline3" color="primary">
                  Appointment summary
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {appointment.dateLabel} · {appointment.timeLabel}
                </ThemedText>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="person-outline" size={16} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="primary" style={styles.summaryValue}>
                {appointment.doctorName}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="pricetag-outline" size={16} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="primary" style={styles.summaryValue}>
                {appointment.serviceLabel}
              </ThemedText>
            </View>
          </ThemedCard>

          <ThemedCard style={styles.listCard}>
            <ThemedText variant="headline3" color="primary">
              Key reminders
            </ThemedText>
            <View style={styles.chipList}>
              {REMINDERS.map((reminder) => (
                <View key={reminder} style={styles.reminderChip}>
                  <Ionicons name="alert-circle-outline" size={14} color={theme.colors.accent.main} />
                  <ThemedText variant="body3" color="secondary" style={{ flex: 1 }}>
                    {reminder}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ThemedCard>

          <ThemedCard style={styles.listCard}>
            <ThemedText variant="headline3" color="primary">
              Pre-visit questionnaire
            </ThemedText>
            {QUESTIONNAIRE_ITEMS.map((item) => {
              const checked = questionnaire[item];
              return (
                <TouchableOpacity
                  key={item}
                  style={styles.checkRow}
                  activeOpacity={0.85}
                  onPress={() => toggleQuestionnaireItem(item)}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Ionicons name="checkmark" size={16} color={theme.colors.neutral.white} />}
                  </View>
                  <ThemedText variant="body3" color="primary">
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ThemedCard>

          <ThemedCard style={styles.listCard}>
            <ThemedText variant="headline3" color="primary">
              Device check
            </ThemedText>
            {DEVICE_TEST_ITEMS.map((item) => {
              const checked = deviceTests[item.key];
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.checkRow}
                  activeOpacity={0.85}
                  onPress={() => toggleDeviceTest(item.key)}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Ionicons name="checkmark" size={16} color={theme.colors.neutral.white} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body3" color="primary">
                      {item.label}
                    </ThemedText>
                    <ThemedText variant="caption2" color="secondary">
                      {item.key === 'connection' ? 'Run a quick speed test if unsure' : 'Tap to mark complete'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ThemedCard>

          <ThemedCard style={styles.listCard}>
            <ThemedText variant="headline3" color="primary">
              Reminder channels
            </ThemedText>
            <ThemedText variant="body3" color="secondary">
              Choose how we nudge you before the call.
            </ThemedText>
            {[
              { key: 'push', label: 'Push notification', note: 'Default on this device' },
              { key: 'sms', label: 'SMS reminder', note: 'Primary phone number' },
              { key: 'email', label: 'Email reminder', note: 'Account email' },
            ].map((option) => {
              const active = reminders[option.key as keyof typeof reminders];
              return (
                <TouchableOpacity
                  key={option.key}
                  style={styles.reminderRow}
                  activeOpacity={0.85}
                  onPress={() => toggleReminder(option.key as keyof typeof reminders)}
                >
                  <View style={styles.reminderTextBlock}>
                    <ThemedText variant="body2" color="primary">
                      {option.label}
                    </ThemedText>
                    <ThemedText variant="caption1" color="secondary">
                      {option.note}
                    </ThemedText>
                  </View>
                  <View style={[styles.reminderToggle, active && styles.reminderToggleActive]}>
                    <View style={[styles.reminderDot, active && styles.reminderDotActive]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ThemedCard>

          <ThemedCard style={styles.listCard}>
            <View style={styles.extraDocHeader}>
              <ThemedText variant="headline3" color="primary">
                Extra documents
              </ThemedText>
              <TouchableOpacity style={styles.addDocButton} activeOpacity={0.85} onPress={handleAddExtraDoc}>
                <Ionicons name="add" size={16} color={theme.colors.neutral.white} />
                <ThemedText variant="caption1" color="inverse">
                  Add
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText variant="body3" color="secondary">
              Attach last-minute photos, lab slips, or medication lists for your provider.
            </ThemedText>
            {extraDocs.length === 0 ? (
              <TouchableOpacity style={styles.uploadCard} activeOpacity={0.9} onPress={handleAddExtraDoc}>
                <View style={styles.uploadLeft}>
                  <View style={styles.uploadIcon}>
                    <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.primary.main} />
                  </View>
                  <View>
                    <ThemedText variant="body2" color="primary">
                      Upload from library
                    </ThemedText>
                    <ThemedText variant="caption1" color="secondary">
                      JPG, PNG, PDF supported
                    </ThemedText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.extraDocsRow}>
                {extraDocs.map((uri) => (
                  <View key={uri} style={styles.extraDocTile}>
                    <Image source={{ uri }} style={styles.extraDocImage} />
                    <TouchableOpacity
                      style={styles.removeDocButton}
                      activeOpacity={0.8}
                      onPress={() => handleRemoveExtraDoc(uri)}
                    >
                      <Ionicons name="close" size={12} color={theme.colors.neutral.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </ThemedCard>

          <ThemedCard style={styles.waitingCard}>
            <View style={styles.waitingHeader}>
              <View style={styles.waitingIcon}>
                <Ionicons name="videocam-outline" size={20} color={theme.colors.primary.main} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="headline3" color="primary">
                  Waiting room
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {inWaitingRoom
                    ? waitingTimer > 0
                      ? `You are checked in. Dr. ${appointment.doctorName} will join in ${waitingTimer}s.`
                      : 'The doctor is ready to start your visit.'
                    : 'Finish the tasks above, then enter the waiting room to check in early.'}
                </ThemedText>
              </View>
            </View>
            <Button
              label={
                inWaitingRoom
                  ? waitingTimer > 0
                    ? `Checked in (${waitingTimer}s)`
                    : 'Join consultation'
                  : 'Enter waiting room'
              }
              variant="primary"
              fullWidth
              disabled={
                (!inWaitingRoom && !canEnterWaitingRoom) ||
                (inWaitingRoom && waitingTimer > 0)
              }
              onPress={inWaitingRoom && waitingTimer === 0 ? handleJoinConsultation : handleEnterWaitingRoom}
            />
            {inWaitingRoom && waitingTimer === 0 && (
              <View style={styles.readyBanner}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.semantic.success} />
                <ThemedText variant="body3" color="primary" style={styles.readyText}>
                  The doctor is ready. Tap “Join consultation” when you’re ready.
                </ThemedText>
              </View>
            )}
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
  heroMetaText: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  heroDoctorName: {
    flexShrink: 1,
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  summaryValue: {
    flex: 1,
  },
  listCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  chipList: {
    gap: theme.spacing.sm,
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.muted,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.card,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  reminderTextBlock: {
    flex: 1,
    gap: theme.spacing.xs / 2,
    paddingRight: theme.spacing.md,
  },
  reminderToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  reminderToggleActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  reminderDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.background.card,
    alignSelf: 'flex-start',
  },
  reminderDotActive: {
    backgroundColor: theme.colors.neutral.white,
    alignSelf: 'flex-end',
  },
  extraDocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  addDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
  },
  uploadCard: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.muted,
  },
  uploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  uploadIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraDocsRow: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  extraDocTile: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.background.muted,
  },
  extraDocImage: {
    width: '100%',
    height: '100%',
  },
  removeDocButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
  },
  waitingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  waitingIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.muted,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  readyText: {
    flex: 1,
  },
});

export default PreConsultationScreen;
