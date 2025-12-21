import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import NavigationBar from '../components/NavigationBar';
import Button from '../components/Button';
import TextField from '../components/TextField';
import ThemedText from '../components/ThemedText';
import TabBar from '../components/TabBar';
import { theme } from '../theme';

const ComponentsShowcaseScreen: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('home');

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

  return (
    <Screen>
      <NavigationBar title="Tele Heal" />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle>Buttons</SectionTitle>
        <View style={styles.block}>
          <Button
            label="Primary Button"
            variant="primary"
            fullWidth
            style={styles.blockItem}
          />
          <Button
            label="Secondary Button"
            variant="secondary"
            fullWidth
            style={styles.blockItem}
          />
          <Button
            label="Ghost Button"
            variant="ghost"
            fullWidth
            style={styles.blockItem}
          />
          <Button
            label="Outline Button"
            variant="outline"
            fullWidth
          />
        </View>

        <SectionTitle>Text Fields</SectionTitle>
        <View style={styles.block}>
          <TextField
            label="Full name"
            placeholder="Dr. Chelsea Owen"
            containerProps={{ style: styles.blockItem }}
          />
          <TextField
            label="Search"
            placeholder="Search doctors or specialties"
            containerProps={{ style: styles.blockItem }}
          />
          <TextField
            label="With error"
            placeholder="Enter value"
            error="This field is required"
            containerProps={{ style: styles.blockItem }}
          />
        </View>

        <SectionTitle>Cards</SectionTitle>
        <View style={styles.block}>
          <View style={styles.cardPlaceholder}>
            <ThemedText variant="headline2" color="primary">
              Card layout comes here
            </ThemedText>
            <ThemedText variant="body2" color="secondary">
              We will replace this with real doctor / appointment cards
              based on your next screens.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <TabBar items={tabItems} activeKey={activeTab} onTabPress={setActiveTab} />
    </Screen>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemedText
    variant="headline1"
    color="primary"
    style={styles.sectionTitle}
  >
    {children}
  </ThemedText>
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 120,
  },
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  block: {
    marginBottom: theme.spacing.lg,
  },
  blockItem: {
    marginBottom: theme.spacing.sm,
  },
  cardPlaceholder: {
    borderRadius: 24,
    backgroundColor: theme.colors.neutral.white,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.level1,
  },
});

export default ComponentsShowcaseScreen;
