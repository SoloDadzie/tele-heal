import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import SectionHeader from '../components/SectionHeader';
import { theme } from '../theme';
import type { HospitalItem } from './SelectHospitalScreen';
import { HOSPITALS } from './SelectHospitalScreen';

export type DoctorListItem = {
  id: string;
  name: string;
  specialty: string;
  distance: string;
  rating: string;
  reviews: string;
  responseTime: string;
  fee: number;
  insurancePlans: string[];
  languages: string[];
  availableNow: boolean;
  hospitalId: string;
};

export type DoctorListScreenProps = {
  onBack: () => void;
  onSelectDoctor: (doctor: DoctorListItem, hospital: HospitalItem) => void;
  selectedHospital?: HospitalItem | null;
};

const SPECIALTIES = [
  'All Specialists',
  'Allergist',
  'Anesthesiologist',
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'General Practitioner',
  'Gynecologist',
  'Hematologist',
  'Nephrologist',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedist',
  'Otolaryngologist (ENT)',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Rheumatologist',
  'Surgeon',
  'Urologist',
];

const DOCTORS: DoctorListItem[] = [
  {
    id: 'doc-1',
    name: 'Dr. Chikanso Chima',
    specialty: 'Angiology',
    distance: '2 km',
    rating: '4.5',
    reviews: '834',
    responseTime: '< 10 min',
    fee: 75,
    insurancePlans: ['TeleHeal Basic', 'TeleHeal Premium'],
    languages: ['English', 'French'],
    availableNow: true,
    hospitalId: 'hospital-1',
  },
  {
    id: 'doc-2',
    name: 'Dr. Justin Biber',
    specialty: 'Angiology',
    distance: '2 km',
    rating: '4.5',
    reviews: '834',
    responseTime: '15 min',
    fee: 45,
    insurancePlans: ['TeleHeal Basic'],
    languages: ['English', 'Spanish'],
    availableNow: false,
    hospitalId: 'hospital-1',
  },
  {
    id: 'doc-3',
    name: 'Dr. Maria Anna',
    specialty: 'Angiology',
    distance: '2 km',
    rating: '4.5',
    reviews: '834',
    responseTime: '20 min',
    fee: 120,
    insurancePlans: ['TeleHeal Premium', 'Global Care'],
    languages: ['English', 'German'],
    availableNow: true,
    hospitalId: 'hospital-2',
  },
  {
    id: 'doc-4',
    name: 'Dr. Push Puttichai',
    specialty: 'Angiology',
    distance: '2 km',
    rating: '4.5',
    reviews: '834',
    responseTime: '5 min',
    fee: 90,
    insurancePlans: ['TeleHeal Premium'],
    languages: ['English', 'Thai'],
    availableNow: true,
    hospitalId: 'hospital-3',
  },
  {
    id: 'doc-5',
    name: 'Dr. Krystal Jung',
    specialty: 'Angiology',
    distance: '2 km',
    rating: '4.5',
    reviews: '834',
    responseTime: '30 min',
    fee: 60,
    insurancePlans: ['TeleHeal Basic', 'Global Care'],
    languages: ['English', 'Korean'],
    availableNow: false,
    hospitalId: 'hospital-4',
  },
];

const QUICK_FILTERS = [
  { label: 'All doctors', icon: 'layers-outline' as const },
  { label: 'Nearby', icon: 'navigate-outline' as const },
  { label: 'Top rated', icon: 'star-outline' as const },
] as const;
type QuickFilterLabel = (typeof QUICK_FILTERS)[number]['label'];

const INSURANCE_OPTIONS = ['All insurance', 'TeleHeal Basic', 'TeleHeal Premium', 'Global Care'] as const;
const LANGUAGE_OPTIONS = ['All languages', 'English', 'French', 'Spanish', 'German', 'Thai', 'Korean'] as const;
const FEE_OPTIONS = ['Any fee', 'Under $50', '$50 - $100', '$100+'] as const;

