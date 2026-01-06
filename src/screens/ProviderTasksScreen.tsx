import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { theme } from '../theme';

type Task = {
  id: string;
  title: string;
  description: string;
  due: string;
  priority: 'high' | 'normal' | 'low';
  category: 'documentation' | 'billing' | 'followup' | 'review';
  completed: boolean;
};

export type ProviderTasksScreenProps = {
  onBack?: () => void;
};

const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Sign off visit notes · Adu Boakye',
    description: 'Complete and approve the visit summary from today\'s consultation.',
    due: 'Due in 1h',
    priority: 'high',
    category: 'documentation',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Review lab results · Yaa K.',
    description: 'Review and interpret the CBC results submitted by the patient.',
    due: 'Today · 4pm',
    priority: 'normal',
    category: 'review',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Send Rx clarification · Mensimah',
    description: 'Clarify dosage instructions for the prescribed medication.',
    due: 'Tomorrow',
    priority: 'normal',
    category: 'followup',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Process billing · Linda Asare',
    description: 'Submit billing codes for the hypertension check-in visit.',
    due: 'By Friday',
    priority: 'normal',
    category: 'billing',
    completed: false,
  },
  {
    id: 'task-5',
    title: 'Schedule follow-up · Ama Mensah',
    description: 'Book the 2-week migraine follow-up appointment.',
    due: 'By end of week',
    priority: 'low',
    category: 'followup',
    completed: true,
  },
];

const getCategoryIcon = (category: Task['category']) => {
  switch (category) {
    case 'documentation':
      return 'document-text-outline';
    case 'billing':
      return 'receipt-outline';
    case 'followup':
      return 'calendar-outline';
    case 'review':
      return 'checkmark-circle-outline';
    default:
      return 'list-outline';
  }
};

const getCategoryColor = (category: Task['category']) => {
  switch (category) {
    case 'documentation':
      return theme.colors.primary.main;
    case 'billing':
      return theme.colors.accent.main;
    case 'followup':
      return theme.colors.semantic.success;
    case 'review':
      return theme.colors.semantic.warning;
    default:
      return theme.colors.text.secondary;
  }
};

const ProviderTasksScreen: React.FC<ProviderTasksScreenProps> = ({ onBack }) => {
  const [tasks, setTasks] = React.useState<Task[]>(MOCK_TASKS);
  const [filter, setFilter] = React.useState<'all' | 'active' | 'completed'>('active');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          Task center
        </ThemedText>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText variant="caption1" color="secondary">
                Active tasks
              </ThemedText>
              <ThemedText variant="headline2" color="primary">
                {activeTasks}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <ThemedText variant="caption1" color="secondary">
                Completed
              </ThemedText>
              <ThemedText variant="headline2" color="primary">
                {completedTasks}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <ThemedText variant="caption1" color="secondary">
                Total
              </ThemedText>
              <ThemedText variant="headline2" color="primary">
                {tasks.length}
              </ThemedText>
            </View>
          </View>
        </ThemedCard>

        <View style={styles.filterRow}>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.85}
            >
              <ThemedText
                variant="caption1"
                color={filter === f ? 'primary' : 'secondary'}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tasksList}>
          {filteredTasks.length === 0 ? (
            <ThemedCard style={styles.emptyCard}>
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color={theme.colors.primary.light}
                style={styles.emptyIcon}
              />
              <ThemedText variant="headline3" color="primary" style={styles.emptyTitle}>
                All caught up!
              </ThemedText>
              <ThemedText variant="body3" color="secondary" style={styles.emptyText}>
                {filter === 'active'
                  ? 'No active tasks. Great work!'
                  : filter === 'completed'
                    ? 'No completed tasks yet.'
                    : 'No tasks to show.'}
              </ThemedText>
            </ThemedCard>
          ) : (
            filteredTasks.map((task) => (
              <ThemedCard key={task.id} style={[styles.taskCard, task.completed && styles.taskCardDone]}>
                <View style={styles.taskHeader}>
                  <TouchableOpacity
                    style={[styles.taskCheckbox, task.completed && styles.taskCheckboxDone]}
                    onPress={() => toggleTaskComplete(task.id)}
                    activeOpacity={0.85}
                  >
                    {task.completed && (
                      <Ionicons name="checkmark" size={16} color={theme.colors.neutral.white} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.taskMeta}>
                    <ThemedText
                      variant="body2"
                      color="primary"
                      style={[task.completed && styles.taskTitleDone]}
                    >
                      {task.title}
                    </ThemedText>
                    <ThemedText variant="caption1" color="secondary">
                      {task.description}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.taskFooter}>
                  <View style={styles.taskBadges}>
                    <View style={styles.categoryBadge}>
                      <Ionicons
                        name={getCategoryIcon(task.category)}
                        size={12}
                        color={getCategoryColor(task.category)}
                      />
                      <ThemedText variant="caption2" color="secondary">
                        {task.category}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        task.priority === 'high' && styles.priorityBadgeHigh,
                        task.priority === 'low' && styles.priorityBadgeLow,
                      ]}
                    >
                      <ThemedText
                        variant="caption2"
                        color={task.priority === 'high' ? 'inverse' : 'secondary'}
                      >
                        {task.priority}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText variant="caption1" color="secondary">
                    {task.due}
                  </ThemedText>
                </View>
              </ThemedCard>
            ))
          )}
        </View>
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
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  statsCard: {
    padding: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: theme.colors.border.light,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterChip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary.light,
    borderColor: theme.colors.primary.main,
  },
  tasksList: {
    gap: theme.spacing.md,
  },
  taskCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  taskCardDone: {
    backgroundColor: theme.colors.background.muted,
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs / 2,
    flexShrink: 0,
  },
  taskCheckboxDone: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  taskMeta: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
  },
  priorityBadgeHigh: {
    backgroundColor: theme.colors.semantic.danger,
  },
  priorityBadgeLow: {
    backgroundColor: theme.colors.background.muted,
  },
  emptyCard: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default ProviderTasksScreen;
