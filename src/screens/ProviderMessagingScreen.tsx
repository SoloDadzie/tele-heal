import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import { theme } from '../theme';

type Message = {
  id: string;
  patientName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar?: string;
};

type ConversationMessage = {
  id: string;
  author: 'provider' | 'patient';
  text: string;
  timestamp: string;
};

export type ProviderMessagingScreenProps = {
  onBack?: () => void;
};

const MOCK_CONVERSATIONS: Message[] = [
  {
    id: 'conv-1',
    patientName: 'Ama Mensah',
    lastMessage: 'Thanks for the migraine tips, doctor!',
    timestamp: 'Just now',
    unread: true,
  },
  {
    id: 'conv-2',
    patientName: 'Linda Asare',
    lastMessage: 'I\'ll check my BP daily as recommended.',
    timestamp: '2h ago',
    unread: false,
  },
  {
    id: 'conv-3',
    patientName: 'Kwesi Boateng',
    lastMessage: 'The rash is improving, thanks!',
    timestamp: 'Yesterday',
    unread: false,
  },
];

const MOCK_MESSAGES: Record<string, ConversationMessage[]> = {
  'conv-1': [
    {
      id: 'm1',
      author: 'provider',
      text: 'Hi Ama, I\'ve reviewed your intake. Let\'s discuss your migraine triggers.',
      timestamp: '09:15 AM',
    },
    {
      id: 'm2',
      author: 'patient',
      text: 'Sure doctor, bright lights seem to trigger them.',
      timestamp: '09:18 AM',
    },
    {
      id: 'm3',
      author: 'provider',
      text: 'Good observation. Try wearing sunglasses and reducing screen time. Also, stay hydrated.',
      timestamp: '09:20 AM',
    },
    {
      id: 'm4',
      author: 'patient',
      text: 'Thanks for the migraine tips, doctor!',
      timestamp: '09:22 AM',
    },
  ],
};

const ProviderMessagingScreen: React.FC<ProviderMessagingScreenProps> = ({ onBack }) => {
  const [selectedConversation, setSelectedConversation] = React.useState<string | null>(null);
  const [messageText, setMessageText] = React.useState('');
  const [conversations, setConversations] = React.useState<Message[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = React.useState<Record<string, ConversationMessage[]>>(MOCK_MESSAGES);

  const unreadCount = conversations.filter((c) => c.unread).length;

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: ConversationMessage = {
      id: `m${Date.now()}`,
      author: 'provider',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMessage],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? { ...conv, lastMessage: messageText, timestamp: 'Just now', unread: false }
          : conv
      )
    );

    setMessageText('');
  };

  const currentConversation = selectedConversation
    ? conversations.find((c) => c.id === selectedConversation)
    : null;
  const currentMessages = selectedConversation ? messages[selectedConversation] || [] : [];

  if (selectedConversation && currentConversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSelectedConversation(null)}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <View style={styles.topBarText}>
            <ThemedText variant="headline3" color="primary">
              {currentConversation.patientName}
            </ThemedText>
            <ThemedText variant="caption1" color="secondary">
              Patient
            </ThemedText>
          </View>
          <View style={styles.navButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {currentMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.author === 'provider' ? styles.messageBubbleProvider : styles.messageBubblePatient,
              ]}
            >
              <ThemedText
                variant="body3"
                color={msg.author === 'provider' ? 'inverse' : 'primary'}
              >
                {msg.text}
              </ThemedText>
              <ThemedText
                variant="caption2"
                color={msg.author === 'provider' ? 'inverse' : 'secondary'}
                style={styles.messageTime}
              >
                {msg.timestamp}
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text.secondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            activeOpacity={0.85}
          >
            <Ionicons
              name="send"
              size={18}
              color={messageText.trim() ? theme.colors.neutral.white : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          Messages
        </ThemedText>
        {unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <ThemedText variant="caption2" color="inverse">
                {unreadCount}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <ThemedCard style={styles.emptyCard}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={48}
              color={theme.colors.primary.light}
              style={styles.emptyIcon}
            />
            <ThemedText variant="headline3" color="primary">
              No messages yet
            </ThemedText>
            <ThemedText variant="body3" color="secondary" style={styles.emptyText}>
              Patient messages will appear here.
            </ThemedText>
          </ThemedCard>
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              style={[styles.conversationCard, conv.unread && styles.conversationCardUnread]}
              onPress={() => setSelectedConversation(conv.id)}
              activeOpacity={0.85}
            >
              <View style={styles.conversationAvatar}>
                <ThemedText variant="headline3" color="inverse">
                  {conv.patientName.charAt(0)}
                </ThemedText>
              </View>
              <View style={styles.conversationMeta}>
                <View style={styles.conversationHeader}>
                  <ThemedText variant="body2" color="primary">
                    {conv.patientName}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    {conv.timestamp}
                  </ThemedText>
                </View>
                <ThemedText
                  variant="body3"
                  color="secondary"
                  numberOfLines={1}
                  style={conv.unread && styles.conversationMessageUnread}
                >
                  {conv.lastMessage}
                </ThemedText>
              </View>
              {conv.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  topBarText: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.semantic.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  conversationCardUnread: {
    backgroundColor: theme.colors.primary.light,
    borderColor: theme.colors.primary.main,
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  conversationMeta: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs / 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessageUnread: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.semantic.danger,
    flexShrink: 0,
  },
  messagesContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs / 2,
  },
  messageBubbleProvider: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary.main,
  },
  messageBubblePatient: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  messageTime: {
    fontSize: 10,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    color: theme.colors.text.primary,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.background.muted,
  },
  emptyCard: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default ProviderMessagingScreen;
