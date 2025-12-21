import React from 'react';
import {
  Image,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import { theme } from '../theme';
import type { DoctorListItem } from './DoctorListScreen';
import type { HospitalItem } from './SelectHospitalScreen';

export type DoctorInfoScreenProps = {
  onBack: () => void;
  onSchedule: () => void;
  onOpenChat: () => void;
  onSeeAllReviews: () => void;
  doctor?: DoctorListItem | null;
  hospital?: HospitalItem | null;
};

type ReviewItem = {
  id: string;
  author: string;
  rating: string;
  timeLabel: string;
  message: string;
};

export const DOCTOR_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Jessica Jung',
    rating: '4.5',
    timeLabel: '12:35',
    message: 'How would you like us to advise about your health?',
  },
  {
    id: 'rev-2',
    author: 'Push Putichai',
    rating: '4.5',
    timeLabel: '12:35',
    message: 'Thank you for always checking in and providing clear guidance.',
  },
];

const DOCTOR_PROFILE = {
  name: 'Dr. Chikanso Chima',
  rating: '4.5',
  reviewCount: 834,
  summary: 'Psychology and psychiatry, internal medicine and surgery',
  about:
    'Dr. Chikanso has over a decade of experience helping patients with complex mental and internal medicine cases. Her integrative, evidence-based approach blends therapy, medication management, and lifestyle coaching.',
  stats: [
    { label: 'Years practice', value: '12+' },
    { label: 'Patients treated', value: '2.4k' },
    { label: 'Avg. response', value: '< 10 min' },
  ],
  services: ['Psychiatric evaluation', 'Stress management', 'Medication review', 'Lifestyle planning'],
  languages: ['English', 'French', 'Igbo'],
  careFocus: [
    'Blends cognitive behavioral therapy with mindfulness exercises.',
    'Coordinates with primary physicians for holistic treatment.',
    'Provides trauma-informed care with culturally sensitive communication.',
  ],
  education: [
    {
      year: '2014',
      title: 'MD, University of Lagos',
      detail: 'Graduated top 5% of class with honors in psychiatry and internal medicine.',
    },
    {
      year: '2018',
      title: 'Fellowship, Psychosomatic Medicine',
      detail: 'Johns Hopkins Hospital — focus on integrated mental and physical health.',
    },
  ],
  availability: {
    day: 'Today',
    time: '14:00 - 15:30',
    mode: 'Virtual consultation',
  },
};

