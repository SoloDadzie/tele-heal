import React from 'react';
import { Alert, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { theme } from '../theme';
import type { ProviderInviteContext } from './ProviderInviteScreen';

export type ConsultationMode = 'virtual' | 'inPerson' | 'hybrid';

type ProviderAttachment = {
  id: string;
  uri: string;
  displayName: string;
  source: 'camera' | 'library';
  addedAt: string;
};

export type ProviderProfileDraft = {
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseState: string;
  yearsOfExperience: string;
  bio: string;
  specialties: string[];
  servicesOffered: string;
  consultationMode: ConsultationMode;
  availabilityNote: string;
  hourlyRate: string;
  timezone: string;
  availabilitySlots: Record<string, string[]>;
  feeCurrency: string;
  trainingAcknowledged: boolean;
  licenseDocuments: ProviderAttachment[];
  malpracticeDocuments: ProviderAttachment[];
  verificationNotes: string;
  trainingModules: Record<string, boolean>;
  trainingCompletedAt?: string;
};

export interface ProviderOnboardingScreenProps {
  inviteContext: ProviderInviteContext;
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit?: (draft: ProviderProfileDraft) => void;
}

type StepKey = 'profile' | 'credentials' | 'services' | 'availability' | 'training' | 'review';

type Step = {
  key: StepKey;
  title: string;
  subtitle: string;
};

const STEPS: Step[] = [
  { key: 'profile', title: 'Your profile', subtitle: 'Basic contact info and introductions.' },
  { key: 'credentials', title: 'Credentials', subtitle: 'Licensing and malpractice uploads.' },
  { key: 'services', title: 'Services', subtitle: 'Specialties, offerings, and consultation mode.' },
  { key: 'availability', title: 'Availability & rates', subtitle: 'Let patients know when you’re free.' },
  { key: 'training', title: 'Training module', subtitle: 'Complete Tele Heal walkthrough.' },
  { key: 'review', title: 'Review & submit', subtitle: 'Double-check before sending to Tele Heal.' },
];

const SPECIALTY_OPTIONS = ['Primary Care', 'Dermatology', 'Cardiology', 'Mental Health', 'Pediatrics'];
const TRAINING_MODULES = [
  { id: 'platform', title: 'Platform orientation', duration: '8 min' },
  { id: 'clinical', title: 'Virtual care clinical protocol', duration: '12 min' },
  { id: 'security', title: 'Data security & privacy', duration: '6 min' },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOT_OPTIONS = ['Morning', 'Afternoon', 'Evening'];
const CURRENCY_OPTIONS = ['GHS', 'USD', 'NGN', 'KES'];

const ProviderOnboardingScreen: React.FC<ProviderOnboardingScreenProps> = ({
  inviteContext,
  onBack,
  onCancel,
  onSubmit,
}) => {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [draft, setDraft] = React.useState<ProviderProfileDraft>({
    fullName: inviteContext.fullName ?? '',
    email: inviteContext.email,
    phone: '',
    licenseNumber: '',
    licenseState: '',
    yearsOfExperience: '',
    bio: '',
    specialties: inviteContext.specialties ?? [],
    servicesOffered: '',
    consultationMode: 'virtual',
    availabilityNote: '',
    hourlyRate: '',
    timezone: 'GMT',
    availabilitySlots: WEEK_DAYS.reduce<Record<string, string[]>>((acc, day) => {
      acc[day] = [];
      return acc;
    }, {}),
    feeCurrency: 'GHS',
    trainingAcknowledged: false,
    licenseDocuments: [],
    malpracticeDocuments: [],
    verificationNotes: '',
    trainingModules: TRAINING_MODULES.reduce<Record<string, boolean>>((acc, module) => {
      acc[module.id] = false;
      return acc;
    }, {}),
    trainingCompletedAt: undefined,
  });
  const [hasSubmitted, setHasSubmitted] = React.useState(false);

  const step = STEPS[stepIndex];
  const totalSteps = STEPS.length;
  const isLastStep = stepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      setHasSubmitted(true);
      onSubmit?.(draft);
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handlePrev = () => {
    if (stepIndex === 0) {
      onBack?.();
      return;
    }
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const toggleSpecialty = (label: string) => {
    setDraft((prev) => {
      const exists = prev.specialties.includes(label);
      return {
        ...prev,
        specialties: exists ? prev.specialties.filter((item) => item !== label) : [...prev.specialties, label],
      };
    });
  };

  const handleAttachmentsPermission = async (source: 'camera' | 'library') => {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      return permission.status === 'granted';
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permission.status === 'granted';
  };

  const handleAddAttachment = async (type: 'license' | 'malpractice', source: 'camera' | 'library') => {
    const granted = await handleAttachmentsPermission(source);
    if (!granted) {
      Alert.alert(
        'Permission needed',
        source === 'camera'
          ? 'Enable camera access to capture a document.'
          : 'Enable photo library access to pick an existing file.',
      );
      return;
    }

    const picker =
      source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;

    const result = await picker({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: source === 'camera',
      base64: false,
      quality: 0.85,
    });

    if (result.canceled) return;

    const assets = (result.assets ?? []).filter(Boolean);
    if (!assets.length) return;

    setDraft((prev) => {
      const attachments = assets.map((asset, index) => ({
        id: `${type}-${Date.now()}-${index}`,
        uri: asset.uri ?? '',
        displayName: asset.fileName ?? `${type === 'license' ? 'License' : 'Malpractice'}-${prevRandomId()}.jpg`,
        source,
        addedAt: new Date().toLocaleString(),
      }));

      const next = {
        ...prev,
        licenseDocuments:
          type === 'license' ? [...prev.licenseDocuments, ...attachments] : prev.licenseDocuments,
        malpracticeDocuments:
          type === 'malpractice'
            ? [...prev.malpracticeDocuments, ...attachments]
            : prev.malpracticeDocuments,
        verificationNotes:
          type === 'license'
            ? `Last uploaded ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : prev.verificationNotes || `Uploaded ${new Date().toLocaleDateString()} · pending credentialing`,
      };
      return next;
    });
  };

  const handleRemoveAttachment = (type: 'license' | 'malpractice', attachmentId: string) => {
    setDraft((prev) => ({
      ...prev,
      licenseDocuments:
        type === 'license'
          ? prev.licenseDocuments.filter((doc) => doc.id !== attachmentId)
          : prev.licenseDocuments,
      malpracticeDocuments:
        type === 'malpractice'
          ? prev.malpracticeDocuments.filter((doc) => doc.id !== attachmentId)
          : prev.malpracticeDocuments,
    }));
  };

  const toggleTrainingModule = (moduleId: string) => {
    setDraft((prev) => {
      const nextModules = { ...prev.trainingModules, [moduleId]: !prev.trainingModules[moduleId] };
      const allComplete = Object.values(nextModules).every(Boolean);
      return {
        ...prev,
        trainingModules: nextModules,
        trainingAcknowledged: allComplete,
        trainingCompletedAt: allComplete ? new Date().toISOString() : undefined,
      };
    });
  };

  const prevRandomId = () => Math.floor(Math.random() * 900 + 100);

  const toggleSlot = (day: string, slot: string) => {
    setDraft((prev) => {
      const existing = prev.availabilitySlots[day] ?? [];
      const exists = existing.includes(slot);
      return {
        ...prev,
        availabilitySlots: {
          ...prev.availabilitySlots,
          [day]: exists ? existing.filter((item) => item !== slot) : [...existing, slot],
        },
      };
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrev} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          Provider onboarding
        </ThemedText>
        <TouchableOpacity style={styles.navButton} onPress={onCancel} activeOpacity={0.85}>
          <Ionicons name="close" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressWrapper}>
        <View style={styles.progressHeader}>
          <ThemedText variant="caption1" color="secondary">
            Step {stepIndex + 1} of {totalSteps}
          </ThemedText>
          <ThemedText variant="body2" color="primary">
            {step.title}
          </ThemedText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((stepIndex + 1) / totalSteps) * 100}%` }]} />
        </View>
        <ThemedText variant="caption1" color="secondary">
          {step.subtitle}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step.key === 'profile' && (
          <ThemedCard style={styles.card}>
            <TextField label="Full name" value={draft.fullName} onChangeText={(text) => setDraft((prev) => ({ ...prev, fullName: text }))} />
            <View style={styles.fieldSpacing} />
            <TextField label="Email" value={draft.email} editable={false} />
            <View style={styles.fieldSpacing} />
            <TextField label="Phone number" value={draft.phone} onChangeText={(text) => setDraft((prev) => ({ ...prev, phone: text }))} />
            <View style={styles.fieldSpacing} />
            <TextField
              label="Professional bio"
              value={draft.bio}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, bio: text }))}
              multiline
              placeholder="Share a short introduction for Tele Heal patients."
            />
          </ThemedCard>
        )}

        {step.key === 'credentials' && (
          <ThemedCard style={styles.card}>
            <TextField
              label="License number"
              value={draft.licenseNumber}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, licenseNumber: text }))}
            />
            <View style={styles.fieldSpacing} />
            <TextField
              label="License state / issuing body"
              value={draft.licenseState}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, licenseState: text }))}
            />
            <View style={styles.fieldSpacing} />
            <TextField
              label="Years of experience"
              value={draft.yearsOfExperience}
              keyboardType="numeric"
              onChangeText={(text) => setDraft((prev) => ({ ...prev, yearsOfExperience: text }))}
            />
            <View style={styles.fieldSpacing} />
            <ThemedText variant="body2" color="primary">
              License uploads
            </ThemedText>
            <ThemedText variant="caption1" color="secondary">
              Add at least one photo or PDF of your active license. These are stored securely for credentialing review.
            </ThemedText>
            <View style={styles.attachmentActions}>
              <TouchableOpacity
                style={styles.attachmentActionButton}
                activeOpacity={0.85}
                onPress={() => handleAddAttachment('license', 'library')}
              >
                <Ionicons name="images-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Photo library
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachmentActionButton}
                activeOpacity={0.85}
                onPress={() => handleAddAttachment('license', 'camera')}
              >
                <Ionicons name="camera-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Use camera
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.attachmentList}>
              {draft.licenseDocuments.length === 0 ? (
                <ThemedText variant="caption1" color="secondary">
                  No documents attached yet.
                </ThemedText>
              ) : (
                draft.licenseDocuments.map((doc) => (
                  <View key={doc.id} style={styles.attachmentRow}>
                    <View style={styles.attachmentIcon}>
                      <Ionicons name="document-text-outline" size={16} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.attachmentMeta}>
                      <ThemedText variant="body3" color="primary" numberOfLines={1}>
                        {doc.displayName}
                      </ThemedText>
                      <ThemedText variant="caption2" color="secondary">
                        {doc.source === 'camera' ? 'Captured' : 'Imported'} · {doc.addedAt}
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      style={styles.attachmentRemoveButton}
                      onPress={() => handleRemoveAttachment('license', doc.id)}
                    >
                      <Ionicons name="trash-outline" size={14} color={theme.colors.semantic.danger} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
            <View style={styles.fieldSpacing} />
            <ThemedText variant="body2" color="primary">
              Malpractice coverage
            </ThemedText>
            <ThemedText variant="caption1" color="secondary">
              Upload your current policy or COI to speed up approval.
            </ThemedText>
            <View style={styles.attachmentActions}>
              <TouchableOpacity
                style={styles.attachmentActionButton}
                activeOpacity={0.85}
                onPress={() => handleAddAttachment('malpractice', 'library')}
              >
                <Ionicons name="images-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Photo library
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachmentActionButton}
                activeOpacity={0.85}
                onPress={() => handleAddAttachment('malpractice', 'camera')}
              >
                <Ionicons name="camera-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Use camera
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.attachmentList}>
              {draft.malpracticeDocuments.length === 0 ? (
                <ThemedText variant="caption1" color="secondary">
                  No documents attached yet.
                </ThemedText>
              ) : (
                draft.malpracticeDocuments.map((doc) => (
                  <View key={doc.id} style={styles.attachmentRow}>
                    <View style={styles.attachmentIcon}>
                      <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.attachmentMeta}>
                      <ThemedText variant="body3" color="primary" numberOfLines={1}>
                        {doc.displayName}
                      </ThemedText>
                      <ThemedText variant="caption2" color="secondary">
                        {doc.source === 'camera' ? 'Captured' : 'Imported'} · {doc.addedAt}
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      style={styles.attachmentRemoveButton}
                      onPress={() => handleRemoveAttachment('malpractice', doc.id)}
                    >
                      <Ionicons name="trash-outline" size={14} color={theme.colors.semantic.danger} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
            {draft.verificationNotes ? (
              <ThemedText variant="caption1" color="secondary">
                {draft.verificationNotes}
              </ThemedText>
            ) : null}
          </ThemedCard>
        )}

        {step.key === 'services' && (
          <ThemedCard style={styles.card}>
            <ThemedText variant="body2" color="primary">
              Select specialties
            </ThemedText>
            <View style={styles.chipGrid}>
              {SPECIALTY_OPTIONS.map((option) => {
                const active = draft.specialties.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleSpecialty(option)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'add-circle-outline'}
                      size={16}
                      color={active ? theme.colors.primary.main : theme.colors.text.secondary}
                    />
                    <ThemedText variant="caption1" color={active ? 'primary' : 'secondary'}>
                      {option}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.fieldSpacing} />
            <TextField
              label="Services offered"
              value={draft.servicesOffered}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, servicesOffered: text }))}
              multiline
              placeholder="Describe visit types, procedures, or care bundles."
            />
            <View style={styles.fieldSpacing} />
            <ThemedText variant="body2" color="primary">
              Consultation mode
            </ThemedText>
            <View style={styles.modeRow}>
              {(['virtual', 'inPerson', 'hybrid'] as ConsultationMode[]).map((mode) => {
                const active = draft.consultationMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.modeChip, active && styles.modeChipActive]}
                    onPress={() => setDraft((prev) => ({ ...prev, consultationMode: mode }))}
                    activeOpacity={0.85}
                  >
                    <ThemedText variant="caption1" color={active ? 'primary' : 'secondary'}>
                      {mode === 'virtual' ? 'Virtual only' : mode === 'inPerson' ? 'In-person' : 'Hybrid'}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ThemedCard>
        )}

        {step.key === 'availability' && (
          <ThemedCard style={styles.card}>
            <TextField
              label="Timezone"
              value={draft.timezone}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, timezone: text }))}
              placeholder="e.g. GMT, PST"
            />
            <View style={styles.fieldSpacing} />
            <TextField
              label="Availability overview"
              value={draft.availabilityNote}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, availabilityNote: text }))}
              multiline
              placeholder="Example: Mon–Thu 9am-2pm, Friday asynchronous follow-ups."
            />
            <View style={styles.fieldSpacing} />
            <ThemedText variant="body2" color="primary">
              Weekly schedule
            </ThemedText>
            <View style={styles.availabilityGrid}>
              {WEEK_DAYS.map((day) => (
                <View key={day} style={styles.availabilityRow}>
                  <ThemedText variant="caption1" color="secondary" style={styles.availabilityDay}>
                    {day}
                  </ThemedText>
                  <View style={styles.slotChips}>
                    {SLOT_OPTIONS.map((slot) => {
                      const active = draft.availabilitySlots[day]?.includes(slot);
                      return (
                        <TouchableOpacity
                          key={`${day}-${slot}`}
                          style={[styles.slotChip, active && styles.slotChipActive]}
                          onPress={() => toggleSlot(day, slot)}
                          activeOpacity={0.85}
                        >
                          <ThemedText variant="caption1" color={active ? 'primary' : 'secondary'}>
                            {slot}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.fieldSpacing} />
            <TextField
              label="Consultation fee (per visit)"
              value={draft.hourlyRate}
              keyboardType="numeric"
              onChangeText={(text) => setDraft((prev) => ({ ...prev, hourlyRate: text }))}
              placeholder="e.g. 75"
            />
            <View style={styles.fieldSpacing} />
            <ThemedText variant="body2" color="primary">
              Fee currency
            </ThemedText>
            <View style={styles.modeRow}>
              {CURRENCY_OPTIONS.map((currency) => {
                const active = draft.feeCurrency === currency;
                return (
                  <TouchableOpacity
                    key={currency}
                    style={[styles.modeChip, active && styles.modeChipActive]}
                    onPress={() => setDraft((prev) => ({ ...prev, feeCurrency: currency }))}
                    activeOpacity={0.85}
                  >
                    <ThemedText variant="caption1" color={active ? 'primary' : 'secondary'}>
                      {currency}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.fieldSpacing} />
            <View style={styles.trainingRow}>
              <TouchableOpacity
                style={[styles.trainingCheckbox, draft.trainingAcknowledged && styles.trainingCheckboxActive]}
                onPress={() => setDraft((prev) => ({ ...prev, trainingAcknowledged: !prev.trainingAcknowledged }))}
                activeOpacity={0.85}
              >
                {draft.trainingAcknowledged && <Ionicons name="checkmark" size={14} color={theme.colors.neutral.white} />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body3" color="primary">
                  I have completed the Tele Heal clinical onboarding module.
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  Required before your profile is activated.
                </ThemedText>
              </View>
            </View>
          </ThemedCard>
        )}

        {step.key === 'training' && (
          <ThemedCard style={styles.card}>
            <ThemedText variant="body2" color="primary">
              Tele Heal training modules
            </ThemedText>
            <ThemedText variant="caption1" color="secondary">
              Complete each topic below. Once all are marked done you can submit for credentialing.
            </ThemedText>
            <View style={styles.trainingList}>
              {TRAINING_MODULES.map((module) => {
                const completed = draft.trainingModules[module.id];
                return (
                  <TouchableOpacity
                    key={module.id}
                    style={[styles.trainingRow, completed && styles.trainingRowDone]}
                    onPress={() => toggleTrainingModule(module.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.trainingCheckbox, completed && styles.trainingCheckboxActive]}>
                      {completed && <Ionicons name="checkmark" size={14} color={theme.colors.neutral.white} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="body3" color="primary">
                        {module.title}
                      </ThemedText>
                      <ThemedText variant="caption1" color="secondary">
                        {module.duration}
                      </ThemedText>
                    </View>
                    <Ionicons
                      name={completed ? 'checkmark-circle' : 'play-circle-outline'}
                      size={18}
                      color={completed ? theme.colors.semantic.success : theme.colors.primary.main}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <Button
              label={draft.trainingAcknowledged ? 'All modules complete' : 'Mark complete'}
              variant={draft.trainingAcknowledged ? 'secondary' : 'primary'}
              size="sm"
              disabled={draft.trainingAcknowledged}
            />
          </ThemedCard>
        )}

        {step.key === 'review' && (
          <ThemedCard style={styles.card}>
            <ThemedText variant="body2" color="primary">
              Summary
            </ThemedText>
            <View style={styles.summaryList}>
              {[
                { label: 'Full name', value: draft.fullName },
                { label: 'Email', value: draft.email },
                { label: 'Phone', value: draft.phone },
                { label: 'License', value: `${draft.licenseNumber} (${draft.licenseState})` },
                { label: 'Experience', value: `${draft.yearsOfExperience || '—'} years` },
                { label: 'Specialties', value: draft.specialties.join(', ') || '—' },
                { label: 'Consultation mode', value: draft.consultationMode },
                { label: 'Availability', value: draft.availabilityNote || '—' },
                {
                  label: 'Weekly schedule',
                  value: WEEK_DAYS.map((day) => {
                    const slots = draft.availabilitySlots[day];
                    return `${day}: ${slots?.length ? slots.join('/') : '—'}`;
                  }).join('  •  '),
                },
                {
                  label: 'Fee per visit',
                  value: draft.hourlyRate ? `${draft.feeCurrency} ${draft.hourlyRate}` : '—',
                },
                {
                  label: 'Training',
                  value: draft.trainingAcknowledged
                    ? `Completed ${draft.trainingCompletedAt ? new Date(draft.trainingCompletedAt).toLocaleDateString() : ''}`
                    : 'Pending completion',
                },
                {
                  label: 'License files',
                  value: draft.licenseDocuments.length ? `${draft.licenseDocuments.length} uploaded` : 'None',
                },
                {
                  label: 'Malpractice docs',
                  value: draft.malpracticeDocuments.length ? `${draft.malpracticeDocuments.length} uploaded` : 'None',
                },
              ].map((item) => (
                <View key={item.label} style={styles.summaryRow}>
                  <ThemedText variant="caption1" color="secondary">
                    {item.label}
                  </ThemedText>
                  <ThemedText variant="body3" color="primary">
                    {item.value}
                  </ThemedText>
                </View>
              ))}
            </View>
            <ThemedText variant="caption1" color="secondary">
              Submitting sends your information to Tele Heal credentialing for review. You can edit details again once approved.
            </ThemedText>
            {hasSubmitted && (
              <View style={styles.statusBanner}>
                <Ionicons name="time-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Submission sent. Waiting for server confirmation (mocked).
                </ThemedText>
              </View>
            )}
          </ThemedCard>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Back" variant="secondary" onPress={handlePrev} disabled={stepIndex === 0} />
        <View style={{ width: theme.spacing.md }} />
        <Button label={isLastStep ? 'Submit for review' : 'Continue'} variant="primary" onPress={handleNext} />
      </View>
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
  progressWrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border.light,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  fieldSpacing: {
    height: theme.spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  chipActive: {
    backgroundColor: theme.colors.primary.light,
    borderColor: theme.colors.primary.main,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  modeChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  modeChipActive: {
    backgroundColor: theme.colors.primary.light,
    borderColor: theme.colors.primary.main,
  },
  summaryList: {
    gap: theme.spacing.sm,
  },
  summaryRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: theme.spacing.xs,
  },
  availabilityGrid: {
    gap: theme.spacing.sm,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  availabilityDay: {
    width: 32,
  },
  slotChips: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flex: 1,
    flexWrap: 'wrap',
  },
  slotChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  slotChipActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  attachmentActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  attachmentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm / 1.2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.sm,
  },
  attachmentList: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  attachmentIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentMeta: {
    flex: 1,
  },
  attachmentRemoveButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.muted,
  },
  trainingList: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  trainingRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm / 1.2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  trainingRowDone: {
    backgroundColor: theme.colors.background.muted,
    borderRadius: theme.borderRadius.md,
  },
  trainingCheckbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.card,
  },
  trainingCheckboxActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  statusBanner: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.light,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
});

export default ProviderOnboardingScreen;
