import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import ErrorAlert from '../components/ErrorAlert';
import { theme } from '../theme';
import type { Appointment } from './ScheduleScreen';
import { useAuth } from '../contexts/AuthContext';
import { getVideoToken, startConsultation, endConsultation, addConsultationNotes } from '../services/video';

export type ConsultWorkspaceState = {
  appointmentId: string;
  notes: string[];
  messages: Array<{ id: string; author: string; text: string }>;
  isMuted: boolean;
  isVideoOff: boolean;
  isSharingScreen: boolean;
  lastUpdated: string;
};

export type VirtualConsultationScreenProps = {
  appointment: Appointment;
  onEndConsultation: () => void;
  onBack?: () => void;
  workspaceState?: ConsultWorkspaceState;
  onWorkspaceStateChange?: (state: ConsultWorkspaceState) => void;
};

const MOCK_MESSAGES = [
  { id: 'm1', author: 'Doctor', text: 'Hi Riley! I can hear you clearly. How are you feeling today?' },
  { id: 'm2', author: 'You', text: 'Hi doctor. I have been feeling dizzy since yesterday.' },
];

const BOTTOM_PANEL_HEIGHT = Math.min(Dimensions.get('window').height * 0.45, 420);

const VirtualConsultationScreen: React.FC<VirtualConsultationScreenProps> = ({
  appointment,
  onEndConsultation,
  onBack,
  workspaceState,
  onWorkspaceStateChange,
}) => {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = React.useState(workspaceState?.isMuted ?? false);
  const [isVideoOff, setIsVideoOff] = React.useState(workspaceState?.isVideoOff ?? false);
  const [isChatOpen, setIsChatOpen] = React.useState(true);
  const [isSharingScreen, setIsSharingScreen] = React.useState(workspaceState?.isSharingScreen ?? false);
  const [notes, setNotes] = React.useState<string[]>(
    workspaceState?.notes ?? [
      'Vitals normal. Needs follow-up labs.',
      'Remind to log dizziness episodes daily.',
    ]
  );
  const [noteDraft, setNoteDraft] = React.useState('');
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [isEnding, setIsEnding] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);
  const [videoToken, setVideoToken] = React.useState<string | null>(null);
  const [isConsultationStarted, setIsConsultationStarted] = React.useState(false);

  // Initialize consultation on mount
  React.useEffect(() => {
    const initializeConsultation = async () => {
      if (!user?.id || isConsultationStarted) return;

      try {
        setIsInitializing(true);

        // Get video token
        const tokenResult = await getVideoToken(appointment.id, user.id, user.full_name || 'Patient');
        if (!tokenResult.success) {
          setError({
            title: 'Video Setup Failed',
            message: tokenResult.error || 'Failed to initialize video call.',
          });
          return;
        }

        setVideoToken(tokenResult.data?.token || null);

        // Start consultation
        const startResult = await startConsultation(appointment.id);
        if (!startResult.success) {
          setError({
            title: 'Consultation Start Failed',
            message: startResult.error || 'Failed to start consultation.',
          });
          return;
        }

        setIsConsultationStarted(true);
      } catch (err: any) {
        setError({
          title: 'Initialization Error',
          message: err.message || 'Failed to initialize consultation.',
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeConsultation();
  }, [user?.id, appointment.id, isConsultationStarted]);

  // Update workspace state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onWorkspaceStateChange?.({
        appointmentId: appointment.id,
        notes,
        messages: MOCK_MESSAGES,
        isMuted,
        isVideoOff,
        isSharingScreen,
        lastUpdated: new Date().toISOString(),
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [notes, isMuted, isVideoOff, isSharingScreen, appointment.id, onWorkspaceStateChange]);

  // Handle end consultation
  const handleEndConsultation = async () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'End',
          onPress: async () => {
            try {
              setIsEnding(true);

              // Add final notes
              if (noteDraft.trim()) {
                await addConsultationNotes(appointment.id, noteDraft);
              }

              // End consultation
              const result = await endConsultation(appointment.id, notes.join('\n'));
              if (!result.success) {
                setError({
                  title: 'End Failed',
                  message: result.error || 'Failed to end consultation.',
                });
                return;
              }

              onEndConsultation();
            } catch (err: any) {
              setError({
                title: 'Error',
                message: err.message || 'Failed to end consultation.',
              });
            } finally {
              setIsEnding(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {error && (
          <ErrorAlert
            title={error.title}
            message={error.message}
            onDismiss={() => setError(null)}
            onRetry={() => setError(null)}
            visible={!!error}
          />
        )}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topBarButton}
            activeOpacity={0.85}
            onPress={onBack ?? handleEndConsultation}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <View style={styles.topBarText}>
            <ThemedText variant="headline2" color="primary">
              Live consultation
            </ThemedText>
            <ThemedText variant="body3" color="secondary">
              {appointment.doctorName} · {appointment.serviceLabel}
            </ThemedText>
          </View>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.videoStage}>
          <LinearGradient colors={[theme.colors.primary.main, '#0f766e']} style={styles.remoteFeed}>
            <View style={styles.remoteHeader}>
              <View style={styles.statusBadge}>
                <Ionicons name="radio-outline" size={14} color={theme.colors.neutral.white} />
                <ThemedText variant="caption1" color="inverse">
                  Connected
                </ThemedText>
              </View>
              <ThemedText variant="caption1" color="inverse">
                HD • 00:12:24
              </ThemedText>
            </View>
            <View>
              <ThemedText variant="headline1" color="inverse">
                Dr. {appointment.doctorName}
              </ThemedText>
              <ThemedText variant="body2" color="inverse" style={styles.remoteSubtitle}>
                {appointment.serviceLabel}
              </ThemedText>
            </View>
            <View style={styles.remoteFooter}>
              <ThemedText variant="body3" color="inverse">
                {appointment.dateLabel} · {appointment.timeLabel}
              </ThemedText>
              <View style={styles.signalPill}>
                <Ionicons name="wifi" size={14} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Strong signal
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
          <View style={styles.selfFeedWrapper}>
            <View style={[styles.selfFeed, isVideoOff && styles.selfFeedMuted]}>
              {isVideoOff ? (
                <ThemedText variant="body2" color="secondary">
                  Camera off
                </ThemedText>
              ) : (
                <ThemedText variant="headline3" color="primary">
                  You
                </ThemedText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.bottomSheet}>
          <ScrollView
            style={styles.bottomScroll}
            contentContainerStyle={styles.bottomScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedCard style={styles.controlsCard}>
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                  activeOpacity={0.85}
                  onPress={() => setIsMuted((prev) => !prev)}
                >
                  <Ionicons
                    name={isMuted ? 'mic-off' : 'mic'}
                    size={20}
                    color={isMuted ? theme.colors.neutral.white : theme.colors.primary.main}
                  />
                  <ThemedText variant="caption1" color={isMuted ? 'inverse' : 'primary'}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
                  activeOpacity={0.85}
                  onPress={() => setIsVideoOff((prev) => !prev)}
                >
                  <Ionicons
                    name={isVideoOff ? 'videocam-off' : 'videocam'}
                    size={20}
                    color={isVideoOff ? theme.colors.neutral.white : theme.colors.primary.main}
                  />
                  <ThemedText variant="caption1" color={isVideoOff ? 'inverse' : 'primary'}>
                    {isVideoOff ? 'Video on' : 'Video off'}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, isSharingScreen && styles.controlButtonActive]}
                  activeOpacity={0.85}
                  onPress={() => setIsSharingScreen((prev) => !prev)}
                >
                  <Ionicons
                    name="desktop-outline"
                    size={20}
                    color={isSharingScreen ? theme.colors.neutral.white : theme.colors.primary.main}
                  />
                  <ThemedText variant="caption1" color={isSharingScreen ? 'inverse' : 'primary'}>
                    {isSharingScreen ? 'Stop share' : 'Share screen'}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, isChatOpen && styles.controlButtonActive]}
                  activeOpacity={0.85}
                  onPress={() => setIsChatOpen((prev) => !prev)}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={20}
                    color={isChatOpen ? theme.colors.neutral.white : theme.colors.primary.main}
                  />
                  <ThemedText variant="caption1" color={isChatOpen ? 'inverse' : 'primary'}>
                    Chat
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, styles.endButton]}
                  activeOpacity={0.85}
                  onPress={onEndConsultation}
                >
                  <Ionicons name="call" size={20} color={theme.colors.neutral.white} />
                  <ThemedText variant="caption1" color="inverse">
                    End
                  </ThemedText>
                </TouchableOpacity>
              </View>
              {isSharingScreen && (
                <View style={styles.shareBanner}>
                  <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary.main} />
                  <ThemedText variant="caption1" color="primary">
                    Screen share is live. Remember to close sensitive tabs.
                  </ThemedText>
                </View>
              )}
              <View style={styles.controlsHintRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="secondary">
                  Recording disabled. Notes from this visit will sync automatically.
                </ThemedText>
              </View>
            </ThemedCard>

            {isChatOpen && (
              <ThemedCard style={styles.chatCard}>
                <View style={styles.chatHeader}>
                  <ThemedText variant="headline3" color="primary">
                    Live chat notes
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    Visible to you & your doctor
                  </ThemedText>
                </View>
                <ScrollView style={styles.chatList} contentContainerStyle={styles.chatListContent}>
                  {MOCK_MESSAGES.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.chatBubble,
                        msg.author === 'You' ? styles.chatBubblePatient : styles.chatBubbleDoctor,
                      ]}
                    >
                      <ThemedText variant="caption2" color="secondary">
                        {msg.author}
                      </ThemedText>
                      <ThemedText variant="body3" color="primary">
                        {msg.text}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>
              </ThemedCard>
            )}

            <ThemedCard style={styles.notesCard}>
              <View style={styles.notesHeader}>
                <View>
                  <ThemedText variant="headline3" color="primary">
                    Shared notes
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    Visible to you & your doctor
                  </ThemedText>
                </View>
                <Ionicons name="create-outline" size={16} color={theme.colors.primary.main} />
              </View>
              <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
                {notes.map((note, index) => (
                  <View key={`${note}-${index}`} style={styles.noteChip}>
                    <ThemedText variant="caption2" color="secondary">
                      {`Note ${index + 1}`}
                    </ThemedText>
                    <ThemedText variant="body3" color="primary">
                      {note}
                    </ThemedText>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.noteInputRow}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a quick note for the provider..."
                  placeholderTextColor={theme.colors.text.secondary}
                  value={noteDraft}
                  onChangeText={setNoteDraft}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.addNoteButton, !noteDraft.trim() && styles.addNoteButtonDisabled]}
                  activeOpacity={noteDraft.trim() ? 0.85 : 1}
                  onPress={() => {
                    const trimmed = noteDraft.trim();
                    if (!trimmed) return;
                    setNotes((prev) => [trimmed, ...prev]);
                    setNoteDraft('');
                  }}
                  disabled={!noteDraft.trim()}
                >
                  <Ionicons
                    name="send"
                    size={16}
                    color={noteDraft.trim() ? theme.colors.neutral.white : theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </ThemedCard>
          </ScrollView>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
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
  topBarText: {
    flex: 1,
  },
  topBarSpacer: {
    width: 40,
  },
  videoStage: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  remoteFeed: {
    flex: 1,
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  remoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  remoteSubtitle: {
    marginTop: theme.spacing.xs,
    opacity: 0.9,
  },
  remoteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
  },
  selfFeedWrapper: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  selfFeed: {
    width: 140,
    height: 90,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfFeedMuted: {
    backgroundColor: theme.colors.background.muted,
  },
  bottomSheet: {
    height: BOTTOM_PANEL_HEIGHT,
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: theme.borderRadius.xxxl,
    borderTopRightRadius: theme.borderRadius.xxxl,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    ...theme.shadows.lg,
  },
  bottomScroll: {
    flex: 1,
  },
  bottomScrollContent: {
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  controlsCard: {
    gap: theme.spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  controlsHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  shareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.muted,
  },
  controlButton: {
    flex: 1,
    height: 72,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs / 2,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  controlButtonActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  endButton: {
    backgroundColor: theme.colors.semantic.danger,
    borderColor: theme.colors.semantic.danger,
  },
  chatCard: {
    gap: theme.spacing.md,
  },
  chatHeader: {
    gap: theme.spacing.xs,
  },
  chatList: {
    maxHeight: 180,
  },
  chatListContent: {
    gap: theme.spacing.sm,
  },
  chatBubble: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  chatBubbleDoctor: {
    backgroundColor: theme.colors.primary.light,
  },
  chatBubblePatient: {
    backgroundColor: theme.colors.background.muted,
  },
  notesCard: {
    gap: theme.spacing.md,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notesList: {
    maxHeight: 180,
  },
  noteChip: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs / 2,
  },
  noteInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  noteInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
  },
  addNoteButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
  },
  addNoteButtonDisabled: {
    backgroundColor: theme.colors.border.light,
  },
});

export default VirtualConsultationScreen;
