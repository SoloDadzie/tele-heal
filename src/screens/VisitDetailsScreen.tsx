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
  attachments: string[];
};

export type VisitDetailsScreenProps = {
  onBack: () => void;
  onContinue: (details: VisitDetails) => void;
};

const VisitDetailsScreen: React.FC<VisitDetailsScreenProps> = ({ onBack, onContinue }) => {
  const [appointmentType, setAppointmentType] = React.useState<AppointmentType>('scheduled');
  const [reason, setReason] = React.useState('');
  const [attachments, setAttachments] = React.useState<string[]>([]);

  const canContinue = reason.trim().length > 0;

  const getImageMediaType = () =>
    (ImagePicker as any).MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;

  const handleAddAttachment = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: getImageMediaType(),
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return;
    const uris = (result.assets ?? []).map((a) => a.uri).filter(Boolean);
    if (!uris.length) return;

    setAttachments((prev) => [...prev, ...uris]);
  };

  const handleRemoveAttachment = (uri: string) => {
    setAttachments((prev) => prev.filter((x) => x !== uri));
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue({
      appointmentType,
      reason: reason.trim(),
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
          </ThemedCard>

          <ThemedCard style={styles.infoCard}>
            <View style={styles.attachHeaderRow}>
              <SectionHeader
                title="Attachments (optional)"
                subtitle="Add supporting photos like labs, prescriptions, or symptom shots."
                icon="images-outline"
                style={styles.attachSectionHeader}
              />
              <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={handleAddAttachment}>
                <Ionicons name="add" size={18} color={theme.colors.neutral.white} />
              </TouchableOpacity>
            </View>

            {attachments.length === 0 ? (
              <TouchableOpacity style={styles.uploadCard} activeOpacity={0.9} onPress={handleAddAttachment}>
                <View style={styles.uploadLeft}>
                  <View style={styles.uploadIcon}>
                    <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.primary.main} />
                  </View>
                  <View style={styles.uploadTextBlock}>
                    <ThemedText variant="body2" color="primary">
                      Add images
                    </ThemedText>
                    <ThemedText variant="body3" color="secondary">
                      JPG/PNG from your photo library
                    </ThemedText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.attachmentGrid}>
                {attachments.map((uri) => (
                  <View key={uri} style={styles.attachmentTile}>
                    <Image source={{ uri }} style={styles.attachmentImage} />
                    <TouchableOpacity
                      style={styles.removeAttachmentButton}
                      activeOpacity={0.85}
                      onPress={() => handleRemoveAttachment(uri)}
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
