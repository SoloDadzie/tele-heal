import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import ErrorAlert from '../components/ErrorAlert';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { startRecording, stopRecording } from '../services/video';

export type ProviderCallMessage = {
  id: string;
  author: 'provider' | 'patient';
  text: string;
};

export type ProviderCallScreenProps = {
  patientName: string;
  appointmentReason: string;
  scheduledTime: string;
  onBack?: () => void;
  onEndCall?: () => void;
  onToggleMic?: (muted: boolean) => void;
  onToggleVideo?: (disabled: boolean) => void;
  onToggleShare?: (sharing: boolean) => void;
  onToggleChat?: (open: boolean) => void;
  onOpenWorkspace?: () => void;
  chatMessages?: ProviderCallMessage[];
  sharedNotes?: string[];
  onSendChatMessage?: (text: string) => void;
  onAddSharedNote?: (text: string) => void;
};

const BOTTOM_PANEL_HEIGHT = Math.min(Dimensions.get('window').height * 0.5, 420);

const ProviderCallScreen: React.FC<ProviderCallScreenProps> = ({
  patientName,
  appointmentReason,
  scheduledTime,
  onBack,
  onEndCall,
  onToggleMic,
  onToggleVideo,
  onToggleShare,
  onToggleChat,
  onOpenWorkspace,
  chatMessages = [],
  sharedNotes = [],
  onSendChatMessage,
  onAddSharedNote,
}) => {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(true);
  const [chatDraft, setChatDraft] = React.useState('');
  const [sharedNoteDraft, setSharedNoteDraft] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);

  const handleToggleMic = () => {
    setIsMuted((prev) => {
      const next = !prev;
      onToggleMic?.(next);
      return next;
    });
  };

  const handleToggleVideo = () => {
    setIsVideoOff((prev) => {
      const next = !prev;
      onToggleVideo?.(next);
      return next;
    });
  };

  const handleToggleShare = () => {
    setIsSharing((prev) => {
      const next = !prev;
      onToggleShare?.(next);
      return next;
    });
  };

  const handleToggleChat = () => {
    setIsChatOpen((prev) => {
      const next = !prev;
      onToggleChat?.(next);
      return next;
    });
  };

  const handleSendChat = () => {
    const trimmed = chatDraft.trim();
    if (!trimmed) return;
    onSendChatMessage?.(trimmed);
    setChatDraft('');
  };

  const handleAddNote = () => {
    const trimmed = sharedNoteDraft.trim();
    if (!trimmed) return;
    onAddSharedNote?.(trimmed);
    setSharedNoteDraft('');
  };

  // Handle video recording
  const handleToggleRecording = async () => {
    if (!user?.id) {
      setError({
        title: 'Recording Failed',
        message: 'User not authenticated. Please sign in again.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isRecording) {
        // Stop recording
        const stopResult = await stopRecording();
        if (!stopResult.success) {
          setError({
            title: 'Stop Recording Failed',
            message: stopResult.error || 'Failed to stop recording.',
          });
          return;
        }
        setIsRecording(false);
        Alert.alert('Success', 'Recording stopped and saved.');
      } else {
        // Start recording
        const startResult = await startRecording();
        if (!startResult.success) {
          setError({
            title: 'Start Recording Failed',
            message: startResult.error || 'Failed to start recording.',
          });
          return;
        }
        setIsRecording(true);
        Alert.alert('Success', 'Recording started.');
      }
    } catch (err: any) {
      setError({
        title: 'Recording Error',
        message: err.message || 'Failed to manage recording.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {error && (
        <ErrorAlert
          title={error.title}
          message={error.message}
          onDismiss={() => setError(null)}
          onRetry={() => setError(null)}
          visible={!!error}
        />
      )}

      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={onBack ?? onOpenWorkspace} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <View style={styles.topBarText}>
            <ThemedText variant="headline2" color="primary">
              {patientName}
            </ThemedText>
            <ThemedText variant="body3" color="secondary">
              {appointmentReason} · {scheduledTime}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.workspaceButton} onPress={onOpenWorkspace} activeOpacity={0.85}>
            <Ionicons name="reader-outline" size={16} color={theme.colors.primary.main} />
            <ThemedText variant="caption1" color="primary">
              Visit workspace
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.videoStage}>
          <LinearGradient colors={[theme.colors.primary.main, theme.colors.primary.dark]} style={styles.remoteFeed}>
            <View style={styles.remoteHeader}>
              <View style={styles.statusBadge}>
                <Ionicons name="radio-outline" size={14} color={theme.colors.neutral.white} />
                <ThemedText variant="caption1" color="inverse">
                  Connected
                </ThemedText>
              </View>
              <ThemedText variant="caption1" color="inverse">
                HD • 12:24 elapsed
              </ThemedText>
            </View>
            <View>
              <ThemedText variant="headline1" color="inverse">
                {patientName}
              </ThemedText>
              <ThemedText variant="body2" color="inverse" style={styles.remoteSubtitle}>
                {appointmentReason}
              </ThemedText>
            </View>
            <View style={styles.remoteFooter}>
              <ThemedText variant="body3" color="inverse">
                {scheduledTime}
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
                  Video off
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
          <ScrollView style={styles.bottomScroll} contentContainerStyle={styles.bottomScrollContent} showsVerticalScrollIndicator={false}>
            <ThemedCard style={styles.controlsCard}>
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                  activeOpacity={0.85}
                  onPress={handleToggleMic}
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
                  onPress={handleToggleVideo}
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
                  style={[styles.controlButton, isSharing && styles.controlButtonActive]}
                  activeOpacity={0.85}
                  onPress={handleToggleShare}
                >
                  <Ionicons
                    name="desktop-outline"
                    size={20}
                    color={isSharing ? theme.colors.neutral.white : theme.colors.primary.main}
                  />
                  <ThemedText variant="caption1" color={isSharing ? 'inverse' : 'primary'}>
                    {isSharing ? 'Stop share' : 'Share screen'}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, isChatOpen && styles.controlButtonActive]}
                  activeOpacity={0.85}
                  onPress={handleToggleChat}
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
                <TouchableOpacity style={[styles.controlButton, styles.endButton]} activeOpacity={0.85} onPress={onEndCall}>
                  <Ionicons name="call" size={20} color={theme.colors.neutral.white} />
                  <ThemedText variant="caption1" color="inverse">
                    End
                  </ThemedText>
                </TouchableOpacity>
              </View>
              {isSharing && (
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
                  Calls are encrypted end-to-end. Notes sync to the workspace automatically.
                </ThemedText>
              </View>
            </ThemedCard>

            {isChatOpen && (
              <ThemedCard style={styles.chatCard}>
                <View style={styles.chatHeader}>
                  <ThemedText variant="headline3" color="primary">
                    Live chat
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    Visible to you & {patientName}
                  </ThemedText>
                </View>
                <ScrollView style={styles.chatList} contentContainerStyle={styles.chatListContent}>
                  {chatMessages.length === 0 ? (
                    <ThemedText variant="caption1" color="secondary">
                      No messages yet. Start the conversation.
                    </ThemedText>
                  ) : (
                    chatMessages.map((message) => (
                      <View
                        key={message.id}
                        style={[
                          styles.chatBubble,
                          message.author === 'provider' ? styles.chatBubbleProvider : styles.chatBubblePatient,
                        ]}
                      >
                        <ThemedText variant="caption2" color="secondary">
                          {message.author === 'provider' ? 'You' : patientName}
                        </ThemedText>
                        <ThemedText variant="body3" color="primary">
                          {message.text}
                        </ThemedText>
                      </View>
                    ))
                  )}
                </ScrollView>
                <View style={styles.chatComposer}>
                  <TextInput
                    style={styles.chatInput}
                    value={chatDraft}
                    onChangeText={setChatDraft}
                    placeholder="Send a quick update..."
                    placeholderTextColor={theme.colors.text.secondary}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.chatSendButton, !chatDraft.trim() && styles.chatSendButtonDisabled]}
                    activeOpacity={chatDraft.trim() ? 0.85 : 1}
                    onPress={handleSendChat}
                    disabled={!chatDraft.trim()}
                  >
                    <Ionicons
                      name="send"
                      size={16}
                      color={chatDraft.trim() ? theme.colors.neutral.white : theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </ThemedCard>
            )}

            <ThemedCard style={styles.notesCard}>
              <View style={styles.notesHeader}>
                <View>
                  <ThemedText variant="headline3" color="primary">
                    Shared visit notes
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    See what the patient sees in real time
                  </ThemedText>
                </View>
                <Ionicons name="create-outline" size={16} color={theme.colors.primary.main} />
              </View>
              <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
                {sharedNotes.length === 0 ? (
                  <ThemedText variant="caption1" color="secondary">
                    Nothing shared yet. Summaries posted here sync to the patient workspace instantly.
                  </ThemedText>
                ) : (
                  sharedNotes.map((note, index) => (
                    <View key={`${note}-${index}`} style={styles.noteChip}>
                      <ThemedText variant="caption2" color="secondary">
                        Note {index + 1}
                      </ThemedText>
                      <ThemedText variant="body3" color="primary">
                        {note}
                      </ThemedText>
                    </View>
                  ))
                )}
              </ScrollView>
              <View style={styles.noteInputRow}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Share a quick summary with the patient..."
                  placeholderTextColor={theme.colors.text.secondary}
                  value={sharedNoteDraft}
                  onChangeText={setSharedNoteDraft}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.addNoteButton, !sharedNoteDraft.trim() && styles.addNoteButtonDisabled]}
                  activeOpacity={sharedNoteDraft.trim() ? 0.85 : 1}
                  onPress={handleAddNote}
                  disabled={!sharedNoteDraft.trim()}
                >
                  <Ionicons
                    name="send"
                    size={16}
                    color={sharedNoteDraft.trim() ? theme.colors.neutral.white : theme.colors.text.secondary}
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
  workspaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.background.card,
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
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  controlsCard: {
    gap: theme.spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
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
  shareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.muted,
  },
  controlsHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  chatCard: {
    gap: theme.spacing.md,
  },
  chatHeader: {
    gap: theme.spacing.xs,
  },
  chatList: {
    maxHeight: 200,
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
  chatBubbleProvider: {
    backgroundColor: theme.colors.primary.light,
  },
  chatBubblePatient: {
    backgroundColor: theme.colors.background.muted,
  },
  chatComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  chatInput: {
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
  chatSendButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
  },
  chatSendButtonDisabled: {
    backgroundColor: theme.colors.border.light,
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

export default ProviderCallScreen;
