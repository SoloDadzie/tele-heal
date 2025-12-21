import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import SectionHeader from '../components/SectionHeader';
import { theme } from '../theme';

export type ServiceScreenProps = {
  onBack: () => void;
  onOpenSelectHospital: () => void;
  onOpenDoctorList: () => void;
};

type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  testsCount: number;
  price: string;
  popular?: boolean;
};

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'blood-test',
    name: 'Complete Blood Count',
    description: 'Comprehensive blood analysis for anemia, infections & more',
    icon: 'water',
    testsCount: 13,
    price: '$ 120',
    popular: true,
  },
  {
    id: 'thyroid',
    name: 'Thyroid Function',
    description: 'TSH, T3, T4 levels to check thyroid health',
    icon: 'fitness',
    testsCount: 5,
    price: '$ 85',
  },
  {
    id: 'diabetes',
    name: 'Diabetes Screening',
    description: 'Glucose, HbA1c tests for diabetes monitoring',
    icon: 'pulse',
    testsCount: 4,
    price: '$ 95',
    popular: true,
  },
  {
    id: 'liver',
    name: 'Liver Function',
    description: 'Comprehensive liver enzyme & protein analysis',
    icon: 'medical',
    testsCount: 8,
    price: '$ 110',
  },
  {
    id: 'kidney',
    name: 'Kidney Function',
    description: 'Creatinine, urea & electrolyte balance tests',
    icon: 'heart-circle',
    testsCount: 6,
    price: '$ 100',
  },
  {
    id: 'vitamin',
    name: 'Vitamin Panel',
    description: 'Vitamin D, B12, folate & essential nutrients',
    icon: 'nutrition',
    testsCount: 7,
    price: '$ 150',
  },
];

const LOCATIONS = ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Bristol', 'Liverpool', 'Glasgow'];

