import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import { theme } from '../theme';
import { DOCTOR_REVIEWS } from './DoctorInfoScreen';

type ReviewFilter = 'All' | 'Most recent' | 'Critical';

type DoctorReviewsScreenProps = {
  onBack: () => void;
  onStartChat: () => void;
};

const EXTRA_REVIEWS = [
  ...DOCTOR_REVIEWS,
  {
    id: 'rev-3',
    author: 'Nadia Sule',
    rating: '5.0',
    timeLabel: 'Yesterday',
    message: 'Compassionate and incredibly thorough. She explained every step.',
  },
  {
    id: 'rev-4',
    author: 'Michael Obeng',
    rating: '4.0',
    timeLabel: '3 days ago',
    message: 'Great listener. Follow-up plan felt personalized to my lifestyle.',
  },
  {
    id: 'rev-5',
    author: 'Anita K',
    rating: '3.5',
    timeLabel: '1 week ago',
    message: 'Appointment started late but the advice was still top-notch.',
  },
];

const ReviewCard: React.FC<{
  author: string;
  rating: string;
  timeLabel: string;
  message: string;
}> = ({ author, rating, timeLabel, message }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewAvatar}>
      <Ionicons name="person" size={24} color={theme.colors.primary.main} />
    </View>
    <View style={styles.reviewInfo}>
      <View style={styles.reviewHeader}>
        <ThemedText variant="headline3" color="primary">
          {author}
        </ThemedText>
        <View style={styles.reviewMeta}>
          <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
          <ThemedText variant="caption1" color="secondary">
            {timeLabel}
          </ThemedText>
        </View>
      </View>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={14} color={theme.colors.accent.main} />
        <ThemedText variant="caption1" color="secondary" style={styles.ratingText}>
          {rating}
        </ThemedText>
      </View>
      <ThemedText variant="body3" color="secondary">
        {message}
      </ThemedText>
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.helpfulButton} activeOpacity={0.8}>
          <Ionicons name="thumbs-up-outline" size={14} color={theme.colors.primary.main} />
          <ThemedText variant="caption1" color="primary">
            Helpful
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportButton} activeOpacity={0.8}>
          <ThemedText variant="caption1" color="secondary">
            Report
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const DoctorReviewsScreen: React.FC<DoctorReviewsScreenProps> = ({ onBack, onStartChat }) => {
  const [filter, setFilter] = React.useState<ReviewFilter>('All');

  const filteredReviews = React.useMemo(() => {
    if (filter === 'Most recent') {
      return EXTRA_REVIEWS.slice().sort((a, b) => a.id < b.id ? 1 : -1);
    }
    if (filter === 'Critical') {
      return EXTRA_REVIEWS.filter((review) => parseFloat(review.rating) < 4.0);
    }
    return EXTRA_REVIEWS;
  }, [filter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary" style={styles.headerTitle}>
            Patient reviews
          </ThemedText>
          <TouchableOpacity style={styles.iconButton} onPress={onStartChat} activeOpacity={0.8}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <ThemedText variant="headline1" color="primary">
                4.5
              </ThemedText>
              <ThemedText variant="body3" color="secondary">
                Based on 834 reviews
              </ThemedText>
              <View style={styles.starRow}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Ionicons
                    key={index}
                    name="star"
                    size={14}
                    color={index < 4 ? theme.colors.accent.main : '#E5E7EB'}
                  />
                ))}
              </View>
            </View>
            <View style={styles.summaryRight}>
              {[5, 4, 3, 2, 1].map((score) => (
                <View key={score} style={styles.scoreRow}>
                  <ThemedText variant="caption1" color="secondary" style={styles.scoreLabel}>
                    {score}★
                  </ThemedText>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${score * 15}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            {(['All', 'Most recent', 'Critical'] as ReviewFilter[]).map((option) => {
              const isActive = option === filter;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setFilter(option)}
                  activeOpacity={0.85}
                >
                  <ThemedText variant="body3" color={isActive ? 'inverse' : 'primary'}>
                    {option}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.reviewList}>
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footerBar}>
          <TouchableOpacity style={styles.footerButton} onPress={onStartChat} activeOpacity={0.9}>
            <Ionicons name="chatbubble-outline" size={18} color={theme.colors.neutral.white} />
            <ThemedText variant="body2" color="inverse">
              Continue conversation
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
  summaryCard: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.neutral.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  summaryLeft: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  starRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs / 2,
  },
  summaryRight: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  scoreLabel: {
    width: 32,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  progressFill: {
    height: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent.main,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  reviewList: {
    gap: theme.spacing.md,
  },
  reviewCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral.white,
    ...theme.shadows.sm,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInfo: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontWeight: '600',
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  reportButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
  },
  footerBar: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.neutral.white,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
  },
});

export default DoctorReviewsScreen;
