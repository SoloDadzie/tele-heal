import React from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ThemedText from '../components/ThemedText';
import TabBar from '../components/TabBar';
import TextField from '../components/TextField';
import PhoneNumberField, { PhoneCountryOption } from '../components/PhoneNumberField';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import SectionHeader from '../components/SectionHeader';
import { theme } from '../theme';
import type { PatientProfile } from './ProfileSetupScreen';

export type ProfileScreenProps = {
  onGoHome: () => void;
  onOpenSchedule: () => void;
  onOpenChat: () => void;
  profile?: PatientProfile | null;
};

export type UserProfile = {
  fullName: string;
  phone: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  email: string;
};

const initialProfile: UserProfile = {
  fullName: 'Jessica Jung',
  phone: '0123 4567 889',
  address: '87 Crown Street London City',
  gender: 'Female',
  dateOfBirth: '1999/09/21',
  email: 'jessicajung@gmail.com',
};

type ProfileMode = 'overview' | 'edit';

type QuickStat = {
  id: string;
  label: string;
  value: string;
  meta: string;
};

type QuickAction = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type InfoItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  placeholder: string;
  trailing?: string;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onGoHome,
  onOpenSchedule,
  onOpenChat,
  profile: patientProfile,
}) => {
  const [activeTab, setActiveTab] = React.useState('profile');
  const [mode, setMode] = React.useState<ProfileMode>('overview');
  const mapPatientToUserProfile = React.useCallback((p: PatientProfile | null | undefined): UserProfile => {
    if (!p) return initialProfile;
    return {
      fullName: p.fullName || initialProfile.fullName,
      phone: p.phone || initialProfile.phone,
      address: p.address || initialProfile.address,
      gender: p.gender || initialProfile.gender,
      dateOfBirth: p.dateOfBirth || initialProfile.dateOfBirth,
      email: p.email || initialProfile.email,
    };
  }, []);

  const [profile, setProfile] = React.useState<UserProfile>(() => mapPatientToUserProfile(patientProfile));
  const [editValues, setEditValues] = React.useState<UserProfile>(() => mapPatientToUserProfile(patientProfile));
  const [phoneCountry, setPhoneCountry] = React.useState<PhoneCountryOption | undefined>(undefined);
  const [isGenderModalVisible, setIsGenderModalVisible] = React.useState(false);
  const [isDobModalVisible, setIsDobModalVisible] = React.useState(false);
  const [dobTemp, setDobTemp] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const nextProfile = mapPatientToUserProfile(patientProfile);
    setProfile(nextProfile);
    setEditValues((prev) => (mode === 'edit' ? prev : nextProfile));
  }, [mapPatientToUserProfile, mode, patientProfile]);

  const profileInitials = React.useMemo(() => {
    const parts = profile.fullName.trim().split(/\s+/);
    if (!parts.length) return '';
    const letters = parts.map((p) => p[0]).join('');
    return letters.slice(0, 2).toUpperCase();
  }, [profile.fullName]);

  const genderOptions = React.useMemo(
    () => ['Female', 'Male', 'Other'],
    [],
  );

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
    if (key === 'home') {
      setActiveTab('home');
      onGoHome();
    } else if (key === 'schedule') {
      setActiveTab('schedule');
      onOpenSchedule();
    } else if (key === 'chat') {
      setActiveTab('chat');
      onOpenChat();
    } else {
      setActiveTab(key);
    }
  };

  const startEditProfile = React.useCallback(() => {
    setEditValues(profile);
    setMode('edit');
  }, [profile]);

  const handleSaveProfile = React.useCallback(() => {
    setProfile(editValues);
    setMode('overview');
  }, [editValues]);

  const handleCancelEdit = React.useCallback(() => {
    setEditValues(profile);
    setMode('overview');
  }, [profile]);

  const handleSelectGender = (value: string) => {
    setEditValues((prev) => ({ ...prev, gender: value }));
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
          setEditValues((prev) => ({ ...prev, dateOfBirth: formatDate(date) }));
        }
      },
    });
  };

  const handleOpenDobPicker = (currentValue: string) => {
    if (Platform.OS === 'android') {
      openAndroidDatePicker(currentValue);
    } else {
      setDobTemp(currentValue ? parseDateFromString(currentValue) : new Date(1990, 0, 1));
      setIsDobModalVisible(true);
    }
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

  const handleConfirmDob = () => {
    const next = dobTemp ?? parseDateFromString(editValues.dateOfBirth);
    setEditValues((prev) => ({ ...prev, dateOfBirth: formatDate(next) }));
    setIsDobModalVisible(false);
  };

  const quickStats = React.useMemo<QuickStat[]>(
    () => [
      {
        id: 'profile',
        label: 'Profile completion',
        value: profile.address ? '100%' : '86%',
        meta: profile.address ? 'All sections verified' : 'Add your address',
      },
      {
        id: 'coverage',
        label: 'Coverage status',
        value: 'Active',
        meta: 'Blue Shield PPO',
      },
      {
        id: 'next',
        label: 'Next visit',
        value: 'Sep 09 · 9:30 AM',
        meta: 'Dr. Sarah Johnson',
      },
    ],
    [profile.address],
  );

  const quickActions = React.useMemo<QuickAction[]>(
    () => [
      {
        id: 'action-edit',
        label: 'Update info',
        description: 'Contact & coverage',
        icon: 'create-outline',
        onPress: startEditProfile,
      },
      {
        id: 'action-schedule',
        label: 'View visits',
        description: 'Upcoming & history',
        icon: 'calendar-outline',
        onPress: onOpenSchedule,
      },
      {
        id: 'action-home',
        label: 'Go to Home',
        description: 'Dashboard overview',
        icon: 'home-outline',
        onPress: onGoHome,
      },
    ],
    [onGoHome, onOpenSchedule, startEditProfile],
  );

  const infoSections = React.useMemo(
    () => ({
      personal: [
        {
          id: 'fullName',
          icon: 'person-outline',
          label: 'Full name',
          value: profile.fullName,
          placeholder: 'Add your full name',
        },
        {
          id: 'dob',
          icon: 'calendar-outline',
          label: 'Date of birth',
          value: profile.dateOfBirth,
          placeholder: 'Add your date of birth',
        },
        {
          id: 'gender',
          icon: 'male-female-outline',
          label: 'Gender',
          value: profile.gender,
          placeholder: 'Add gender',
        },
      ] as InfoItem[],
      contact: [
        {
          id: 'phone',
          icon: 'call-outline',
          label: 'Phone number',
          value: profile.phone,
          placeholder: 'Add a phone number',
        },
        {
          id: 'email',
          icon: 'mail-outline',
          label: 'Email address',
          value: profile.email,
          placeholder: 'Add an email address',
        },
        {
          id: 'address',
          icon: 'location-outline',
          label: 'Home address',
          value: profile.address,
          placeholder: 'Add address details',
        },
      ] as InfoItem[],
    }),
    [profile],
  );

  const renderInfoRow = (item: InfoItem) => {
    const valuePresent = Boolean(item.value?.trim());
    const valueText = valuePresent ? item.value : item.placeholder;

    return (
      <View key={item.id} style={styles.infoRow}>
        <View style={styles.infoRowLeft}>
          <View style={styles.infoRowIcon}>
            <Ionicons name={item.icon} size={16} color={theme.colors.primary.main} />
          </View>
          <View>
            <ThemedText variant='caption1' color='secondary'>
              {item.label}
            </ThemedText>
            <ThemedText variant='body2' color={valuePresent ? 'primary' : 'secondary'}>
              {valueText}
            </ThemedText>
          </View>
        </View>
        {item.trailing && (
          <ThemedText variant='caption1' color='secondary'>
            {item.trailing}
          </ThemedText>
        )}
      </View>
    );
  };

  const renderOverviewContent = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <ThemedText variant='caption1' color='secondary'>
          Patient profile
        </ThemedText>
        <TouchableOpacity style={styles.headerQuickAction} activeOpacity={0.85} onPress={startEditProfile}>
          <Ionicons name='create-outline' size={18} color={theme.colors.primary.main} />
          <ThemedText variant='body3' color='primary'>
            Edit
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedCard style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.avatarShell}>
            <ThemedText variant='headline2' color='primary'>
              {profileInitials || 'AA'}
            </ThemedText>
          </View>
          <View style={styles.heroTextBlock}>
            <ThemedText variant='headline2' color='primary'>
              {profile.fullName || 'Add your name'}
            </ThemedText>
            <ThemedText variant='body3' color='secondary'>
              {profile.email || 'Add email address'}
            </ThemedText>
          </View>
        </View>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroChip}>
            <Ionicons name='shield-checkmark-outline' size={16} color={theme.colors.primary.main} />
            <ThemedText variant='body4' color='primary'>
              Enrolled in Tele Heal
            </ThemedText>
          </View>
          <View style={styles.heroChip}>
            <Ionicons name='document-text-outline' size={16} color={theme.colors.primary.main} />
            <ThemedText variant='body4' color='primary'>
              Preferences synced
            </ThemedText>
          </View>
        </View>
      </ThemedCard>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsContent}
      >
        {quickStats.map((stat) => (
          <View key={stat.id} style={styles.statCard}>
            <ThemedText variant='caption1' color='secondary'>
              {stat.label}
            </ThemedText>
            <ThemedText variant='headline3' color='primary' style={styles.statValue}>
              {stat.value}
            </ThemedText>
            <ThemedText variant='caption1' color='secondary'>
              {stat.meta}
            </ThemedText>
          </View>
        ))}
      </ScrollView>

      <ThemedCard style={styles.actionsCard}>
        <SectionHeader title='Care shortcuts' subtitle='Get to the most common destinations quicker.' icon='flash-outline' />
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              activeOpacity={0.9}
              onPress={action.onPress}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={18} color={theme.colors.primary.main} />
              </View>
              <View style={styles.quickActionText}>
                <ThemedText variant='body2' color='primary'>
                  {action.label}
                </ThemedText>
                <ThemedText variant='caption1' color='secondary'>
                  {action.description}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedCard>

      <ThemedCard style={styles.sectionCard}>
        <SectionHeader title='Personal details' subtitle='How your providers identify you.' icon='person-circle-outline' />
        {infoSections.personal.map(renderInfoRow)}
      </ThemedCard>

      <ThemedCard style={styles.sectionCard}>
        <SectionHeader title='Contact & address' subtitle='Where we reach you for care coordination.' icon='call-outline' />
        {infoSections.contact.map(renderInfoRow)}
      </ThemedCard>

      <View style={styles.primaryButtonWrapper}>
        <Button label='Edit profile' variant='primary' fullWidth onPress={startEditProfile} />
      </View>
    </ScrollView>
  );

  const renderEditContent = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ThemedCard style={styles.editCard}>
        <SectionHeader title='Personal details' subtitle='Update legal info and demographics.' icon='person-circle-outline' />
        <TextField
          label='Full name'
          value={editValues.fullName}
          onChangeText={(text) => setEditValues((prev) => ({ ...prev, fullName: text }))}
        />
        <View style={styles.fieldSpacing} />
        <TextField
          label='Gender'
          value={editValues.gender}
          editable={false}
          onPress={() => setIsGenderModalVisible(true)}
          rightIcon={<Ionicons name='chevron-down-outline' size={18} color={theme.colors.text.secondary} />}
        />
        <View style={styles.fieldSpacing} />
        <TextField
          label='Date of birth'
          value={editValues.dateOfBirth}
          editable={false}
          onPress={() => handleOpenDobPicker(editValues.dateOfBirth)}
          rightIcon={<Ionicons name='calendar-outline' size={18} color={theme.colors.text.secondary} />}
        />
      </ThemedCard>

      <ThemedCard style={styles.editCard}>
        <SectionHeader title='Contact info' subtitle='How we keep in touch.' icon='mail-outline' />
        <PhoneNumberField
          label='Phone number'
          value={editValues.phone}
          onChangeText={(text) => setEditValues((prev) => ({ ...prev, phone: text }))}
          countryCode={phoneCountry?.code}
          onCountryChange={(country) => setPhoneCountry(country)}
        />
        <View style={styles.fieldSpacing} />
        <TextField
          label='Email'
          value={editValues.email}
          keyboardType='email-address'
          onChangeText={(text) => setEditValues((prev) => ({ ...prev, email: text }))}
        />
        <View style={styles.fieldSpacing} />
        <TextField
          label='Address'
          value={editValues.address}
          multiline
          onChangeText={(text) => setEditValues((prev) => ({ ...prev, address: text }))}
          placeholder='Street, city, state'
        />
      </ThemedCard>

      <View style={styles.editActions}>
        <Button label='Cancel' variant='secondary' fullWidth onPress={handleCancelEdit} />
        <View style={styles.fieldSpacing} />
        <Button label='Save changes' variant='primary' fullWidth onPress={handleSaveProfile} />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {mode === 'edit' ? renderEditContent() : renderOverviewContent()}
        <Modal
          transparent
          visible={Platform.OS === 'ios' && isDobModalVisible}
          animationType="slide"
          onRequestClose={() => setIsDobModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setIsDobModalVisible(false)}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHandle} />
                <ThemedText variant="headline3" color="primary" style={styles.modalTitle}>
                  Select date of birth
                </ThemedText>
                <View style={styles.modalOptionsList}>
                  <DateTimePicker
                    value={dobTemp ?? parseDateFromString(editValues.dateOfBirth)}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={(_event: any, selectedDate?: Date) => {
                      if (selectedDate) {
                        setDobTemp(selectedDate);
                      }
                    }}
                  />
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.modalActionSecondary]}
                      activeOpacity={0.8}
                      onPress={() => {
                        setIsDobModalVisible(false);
                        setDobTemp(null);
                      }}
                    >
                      <ThemedText variant="body2" color="primary">
                        Cancel
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.modalActionPrimary]}
                      activeOpacity={0.9}
                      onPress={handleConfirmDob}
                    >
                      <ThemedText variant="body2" color="inverse">
                        Confirm
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>

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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerQuickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.sm,
  },
  heroCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarShell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  statsScroll: {
    marginBottom: theme.spacing.lg,
  },
  statsContent: {
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    width: 200,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statValue: {
    marginVertical: theme.spacing.xs,
  },
  actionsCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  quickActionsGrid: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.muted,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  quickActionText: {
    flex: 1,
  },
  sectionCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  infoRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonWrapper: {
    marginTop: theme.spacing.md,
  },
  editCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  fieldSpacing: {
    height: theme.spacing.md,
  },
  editActions: {
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    borderTopLeftRadius: theme.borderRadius.xxxl,
    borderTopRightRadius: theme.borderRadius.xxxl,
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
    marginBottom: theme.spacing.sm,
  },
  modalOptionsList: {
    marginTop: theme.spacing.md,
  },
  modalOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.muted,
    marginBottom: theme.spacing.sm,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionSecondary: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.background.muted,
  },
  modalActionPrimary: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary.main,
  },
});

export default ProfileScreen;