const DoctorInfoScreen: React.FC<DoctorInfoScreenProps> = ({
  onBack,
  onSchedule,
  onOpenChat,
  onSeeAllReviews,
  doctor,
  hospital,
}) => {
  const [activeTab, setActiveTab] = React.useState<'reviews' | 'thanks'>('reviews');
  const handleShare = React.useCallback(() => {
    Share.share({
      title: 'Tele-Heal Doctor',
      message: 'Check out Dr. Chikanso Chima on Tele-Heal — Psychology and psychiatry specialist.',
    }).catch((error) => {
      console.warn('Share failed', error);
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary" style={styles.headerTitle}>
            Doctor Information
          </ThemedText>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?img=31' }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.profileInfo}>
                <ThemedText variant="headline2" color="primary">
                  {doctor?.name ?? DOCTOR_PROFILE.name}
                </ThemedText>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color={theme.colors.accent.main} />
                  <ThemedText variant="body3" color="primary" style={styles.ratingText}>
                    {(doctor?.rating ?? DOCTOR_PROFILE.rating)} ({doctor?.reviews ?? DOCTOR_PROFILE.reviewCount})
                  </ThemedText>
                </View>
                <View style={styles.detailsRow}>
                  <Ionicons name="person-outline" size={16} color={theme.colors.primary.main} />
                  <ThemedText variant="body4" color="secondary" style={styles.detailText}>
                    {doctor?.specialty ?? DOCTOR_PROFILE.summary}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.chatBadge}
                activeOpacity={0.85}
                onPress={onOpenChat}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary.main} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.tagRow}>
              <TouchableOpacity
                style={[styles.tagChip, activeTab === 'reviews' && styles.tagChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveTab('reviews')}
              >
                <Ionicons
                  name="star-outline"
                  size={16}
                  color={activeTab === 'reviews' ? theme.colors.neutral.white : theme.colors.primary.main}
                />
                <ThemedText
                  variant="body4"
                  color={activeTab === 'reviews' ? 'inverse' : 'primary'}
                  style={styles.tagLabel}
                >
                  Reviews
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tagChip, activeTab === 'thanks' && styles.tagChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveTab('thanks')}
              >
                <Ionicons
                  name="heart-outline"
                  size={16}
                  color={activeTab === 'thanks' ? theme.colors.neutral.white : theme.colors.primary.main}
                />
                <ThemedText
                  variant="body4"
                  color={activeTab === 'thanks' ? 'inverse' : 'primary'}
                  style={styles.tagLabel}
                >
                  Thanks
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.metricRow}>
              {DOCTOR_PROFILE.stats.map((stat) => (
                <View key={stat.label} style={styles.metricCard}>
                  <ThemedText variant="headline3" color="primary" style={styles.metricValue}>
                    {stat.value}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    {stat.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="headline3" color="primary">
                Care focus
              </ThemedText>
            </View>
            <View style={styles.focusList}>
              {DOCTOR_PROFILE.careFocus.map((item) => (
                <View key={item} style={styles.focusRow}>
                  <View style={styles.focusIcon}>
                    <Ionicons name="sparkles-outline" size={14} color={theme.colors.primary.main} />
                  </View>
                  <View style={styles.focusTextWrapper}>
                    <ThemedText variant="body3" color="secondary">
                      {item}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText variant="headline3" color="primary">
                Services & languages
              </ThemedText>
            </View>
            <View style={styles.serviceChipRow}>
              {DOCTOR_PROFILE.services.map((service) => (
                <View key={service} style={styles.serviceChip}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.primary.main} />
                  <ThemedText variant="body4" color="primary">
                    {service}
                  </ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.languagesRow}>
              <Ionicons name="globe-outline" size={18} color={theme.colors.primary.main} />
              <ThemedText variant="body3" color="secondary">
                Languages:
              </ThemedText>
              <View style={styles.languageList}>
                {DOCTOR_PROFILE.languages.map((lang) => (
                  <View key={lang} style={styles.languagePill}>
                    <ThemedText variant="caption1" color="primary">
                      {lang}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="headline3" color="primary">
                Education & certifications
              </ThemedText>
            </View>
            {DOCTOR_PROFILE.education.map((item) => (
              <View key={item.year} style={styles.educationRow}>
                <View style={styles.educationYear}>
                  <ThemedText variant="headline3" color="primary">
                    {item.year}
                  </ThemedText>
                </View>
                <View style={styles.educationDetail}>
                  <ThemedText variant="body2" color="primary" style={styles.educationTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText variant="body3" color="secondary">
                    {item.detail}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="headline3" color="primary">
                Choose a consultation with a Doctor
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.primaryAction}
              activeOpacity={0.9}
              onPress={onOpenChat}
            >
              <View style={styles.primaryActionLeft}>
                <View style={styles.primaryIconWrapper}>
                  <Ionicons name="chatbubble-outline" size={18} color={theme.colors.primary.main} />
                </View>
                <ThemedText variant="body2" color="primary">
                  Chat with Doctor
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.primary.main} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              activeOpacity={0.9}
              onPress={onSchedule}
              disabled={!hospital}
            >
              <View style={styles.primaryActionLeft}>
                <View style={[styles.primaryIconWrapper, styles.secondaryIconWrapper]}>
                  <Ionicons name="videocam-outline" size={18} color={theme.colors.primary.main} />
                </View>
                <View>
                  <ThemedText variant="body2" color={hospital ? 'primary' : 'secondary'}>
                    Schedule video session
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    {hospital ? `At ${hospital.name}` : 'Select a hospital to continue'}
                  </ThemedText>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={hospital ? theme.colors.primary.main : theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="headline3" color="primary">
                About doctor
              </ThemedText>
            </View>
            <ThemedText variant="body3" color="secondary">
              {DOCTOR_PROFILE.about}
            </ThemedText>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText variant="headline3" color="primary">
                Reviews from users
              </ThemedText>
              <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllReviews}>
                <ThemedText variant="body3" color="accent">
                  See all
                </ThemedText>
              </TouchableOpacity>
            </View>
            {DOCTOR_REVIEWS.map((review) => (
              <TouchableOpacity
                key={review.id}
                style={styles.reviewCard}
                activeOpacity={0.85}
                onPress={onSeeAllReviews}
              >
                <View style={styles.reviewAvatarWrapper}>
                  <Ionicons name="person-circle" size={36} color={theme.colors.primary.main} />
                </View>
                <View style={styles.reviewBody}>
                  <View style={styles.reviewHeader}>
                    <ThemedText variant="headline3" color="primary">
                      {review.author}
                    </ThemedText>
                    <View style={styles.reviewMeta}>
                      <Ionicons name="time-outline" size={14} color={theme.colors.accent.main} />
                      <ThemedText variant="caption1" color="accent" style={styles.reviewTime}>
                        {review.timeLabel}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.reviewRatingRow}>
                    <Ionicons name="star" size={14} color={theme.colors.accent.main} />
                    <ThemedText variant="caption1" color="secondary" style={styles.reviewRating}>
                      {review.rating} (834)
                    </ThemedText>
                  </View>
                  <ThemedText variant="body3" color="secondary">
                    {review.message}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.ctaBar}>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.9} onPress={onSchedule}>
            <ThemedText variant="body2" color="inverse">
              Schedule a consultation
            </ThemedText>
          </TouchableOpacity>
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
    paddingVertical: theme.spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral.white,
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
    paddingBottom: theme.spacing.xl * 3,
  },
  profileCard: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    right: 6,
    bottom: 6,
    backgroundColor: theme.colors.semantic.success,
    borderWidth: 2,
    borderColor: theme.colors.neutral.white,
  },
  profileInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  detailText: {
    flex: 1,
  },
  chatBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  tagChipActive: {
    backgroundColor: theme.colors.primary.main,
  },
  tagLabel: {
    fontWeight: '600',
  },
  focusList: {
    gap: theme.spacing.sm,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  focusIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusTextWrapper: {
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
  },
  metricValue: {
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  primaryActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  primaryIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
  },
  secondaryIconWrapper: {
    backgroundColor: 'rgba(13,148,136,0.12)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  specialtyRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  serviceChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
  },
  languagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  languageList: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  languagePill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  reviewCard: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  reviewAvatarWrapper: {
    width: 48,
    alignItems: 'center',
  },
  reviewBody: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  reviewTime: {
    fontWeight: '600',
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  reviewRating: {
    fontWeight: '600',
  },
  educationRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  educationYear: {
    width: 64,
  },
  educationDetail: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  educationTitle: {
    fontWeight: '600',
  },
  availabilityCard: {
    backgroundColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  availabilityIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilityTime: {
    marginBottom: theme.spacing.xs,
  },
  quickBookButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  ctaBar: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.neutral.white,
  },
  ctaButton: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
});

export default DoctorInfoScreen;
