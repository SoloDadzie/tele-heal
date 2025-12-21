import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import { theme } from '../theme';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
};

export type NotificationScreenProps = {
  onBack: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  onMarkAllAsRead: () => void;
};

const NotificationScreen: React.FC<NotificationScreenProps> = ({
  onBack,
  notifications,
  onMarkAsRead,
  onRemove,
  onMarkAllAsRead,
}) => {
  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const hasNotifications = notifications.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} activeOpacity={0.85} onPress={onBack}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary">
            Notifications
          </ThemedText>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[theme.colors.primary.dark, theme.colors.primary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles-outline" size={14} color={theme.colors.neutral.white} />
              <ThemedText variant="caption1" color="inverse">
                Inbox overview
              </ThemedText>
            </View>
            <ThemedText variant="headline1" color="inverse">
              {unreadCount ? `${unreadCount} new alerts` : 'All caught up'}
            </ThemedText>
            <ThemedText variant="body2" color="inverse" style={styles.heroSubtitle}>
              {unreadCount
                ? 'Tap any card to mark it read or triage.'
                : 'Nothing needs your attention right now.'}
            </ThemedText>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaCard}>
                <Ionicons name="notifications-outline" size={16} color={theme.colors.neutral.white} />
                <View>
                  <ThemedText variant="headline3" color="inverse">
                    {notifications.length}
                  </ThemedText>
                  <ThemedText variant="caption1" color="inverse">
                    Total updates
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.heroMetaCard, styles.heroMetaCardAction]}
                activeOpacity={unreadCount ? 0.85 : 1}
                onPress={unreadCount ? onMarkAllAsRead : undefined}
              >
                <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.neutral.white} />
                <ThemedText variant="body2" color="inverse">
                  Mark all as read
                </ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {hasNotifications ? (
            notifications.map((item) => {
              const isUnread = !item.read;
              return (
                <ThemedCard
                  key={item.id}
                  style={[styles.notificationCard, isUnread && styles.notificationCardUnread]}
                >
                  <TouchableOpacity
                    activeOpacity={0.95}
                    onPress={() => {
                      if (isUnread) {
                        onMarkAsRead(item.id);
                      }
                    }}
                  >
                    <View style={styles.notificationHeaderRow}>
                      <View style={styles.notificationTitleBlock}>
                        <ThemedText variant="body2" color="primary" style={styles.notificationTitle}>
                          {item.title}
                        </ThemedText>
                        <ThemedText variant="body3" color="secondary" style={styles.notificationBody}>
                          {item.body}
                        </ThemedText>
                      </View>
                      <View style={styles.timeAndDotRow}>
                        {isUnread && <View style={styles.unreadDot} />}
                        <ThemedText variant="caption1" color="secondary">
                          {item.timeLabel}
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.notificationFooterRow}>
                    <TouchableOpacity
                      style={styles.footerAction}
                      activeOpacity={0.85}
                      onPress={() => onRemove(item.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.colors.text.secondary} />
                      <ThemedText variant="caption1" color="secondary">
                        Remove
                      </ThemedText>
                    </TouchableOpacity>
                    {isUnread && (
                      <TouchableOpacity
                        style={styles.footerAction}
                        activeOpacity={0.85}
                        onPress={() => onMarkAsRead(item.id)}
                      >
                        <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.primary.main} />
                        <ThemedText variant="caption1" color="primary">
                          Mark read
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                </ThemedCard>
              );
            })
          ) : (
            <ThemedCard style={styles.emptyCard}>
              <Ionicons name="notifications-off-outline" size={32} color={theme.colors.primary.main} />
              <ThemedText variant="headline3" color="primary">
                No notifications yet
              </ThemedText>
              <ThemedText variant="body2" color="secondary" style={styles.emptyBody}>
                When you have updates from your doctors, you'll see them here.
              </ThemedText>
            </ThemedCard>
          )}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  topBarSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 1.5,
    gap: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroSubtitle: {
    opacity: 0.9,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  heroMetaCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  heroMetaCardAction: {
    justifyContent: 'center',
  },
  notificationCard: {
    gap: theme.spacing.sm,
  },
  notificationCardUnread: {
    borderColor: theme.colors.primary.light,
    borderWidth: 1,
  },
  notificationTitle: {
    flex: 1,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  notificationTitleBlock: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  notificationBody: {
    lineHeight: 20,
  },
  timeAndDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.main,
  },
  notificationFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  emptyBody: {
    textAlign: 'center',
  },
});

export default NotificationScreen;
