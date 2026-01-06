import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ThemedText from '../components/ThemedText';
import TextField from '../components/TextField';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import SectionHeader from '../components/SectionHeader';
import { theme } from '../theme';

export type AppointmentType = 'urgent' | 'scheduled';

export type VisitDetails = {
  appointmentType: AppointmentType;
  reason: string;
  attachments: Attachment[];
};

type Attachment = {
  id: string;
  uri: string;
  name: string;
  source: 'camera' | 'library';
};

export type VisitDetailsScreenProps = {
  onBack: () => void;
  onContinue: (details: VisitDetails) => void;
};

const MIN_REASON_CHARACTERS = 30;

const VisitDetailsScreen: React.FC<VisitDetailsScreenProps> = ({ onBack, onContinue }) => {
  const [appointmentType, setAppointmentType] = React.useState<AppointmentType>('scheduled');
  const [reason, setReason] = React.useState('');
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null);
  const [isAttaching, setIsAttaching] = React.useState(false);

  const trimmedReason = reason.trim();
  const reasonCharsRemaining = Math.max(0, MIN_REASON_CHARACTERS - trimmedReason.length);
  const reasonHelperCopy =
    trimmedReason.length < MIN_REASON_CHARACTERS
      ? `${reasonCharsRemaining} more character${reasonCharsRemaining === 1 ? '' : 's'} to help your provider prepare.`
      : 'Looks great—thanks for the detail.';
  const canContinue = trimmedReason.length >= MIN_REASON_CHARACTERS;

  const IMAGE_MEDIA_TYPES: ImagePicker.MediaType[] = ['images'];

  const handleAddAttachment = async (source: 'library' | 'camera') => {
    setAttachmentError(null);
    setIsAttaching(true);

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      setIsAttaching(false);
      setAttachmentError('Please allow Tele Heal to access your camera or photos to attach files.');
      return;
    }

    const picker =
      source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;

    const result = await picker({
      mediaTypes: IMAGE_MEDIA_TYPES,
      allowsMultipleSelection: source === 'library',
      quality: 0.85,
    });

    if (result.canceled) {
      setIsAttaching(false);
      return;
    }

    const assets = (result.assets ?? []).filter(Boolean);
    if (!assets.length) {
      setAttachmentError('No files were selected. Please try again.');
      setIsAttaching(false);
      return;
    }

    setAttachments((prev) => [
      ...prev,
      ...assets.map((asset, index) => ({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        name: asset.fileName ?? `Attachment ${prev.length + index + 1}`,
        source,
      })),
    ]);
    setIsAttaching(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue({
      appointmentType,
      reason: trimmedReason,
      attachments,
    });
  };

  const quickSteps = React.useMemo(
    () => [
      {
        id: 'step-type',
        icon: 'flash-outline',
        title: 'Choose urgency',
        description: 'Urgent or scheduled',
      },
      {
        id: 'step-reason',
        icon: 'document-text-outline',
        title: 'Describe symptoms',
        description: 'Give a short summary',
      },
      {
        id: 'step-files',
        icon: 'images-outline',
        title: 'Upload photos',
        description: 'Labs, meds, or notes',
      },
    ],
    [],
  );

  const renderTypeChip = (key: AppointmentType, title: string, subtitle: string, icon: string) => {
    const active = appointmentType === key;
    return (
      <TouchableOpacity
        style={[styles.typeChip, active && styles.typeChipActive]}
        activeOpacity={0.85}
        onPress={() => setAppointmentType(key)}
      >
        <View style={[styles.typeIcon, active && styles.typeIconActive]}>
          <Ionicons
            name={icon as any}
            size={18}
            color={active ? theme.colors.neutral.white : theme.colors.primary.main}
          />
        </View>
        <View style={styles.typeTextBlock}>
          <ThemedText variant="body2" color={active ? 'inverse' : 'primary'}>
            {title}
          </ThemedText>
          <ThemedText variant="caption1" color={active ? 'inverse' : 'secondary'}>
            {subtitle}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary" style={styles.headerTitle}>
            Visit details
          </ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader
            title="Visit setup"
            subtitle="We’ll share this info with your provider before the session."
            icon="clipboard-outline"
            style={styles.sectionHeader}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickStepsRow}
            style={styles.quickStepsScroll}
          >
            {quickSteps.map((step) => (
              <View key={step.id} style={styles.quickStepCard}>
                <View style={styles.quickStepIcon}>
                  <Ionicons name={step.icon as any} size={16} color={theme.colors.primary.main} />
                </View>
                <ThemedText variant="body3" color="primary" style={styles.quickStepTitle}>
                  {step.title}
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  {step.description}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

          <ThemedCard style={styles.infoCard}>
            <SectionHeader
              title="Appointment type"
              subtitle="Pick the pace that fits your needs."
              icon="flash-outline"
            />
            <View style={styles.typeRow}>
              {renderTypeChip('urgent', 'Urgent care', 'Talk to a provider ASAP', 'flash-outline')}
              {renderTypeChip('scheduled', 'Scheduled', 'Book at a convenient time', 'calendar-outline')}
            </View>
          </ThemedCard>

          <ThemedCard style={styles.infoCard}>
            <SectionHeader
              title="Symptoms / reason for visit"
              subtitle="Give your care team a quick overview so they can prepare."
              icon="document-text-outline"
            />
            <TextField
              label="Describe your symptoms"
              value={reason}
              onChangeText={setReason}
              multiline
            />
            <ThemedText
              variant="caption1"
              color={trimmedReason.length < MIN_REASON_CHARACTERS ? 'secondary' : 'primary'}
              style={styles.reasonHelper}
            >
              {reasonHelperCopy}
            </ThemedText>
          </ThemedCard>

          {appointmentType === 'urgent' && (
            <ThemedCard style={styles.urgentCard}>
              <View style={styles.urgentCardHeader}>
                <Ionicons name="warning-outline" size={16} color={theme.colors.semantic.warning} />
                <ThemedText variant="body2" color="primary">
                  Urgent visits book into the next available slot.
                </ThemedText>
              </View>
              <ThemedText variant="caption1" color="secondary">
                Be ready to join within 15 minutes once your doctor confirms. Scheduled visits let you pick a specific
                time.
              </ThemedText>
            </ThemedCard>
          )}

          <ThemedCard style={styles.infoCard}>
            <View style={styles.attachHeaderRow}>
              <SectionHeader
                title="Attachments (optional)"
                subtitle="Add supporting photos like labs, prescriptions, or symptom shots."
                icon="images-outline"
                style={styles.attachSectionHeader}
              />
              <TouchableOpacity
                style={[styles.addButton, isAttaching && styles.addButtonDisabled]}
                activeOpacity={0.85}
                onPress={() => handleAddAttachment('library')}
                disabled={isAttaching}
              >
                <Ionicons name={isAttaching ? 'hourglass-outline' : 'add'} size={18} color={theme.colors.neutral.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.attachmentActionsRow}>
              <TouchableOpacity
                style={styles.secondaryAttachButton}
                activeOpacity={0.85}
                onPress={() => handleAddAttachment('library')}
                disabled={isAttaching}
              >
                <Ionicons name="images-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Photo library
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryAttachButton}
                activeOpacity={0.85}
                onPress={() => handleAddAttachment('camera')}
                disabled={isAttaching}
              >
                <Ionicons name="camera-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Use camera
                </ThemedText>
              </TouchableOpacity>
            </View>

            {!!attachmentError && (
              <ThemedText variant="caption1" color="secondary" style={styles.attachmentError}>
                {attachmentError}
              </ThemedText>
            )}

            {attachments.length === 0 ? (
              <View style={styles.uploadCard}>
                <View style={styles.uploadLeft}>
                  <View style={styles.uploadIcon}>
                    <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.primary.main} />
                  </View>
                  <View style={styles.uploadTextBlock}>
                    <ThemedText variant="body2" color="primary">
                      Add images
                    </ThemedText>
                    <ThemedText variant="body3" color="secondary">
                      JPG/PNG from your photo library or camera
                    </ThemedText>
                  </View>
                </View>
                <ThemedText variant="caption1" color="secondary">
                  Optional
                </ThemedText>
              </View>
            ) : (
              <View style={styles.attachmentGrid}>
                {attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentTile}>
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                    <View style={styles.attachmentBadge}>
                      <ThemedText variant="caption2" color="inverse">
                        {attachment.source === 'camera' ? 'Camera' : 'Library'}
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      style={styles.removeAttachmentButton}
                      activeOpacity={0.85}
                      onPress={() => handleRemoveAttachment(attachment.id)}
                    >
                      <Ionicons name="close" size={14} color={theme.colors.neutral.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ThemedCard>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Continue to time selection"
            variant="primary"
            fullWidth
            onPress={handleContinue}
            disabled={!canContinue}
          />
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
    paddingBottom: theme.spacing.xl * 2,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  quickStepsScroll: {
    marginBottom: theme.spacing.lg,
  },
  quickStepsRow: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.lg,
  },
  quickStepCard: {
    width: 180,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  quickStepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickStepTitle: {
    marginBottom: theme.spacing.xs / 2,
  },
  card: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardTitle: {
    marginBottom: theme.spacing.sm,
  },
  cardSubtitle: {
    marginBottom: theme.spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.muted,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  typeIconActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  typeTextBlock: {
    flex: 1,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  reasonHelper: {
    marginTop: theme.spacing.sm,
  },
  urgentCard: {
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.semantic.warning,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  urgentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  attachHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  attachSectionHeader: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  attachmentActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  secondaryAttachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm / 1.2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  attachmentError: {
    marginBottom: theme.spacing.sm,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.muted,
    padding: theme.spacing.lg,
  },
  uploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  uploadTextBlock: {
    flex: 1,
  },
  attachmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  attachmentTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.background.muted,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  attachmentBadge: {
    position: 'absolute',
    left: 6,
    top: 6,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.lg,
  },
});

export default VisitDetailsScreen;
