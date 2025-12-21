import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import ThemedCard from '../components/ThemedCard';
import { theme } from '../theme';
import doctorsIllustration from '../../assets/illustrations/onboarding-quality-reputation.png';
import onlineCheckIllustration from '../../assets/illustrations/onboarding-online-health-check.png';
import researchIllustration from '../../assets/illustrations/onboarding-research-deep-testing.png';

const { width } = Dimensions.get('window');

type OnboardingSlide = {
  key: string;
  title: string;
  description: string;
  illustration: ImageSourcePropType;
  highlights: string[];
  gradient: [string, string];
  showButton?: boolean;
};

export interface OnboardingCarouselScreenProps {
  onDone?: () => void;
  onSkip?: () => void;
  onOpenProviderAccess?: () => void;
}

const slides: OnboardingSlide[] = [
  {
    key: 'quality',
    title: 'Quality reputation',
    description:
      'The team of reputable doctors has many years of professional experience.',
    illustration: doctorsIllustration,
    highlights: [
      'Board-certified specialists in every department',
      'Personal care team that knows your history',
    ],
    gradient: [theme.colors.primary.dark, theme.colors.primary.main],
  },
  {
    key: 'online-check',
    title: 'Online health check',
    description: 'Easy and convenient online check-ups right from your home.',
    illustration: onlineCheckIllustration,
    highlights: [
      '24/7 video visits with instant triage',
      'Lab pick-ups and prescriptions delivered',
    ],
    gradient: ['#0F766E', '#059669'],
  },
  {
    key: 'research',
    title: 'Research, deep testing',
    description: "Ensure the most accurate results for you and your family's health.",
    illustration: researchIllustration,
    highlights: [
      'AI-assisted symptom summary before every visit',
      'Secure records that follow you everywhere',
    ],
    gradient: ['#0D9488', theme.colors.accent.coral],
    showButton: true,
  },
];

const OnboardingCarouselScreen: React.FC<OnboardingCarouselScreenProps> = ({
  onDone,
  onSkip,
  onOpenProviderAccess,
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        const index = viewableItems[0].index ?? 0;
        setCurrentIndex(index);
      }
    },
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <ThemedText variant="headline3" color="primary">
            Tele Heal
          </ThemedText>
          {onSkip && (
            <TouchableOpacity activeOpacity={0.85} onPress={onSkip} style={styles.skipButton}>
              <ThemedText variant="body3" color="primary">
                Skip
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
        <Animated.FlatList
          data={slides}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [20, 0, 20],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });

            return (
              <View style={{ width }}>
                <View style={styles.slideInner}>
                  <Animated.View
                    style={[
                      styles.slideContent,
                      { transform: [{ translateY }], opacity },
                    ]}
                  >
                    <LinearGradient colors={item.gradient} style={styles.heroCard}>
                      <View style={styles.heroCopy}>
                        <View style={styles.heroBadge}>
                          <Ionicons name="sparkles-outline" size={14} color={theme.colors.neutral.white} />
                          <ThemedText variant="caption1" color="inverse">
                            {index + 1} / {slides.length}
                          </ThemedText>
                        </View>
                        <ThemedText variant="headline1" color="inverse" style={styles.title}>
                          {item.title}
                        </ThemedText>
                        <ThemedText variant="body2" color="inverse" style={styles.body}>
                          {item.description}
                        </ThemedText>
                      </View>
                      <View style={styles.heroArt}>
                        <View style={styles.heroOrbLarge} />
                        <View style={styles.heroOrbSmall} />
                        <Image source={item.illustration} style={styles.illustration} resizeMode="contain" />
                      </View>
                    </LinearGradient>

                    <ThemedCard style={styles.detailCard}>
                      <ThemedText variant="headline3" color="primary">
                        Why you’ll love it
                      </ThemedText>
                      <View style={styles.chipGrid}>
                        {item.highlights.map((highlight) => (
                          <View key={highlight} style={styles.highlightChip}>
                            <Ionicons name="checkmark-circle" size={14} color={theme.colors.primary.main} />
                            <ThemedText variant="body3" color="secondary" style={styles.chipText}>
                              {highlight}
                            </ThemedText>
                          </View>
                        ))}
                      </View>
                    </ThemedCard>
                  </Animated.View>
                </View>
              </View>
            );
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewConfigRef.current}
        />

        <View style={styles.bottomArea}>
          <Animated.View style={styles.pagination}>
            {slides.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];

              const dotOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.8, 1.2, 0.8],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: dotOpacity,
                      transform: [{ scale }],
                      backgroundColor:
                        currentIndex === index
                          ? theme.colors.primary.main
                          : theme.colors.primary.light,
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          <View style={styles.buttonContainer}>
            {slides[currentIndex]?.showButton && (
              <Animated.View
                style={{
                  opacity: scrollX.interpolate({
                    inputRange: [
                      (slides.length - 2) * width,
                      (slides.length - 1) * width,
                    ],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      translateY: scrollX.interpolate({
                        inputRange: [
                          (slides.length - 2) * width,
                          (slides.length - 1) * width,
                        ],
                        outputRange: [20, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                }}
              >
                <Button
                  label="Get Started"
                  variant="primary"
                  fullWidth
                  onPress={onDone}
                />
              </Animated.View>
            )}
            {onOpenProviderAccess && (
              <TouchableOpacity style={styles.providerLink} activeOpacity={0.8} onPress={onOpenProviderAccess}>
                <ThemedText variant="caption1" color="primary">
                  Are you a provider? Access your invite →
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
  },
  container: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
  },
  topBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  slideInner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  slideContent: {
    flex: 1,
    gap: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  illustration: {
    width: 180,
    height: 180,
    alignSelf: 'flex-end',
  },
  heroCard: {
    minHeight: 380,
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  heroArt: {
    width: 160,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroOrbLarge: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    bottom: 0,
  },
  heroOrbSmall: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    top: 10,
    right: 0,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  body: {
    marginTop: theme.spacing.xs,
  },
  bottomArea: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    height: 72,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing.xs,
  },
  providerLink: {
    marginTop: theme.spacing.sm,
    alignSelf: 'center',
  },
  detailCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  chipGrid: {
    gap: theme.spacing.sm,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  chipText: {
    flex: 1,
  },
});

export default OnboardingCarouselScreen;
