import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ThemedText from '../components/ThemedText';
import TabBar from '../components/TabBar';
import ThemedCard from '../components/ThemedCard';
import SectionHeader from '../components/SectionHeader';
import ErrorAlert from '../components/ErrorAlert';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, getMessages, getConversations, markConversationAsRead } from '../services/messaging';
import { subscribeToMessages } from '../services/realtime';

export type ChatThread = {
  id: string;
  name: string;
  lastMessage: string;
  timeLabel: string;
  unreadCount?: number;
  online?: boolean;
  specialty?: string;
  pinned?: boolean;
};

export type ChatMessage = {
  id: string;
  from: 'doctor' | 'self';
  text?: string;
  imageUri?: string;
};

export type ChatScreenProps = {
  onGoHome: () => void;
  onOpenSchedule: () => void;
  onOpenProfile: () => void;
};

const mockThreads: ChatThread[] = [
  {
    id: 't-1',
    name: 'Jessica Jung',
    lastMessage: 'How would you like us to advise about your health?',
    timeLabel: '12:35',
    unreadCount: 2,
    online: true,
    specialty: 'General health',
    pinned: true,
  },
  {
    id: 't-2',
    name: 'Dr. Sarah Johnson',
    lastMessage: 'Your blood test results are ready to review.',
    timeLabel: '11:10',
    unreadCount: 0,
    online: true,
    specialty: 'Lab results',
    pinned: true,
  },
  {
    id: 't-3',
    name: 'Dr. Mark Lee',
    lastMessage: "Let's schedule your follow-up appointment.",
    timeLabel: '09:45',
    unreadCount: 1,
    specialty: 'Dental care',
  },
  {
    id: 't-4',
    name: 'Dr. Amina Khan',
    lastMessage: 'Please remember to stay hydrated today.',
    timeLabel: 'Yesterday',
    unreadCount: 0,
    specialty: 'Nutrition',
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: 'm-1',
    from: 'doctor',
    text: 'How would you like us to advise about your health?',
  },
  {
    id: 'm-2',
    from: 'self',
    text: "I'd like some advice about managing my stress levels.",
  },
];

