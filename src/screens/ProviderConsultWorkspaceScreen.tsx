import React from 'react';
import { ScrollView, StyleSheet, TextInput, View, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import TextField from '../components/TextField';
import ErrorAlert from '../components/ErrorAlert';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { updateConsultationStatus, addConsultationNotes, createPrescription, orderLabTest } from '../services/providerDashboard';

type VitalStat = {
  label: string;
  value: string;
  status?: 'normal' | 'warning';
};

type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  description: string;
};

type PatientHistoryEntry = {
  id: string;
  title: string;
  date: string;
  summary: string;
};

type ProviderOrder = {
  id: string;
  type: 'prescription' | 'lab';
  detail: string;
  timestamp: string;
};

type TreatmentPlan = {
  summary: string;
  goals: string[];
};

export type ProviderConsultWorkspaceScreenProps = {
  patientName: string;
  appointmentReason: string;
  scheduledTime: string;
  onBack?: () => void;
  onComplete?: () => void;
  onAddOrder?: () => void;
  onSendMessage?: () => void;
  onToggleMic?: (muted: boolean) => void;
  onToggleCamera?: (disabled: boolean) => void;
  onSwitchCamera?: () => void;
  onOpenChat?: () => void;
  onShareDocs?: () => void;
  onAdmitPatient?: () => void;
  onSendChatMessage?: (message: string) => void;
  onShareVisitNote?: (note: string) => void;
  initialPatientReady?: boolean;
  initialCallStatus?: 'waiting' | 'live';
  chatMessages?: { id: string; author: 'provider' | 'patient'; text: string }[];
  sharedNotes?: string[];
  patientHistory?: PatientHistoryEntry[];
  orders?: ProviderOrder[];
  treatmentPlan?: TreatmentPlan;
  onCreatePrescription?: (note: string) => void;
  onOrderLab?: (note: string) => void;
  onUpdateTreatmentPlan?: (plan: TreatmentPlan) => void;
};

const MOCK_VITALS: VitalStat[] = [
  { label: 'BP', value: '118/76', status: 'normal' },
  { label: 'Pulse', value: '74 bpm', status: 'normal' },
  { label: 'Temp', value: '37.4°C', status: 'warning' },
  { label: 'SpO₂', value: '98%', status: 'normal' },
];

const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: 'evt-1',
    time: '09:02',
    title: 'Reason for visit logged',
    description: 'Recurring migraines, worsened since last visit.',
  },
  {
    id: 'evt-2',
    time: '09:05',
    title: 'Pre-visit questionnaire',
    description: 'Dizziness episodes increased, triggers include bright lights.',
  },
  {
    id: 'evt-3',
    time: '09:08',
    title: 'Uploads reviewed',
    description: 'Patient shared headache diary and OTC med list.',
  },
];