const DoctorListScreen: React.FC<DoctorListScreenProps> = ({ onBack, onSelectDoctor, selectedHospital }) => {
  const [selectedSpecialties, setSelectedSpecialties] = React.useState<string[]>(['All Specialists']);
  const [isFilterModalVisible, setIsFilterModalVisible] = React.useState(false);
  const [tempSelectedSpecialties, setTempSelectedSpecialties] = React.useState<string[]>(['All Specialists']);
  const [activeQuickFilter, setActiveQuickFilter] = React.useState<QuickFilterLabel>('All doctors');
  const [firstAvailableOnly, setFirstAvailableOnly] = React.useState(false);
  const [insuranceFilter, setInsuranceFilter] = React.useState<(typeof INSURANCE_OPTIONS)[number]>('All insurance');
  const [feeFilter, setFeeFilter] = React.useState<(typeof FEE_OPTIONS)[number]>('Any fee');
  const [languageFilter, setLanguageFilter] = React.useState<(typeof LANGUAGE_OPTIONS)[number]>('All languages');
  const [tempFirstAvailableOnly, setTempFirstAvailableOnly] = React.useState(firstAvailableOnly);
  const [tempInsuranceFilter, setTempInsuranceFilter] =
    React.useState<(typeof INSURANCE_OPTIONS)[number]>('All insurance');
  const [tempFeeFilter, setTempFeeFilter] = React.useState<(typeof FEE_OPTIONS)[number]>('Any fee');
  const [tempLanguageFilter, setTempLanguageFilter] =
    React.useState<(typeof LANGUAGE_OPTIONS)[number]>('All languages');
  const [searchTerm, setSearchTerm] = React.useState('');

  const resolveHospital = React.useCallback(
    (hospitalId: string): HospitalItem => HOSPITALS.find((hospital) => hospital.id === hospitalId) ?? HOSPITALS[0],
    [],
  );

  const hospitalScopedDoctors = React.useMemo(() => {
    if (!selectedHospital) return DOCTORS;
    return DOCTORS.filter((doctor) => doctor.hospitalId === selectedHospital.id);
  }, [selectedHospital]);

  const visibleDoctors = React.useMemo(() => {
    if (selectedSpecialties.includes('All Specialists')) {
      return hospitalScopedDoctors;
    }
    return hospitalScopedDoctors.filter((doc) => selectedSpecialties.includes(doc.specialty));
  }, [hospitalScopedDoctors, selectedSpecialties]);

  const filteredDoctors = React.useMemo(() => {
    let result = visibleDoctors;
    if (activeQuickFilter === 'Nearby') {
      const nearby = visibleDoctors.filter((_, index) => index % 2 === 0);
      result = nearby.length ? nearby : visibleDoctors;
    } else if (activeQuickFilter === 'Top rated') {
      result = [...visibleDoctors].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    if (firstAvailableOnly) {
      result = result.filter((doc) => doc.availableNow);
    }

    if (insuranceFilter !== 'All insurance') {
      result = result.filter((doc) => doc.insurancePlans.includes(insuranceFilter));
    }

    if (languageFilter !== 'All languages') {
      result = result.filter((doc) => doc.languages.includes(languageFilter));
    }

    if (feeFilter !== 'Any fee') {
      result = result.filter((doc) => {
        if (feeFilter === 'Under $50') return doc.fee < 50;
        if (feeFilter === '$50 - $100') return doc.fee >= 50 && doc.fee <= 100;
        if (feeFilter === '$100+') return doc.fee > 100;
        return true;
      });
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.trim().toLowerCase();
      result = result.filter(
        (doc) =>
          doc.name.toLowerCase().includes(lower) ||
          doc.specialty.toLowerCase().includes(lower),
      );
    }

    return result;
  }, [
    activeQuickFilter,
    visibleDoctors,
    firstAvailableOnly,
    insuranceFilter,
    languageFilter,
    feeFilter,
    searchTerm,
  ]);

  const activeFilterChips = React.useMemo(() => {
    const chips: string[] = [activeQuickFilter];
    if (firstAvailableOnly) chips.push('First available');
    if (insuranceFilter !== 'All insurance') chips.push(insuranceFilter);
    if (languageFilter !== 'All languages') chips.push(languageFilter);
    if (feeFilter !== 'Any fee') chips.push(feeFilter);
    const specialtyFilterCount = selectedSpecialties.includes('All Specialists')
      ? 0
      : selectedSpecialties.length;
    if (specialtyFilterCount > 0) chips.push(`${specialtyFilterCount} specialties`);
    return chips;
  }, [activeQuickFilter, firstAvailableOnly, insuranceFilter, languageFilter, feeFilter, selectedSpecialties]);

  const handleOpenFilter = () => {
    setTempSelectedSpecialties([...selectedSpecialties]);
    setTempFirstAvailableOnly(firstAvailableOnly);
    setTempInsuranceFilter(insuranceFilter);
    setTempFeeFilter(feeFilter);
    setTempLanguageFilter(languageFilter);
    setIsFilterModalVisible(true);
  };

  const handleToggleSpecialty = (specialty: string) => {
    if (specialty === 'All Specialists') {
      setTempSelectedSpecialties(['All Specialists']);
    } else {
      const newSelection = tempSelectedSpecialties.filter(s => s !== 'All Specialists');
      if (newSelection.includes(specialty)) {
        const filtered = newSelection.filter(s => s !== specialty);
        setTempSelectedSpecialties(filtered.length > 0 ? filtered : ['All Specialists']);
      } else {
        setTempSelectedSpecialties([...newSelection, specialty]);
      }
    }
  };

  const handleApplyFilter = () => {
    setSelectedSpecialties([...tempSelectedSpecialties]);
    setFirstAvailableOnly(tempFirstAvailableOnly);
    setInsuranceFilter(tempInsuranceFilter);
    setFeeFilter(tempFeeFilter);
    setLanguageFilter(tempLanguageFilter);
    setIsFilterModalVisible(false);
  };

  const handleClearFilter = () => {
    setTempSelectedSpecialties(['All Specialists']);
    setTempFirstAvailableOnly(false);
    setTempInsuranceFilter('All insurance');
    setTempFeeFilter('Any fee');
    setTempLanguageFilter('All languages');
  };

  const handleClearAllFilters = () => {
    setSelectedSpecialties(['All Specialists']);
    setFirstAvailableOnly(false);
    setInsuranceFilter('All insurance');
    setFeeFilter('Any fee');
    setLanguageFilter('All languages');
  };

  const firstAvailableDoctor = React.useMemo(
    () => filteredDoctors.find((doc) => doc.availableNow),
    [filteredDoctors],
  );

  const handleDoctorPress = React.useCallback(
    (doctor: DoctorListItem) => {
      const hospital = resolveHospital(doctor.hospitalId);
      onSelectDoctor(doctor, hospital);
    },
    [onSelectDoctor, resolveHospital],
  );

  const handleSelectFirstAvailable = () => {
    if (firstAvailableDoctor) {
      handleDoctorPress(firstAvailableDoctor);
    }
  };

  const handleToggleFirstAvailable = () => {
    setFirstAvailableOnly((prev) => !prev);
  };

  const specialtyFilterCount = selectedSpecialties.includes('All Specialists') ? 0 : selectedSpecialties.length;
  const totalActiveFilters =
    specialtyFilterCount +
    (firstAvailableOnly ? 1 : 0) +
    (insuranceFilter !== 'All insurance' ? 1 : 0) +
    (languageFilter !== 'All languages' ? 1 : 0) +
    (feeFilter !== 'Any fee' ? 1 : 0);

  const activeInsuranceLabel = insuranceFilter === 'All insurance' ? 'All plans' : insuranceFilter;
  const activeFeeLabel = feeFilter === 'Any fee' ? 'Any budget' : feeFilter;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary">
            Find a doctor
          </ThemedText>
          <TouchableOpacity style={styles.topBarButton} onPress={handleOpenFilter} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[theme.colors.primary.main, theme.colors.primary.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeaderRow}>
              <View style={styles.heroCopy}>
                <View style={styles.heroBadge}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.neutral.white} />
                  <ThemedText variant="caption1" color="inverse">
                    Care navigator
                  </ThemedText>
                </View>
                <ThemedText variant="headline1" color="inverse" style={styles.heroTitle}>
                  Specialists near you
                </ThemedText>
                <ThemedText variant="body3" color="inverse" style={styles.heroSubtitle}>
                  {filteredDoctors.length} doctors available this week
                </ThemedText>
              </View>
              <View style={styles.heroHighlight}>
                <Ionicons name="medkit-outline" size={16} color={theme.colors.neutral.white} />
                <ThemedText variant="caption1" color="inverse">
                  Tele Heal network
                </ThemedText>
              </View>
            </View>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaCard}>
                <Ionicons name="people-outline" size={18} color={theme.colors.neutral.white} />
                <View>
                  <ThemedText variant="headline2" color="inverse">
                    120+
                  </ThemedText>
                  <ThemedText variant="caption1" color="inverse">
                    Verified doctors
                  </ThemedText>
                </View>
              </View>
              <View style={styles.heroMetaCard}>
                <Ionicons name="star-outline" size={18} color={theme.colors.neutral.white} />
                <View>
                  <ThemedText variant="headline2" color="inverse">
                    4.8
                  </ThemedText>
                  <ThemedText variant="caption1" color="inverse">
                    Avg rating
                  </ThemedText>
                </View>
              </View>
              <View style={styles.heroMetaCard}>
                <Ionicons name="time-outline" size={18} color={theme.colors.neutral.white} />
                <View>
                  <ThemedText variant="headline2" color="inverse">
                    12 min
                  </ThemedText>
                  <ThemedText variant="caption1" color="inverse">
                    Avg response
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.heroFilterRow}>
              <View style={styles.heroFilterPill}>
                <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.primary.main} />
                <View>
                  <ThemedText variant="caption1" color="secondary">
                    Insurance
                  </ThemedText>
                  <ThemedText variant="body3" color="primary">
                    {activeInsuranceLabel}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.heroFilterPill}>
                <Ionicons name="cash-outline" size={14} color={theme.colors.primary.main} />
                <View>
                  <ThemedText variant="caption1" color="secondary">
                    Budget
                  </ThemedText>
                  <ThemedText variant="body3" color="primary">
                    {activeFeeLabel}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.heroFilterToggle, firstAvailableOnly && styles.heroFilterToggleActive]}
                activeOpacity={0.9}
                onPress={handleToggleFirstAvailable}
              >
                <Ionicons
                  name="flash-outline"
                  size={14}
                  color={firstAvailableOnly ? theme.colors.neutral.white : theme.colors.primary.main}
                />
                <ThemedText variant="caption1" color={firstAvailableOnly ? 'inverse' : 'primary'}>
                  First available
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity style={styles.heroActionPrimary} activeOpacity={0.9} onPress={handleSelectFirstAvailable}>
                <Ionicons name="flash-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="body3" color="primary">
                  Match me now
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionSecondary} activeOpacity={0.9} onPress={handleOpenFilter}>
                <Ionicons name="options-outline" size={16} color={theme.colors.neutral.white} />
                <ThemedText variant="body3" color="inverse">
                  Adjust filters
                </ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ThemedCard style={styles.searchCard}>
            <TouchableOpacity style={styles.locationRow} activeOpacity={0.85} onPress={handleOpenFilter}>
              <View style={styles.locationMeta}>
                <Ionicons name="navigate-outline" size={16} color={theme.colors.primary.main} />
                <View>
                  <ThemedText variant="body3" color="primary">
                    Within 5 miles
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    Tele Heal preferred locations
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-down" size={16} color={theme.colors.primary.main} />
            </TouchableOpacity>
            <View style={styles.searchInputRow}>
              <Ionicons name="search-outline" size={18} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search doctor, symptom, or specialty"
                placeholderTextColor={theme.colors.text.secondary}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')} activeOpacity={0.7}>
                  <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.searchActionsRow}>
              <View style={styles.searchHint}>
                <Ionicons name="sparkles-outline" size={16} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="secondary">
                  Smart suggestions update as you type
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.inlineFilterButton} onPress={handleOpenFilter} activeOpacity={0.85}>
                <Ionicons name="funnel-outline" size={14} color={theme.colors.primary.main} />
                <ThemedText variant="caption1" color="primary">
                  Refine filters
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedCard>

          <ThemedCard style={styles.quickFilterCard}>
            <View style={styles.quickFilterHeader}>
              <View>
                <ThemedText variant="headline3" color="primary">
                  Quick filters
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  Mix and match to narrow results
                </ThemedText>
              </View>
              <TouchableOpacity onPress={handleOpenFilter} activeOpacity={0.8} style={styles.quickFilterManage}>
                <Ionicons name="settings-outline" size={14} color={theme.colors.primary.main} />
                <ThemedText variant="body3" color="primary">
                  Manage
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilterRow}>
              {QUICK_FILTERS.map(({ label, icon }) => {
                const isActive = activeQuickFilter === label;
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.quickFilterChip, isActive && styles.quickFilterChipActive]}
                    onPress={() => setActiveQuickFilter(label)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={icon}
                      size={14}
                      color={isActive ? theme.colors.neutral.white : theme.colors.primary.main}
                    />
                    <ThemedText variant="body3" color={isActive ? 'inverse' : 'primary'} style={styles.quickFilterLabel}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ThemedCard>

          <ThemedCard style={styles.firstAvailableCard}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="headline3" color="primary">
                Need someone now?
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                {firstAvailableDoctor
                  ? `${firstAvailableDoctor.name} can see you within ${firstAvailableDoctor.responseTime}.`
                  : 'No doctors are immediately available. Try adjusting filters.'}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.firstAvailableButton, !firstAvailableDoctor && styles.firstAvailableButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleSelectFirstAvailable}
              disabled={!firstAvailableDoctor}
            >
              <Ionicons name="flash" size={16} color={firstAvailableDoctor ? theme.colors.neutral.white : theme.colors.text.secondary} />
              <ThemedText variant="body3" color={firstAvailableDoctor ? 'inverse' : 'secondary'} style={styles.firstAvailableButtonLabel}>
                First available
              </ThemedText>
            </TouchableOpacity>
          </ThemedCard>

          {totalActiveFilters > 0 && (
            <ThemedCard style={styles.filterSummaryCard}>
              <SectionHeader
                title="Your filters"
                subtitle={`${totalActiveFilters} active`}
                icon="funnel-outline"
                actionLabel="Clear all"
                onActionPress={handleClearAllFilters}
              />
              <View style={styles.filterSummaryRow}>
                {activeFilterChips.map((chip) => (
                  <View key={chip} style={styles.filterSummaryChip}>
                    <ThemedText variant="caption1" color="primary">
                      {chip}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </ThemedCard>
          )}

          <SectionHeader
            title="Recommended doctors"
            subtitle="Based on your filters and availability."
            icon="medkit-outline"
            style={styles.sectionHeader}
          />

          <View style={styles.doctorStack}>
            {filteredDoctors.length === 0 ? (
              <ThemedCard style={styles.emptyCard}>
                <Ionicons name="medkit-outline" size={24} color={theme.colors.primary.main} />
                <ThemedText variant="headline3" color="primary">
                  No doctors to show
                </ThemedText>
                <ThemedText variant="body3" color="secondary" style={{ textAlign: 'center' }}>
                  Try adjusting filters or choose another facility to see available providers.
                </ThemedText>
                <TouchableOpacity style={styles.emptyButton} onPress={handleOpenFilter} activeOpacity={0.85}>
                  <Ionicons name="options-outline" size={14} color={theme.colors.neutral.white} />
                  <ThemedText variant="caption1" color="inverse">
                    Adjust filters
                  </ThemedText>
                </TouchableOpacity>
              </ThemedCard>
            ) : (
              filteredDoctors.map((doctor) => {
                const insuranceText = doctor.insurancePlans.join(', ');
                const languagesText = doctor.languages.join(' • ');
                const matchesInsurancePreference =
                  insuranceFilter === 'All insurance' || doctor.insurancePlans.includes(insuranceFilter);
                return (
                  <ThemedCard key={doctor.id} style={styles.modernCard}>
                    <View style={styles.cardAccent} />
                    <TouchableOpacity
                      activeOpacity={0.95}
                      onPress={() => handleDoctorPress(doctor)}
                      style={styles.modernCardTouchable}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.modernPhotoWrapper}>
                          <View style={styles.modernPhotoPlaceholder}>
                            <Ionicons name="person-outline" size={36} color={theme.colors.primary.main} />
                          </View>
                          {doctor.availableNow && (
                            <View style={styles.onlineBadge}>
                              <View style={styles.onlineDot} />
                            </View>
                          )}
                        </View>

                        <View style={styles.modernCardBody}>
                          <View style={styles.nameRow}>
                            <ThemedText variant="headline3" color="primary">
                              {doctor.name}
                            </ThemedText>
                            <View style={styles.ratingPill}>
                              <Ionicons name="star" size={12} color={theme.colors.accent.main} />
                              <ThemedText variant="caption1" color="primary">
                                {doctor.rating}
                              </ThemedText>
                              <ThemedText variant="caption1" color="secondary">
                                ({doctor.reviews})
                              </ThemedText>
                            </View>
                          </View>

                          <View style={styles.specialtyRow}>
                            <Ionicons name="medkit-outline" size={12} color={theme.colors.primary.main} />
                            <ThemedText variant="caption1" color="primary">
                              {doctor.specialty}
                            </ThemedText>
                          </View>

                          <View style={styles.insuranceFeeRow}>
                            <View style={styles.insuranceBadge}>
                              <Ionicons name="shield-checkmark-outline" size={12} color={theme.colors.primary.main} />
                              <ThemedText variant="caption1" color="primary">
                                {doctor.insurancePlans.slice(0, 1).join(', ')}
                              </ThemedText>
                            </View>
                            <View style={styles.feeBadge}>
                              <Ionicons name="cash-outline" size={12} color={theme.colors.primary.main} />
                              <ThemedText variant="caption1" color="primary">
                                ${doctor.fee}
                              </ThemedText>
                            </View>
                            {doctor.availableNow && (
                              <View style={styles.firstAvailableBadge}>
                                <Ionicons name="flash-outline" size={12} color={theme.colors.neutral.white} />
                                <ThemedText variant="caption1" color="inverse">
                                  First available
                                </ThemedText>
                              </View>
                            )}
                          </View>

                          <View style={styles.coverageRow}>
                            <View
                              style={[
                                styles.coveragePill,
                                !matchesInsurancePreference && styles.coveragePillOut,
                              ]}
                            >
                              <Ionicons
                                name={matchesInsurancePreference ? 'shield-checkmark-outline' : 'alert-circle-outline'}
                                size={12}
                                color={matchesInsurancePreference ? theme.colors.semantic.success : theme.colors.accent.main}
                              />
                              <ThemedText
                                variant="caption1"
                                color={matchesInsurancePreference ? 'primary' : 'accent'}
                              >
                                {matchesInsurancePreference ? 'In-network match' : 'Out-of-network · verify coverage'}
                              </ThemedText>
                            </View>
                          </View>

                          <View style={styles.availabilityRow}>
                            <View
                              style={[
                                styles.availabilityChip,
                                doctor.availableNow && styles.availabilityChipActive,
                              ]}
                            >
                              <Ionicons
                                name={doctor.availableNow ? 'flash-outline' : 'time-outline'}
                                size={12}
                                color={doctor.availableNow ? theme.colors.neutral.white : theme.colors.primary.main}
                              />
                              <ThemedText
                                variant="caption1"
                                color={doctor.availableNow ? 'inverse' : 'primary'}
                              >
                                {doctor.availableNow ? 'Available now' : `Responds in ${doctor.responseTime}`}
                              </ThemedText>
                            </View>
                          </View>

                          <View style={styles.doctorMetaRow}>
                            <View style={styles.metaPill}>
                              <Ionicons name="navigate-outline" size={12} color={theme.colors.primary.main} />
                              <ThemedText variant="caption1" color="primary">
                                {doctor.distance}
                              </ThemedText>
                            </View>
                            <View style={styles.metaPill}>
                              <Ionicons name="cash-outline" size={12} color={theme.colors.primary.main} />
                              <ThemedText variant="caption1" color="primary">
                                ${doctor.fee}
                              </ThemedText>
                            </View>
                            <View style={styles.metaPill}>
                              <Ionicons name="shield-checkmark-outline" size={12} color={theme.colors.primary.main} />
                              <ThemedText variant="caption1" color="primary">
                                {doctor.insurancePlans.length} plans
                              </ThemedText>
                            </View>
                          </View>

                          <View style={styles.tagRow}>
                            <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.primary.main} />
                            <ThemedText variant="caption1" color="secondary" style={styles.tagText}>
                              {insuranceText}
                            </ThemedText>
                          </View>
                          <View style={styles.tagRow}>
                            <Ionicons name="chatbox-ellipses-outline" size={14} color={theme.colors.primary.main} />
                            <ThemedText variant="caption1" color="secondary" style={styles.tagText}>
                              {languagesText}
                            </ThemedText>
                          </View>
                        </View>
                      </View>

                      <View style={styles.cardDivider} />

                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.primaryCta}
                          activeOpacity={0.9}
                          onPress={() => handleDoctorPress(doctor)}
                        >
                          <ThemedText variant="caption1" color="inverse" style={styles.ctaLabel}>
                            Book visit
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.secondaryCta}
                          activeOpacity={0.85}
                          onPress={() => handleDoctorPress(doctor)}
                        >
                          <ThemedText variant="caption1" color="primary" style={styles.ctaLabel}>
                            View profile
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </ThemedCard>
                );
              })
            )}
          </View>
        </ScrollView>

        {filteredDoctors.length > 0 && (
          <View style={styles.stickySummary}>
            <View>
              <ThemedText variant="body2" color="primary" style={styles.stickySummaryTitle}>
                {filteredDoctors.length} matches
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                {totalActiveFilters > 0 ? `${totalActiveFilters} filters active` : 'Using default filters'}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.stickySummaryButton}
              activeOpacity={0.9}
              onPress={firstAvailableDoctor ? handleSelectFirstAvailable : handleOpenFilter}
            >
              <Ionicons
                name={firstAvailableDoctor ? 'flash-outline' : 'options-outline'}
                size={16}
                color={theme.colors.neutral.white}
              />
              <ThemedText variant="body3" color="inverse">
                {firstAvailableDoctor ? 'Book now' : 'Adjust filters'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsFilterModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.filterModalContent}>
                <View style={styles.filterModalHeader}>
                  <ThemedText variant="headline2" color="primary">
                    Filter by Specialty
                  </ThemedText>
                  <TouchableOpacity 
                    onPress={() => setIsFilterModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.filterList}
                  showsVerticalScrollIndicator={false}
                >
                  {SPECIALTIES.map((specialty) => {
                    const isSelected = tempSelectedSpecialties.includes(specialty);
                    return (
                      <TouchableOpacity
                        key={specialty}
                        style={styles.filterItem}
                        onPress={() => handleToggleSpecialty(specialty)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.filterItemContent}>
                          <ThemedText 
                            variant="body2" 
                            color="primary"
                            style={isSelected && styles.filterItemTextSelected}
                          >
                            {specialty}
                          </ThemedText>
                          {isSelected && (
                            <View style={styles.checkmark}>
                              <Ionicons 
                                name="checkmark" 
                                size={18} 
                                color={theme.colors.primary.main} 
                              />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.filterModalActions}>
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={handleClearFilter}
                  >
                    <ThemedText variant="body2" color="primary">
                      Clear
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.applyButton}
                    onPress={handleApplyFilter}
                  >
                    <ThemedText variant="body2" color="inverse">
                      Apply Filters
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.filterSection}>
                <View style={styles.sectionRow}>
                  <ThemedText variant="headline3" color="primary">
                    Availability
                  </ThemedText>
                  <View style={styles.switchRow}>
                    <ThemedText variant="body3" color="secondary" style={styles.switchLabel}>
                      First available only
                    </ThemedText>
                    <Switch
                      value={tempFirstAvailableOnly}
                      onValueChange={setTempFirstAvailableOnly}
                      trackColor={{
                        true: theme.colors.primary.main,
                        false: theme.colors.border.light,
                      }}
                      thumbColor={tempFirstAvailableOnly ? theme.colors.neutral.white : theme.colors.background.card}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <ThemedText variant="headline3" color="primary" style={styles.sectionTitle}>
                  Insurance
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
                  {INSURANCE_OPTIONS.map((option) => {
                    const isActive = tempInsuranceFilter === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        activeOpacity={0.8}
                        onPress={() => setTempInsuranceFilter(option)}
                      >
                        <ThemedText variant="body3" color={isActive ? 'inverse' : 'primary'}>
                          {option}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <ThemedText variant="headline3" color="primary" style={styles.sectionTitle}>
                  Consultation fee
                </ThemedText>
                <View style={styles.filterChipRowWrap}>
                  {FEE_OPTIONS.map((option) => {
                    const isActive = tempFeeFilter === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        activeOpacity={0.8}
                        onPress={() => setTempFeeFilter(option)}
                      >
                        <ThemedText variant="body3" color={isActive ? 'inverse' : 'primary'}>
                          {option}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <ThemedText variant="headline3" color="primary" style={styles.sectionTitle}>
                  Languages
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
                  {LANGUAGE_OPTIONS.map((option) => {
                    const isActive = tempLanguageFilter === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        activeOpacity={0.8}
                        onPress={() => setTempLanguageFilter(option)}
                      >
                        <ThemedText variant="body3" color={isActive ? 'inverse' : 'primary'}>
                          {option}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.muted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  heroCard: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
  },
  heroTitle: {
    maxWidth: '80%',
  },
  heroSubtitle: {
    opacity: 0.9,
  },
  heroHighlight: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  heroMetaCard: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minWidth: 110,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  heroFilterRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  heroFilterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroFilterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroFilterToggleActive: {
    backgroundColor: theme.colors.neutral.white,
    borderColor: theme.colors.neutral.white,
  },
  heroActionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral.white,
  },
  heroActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  searchCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  searchActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  inlineFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm / 1.2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
  },
  quickFilterCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
  },
  quickFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickFilterManage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  quickFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.muted,
  },
  quickFilterChipActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
    ...theme.shadows.sm,
  },
  quickFilterLabel: {
    fontWeight: '600',
  },
  firstAvailableCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  firstAvailableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
  },
  firstAvailableButtonDisabled: {
    backgroundColor: theme.colors.border.light,
  },
  firstAvailableButtonLabel: {
    fontWeight: '600',
  },
  filterSummaryCard: {
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
  },
  filterSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterSummaryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  sectionHeader: {
    paddingHorizontal: 0,
  },
  doctorStack: {
    gap: theme.spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
  },
  modernCard: {
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: 0,
    ...theme.shadows.sm,
  },
  cardAccent: {
    height: 4,
    backgroundColor: theme.colors.primary.main,
    marginHorizontal: -theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  modernCardTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  modernPhotoWrapper: {
    position: 'relative',
  },
  modernPhotoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.card,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.semantic.success,
  },
  modernCardBody: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  specialtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  insuranceFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  insuranceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  feeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  firstAvailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    backgroundColor: theme.colors.semantic.success,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  doctorMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  availabilityRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  availabilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  availabilityChipActive: {
    backgroundColor: theme.colors.primary.main,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  tagText: {
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  primaryCta: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
  },
  secondaryCta: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  ctaLabel: {
    fontWeight: '600',
  },
  stickySummary: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.md,
  },
  stickySummaryTitle: {
    fontWeight: '600',
  },
  stickySummaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: theme.borderRadius.xxxl,
    borderTopRightRadius: theme.borderRadius.xxxl,
    maxHeight: '80%',
    ...theme.shadows.xl,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterList: {
    maxHeight: 400,
  },
  filterItem: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  filterItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterItemTextSelected: {
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterModalActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  clearButton: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border.medium,
  },
  applyButton: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  switchLabel: {
    fontWeight: '500',
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
  },
  filterChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  filterChipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
});

export default DoctorListScreen;
