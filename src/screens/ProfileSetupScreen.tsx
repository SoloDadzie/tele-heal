import React from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ThemedText from '../components/ThemedText';
import TextField from '../components/TextField';
import PhoneNumberField, { PhoneCountryOption, PHONE_COUNTRY_OPTIONS } from '../components/PhoneNumberField';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import SectionHeader from '../components/SectionHeader';
import { theme } from '../theme';

export type PatientProfile = {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  address: string;

  medicalHistory: string;
  allergies: string;
  medications: string;

  insuranceProvider: string;
  insuranceMemberId: string;
  insuranceFrontUri: string | null;
  insuranceBackUri: string | null;

  consentTelemedicine: boolean;
  consentPrivacy: boolean;
  completedAt: string;
};

export type ProfileSetupScreenProps = {
  initialEmail?: string;
  initialPhone?: string;
  initialCountryCode?: string;
  onDone: (profile: PatientProfile) => void;
  onBack: () => void;
};

type StepKey = 'demographics' | 'history' | 'insurance' | 'consent';

const STEPS: { key: StepKey; title: string; subtitle: string }[] = [
  {
    key: 'demographics',
    title: 'Your details',
    subtitle: 'Tell us a bit about you so we can personalize your care.',
  },
  {
    key: 'history',
    title: 'Medical background',
    subtitle: 'Share important health information for safer consultations.',
  },
  {
    key: 'insurance',
    title: 'Insurance (optional)',
    subtitle: 'Add insurance details to speed up check-ins and billing.',
  },
  {
    key: 'consent',
    title: 'Consent',
    subtitle: 'Please review and accept required policies to continue.',
  },
];

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  initialEmail,
  initialPhone,
  initialCountryCode,
  onDone,
  onBack,
}) => {
  const [stepIndex, setStepIndex] = React.useState(0);
  const progressScrollRef = React.useRef<ScrollView | null>(null);
  const chipLayouts = React.useRef<Record<StepKey, { x: number; width: number }>>({
    demographics: { x: 0, width: 0 },
    history: { x: 0, width: 0 },
    insurance: { x: 0, width: 0 },
    consent: { x: 0, width: 0 },
  });

  const [values, setValues] = React.useState<Omit<PatientProfile, 'completedAt'>>({
    fullName: '',
    phone: initialPhone ?? '',
    email: initialEmail ?? '',
    gender: '',
    dateOfBirth: '',
    address: '',

    medicalHistory: '',
    allergies: '',
    medications: '',

    insuranceProvider: '',
    insuranceMemberId: '',
    insuranceFrontUri: null,
    insuranceBackUri: null,

    consentTelemedicine: false,
    consentPrivacy: false,
  });
  const [phoneCountry, setPhoneCountry] = React.useState<PhoneCountryOption | undefined>(() => {
    if (!initialCountryCode) return undefined;
    return PHONE_COUNTRY_OPTIONS.find((option) => option.code === initialCountryCode) ?? undefined;
  });

  React.useEffect(() => {
    if (!initialPhone) return;
    setValues((prev) => {
      if (prev.phone?.trim().length) return prev;
      return { ...prev, phone: initialPhone };
    });
  }, [initialPhone]);

  React.useEffect(() => {
    if (!initialCountryCode) return;
    setPhoneCountry((prev) => {
      if (prev) return prev;
      return PHONE_COUNTRY_OPTIONS.find((option) => option.code === initialCountryCode) ?? prev;
    });
  }, [initialCountryCode]);

  const step = STEPS[stepIndex];

  const progressLabel = `${stepIndex + 1} of ${STEPS.length}`;
  const genderOptions = React.useMemo(() => ['Male', 'Female', 'Other'], []);
  const [isGenderModalVisible, setIsGenderModalVisible] = React.useState(false);
  const [isDobModalVisible, setIsDobModalVisible] = React.useState(false);

  const canContinue = React.useMemo(() => {
    if (step.key === 'demographics') {
      return Boolean(values.fullName.trim() && values.phone.trim() && values.email.trim());
    }
    if (step.key === 'history') {
      return true;
    }
    if (step.key === 'insurance') {
      return true;
    }
    if (step.key === 'consent') {
      return values.consentTelemedicine && values.consentPrivacy;
    }
    return false;
  }, [step.key, values]);

  const IMAGE_MEDIA_TYPES: ImagePicker.MediaType[] = ['images'];

  const handleInsuranceImageSelection = async (side: 'front' | 'back', source: 'library' | 'camera') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      return;
    }

    const picker =
      source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;

    const result = await picker({
      mediaTypes: IMAGE_MEDIA_TYPES,
      allowsEditing: true,
      aspect: [5, 3],
      quality: 0.9,
    });

    if (result.canceled) return;
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    setValues((prev) =>
      side === 'front' ? { ...prev, insuranceFrontUri: uri } : { ...prev, insuranceBackUri: uri },
    );
  };

  React.useEffect(() => {
    const currentLayout = chipLayouts.current[step.key];
    if (progressScrollRef.current && currentLayout) {
      const targetX = Math.max(currentLayout.x - theme.spacing.lg, 0);
      progressScrollRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [step.key]);

  const handleNext = () => {
    if (!canContinue) return;

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    onDone({
      ...values,
      completedAt: new Date().toISOString(),
    });
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      onBack();
      return;
    }
    setStepIndex((prev) => prev - 1);
  };

  const parseDateFromString = (value: string): Date => {
    const parts = value.split(/[/-]/);
    if (parts.length >= 3) {
      const year = Number(parts[0]) || 1990;
      const month = (Number(parts[1]) || 1) - 1;
      const day = Number(parts[2]) || 1;
      return new Date(year, month, day);
    }
    return new Date(1990, 0, 1);
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const handleSelectGender = (option: string) => {
    setValues((prev) => ({ ...prev, gender: option }));
    setIsGenderModalVisible(false);
  };

  const openAndroidDatePicker = (currentValue: string) => {
    const { DateTimePickerAndroid } =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@react-native-community/datetimepicker');
    DateTimePickerAndroid.open({
      value: currentValue ? parseDateFromString(currentValue) : new Date(1990, 0, 1),
      mode: 'date',
      is24Hour: true,
      maximumDate: new Date(),
      onChange: (event: any, date?: Date) => {
        if (event.type === 'dismissed') return;
        if (date) {
          setValues((prev) => ({ ...prev, dateOfBirth: formatDate(date) }));
        }
      },
    });
  };

  const handleOpenDobPicker = (currentValue: string) => {
    if (Platform.OS === 'android') {
      openAndroidDatePicker(currentValue);
    } else {
      setIsDobModalVisible(true);
    }
  };

  const renderToggleRow = (label: string, description: string, value: boolean, onPress: () => void) => {
    return (
      <TouchableOpacity style={styles.toggleRow} activeOpacity={0.85} onPress={onPress}>
        <View style={styles.toggleTextBlock}>
          <ThemedText variant="body2" color="primary" style={styles.toggleTitle}>
            {label}
          </ThemedText>
          <ThemedText variant="body3" color="secondary">
            {description}
          </ThemedText>
        </View>
        <View style={[styles.toggleBox, value && styles.toggleBoxActive]}>
          {value && <Ionicons name="checkmark" size={16} color={theme.colors.neutral.white} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText variant="headline3" color="primary" style={styles.headerTitle}>
              Profile Setup
            </ThemedText>
            <View style={styles.headerSubRow}>
              <Ionicons name="sparkles-outline" size={14} color={theme.colors.primary.main} />
              <ThemedText variant="caption1" color="secondary">
                {progressLabel} · {step.title}
              </ThemedText>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.progressChipsRow}
            style={styles.progressChipsScroll}
            ref={progressScrollRef}
          >
            {STEPS.map((item, index) => {
              const isActive = step.key === item.key;
              const isCompleted = index < stepIndex;
              return (
                <View
                  key={item.key}
                  style={[
                    styles.progressChip,
                    (isActive || isCompleted) && styles.progressChipActive,
                    isCompleted && styles.progressChipDone,
                  ]}
                  onLayout={(event) => {
                    chipLayouts.current[item.key] = {
                      x: event.nativeEvent.layout.x,
                      width: event.nativeEvent.layout.width,
                    };
                  }}
                >
                  <View
                    style={[
                      styles.progressChipIcon,
                      (isActive || isCompleted) && styles.progressChipIconActive,
                    ]}
                  >
                    <ThemedText variant="body3" color={isActive || isCompleted ? 'inverse' : 'secondary'}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  <View style={styles.progressChipTextBlock}>
                    <ThemedText variant="caption1" color={isActive ? 'primary' : 'secondary'}>
                      {item.title}
                    </ThemedText>
                    <ThemedText variant="caption2" color="secondary" numberOfLines={1}>
                      {isActive ? 'In progress' : isCompleted ? 'Completed' : 'Pending'}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <ThemedCard style={styles.stepCard}>
            <SectionHeader title={step.title} subtitle={step.subtitle} icon="layers-outline" />

            {step.key === 'demographics' && (
              <View style={styles.formBlock}>
                <TextField
                  label="Full name"
                  value={values.fullName}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, fullName: text }))}
                />
                <View style={styles.fieldSpacing} />
                <PhoneNumberField
                  label="Phone number"
                  value={values.phone}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, phone: text }))}
                  countryCode={phoneCountry?.code}
                  onCountryChange={(country) => setPhoneCountry(country)}
                />
                <View style={styles.fieldSpacing} />
                <TextField
                  label="Email"
                  value={values.email}
                  keyboardType="email-address"
                  onChangeText={(text) => setValues((prev) => ({ ...prev, email: text }))}
                />
                <View style={styles.fieldSpacing} />
                <TextField
                  label="Gender (optional)"
                  value={values.gender}
                  editable={false}
                  onPress={() => setIsGenderModalVisible(true)}
                  rightIcon={
                    <Ionicons
                      name="chevron-down-outline"
                      size={18}
                      color={theme.colors.text.secondary}
                    />
                  }
                />
                <View style={styles.fieldSpacing} />
                <TextField
                  label="Date of birth (optional)"
                  value={values.dateOfBirth}
                  editable={false}
                  onPress={() => handleOpenDobPicker(values.dateOfBirth)}
                  rightIcon={
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={theme.colors.text.secondary}
                    />
                  }
                />
                <View style={styles.fieldSpacing} />
                <View style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <ThemedText variant="caption1" color="secondary">
                      Address (optional)
                    </ThemedText>
                    <TouchableOpacity activeOpacity={0.8}>
                      <ThemedText variant="caption1" color="primary">
                        Use current location
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextField
                    label="Street, city, state"
                    value={values.address}
                    onChangeText={(text) => setValues((prev) => ({ ...prev, address: text }))}
                    multiline
                    placeholder="123 Main St, Springfield, IL 62704"
                  />
                  <ThemedText variant="caption1" color="secondary" style={styles.addressHint}>
                    Include apartment, city, state, and postal code for faster deliveries.
                  </ThemedText>
                </View>
              </View>
            )}

            {step.key === 'history' && (
              <View style={styles.formBlock}>
                <TextField
                  label="Medical history (optional)"
                  value={values.medicalHistory}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, medicalHistory: text }))}
                  multiline
                />
                <View style={styles.fieldSpacing} />
                <TextField
                  label="Allergies (optional)"
                  value={values.allergies}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, allergies: text }))}
                  multiline
                />
                <View style={styles.fieldSpacing} />
                <TextField
                  label="Current medications (optional)"
                  value={values.medications}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, medications: text }))}
                  multiline
                />
              </View>
            )}

            {step.key === 'insurance' && (
              <View style={styles.formBlock}>
                <TextField
                  label="Insurance provider (optional)"
                  value={values.insuranceProvider}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, insuranceProvider: text }))}
                />
                <View style={styles.fieldSpacing} />
                <TextField
                  label="Member ID (optional)"
                  value={values.insuranceMemberId}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, insuranceMemberId: text }))}
                />

                <View style={styles.fieldSpacing} />

                <View style={styles.uploadCard}>
                  <View style={styles.uploadHeader}>
                    <View style={styles.uploadIcon}>
                      <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.uploadTextBlock}>
                      <ThemedText variant="body2" color="primary">
                        Upload insurance card (front)
                      </ThemedText>
                      <ThemedText variant="body3" color="secondary">
                        Snap a photo or import from your phone
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.uploadActionsRow}>
                    <TouchableOpacity
                      style={styles.uploadActionButton}
                      activeOpacity={0.85}
                      onPress={() => handleInsuranceImageSelection('front', 'library')}
                    >
                      <Ionicons name="images-outline" size={18} color={theme.colors.primary.main} />
                      <ThemedText variant="caption1" color="primary" style={styles.uploadActionText}>
                        Photo Library
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.uploadActionButton}
                      activeOpacity={0.85}
                      onPress={() => handleInsuranceImageSelection('front', 'camera')}
                    >
                      <Ionicons name="camera-outline" size={18} color={theme.colors.primary.main} />
                      <ThemedText variant="caption1" color="primary" style={styles.uploadActionText}>
                        Use Camera
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                {values.insuranceFrontUri && (
                  <View style={styles.previewWrapper}>
                    <Image source={{ uri: values.insuranceFrontUri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removePreviewButton}
                      activeOpacity={0.85}
                      onPress={() => setValues((prev) => ({ ...prev, insuranceFrontUri: null }))}
                    >
                      <Ionicons name="close" size={16} color={theme.colors.neutral.white} />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.fieldSpacing} />

                <View style={styles.uploadCard}>
                  <View style={styles.uploadHeader}>
                    <View style={styles.uploadIcon}>
                      <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.uploadTextBlock}>
                      <ThemedText variant="body2" color="primary">
                        Upload insurance card (back)
                      </ThemedText>
                      <ThemedText variant="body3" color="secondary">
                        Snap a photo or import from your phone
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.uploadActionsRow}>
                    <TouchableOpacity
                      style={styles.uploadActionButton}
                      activeOpacity={0.85}
                      onPress={() => handleInsuranceImageSelection('back', 'library')}
                    >
                      <Ionicons name="images-outline" size={18} color={theme.colors.primary.main} />
                      <ThemedText variant="caption1" color="primary" style={styles.uploadActionText}>
                        Photo Library
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.uploadActionButton}
                      activeOpacity={0.85}
                      onPress={() => handleInsuranceImageSelection('back', 'camera')}
                    >
                      <Ionicons name="camera-outline" size={18} color={theme.colors.primary.main} />
                      <ThemedText variant="caption1" color="primary" style={styles.uploadActionText}>
                        Use Camera
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                {values.insuranceBackUri && (
                  <View style={styles.previewWrapper}>
                    <Image source={{ uri: values.insuranceBackUri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removePreviewButton}
                      activeOpacity={0.85}
                      onPress={() => setValues((prev) => ({ ...prev, insuranceBackUri: null }))}
                    >
                      <Ionicons name="close" size={16} color={theme.colors.neutral.white} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {step.key === 'consent' && (
              <View style={styles.formBlock}>
                {renderToggleRow(
                  'Telemedicine consent',
                  'I consent to receive care via telemedicine services.',
                  values.consentTelemedicine,
                  () => setValues((prev) => ({ ...prev, consentTelemedicine: !prev.consentTelemedicine })),
                )}
                {renderToggleRow(
                  'Privacy policy',
                  'I agree to the privacy policy and data handling.',
                  values.consentPrivacy,
                  () => setValues((prev) => ({ ...prev, consentPrivacy: !prev.consentPrivacy })),
                )}
              </View>
            )}
          </ThemedCard>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={stepIndex === STEPS.length - 1 ? 'Finish setup' : 'Continue'}
            variant="primary"
            fullWidth
            onPress={handleNext}
            disabled={!canContinue}
          />
        </View>
      </View>

      <Modal
        transparent
        visible={isGenderModalVisible}
        animationType="fade"
        onRequestClose={() => setIsGenderModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlayCenter}
          onPress={() => setIsGenderModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalCardCenter}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  activeOpacity={0.8}
                  onPress={() => handleSelectGender(option)}
                >
                  <ThemedText variant="body2" color="primary">
                    {option}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent
        visible={Platform.OS === 'ios' && isDobModalVisible}
        animationType="fade"
        onRequestClose={() => setIsDobModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <TouchableWithoutFeedback onPress={() => setIsDobModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.pickerCard}>
            <DateTimePicker
              value={values.dateOfBirth ? parseDateFromString(values.dateOfBirth) : new Date(1990, 0, 1)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, date) => {
                if (event.type === 'dismissed') {
                  setIsDobModalVisible(false);
                } else if (date) {
                  setValues((prev) => ({ ...prev, dateOfBirth: formatDate(date) }));
                  setIsDobModalVisible(false);
                }
              }}
            />
          </View>
        </View>
      </Modal>
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
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  progressChipsScroll: {
    marginBottom: theme.spacing.lg,
  },
  progressChipsRow: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.lg,
  },
  progressChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minWidth: 160,
  },
  progressChipActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  progressChipDone: {
    borderColor: theme.colors.semantic.success,
  },
  progressChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  progressChipIconActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  progressChipTextBlock: {
    flex: 1,
  },
  stepCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  stepTitle: {
    marginBottom: theme.spacing.xs,
  },
  stepSubtitle: {
    marginBottom: theme.spacing.lg,
  },
  formBlock: {
    marginTop: theme.spacing.sm,
  },
  fieldSpacing: {
    height: theme.spacing.md,
  },
  uploadCard: {
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.muted,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  uploadActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -theme.spacing.xs,
  },
  uploadActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  uploadActionText: {
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
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
  previewWrapper: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
  },
  removePreviewButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.muted,
    marginBottom: theme.spacing.md,
  },
  toggleTextBlock: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  toggleTitle: {
    marginBottom: theme.spacing.xs / 2,
  },
  toggleBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.main,
  },
  addressCard: {
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  addressHalf: {
    flex: 1,
  },
  addressHint: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.xxxl,
    borderTopRightRadius: theme.borderRadius.xxxl,
  },
  modalCardCenter: {
    width: '100%',
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  pickerWrapper: {
    backgroundColor: 'transparent',
  },
  pickerCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    marginBottom: theme.spacing.md,
  },
  modalOption: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  modalActionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionSecondary: {
    backgroundColor: theme.colors.background.muted,
  },
  modalActionPrimary: {
    backgroundColor: theme.colors.primary.main,
  },
});

export default ProfileSetupScreen;
