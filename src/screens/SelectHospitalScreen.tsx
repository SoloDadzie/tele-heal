import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import { theme } from '../theme';

export type SelectHospitalScreenProps = {
  onBack: () => void;
  onSelectHospital: (hospital: HospitalItem) => void;
  selectedHospitalId?: string | null;
};

export type HospitalItem = {
  id: string;
  name: string;
  address: string;
  rating: string;
  reviews: string;
  distance: string;
  image: string;
};

export const HOSPITALS: HospitalItem[] = [
  {
    id: 'hospital-1',
    name: 'Mayao Clinic, Rochester',
    address: '99 Crown Street London city',
    rating: '4.5',
    reviews: '834',
    distance: '2 km',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hospital-2',
    name: 'Cleveland Clinic',
    address: '99 Crown Street London city',
    rating: '4.5',
    reviews: '834',
    distance: '12 km',
    image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hospital-3',
    name: 'John Hopkins Hospital',
    address: '99 Crown Street London city',
    rating: '4.5',
    reviews: '834',
    distance: '8 km',
    image: 'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hospital-4',
    name: 'UCSF Medical Center',
    address: '99 Crown Street London city',
    rating: '4.5',
    reviews: '834',
    distance: '2 km',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hospital-5',
    name: 'UCLA Medical Center',
    address: '99 Crown Street London city',
    rating: '4.5',
    reviews: '834',
    distance: '16 km',
    image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=600&q=80',
  },
];

const SelectHospitalScreen: React.FC<SelectHospitalScreenProps> = ({
  onBack,
  onSelectHospital,
  selectedHospitalId,
}) => {
  const [activeSort, setActiveSort] = React.useState<'Nearest' | 'Top Rated'>('Nearest');
  const [selectedHospital, setSelectedHospital] = React.useState<string | null>(selectedHospitalId ?? null);

  const handleSelect = (hospital: HospitalItem) => {
    setSelectedHospital(hospital.id);
    onSelectHospital(hospital);
  };

  const sortedHospitals = React.useMemo(() => {
    if (activeSort === 'Top Rated') {
      return [...HOSPITALS].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }
    return HOSPITALS;
  }, [activeSort]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary" style={styles.headerTitle}>
            Select Hospital
          </ThemedText>
          <TouchableOpacity
            style={styles.sortPill}
            onPress={() => setActiveSort(activeSort === 'Nearest' ? 'Top Rated' : 'Nearest')}
            activeOpacity={0.85}
          >
            <ThemedText variant="body3" color="primary" style={styles.sortText}>
              {activeSort}
            </ThemedText>
            <Ionicons name="chevron-down" size={16} color={theme.colors.primary.main} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedHospitals.map((hospital) => {
            const isSelected = selectedHospital === hospital.id;
            return (
              <TouchableOpacity
                key={hospital.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                activeOpacity={0.9}
                onPress={() => handleSelect(hospital)}
              >
                <Image source={{ uri: hospital.image }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <ThemedText variant="headline3" color="primary" style={styles.cardTitle} numberOfLines={1}>
                    {hospital.name}
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary" numberOfLines={1}>
                    {hospital.address}
                  </ThemedText>
                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Ionicons name="star" size={12} color={theme.colors.accent.main} />
                      <ThemedText variant="caption1" color="primary" style={styles.metaLabel}>
                        {hospital.rating} ({hospital.reviews})
                      </ThemedText>
                    </View>
                    <View style={styles.metaChip}>
                      <Ionicons name="location" size={12} color={theme.colors.primary.main} />
                      <ThemedText variant="caption1" color="primary" style={styles.metaLabel}>
                        {hospital.distance}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.sm,
  },
  sortText: {
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  metaLabel: {
    fontWeight: '600',
  },
});

export default SelectHospitalScreen;