const ProviderConsultWorkspaceScreen: React.FC<ProviderConsultWorkspaceScreenProps> = ({
  patientName,
  appointmentReason,
  scheduledTime,
  onBack,
  onComplete,
  onAddOrder,
  onSendMessage,
  onToggleMic,
  onToggleCamera,
  onSwitchCamera,
  onOpenChat,
  onShareDocs,
  onAdmitPatient,
  onSendChatMessage,
  onShareVisitNote,
  initialPatientReady = true,
  initialCallStatus = 'waiting',
  chatMessages = [],
  sharedNotes = [],
  patientHistory = [],
  orders = [],
  treatmentPlan,
  onCreatePrescription,
  onOrderLab,
  onUpdateTreatmentPlan,
}) => {
  const { user } = useAuth();
  const [noteDraft, setNoteDraft] = React.useState('Patient joined call. Reports 3 migraines/week. Considering triptan.');
  const [chatDraft, setChatDraft] = React.useState('');
  const [prescriptionDraft, setPrescriptionDraft] = React.useState('');
  const [labDraft, setLabDraft] = React.useState('');
  const [planSummary, setPlanSummary] = React.useState(treatmentPlan?.summary ?? '');
  const [planGoals, setPlanGoals] = React.useState<string[]>(treatmentPlan?.goals ?? []);
  const [goalDraft, setGoalDraft] = React.useState('');
  const [isMicMuted, setIsMicMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const isLiveCall = initialCallStatus === 'live';
  const canAdmitPatient = initialCallStatus === 'live' || initialPatientReady;
  const waitingDescription =
    isLiveCall
      ? 'This visit is in progress. Jump back into the room anytime.'
      : initialPatientReady
        ? `${patientName} has checked in and is ready to start.`
        : `${patientName} has not checked in yet. You'll be notified once they enter the waiting room.`;
  const statusBadgeIcon = isLiveCall ? 'radio-outline' : 'hourglass-outline';
  const statusBadgeLabel = isLiveCall ? 'Connected' : 'Standby';
  const stageMetaLabel = isLiveCall ? 'HD • Live' : 'Waiting room';
  const signalCopy = isLiveCall ? 'Strong signal' : 'Ready to connect';

  // Handle adding consultation notes
  const handleAddNotes = async () => {
    if (!noteDraft.trim() || !user?.id) return;

    try {
      setIsSubmitting(true);
      // In a real app, we'd have a consultation ID from props
      // For now, we'll just call the callback
      onShareVisitNote?.(noteDraft);
      setNoteDraft('');
    } catch (err: any) {
      setError({
        title: 'Failed to add notes',
        message: err.message || 'Could not save consultation notes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle creating prescription
  const handleCreatePrescription = async () => {
    if (!prescriptionDraft.trim() || !user?.id) return;

    try {
      setIsSubmitting(true);
      onCreatePrescription?.(prescriptionDraft);
      setPrescriptionDraft('');
      Alert.alert('Success', 'Prescription created successfully.');
    } catch (err: any) {
      setError({
        title: 'Failed to create prescription',
        message: err.message || 'Could not create prescription.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ordering lab test
  const handleOrderLab = async () => {
    if (!labDraft.trim() || !user?.id) return;

    try {
      setIsSubmitting(true);
      onOrderLab?.(labDraft);
      setLabDraft('');
      Alert.alert('Success', 'Lab order created successfully.');
    } catch (err: any) {
      setError({
        title: 'Failed to order lab',
        message: err.message || 'Could not create lab order.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMic = () => {
    setIsMicMuted((prev) => {
      const next = !prev;
      onToggleMic?.(next);
      return next;
    });
  };

  const handleToggleCamera = () => {
    setIsCameraOff((prev) => {
      const next = !prev;
      onToggleCamera?.(next);
      return next;
    });
  };

  const mediaControls = [
    {
      key: 'mic',
      icon: isMicMuted ? 'mic-off' : 'mic',
      onPress: handleToggleMic,
      toggled: isMicMuted,
    },
    {
      key: 'camera',
      icon: isCameraOff ? 'videocam-off' : 'videocam',
      onPress: handleToggleCamera,
      toggled: isCameraOff,
    },
    {
      key: 'switch',
      icon: 'repeat',
      onPress: onSwitchCamera,
      toggled: false,
    },
    {
      key: 'chat',
      icon: 'chatbubble-ellipses',
      onPress: onOpenChat,
      toggled: false,
    },
    {
      key: 'docs',
      icon: 'document',
      onPress: onShareDocs,
      toggled: false,
    },
  ] as const;

  const handleSendChat = () => {
    const trimmed = chatDraft.trim();
    if (!trimmed) return;
    onSendChatMessage?.(trimmed);
    setChatDraft('');
  };

  const handleShareNote = () => {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    onShareVisitNote?.(trimmed);
    setNoteDraft('');
  };

  const handleSendPrescription = () => {
    const trimmed = prescriptionDraft.trim();
    if (!trimmed) return;
    onCreatePrescription?.(trimmed);
    setPrescriptionDraft('');
  };

  const handleOrderLab = () => {
    const trimmed = labDraft.trim();
    if (!trimmed) return;
    onOrderLab?.(trimmed);
    setLabDraft('');
  };

  React.useEffect(() => {
    setPlanSummary(treatmentPlan?.summary ?? '');
    setPlanGoals(treatmentPlan?.goals ?? []);
  }, [treatmentPlan]);

  const handleAddGoal = () => {
    const trimmed = goalDraft.trim();
    if (!trimmed) return;
    setPlanGoals((prev) => [...prev, trimmed]);
    setGoalDraft('');
  };

  const handleRemoveGoal = (idx: number) => {
    setPlanGoals((prev) => prev.filter((_, goalIndex) => goalIndex !== idx));
  };

  const handleSavePlan = () => {
    const summary = planSummary.trim();
    if (!summary || planGoals.length === 0) return;
    onUpdateTreatmentPlan?.({ summary, goals: planGoals });
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

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <View style={styles.sessionCopy}>
          <ThemedText variant="headline2" color="primary">
            {patientName}
          </ThemedText>
          <ThemedText variant="body3" color="secondary">
            {appointmentReason} · {scheduledTime}
          </ThemedText>
        </View>
        <View style={styles.timerPill}>
          <Ionicons name="time-outline" size={14} color={theme.colors.primary.main} />
          <ThemedText variant="caption1" color="primary">
            {isLiveCall ? '12:24 elapsed' : 'Not started'}
          </ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedCard style={[styles.stageCard, isCompact && styles.stageCardCompact]}>
          <LinearGradient colors={[theme.colors.primary.main, theme.colors.primary.dark]} style={styles.remoteStage}>
            <View style={styles.remoteHeader}>
              <View style={styles.statusBadge}>
                <Ionicons name={statusBadgeIcon as keyof typeof Ionicons.glyphMap} size={14} color={theme.colors.neutral.white} />
                <ThemedText variant="caption1" color="inverse">
                  {statusBadgeLabel}
                </ThemedText>
              </View>
              <ThemedText variant="caption1" color="inverse">
                {stageMetaLabel}
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse">
              {patientName}
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.remoteSubtitle}>
              {appointmentReason}
            </ThemedText>
            <View style={styles.remoteFooter}>
              <ThemedText variant="caption1" color="inverse">
                {scheduledTime}
              </ThemedText>
              <View style={styles.signalPill}>
                <Ionicons name="wifi" size={14} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  {signalCopy}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
          <View style={[styles.selfStage, isCompact && styles.selfStageStacked]}>
            <ThemedText variant="body3" color="secondary">
              Your feed
            </ThemedText>
            <View style={styles.selfFeed}>
              <Ionicons name="person" size={32} color={theme.colors.text.secondary} />
              <ThemedText variant="caption1" color="secondary">
                Camera ready
              </ThemedText>
            </View>
            <View style={[styles.mediaControls, isCompact && styles.mediaControlsWrap]}>
              {mediaControls.map((control) => (
                <TouchableOpacity
                  key={control.key}
                  style={[
                    styles.mediaButton,
                    control.toggled && styles.mediaButtonToggled,
                    !control.onPress && styles.mediaButtonDisabled,
                  ]}
                  activeOpacity={control.onPress ? 0.85 : 1}
                  onPress={control.onPress}
                  disabled={!control.onPress}
                >
                  <Ionicons
                    name={control.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={control.toggled ? theme.colors.semantic.danger : theme.colors.neutral.white}
                  />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.mediaButton, styles.mediaButtonEnd]} activeOpacity={0.85} onPress={onComplete}>
                <Ionicons name="call" size={18} color={theme.colors.semantic.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </ThemedCard>

        <ThemedCard style={styles.waitingCard}>
          <View style={styles.waitingHeader}>
            <View style={styles.waitingIcon}>
              <Ionicons name="time-outline" size={18} color={theme.colors.primary.main} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="headline3" color="primary">
                Waiting room
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                {waitingDescription}
              </ThemedText>
            </View>
          </View>
          <Button
            label={initialCallStatus === 'live' ? 'Return to live call' : 'Admit & start call'}
            variant="primary"
            size="sm"
            disabled={!canAdmitPatient}
            onPress={onAdmitPatient}
          />
        </ThemedCard>

        <ThemedCard style={styles.chatCard}>
          <View style={styles.cardHeader}>
            <View>
              <ThemedText variant="headline3" color="primary">
                Live chat
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Visible to you & {patientName}
              </ThemedText>
            </View>
          </View>
          <View style={styles.chatList}>
            {chatMessages.length === 0 ? (
              <ThemedText variant="caption1" color="secondary">
                No messages yet. Say hello to kick things off.
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
          </View>
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

        <View style={[styles.twoColumn, isCompact && styles.twoColumnStacked]}>
          <ThemedCard style={[
            styles.columnCard,
            styles.vitalsCard,
            isCompact && styles.columnCardFullWidth,
          ]}>
            <View style={[styles.cardHeader, isCompact && styles.cardHeaderStacked]}>
              <ThemedText variant="headline3" color="primary">
                Current vitals
              </ThemedText>
              <Button
                label="Add reading"
                variant="secondary"
                size="sm"
                textVariant="caption1"
                onPress={onAddOrder}
                style={styles.inlineButton}
              />
            </View>
            <View style={styles.vitalGrid}>
              {MOCK_VITALS.map((vital) => (
                <View key={vital.label} style={styles.vitalItem}>
                  <ThemedText variant="caption1" color="secondary">
                    {vital.label}
                  </ThemedText>
                  <ThemedText
                    variant="headline3"
                    color="primary"
                    style={vital.status === 'warning' ? styles.vitalWarning : undefined}
                  >
                    {vital.value}
                  </ThemedText>
                  <ThemedText variant="caption2" color="secondary">
                    {vital.status === 'warning' ? 'Recheck' : 'Stable'}
                  </ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.miniChart}>
              {[48, 64, 32, 80, 70, 62, 90].map((bar, index) => (
                <View key={index} style={[styles.chartBar, { height: bar }]} />
              ))}
            </View>
          </ThemedCard>

          <ThemedCard style={[
            styles.columnCard,
            styles.timelineCard,
            isCompact && styles.columnCardFullWidth,
          ]}>
            <View style={[styles.cardHeader, isCompact && styles.cardHeaderStacked]}>
              <ThemedText variant="headline3" color="primary">
                Intake timeline
              </ThemedText>
              <Button
                label="View chart"
                variant="secondary"
                size="sm"
                textVariant="caption1"
                onPress={onSendMessage}
                style={styles.inlineButton}
              />
            </View>
            <View style={styles.timeline}>
              {MOCK_TIMELINE.map((event, index) => (
                <View key={event.id} style={styles.timelineRow}>
                  <View style={styles.timelineMarker}>
                    <View style={styles.timelineDot} />
                    {index !== MOCK_TIMELINE.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineCopy}>
                    <ThemedText variant="caption1" color="secondary">
                      {event.time}
                    </ThemedText>
                    <ThemedText variant="body2" color="primary">
                      {event.title}
                    </ThemedText>
                    <ThemedText variant="caption1" color="secondary">
                      {event.description}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </ThemedCard>
        </View>

        {patientHistory.length > 0 && (
          <ThemedCard style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <ThemedText variant="headline3" color="primary">
                Patient history
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                Recent visits & key events
              </ThemedText>
            </View>
            <View style={styles.historyList}>
              {patientHistory.map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <View style={styles.historyMeta}>
                    <ThemedText variant="caption1" color="secondary">
                      {entry.date}
                    </ThemedText>
                    <ThemedText variant="body2" color="primary">
                      {entry.title}
                    </ThemedText>
                    <ThemedText variant="caption1" color="secondary">
                      {entry.summary}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </ThemedCard>
        )}

        <ThemedCard style={styles.ordersCard}>
          <View style={styles.cardHeader}>
            <ThemedText variant="headline3" color="primary">
              Orders & quick actions
            </ThemedText>
          </View>
          {orders.length > 0 && (
            <View style={styles.orderLog}>
              {orders.map((order) => (
                <View key={order.id} style={styles.orderRow}>
                  <View style={styles.orderMeta}>
                    <ThemedText variant="caption1" color="secondary">
                      {order.timestamp} · {order.type === 'prescription' ? 'Rx' : 'Lab'}
                    </ThemedText>
                    <ThemedText variant="body3" color="primary">
                      {order.detail}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={styles.orderSection}>
            <ThemedText variant="body3" color="secondary">
              Prescription note
            </ThemedText>
            <TextField
              multiline
              numberOfLines={3}
              value={prescriptionDraft}
              onChangeText={setPrescriptionDraft}
              placeholder="Medication, dosage, instructions..."
              textAlignVertical="top"
            />
            <Button
              label="Send Rx"
              variant="primary"
              size="sm"
              onPress={handleSendPrescription}
              disabled={!prescriptionDraft.trim()}
            />
          </View>
          <View style={styles.orderSection}>
            <ThemedText variant="body3" color="secondary">
              Lab request
            </ThemedText>
            <TextField
              multiline
              numberOfLines={3}
              value={labDraft}
              onChangeText={setLabDraft}
              placeholder="Lab name, specimen, urgency..."
              textAlignVertical="top"
            />
            <Button
              label="Order lab"
              variant="secondary"
              size="sm"
              onPress={handleOrderLab}
              disabled={!labDraft.trim()}
            />
          </View>
        </ThemedCard>

        <ThemedCard style={styles.planCard}>
          <View style={styles.cardHeader}>
            <ThemedText variant="headline3" color="primary">
              Treatment plan
            </ThemedText>
          </View>
          <TextField
            label="Summary"
            multiline
            numberOfLines={3}
            value={planSummary}
            onChangeText={setPlanSummary}
            placeholder="High-level guidance, next steps..."
            textAlignVertical="top"
          />
          <View style={styles.goalInputRow}>
            <View style={styles.goalInputField}>
              <TextField
                label="New goal"
                value={goalDraft}
                onChangeText={setGoalDraft}
                placeholder="e.g. Track migraines daily"
              />
            </View>
            <Button
              label="Add"
              variant="secondary"
              size="sm"
              onPress={handleAddGoal}
              disabled={!goalDraft.trim()}
              style={styles.goalAddButton}
            />
          </View>
          {planGoals.length > 0 && (
            <View style={styles.goalList}>
              {planGoals.map((goal, idx) => (
                <View key={`${goal}-${idx}`} style={styles.goalRow}>
                  <ThemedText variant="body3" color="primary" style={{ flex: 1 }}>
                    {goal}
                  </ThemedText>
                  <TouchableOpacity onPress={() => handleRemoveGoal(idx)} style={styles.goalRemove} activeOpacity={0.75}>
                    <Ionicons name="close" size={14} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <Button
            label="Save plan"
            variant="primary"
            size="sm"
            disabled={!planSummary.trim() || planGoals.length === 0}
            onPress={handleSavePlan}
          />
        </ThemedCard>

        <ThemedCard style={[styles.columnCard, styles.notesCard, isCompact && styles.columnCardFullWidth]}>
          {sharedNotes.length > 0 && (
            <View style={styles.sharedNotesList}>
              {sharedNotes.map((note, index) => (
                <View key={`${note}-${index}`} style={styles.sharedNoteChip}>
                  <ThemedText variant="caption2" color="secondary">
                    Shared note {index + 1}
                  </ThemedText>
                  <ThemedText variant="body3" color="primary">
                    {note}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          <View style={[styles.cardHeader, isCompact && styles.cardHeaderStacked]}>
            <ThemedText variant="headline3" color="primary">
              Live notes & actions
            </ThemedText>
            <Button
              label="Send Rx / Lab"
              variant="secondary"
              size="sm"
              textVariant="caption1"
              onPress={onAddOrder}
              style={styles.inlineButton}
            />
          </View>
          <TextField
            multiline
            numberOfLines={5}
            value={noteDraft}
            onChangeText={setNoteDraft}
            placeholder="Type live notes here..."
            textAlignVertical="top"
          />
          <View style={[styles.noteActions, isCompact && styles.noteActionsStacked]}>
            <Button
              label="Share update"
              variant="secondary"
              size="sm"
              textVariant="body3"
              onPress={handleShareNote}
              style={[styles.inlineButton, styles.noteActionButton]}
            />
            <Button
              label="Complete visit"
              variant="primary"
              size="sm"
              textVariant="body3"
              onPress={onComplete}
              style={[styles.inlineButton, styles.noteActionButton]}
            />
          </View>
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
  sessionCopy: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
    gap: theme.spacing.xs / 2,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  stageCard: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  stageCardCompact: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  remoteStage: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    minHeight: 190,
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
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs / 1.2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  remoteSubtitle: {
    marginTop: theme.spacing.xs,
  },
  remoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    backgroundColor: theme.colors.neutral.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs / 1.2,
    borderRadius: theme.borderRadius.full,
  },
  selfStage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  selfStageStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  selfFeed: {
    flex: 1,
    minHeight: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  mediaControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  mediaControlsWrap: {
    justifyContent: 'flex-start',
  },
  mediaButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaButtonToggled: {
    backgroundColor: theme.colors.neutral.white,
    borderWidth: 1,
    borderColor: theme.colors.semantic.dangerLight,
  },
  mediaButtonDisabled: {
    opacity: 0.5,
  },
  mediaButtonEnd: {
    backgroundColor: theme.colors.semantic.dangerLight,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  twoColumnStacked: {
    flexDirection: 'column',
  },
  columnCard: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  columnCardFullWidth: {
    width: '100%',
  },
  vitalsCard: {
    flex: 0.9,
  },
  timelineCard: {
    flex: 1.1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  vitalItem: {
    width: '45%',
    gap: theme.spacing.xs / 2,
  },
  vitalWarning: {
    color: theme.colors.semantic.warning,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
    height: 120,
  },
  chartBar: {
    flex: 1,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.light,
  },
  timeline: {
    gap: theme.spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timelineMarker: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary.main,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border.light,
    marginTop: theme.spacing.xs,
  },
  timelineCopy: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  notesCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  notesCardCompact: {
    padding: theme.spacing.md,
  },
  sharedNotesList: {
    gap: theme.spacing.sm,
  },
  sharedNoteChip: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.xs / 2,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  noteActionsStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inlineButton: {
    alignSelf: 'flex-start',
  },
  noteActionButton: {
    width: '100%',
  },
  historyCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  historyList: {
    gap: theme.spacing.sm,
  },
  historyRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: theme.spacing.sm,
  },
  historyMeta: {
    gap: theme.spacing.xs / 2,
  },
  ordersCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  orderLog: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  orderRow: {
    padding: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  orderMeta: {
    gap: theme.spacing.xs / 2,
  },
  orderSection: {
    gap: theme.spacing.sm,
  },
  planCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  goalInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  goalInputField: {
    flex: 1,
  },
  goalAddButton: {
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  goalList: {
    gap: theme.spacing.xs,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  goalRemove: {
    padding: theme.spacing.xs,
  },
  waitingCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  waitingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  waitingIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  chatList: {
    gap: theme.spacing.sm,
  },
  chatBubble: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
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
});

export default ProviderConsultWorkspaceScreen;
