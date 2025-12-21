import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { theme } from '../theme';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOT_OPTIONS = ['Morning', 'Afternoon', 'Evening'];
const CURRENCY_OPTIONS = ['GHS', 'USD', 'NGN', 'KES'];

export type ProviderScheduleSettings = {
  timezone: string;
  availabilityNote: string;
  availabilitySlots: Record<string, string[]>;
  feeCurrency: string;
  feeAmount: string;
};

type ProviderScheduleSettingsScreenProps = {
  settings: ProviderScheduleSettings;
  onBack?: () => void;
  onSave?: (settings: ProviderScheduleSettings) => void;
};

const ProviderScheduleSettingsScreen: React.FC<ProviderScheduleSettingsScreenProps> = ({
  settings,
  onBack,
  onSave,
}) => {
  const [draft, setDraft] = React.useState<ProviderScheduleSettings>(settings);

  const toggleSlot = (day: string, slot: string) => {
    setDraft((prev) => {
      const existing = prev.availabilitySlots[day] ?? [];
      const exists = existing.includes(slot);
      return {
        ...prev,
        availabilitySlots: {
          ...prev.availabilitySlots,
          [day]: exists ? existing.filter((item) => item !== slot) : [...existing, slot],
        },
      };
    });
  };

  const handleSave = () => {
    onSave?.(draft);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          Schedule settings
        </ThemedText>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedCard style={styles.card}>
          <ThemedText variant="headline3" color="primary">
            Availability
          </ThemedText>
          <TextField
            label="Timezone"
            value={draft.timezone}
            onChangeText={(text) => setDraft((prev) => ({ ...prev, timezone: text }))}
            placeholder="e.g. GMT, PST"
          />
          <View style={styles.fieldSpacing} />
          <TextField
            label="Availability overview"
            value={draft.availabilityNote}
            onChangeText={(text) => setDraft((prev) => ({ ...prev, availabilityNote: text }))}
            multiline
            placeholder="Example: Mon–Thu 9am-2pm, Friday async follow-ups."
          />
          <View style={styles.fieldSpacing} />
          <ThemedText variant="body2" color="primary">
            Weekly schedule
          </ThemedText>
          <View style={styles.weekGrid}>
            {WEEK_DAYS.map((day) => (
              <View key={day} style={styles.weekRow}>
                <ThemedText variant="caption1" color="secondary" style={styles.weekDay}>
                  {day}
                </ThemedText>
                <View style={styles.slotChips}>
                  {SLOT_OPTIONS.map((slot) => {
                    const active = draft.availabilitySlots[day]?.includes(slot);
                    return (
                      <TouchableOpacity
                        key={`${day}-${slot}`}
                        style={[styles.slotChip, active && styles.slotChipActive]}
                        onPress={() => toggleSlot(day, slot)}
                        activeOpacity={0.85}
                      >
                        <ThemedText variant="caption1" color={active ? 'primary' : 'secondary'}>
                          {slot}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ThemedCard>

        <ThemedCard style={styles.card}>
          <ThemedText variant="headline3" color="primary">
            Consultation fees
          </ThemedText>
          <TextField
            label="Amount per visit"
            value={draft.feeAmount}
            onChangeText={(text) => setDraft((prev) => ({ ...prev, feeAmount: text }))}
            keyboardType="numeric"
            placeholder="e.g. 120"
          />
          <View style={styles.fieldSpacing} />
          <ThemedText variant="body2" color="primary">
            Currency
          </ThemedText>
          <View style={styles.currencyRow}>
            {CURRENCY_OPTIONS.map((currency) => {
              const active = draft.feeCurrency === currency;
              return (
                <TouchableOpacity
                  key={currency}
                  style={[styles.currencyChip, active && styles.currencyChipActive]}
                  onPress={() => setDraft((prev) => ({ ...prev, feeCurrency: currency }))}
                  activeOpacity={0.85}
                >
                  <ThemedText variant="caption1" color={active ? 'primary' : 'secondary'}>
                    {currency}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ThemedCard>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save changes" variant="primary" fullWidth onPress={handleSave} />
      </View>
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
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  weekGrid: {
    gap: theme.spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  weekDay: {
    width: 32,
  },
  slotChips: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  slotChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  slotChipActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  currencyChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  currencyChipActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  fieldSpacing: {
    height: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
  },
});

export default ProviderScheduleSettingsScreen;