const ServiceScreen: React.FC<ServiceScreenProps> = ({ onBack, onOpenSelectHospital, onOpenDoctorList }) => {
  const [selectedLocation, setSelectedLocation] = React.useState('London');
  const [tempLocation, setTempLocation] = React.useState('London');
  const [isLocationModalVisible, setIsLocationModalVisible] = React.useState(false);

  const quickFilters = React.useMemo(
    () => ['Popular', 'Fast results', 'At-home kit', 'Budget friendly'],
    [],
  );

  const heroStats = React.useMemo(
    () => [
      { id: 'labs', label: 'Partner labs', value: '24' },
      { id: 'slots', label: 'Same-day slots', value: '08' },
      { id: 'specialists', label: 'Specialists', value: '18' },
    ],
    [],
  );

  const openLocationModal = () => {
    setTempLocation(selectedLocation);
    setIsLocationModalVisible(true);
  };

  const closeLocationModal = () => setIsLocationModalVisible(false);

  const handleSelectLocation = () => {
    setSelectedLocation(tempLocation);
    setIsLocationModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <ThemedText variant="headline2" color="primary">
              Medical services
            </ThemedText>
            <ThemedText variant="caption1" color="secondary">
              Book labs, screenings, and visits
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.locationPill} activeOpacity={0.85} onPress={openLocationModal}>
            <Ionicons name="location-outline" size={16} color={theme.colors.neutral.white} />
            <ThemedText variant="caption1" color="inverse">
              {selectedLocation}
            </ThemedText>
            <Ionicons name="chevron-down" size={14} color={theme.colors.neutral.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[theme.colors.primary.dark, theme.colors.primary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles-outline" size={14} color={theme.colors.neutral.white} />
                <ThemedText variant="caption1" color="inverse">
                  Diagnostics on demand
                </ThemedText>
              </View>
              <ThemedText variant="headline1" color="inverse">
                Get tests without the waiting room
              </ThemedText>
              <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
                Book lab visits, kit drop-offs, or specialist consults. Results sync automatically to your chart.
              </ThemedText>
            </View>
            <View style={styles.heroStatsRow}>
              {heroStats.map((stat) => (
                <View key={stat.id} style={styles.heroStat}>
                  <ThemedText variant="headline3" color="inverse">
                    {stat.value}
                  </ThemedText>
                  <ThemedText variant="caption1" color="inverse" style={styles.heroStatLabel}>
                    {stat.label}
                  </ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity style={[styles.heroActionButton, styles.heroActionLight]} activeOpacity={0.9} onPress={onOpenDoctorList}>
                <Ionicons name="people-outline" size={18} color={theme.colors.primary.main} />
                <ThemedText variant="body3" color="primary">
                  Browse doctors
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.heroActionButton, styles.heroActionDark]} activeOpacity={0.9} onPress={onOpenSelectHospital}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.neutral.white} />
                <ThemedText variant="body3" color="inverse">
                  Schedule visit
                </ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ThemedCard>
            <SectionHeader
              title="Filters"
              subtitle="Narrow services by preference."
              icon="options-outline"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {quickFilters.map((filter) => (
                <View key={filter} style={styles.filterChip}>
                  <ThemedText variant="body3" color="primary">
                    {filter}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          </ThemedCard>

          <SectionHeader
            title="Popular panels"
            subtitle="Hand picked tests and screenings."
            icon="flask-outline"
            style={styles.sectionHeader}
          />

          <View style={styles.categoryGrid}>
            {SERVICE_CATEGORIES.map((category) => (
              <ThemedCard key={category.id} style={styles.categoryCard}>
                {category.popular && (
                  <View style={styles.popularBadge}>
                    <ThemedText variant="caption2" color="inverse">
                      Popular
                    </ThemedText>
                  </View>
                )}
                <TouchableOpacity activeOpacity={0.9} onPress={onOpenSelectHospital} style={styles.categoryTouchable}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryIconWrapper}>
                      <Ionicons name={category.icon} size={22} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.categoryHeaderText}>
                      <ThemedText variant="headline3" color="primary">
                        {category.name}
                      </ThemedText>
                      <View style={styles.categoryMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="flask-outline" size={14} color={theme.colors.text.secondary} />
                          <ThemedText variant="caption1" color="secondary">
                            {category.testsCount} tests
                          </ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                          <ThemedText variant="caption1" color="secondary">
                            Avg 24h results
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>

                  <ThemedText variant="body3" color="secondary" style={styles.categoryDescription} numberOfLines={2}>
                    {category.description}
                  </ThemedText>

                  <View style={styles.categoryFooter}>
                    <View style={styles.priceTag}>
                      <ThemedText variant="caption1" color="secondary">
                        Starting from
                      </ThemedText>
                      <ThemedText variant="headline3" color="primary" style={styles.categoryPrice}>
                        {category.price}
                      </ThemedText>
                    </View>
                    <View style={styles.bookNowButton}>
                      <ThemedText variant="body3" color="inverse">
                        Book now
                      </ThemedText>
                      <Ionicons name="arrow-forward" size={16} color={theme.colors.neutral.white} />
                    </View>
                  </View>
                </TouchableOpacity>
              </ThemedCard>
            ))}
          </View>
        </ScrollView>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isLocationModalVisible}
        onRequestClose={closeLocationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModalCard}>
            <ThemedText variant="headline2" color="primary" style={styles.modalTitle}>
              Locate
            </ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {LOCATIONS.map((location) => {
                const isActive = tempLocation === location;
                return (
                  <TouchableOpacity
                    key={location}
                    style={styles.locationRow}
                    onPress={() => setTempLocation(location)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.locationLeft}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={isActive ? theme.colors.primary.main : theme.colors.text.secondary}
                      />
                      <ThemedText
                        variant="body2"
                        color={isActive ? 'primary' : 'secondary'}
                        style={styles.locationLabel}
                      >
                        {location}
                      </ThemedText>
                    </View>
                    {isActive && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={theme.colors.primary.main}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closeLocationModal} activeOpacity={0.85}>
                <ThemedText variant="body2" color="primary">
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSelectButton} onPress={handleSelectLocation} activeOpacity={0.85}>
                <ThemedText variant="body2" color="inverse">
                  Select
                </ThemedText>
              </TouchableOpacity>
            </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
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
  topBarCenter: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
    gap: theme.spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.sm,
  },
  heroGradient: {
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  heroHeader: {
    gap: theme.spacing.sm,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  heroSubtitle: {
    opacity: 0.95,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  heroStat: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: theme.spacing.md,
  },
  heroStatLabel: {
    opacity: 0.8,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  heroActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  heroActionLight: {
    backgroundColor: theme.colors.background.card,
  },
  heroActionDark: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  categoryGrid: {
    gap: theme.spacing.lg,
  },
  categoryCard: {
    padding: theme.spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryTouchable: {
    gap: theme.spacing.md,
  },
  popularBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.accent.main,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    zIndex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  categoryIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  categoryHeaderText: {
    flex: 1,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs / 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  categoryDescription: {
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceTag: {
    flex: 1,
  },
  categoryPrice: {
    marginTop: theme.spacing.xs / 2,
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  locationModalCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  locationLabel: {
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  modalSelectButton: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
});

export default ServiceScreen;
