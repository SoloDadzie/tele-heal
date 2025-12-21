import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TextField from './TextField';
import ThemedText from './ThemedText';
import { theme } from '../theme';

export type PhoneCountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

export const PHONE_COUNTRY_OPTIONS: PhoneCountryOption[] = [
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
];

const DEFAULT_COUNTRY = PHONE_COUNTRY_OPTIONS[0];

const resolveCountry = (code?: string) =>
  PHONE_COUNTRY_OPTIONS.find((item) => item.code === code) ?? DEFAULT_COUNTRY;

export type PhoneNumberFieldProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  countryCode?: string;
  initialCountryCode?: string;
  onCountryChange?: (country: PhoneCountryOption) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  label = 'Phone number',
  value,
  onChangeText,
  placeholder = 'Enter phone number',
  helperText,
  error,
  countryCode,
  initialCountryCode,
  onCountryChange,
  style,
  disabled = false,
}) => {
  const isControlled = Boolean(countryCode);

  const [selectedCountry, setSelectedCountry] = React.useState<PhoneCountryOption>(() =>
    resolveCountry(countryCode ?? initialCountryCode),
  );
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  React.useEffect(() => {
    if (!countryCode) return;
    setSelectedCountry((prev) => {
      if (prev.code === countryCode) return prev;
      return resolveCountry(countryCode);
    });
  }, [countryCode]);

  const handleSelectCountry = (country: PhoneCountryOption) => {
    if (!isControlled) {
      setSelectedCountry(country);
    }
    onCountryChange?.(country);
    setIsModalVisible(false);
  };

  const currentCountry = isControlled ? resolveCountry(countryCode) : selectedCountry;

  return (
    <View style={style}>
      {!!label && (
        <ThemedText variant="caption1" color="secondary" style={styles.label}>
          {label}
        </ThemedText>
      )}
      <View style={[styles.phoneRow, disabled && styles.disabledRow]}>
        <TouchableOpacity
          style={styles.flagContainer}
          onPress={() => !disabled && setIsModalVisible(true)}
          activeOpacity={0.85}
          disabled={disabled}
        >
          <ThemedText variant="body3" color="primary">
            {currentCountry.flag}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => !disabled && setIsModalVisible(true)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <ThemedText variant="body3" color="secondary" style={styles.dialCode}>
            {currentCountry.dialCode}
          </ThemedText>
        </TouchableOpacity>
        <View style={styles.phoneInputWrapper}>
          <TextField
            placeholder={placeholder}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            value={value}
            onChangeText={onChangeText}
            editable={!disabled}
            error={error}
            helperText={helperText}
          />
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                {PHONE_COUNTRY_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.modalItem,
                      item.code === currentCountry.code && styles.modalItemActive,
                    ]}
                    onPress={() => handleSelectCountry(item)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.modalItemContent}>
                      <ThemedText variant="body2" color="primary">
                        {item.flag} {item.name}
                      </ThemedText>
                      <ThemedText variant="body3" color="secondary">
                        {item.dialCode}
                      </ThemedText>
                    </View>
                    {item.code === currentCountry.code && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary.main} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm / 1.2,
  },
  disabledRow: {
    opacity: 0.6,
  },
  flagContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialCode: {
    fontWeight: '600',
  },
  phoneInputWrapper: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.lg,
  },
  modalItem: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemActive: {
    backgroundColor: theme.colors.background.muted,
  },
  modalItemContent: {
    gap: theme.spacing.xs / 2,
  },
});

export default PhoneNumberField;