const ChatScreen: React.FC<ChatScreenProps> = ({ onGoHome, onOpenSchedule, onOpenProfile }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('chat');
  const [mode, setMode] = React.useState<'list' | 'conversation'>('list');
  const [selectedThread, setSelectedThread] = React.useState<ChatThread | null>(null);
  const [threads, setThreads] = React.useState<ChatThread[]>(mockThreads);
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'All' | 'Unread' | 'Pinned'>('All');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);

  // Load conversations from Supabase
  React.useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const result = await getConversations(user.id);

        if (result.success && result.data) {
          const formattedThreads: ChatThread[] = result.data.map((conv: any) => ({
            id: conv.id,
            name: conv.other_user_name || 'Unknown',
            lastMessage: conv.last_message || 'No messages yet',
            timeLabel: new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: conv.unread_count || 0,
            online: conv.is_online || false,
            specialty: conv.other_user_specialty || undefined,
          }));

          setThreads(formattedThreads);
        }
      } catch (err: any) {
        setError({
          title: 'Load Failed',
          message: err.message || 'Failed to load conversations.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user?.id]);

  // Load messages when thread is selected
  React.useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id || !selectedThread) return;

      try {
        const result = await getMessages(user.id, selectedThread.id);

        if (result.success && result.data) {
          const formattedMessages: ChatMessage[] = result.data.map((msg: any) => ({
            id: msg.id,
            from: msg.sender_id === user.id ? 'self' : 'doctor',
            text: msg.content || undefined,
            imageUri: msg.image_url || undefined,
          }));

          setMessages(formattedMessages);

          // Mark conversation as read
          await markConversationAsRead(user.id, selectedThread.id);

          // Update thread to remove unread count
          setThreads((prev) =>
            prev.map((t) =>
              t.id === selectedThread.id ? { ...t, unreadCount: 0 } : t
            )
          );
        }
      } catch (err: any) {
        setError({
          title: 'Load Failed',
          message: err.message || 'Failed to load messages.',
        });
      }
    };

    loadMessages();

    // Subscribe to new messages
    if (user?.id && selectedThread) {
      const subscription = subscribeToMessages(user.id, (newMessage) => {
        if (newMessage.conversation_id === selectedThread.id) {
          setMessages((prev) => [
            ...prev,
            {
              id: newMessage.id,
              from: newMessage.sender_id === user.id ? 'self' : 'doctor',
              text: newMessage.content || undefined,
              imageUri: newMessage.image_url || undefined,
            },
          ]);
        }
      });

      return () => {
        if (subscription) {
          // Unsubscribe logic would go here
        }
      };
    }
  }, [user?.id, selectedThread]);

  const filteredThreads = React.useMemo(() => {
    if (activeFilter === 'Unread') {
      return threads.filter((thread) => (thread.unreadCount ?? 0) > 0);
    }
    if (activeFilter === 'Pinned') {
      return threads.filter((thread) => thread.pinned);
    }
    return threads;
  }, [activeFilter, threads]);

  const pinnedThreads = React.useMemo(
    () => threads.filter((thread) => thread.pinned),
    [threads],
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
    } else if (key === 'profile') {
      setActiveTab('profile');
      onOpenProfile();
    } else {
      setActiveTab(key);
    }
  };

  const handleOpenThread = (thread: ChatThread) => {
    setSelectedThread(thread);
    setMessages(initialMessages);
    setMode('conversation');
  };

  const quickActions = React.useMemo(
    () => [
      {
        id: 'action-new',
        label: 'Start new chat',
        description: 'Ping your care team',
        icon: 'chatbubble-ellipses-outline' as keyof typeof Ionicons.glyphMap,
        onPress: () => {
          const target = pinnedThreads[0] ?? mockThreads[0];
          if (target) handleOpenThread(target);
        },
      },
      {
        id: 'action-video',
        label: 'Join video room',
        description: 'Hop into a live session',
        icon: 'videocam-outline' as keyof typeof Ionicons.glyphMap,
        onPress: onOpenSchedule,
      },
      {
        id: 'action-profile',
        label: 'Update profile',
        description: 'Share latest records',
        icon: 'person-circle-outline' as keyof typeof Ionicons.glyphMap,
        onPress: onOpenProfile,
      },
    ],
    [handleOpenThread, onOpenProfile, onOpenSchedule, pinnedThreads],
  );

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      from: 'self',
      text: trimmed,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  const appendImageMessage = (uri: string) => {
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      from: 'self',
      imageUri: uri,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const getImageMediaType = () =>
    (ImagePicker as any).MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;

  const handleOpenCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: getImageMediaType(),
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          appendImageMessage(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error opening camera', error);
    }
  };

  const handleOpenLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getImageMediaType(),
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          appendImageMessage(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error opening media library', error);
    }
  };

  const renderList = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#14b8a6', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextBlock}>
            <ThemedText variant="headline1" color="inverse">
              Messages
            </ThemedText>
            <ThemedText variant="body3" color="inverse" style={styles.heroSubtitle}>
              Continue healthy conversations
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.heroAction} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={22} color={theme.colors.primary.main} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <ThemedText variant="headline2" color="inverse">
              14
            </ThemedText>
            <ThemedText variant="caption1" color="inverse">
              Active doctors
            </ThemedText>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <ThemedText variant="headline2" color="inverse">
              05
            </ThemedText>
            <ThemedText variant="caption1" color="inverse">
              Unread chats
            </ThemedText>
          </View>
        </View>
        <View style={styles.heroActionsRow}>
          <TouchableOpacity style={styles.heroQuickAction} activeOpacity={0.85}>
            <Ionicons name="videocam-outline" size={18} color={theme.colors.primary.main} />
            <ThemedText variant="body4" color="primary">
              Video room
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroQuickAction} activeOpacity={0.85}>
            <Ionicons name="document-text-outline" size={18} color={theme.colors.primary.main} />
            <ThemedText variant="body4" color="primary">
              Share files
            </ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.colors.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search threads or doctors"
          placeholderTextColor={theme.colors.text.secondary}
        />
      </View>

      <ThemedCard style={styles.quickActionsCard}>
        <SectionHeader
          title="Care shortcuts"
          subtitle="Jump to the most common messaging tools."
          icon="flash-outline"
        />
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionTile}
              activeOpacity={0.9}
              onPress={action.onPress}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={18} color={theme.colors.primary.main} />
              </View>
              <View style={styles.quickActionText}>
                <ThemedText variant="body2" color="primary">
                  {action.label}
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  {action.description}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedCard>

      {pinnedThreads.length > 0 && (
        <ThemedCard style={styles.pinnedCard}>
          <SectionHeader
            title="Pinned specialists"
            subtitle="Recently active conversations from your care team."
            icon="bookmark-outline"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pinnedList}
            style={styles.pinnedScroll}
          >
            {pinnedThreads.map((thread) => (
              <TouchableOpacity
                key={`pinned-${thread.id}`}
                style={styles.pinnedChip}
                activeOpacity={0.85}
                onPress={() => handleOpenThread(thread)}
              >
                <View style={styles.pinnedAvatar}>
                  <ThemedText variant="caption2" color="inverse">
                    {thread.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText variant="body4" color="primary" numberOfLines={1}>
                  {thread.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedCard>
      )}

      <ThemedCard style={styles.threadCollectionCard}>
        <SectionHeader
          title="Conversations"
          subtitle="All secure threads with your providers."
          icon="chatbubble-ellipses-outline"
        />
        <View style={styles.filterRow}>
          {(['All', 'Unread', 'Pinned'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.85}
              >
                <ThemedText
                  variant="body3"
                  color={isActive ? 'inverse' : 'secondary'}
                  style={styles.filterLabel}
                >
                  {filter}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.threadStack}>
          {filteredThreads.map((thread) => (
            <TouchableOpacity
              key={thread.id}
              style={styles.threadCard}
              activeOpacity={0.9}
              onPress={() => handleOpenThread(thread)}
            >
              <View style={styles.threadAvatarWrapper}>
                <View style={styles.threadAvatar}>
                  <Ionicons name="person-outline" size={26} color={theme.colors.neutral.white} />
                </View>
                {thread.online && <View style={styles.presenceDot} />}
              </View>
              <View style={styles.threadMain}>
                <View style={styles.threadNameRow}>
                  <ThemedText variant="headline3" color="primary" style={styles.threadName}>
                    {thread.name}
                  </ThemedText>
                  <View style={styles.threadMeta}>
                    <ThemedText variant="caption1" color="secondary">
                      {thread.timeLabel}
                    </ThemedText>
                    {thread.unreadCount ? (
                      <View style={styles.unreadBadge}>
                        <ThemedText variant="caption2" color="inverse">
                          {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                </View>
                <ThemedText variant="body4" color="secondary" style={styles.threadSpecialty}>
                  {thread.specialty}
                </ThemedText>
                <ThemedText
                  variant="body3"
                  color="secondary"
                  numberOfLines={2}
                  style={styles.threadPreview}
                >
                  {thread.lastMessage}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedCard>
    </ScrollView>
  );

  const renderConversation = () => (
    <View style={styles.content}>
      <LinearGradient
        colors={['#f8fafc', '#e0f2f1']}
        style={styles.conversationGradient}
      >
        <View style={styles.conversationSurface}>
        <View style={styles.conversationHeaderCard}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={() => setMode('list')}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <View style={styles.conversationHeaderInfo}>
            <ThemedText variant="headline2" color="primary">
              {selectedThread?.name ?? 'Chat'}
            </ThemedText>
            <View style={styles.presenceRow}>
              <View style={[styles.presenceDot, styles.presenceDotLarge]} />
              <ThemedText variant="caption2" color="secondary">
                {selectedThread?.online ? 'Online now' : 'Typically replies in 5 mins'}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.8}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.colors.primary.main}
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.conversationBody}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <View style={styles.conversationDateChip}>
            <ThemedText variant="caption1" color="secondary">
              Today
            </ThemedText>
          </View>
          <ScrollView
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => {
              const isSelf = message.from === 'self';
              const doctorInitial =
                selectedThread?.name?.[0]?.toUpperCase() ?? 'D';
              const bubbleContent = (
                <>
                  {message.imageUri && (
                    <Image
                      source={{ uri: message.imageUri }}
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  )}
                  {message.text ? (
                    <ThemedText
                      variant="body3"
                      color="primary"
                      style={styles.messageText}
                    >
                      {message.text}
                    </ThemedText>
                  ) : null}
                </>
              );

              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    isSelf ? styles.messageRowSelf : styles.messageRowDoctor,
                  ]}
                >
                  {!isSelf && (
                    <View style={styles.messageAvatar}>
                      <ThemedText variant="caption2" color="inverse">
                        {doctorInitial}
                      </ThemedText>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      isSelf ? styles.messageBubbleSelf : styles.messageBubbleDoctor,
                    ]}
                  >
                    {bubbleContent}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.inputBarWrapper}>
            <View style={styles.inputBar}>
              <TouchableOpacity
                style={styles.inputIconButton}
                activeOpacity={0.8}
                onPress={handleOpenLibrary}
              >
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.inputIconButton}
                activeOpacity={0.8}
                onPress={handleOpenCamera}
              >
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Ask anything..."
                placeholderTextColor={theme.colors.text.secondary}
                value={inputValue}
                onChangeText={setInputValue}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, inputValue.trim() && styles.sendButtonActive]}
                activeOpacity={inputValue.trim() ? 0.8 : 1}
                onPress={handleSend}
              >
                <Ionicons
                  name="paper-plane-outline"
                  size={20}
                  color={
                    inputValue.trim()
                      ? theme.colors.neutral.white
                      : theme.colors.text.secondary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {mode === 'list' ? renderList() : renderConversation()}
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
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  heroCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xxxl,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTextBlock: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  heroSubtitle: {
    marginTop: theme.spacing.xs,
    opacity: 0.9,
  },
  heroAction: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  heroStat: {
    flex: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: theme.spacing.lg,
  },
  heroActionsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  heroQuickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  quickActionsCard: {
    paddingVertical: theme.spacing.lg,
  },
  quickActionsGrid: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  quickActionTile: {
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
  pinnedCard: {
    paddingVertical: theme.spacing.lg,
  },
  pinnedScroll: {
    marginTop: theme.spacing.md,
  },
  filterChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  filterLabel: {
    fontWeight: '600',
  },
  pinnedList: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  pinnedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  pinnedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadCollectionCard: {
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  threadStack: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.muted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  threadAvatarWrapper: {
    marginRight: theme.spacing.sm,
  },
  threadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presenceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.background.card,
    backgroundColor: theme.colors.semantic.success,
    position: 'absolute',
    right: 2,
    bottom: 0,
  },
  threadMain: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  threadNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  threadName: {
    marginBottom: theme.spacing.xs,
    fontWeight: '700',
  },
  threadSpecialty: {
    marginBottom: theme.spacing.xs / 2,
  },
  threadPreview: {},
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  unreadBadge: {
    marginLeft: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.semantic.info,
  },
  conversationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  conversationTitle: {
    flex: 1,
    textAlign: 'center',
  },
  conversationGradient: {
    flex: 1,
    borderTopLeftRadius: theme.borderRadius.xxxl,
    borderTopRightRadius: theme.borderRadius.xxxl,
    overflow: 'hidden',
  },
  conversationSurface: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  conversationHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
  },
  conversationHeaderInfo: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  presenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  presenceDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: 'transparent',
  },
  conversationBody: {
    flex: 1,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  conversationDateChip: {
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  messageRowDoctor: {
    justifyContent: 'flex-start',
  },
  messageRowSelf: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  messageBubbleDoctor: {
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  messageBubbleSelf: {
    backgroundColor: '#DCFCE7',
    borderWidth: 0,
  },
  messageText: {
    lineHeight: 20,
    color: theme.colors.neutral.darkest,
  },
  messageImage: {
    width: 180,
    height: 180,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xs,
  },
  inputBarWrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colors.background.muted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  inputIconButton: {
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  sendButtonActive: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.sm,
  },
});

export default ChatScreen;
