import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { theme } from '../theme';
import type { Appointment } from './ScheduleScreen';

export type PatientAppointmentsScreenProps = {
  appointments: Appointment[];
  onBack?: () => void;
  onCancelAppointment?: (id: string) => void;
  onRescheduleAppointment?: (id: string, dateLabel: string, timeLabel: string, group: Appointment['group']) => void;
};

const PatientAppointmentsScreen: React.FC<PatientAppointmentsScreenProps> = ({
  appointments,
  onBack,
  onCancelAppointment,
  onRescheduleAppointment,
}) => {
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [rescheduleDate, setRescheduleDate] = React.useState('');
  const [rescheduleTime, setRescheduleTime] = React.useState('');

  const handleCancelConfirm = () => {
    if (selectedAppointment && onCancelAppointment) {
      onCancelAppointment(selectedAppointment.id);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
    }
  };

  const handleRescheduleConfirm = () => {
    if (selectedAppointment && onRescheduleAppointment && rescheduleDate && rescheduleTime) {
      onRescheduleAppointment(
        selectedAppointment.id,
        rescheduleDate,
        rescheduleTime,
        'upcoming'
      );
      setShowRescheduleModal(false);
      setRescheduleDate('');
      setRescheduleTime('');
      setSelectedAppointment(null);
    }
  };

  const upcomingAppointments = appointments.filter((a) => a.group === 'upcoming');
  const todayAppointments = appointments.filter((a) => a.group === 'today');

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'paid':
        return theme.colors.semantic.success;
      case 'pendingPayment':
        return theme.colors.semantic.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'paid':
        return 'checkmark-circle';
      case 'pendingPayment':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          My appointments
        </ThemedText>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <ThemedText variant="headline3" color="primary">
              Upcoming
            </ThemedText>
            <View style={styles.appointmentsList}>
              {upcomingAppointments.map((appt) => (
                <ThemedCard key={appt.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentInfo}>
                      <ThemedText variant="body2" color="primary">
                        {appt.serviceLabel}
                      </ThemedText>
                      <ThemedText variant="caption1" color="secondary">
                        {appt.doctorName}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(appt.status) },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(appt.status)}
                        size={14}
                        color={theme.colors.neutral.white}
                      />
                      <ThemedText variant="caption2" color="inverse">
                        {appt.status === 'paid'
                          ? 'Confirmed'
                          : appt.status === 'pendingPayment'
                            ? 'Pending'
                            : 'Cancelled'}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
                      <ThemedText variant="body3" color="secondary">
                        {appt.dateLabel}
                      </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
                      <ThemedText variant="body3" color="secondary">
                        {appt.timeLabel}
                      </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
                      <ThemedText variant="body3" color="secondary">
                        {appt.total}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.appointmentActions}>
                    <Button
                      label="Reschedule"
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        setSelectedAppointment(appt);
                        setShowRescheduleModal(true);
                      }}
                    />
                    <Button
                      label="Cancel"
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        setSelectedAppointment(appt);
                        setShowCancelModal(true);
                      }}
                    />
                  </View>
                </ThemedCard>
              ))}
            </View>
          </View>
        )}

        {todayAppointments.length > 0 && (
          <View style={styles.section}>
            <ThemedText variant="headline3" color="primary">
              Today
            </ThemedText>
            <View style={styles.appointmentsList}>
              {todayAppointments.map((appt: Appointment) => (
                <ThemedCard key={appt.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentInfo}>
                      <ThemedText variant="body2" color="primary">
                        {appt.serviceLabel}
                      </ThemedText>
                      <ThemedText variant="caption1" color="secondary">
                        {appt.doctorName}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(appt.status) },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(appt.status)}
                        size={14}
                        color={theme.colors.neutral.white}
                      />
                      <ThemedText variant="caption2" color="inverse">
                        {appt.status === 'paid' ? 'Confirmed' : 'Pending'}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
                      <ThemedText variant="body3" color="secondary">
                        {appt.dateLabel}
                      </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
                      <ThemedText variant="body3" color="secondary">
                        {appt.timeLabel}
                      </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
                      <ThemedText variant="body3" color="secondary">
                        {appt.total}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.appointmentActions}>
                    <Button
                      label="Reschedule"
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        setSelectedAppointment(appt);
                        setShowRescheduleModal(true);
                      }}
                    />
                    <Button
                      label="Cancel"
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        setSelectedAppointment(appt);
                        setShowCancelModal(true);
                      }}
                    />
                  </View>
                </ThemedCard>
              ))}
            </View>
          </View>
        )}

        {appointments.length === 0 && (
          <ThemedCard style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={theme.colors.primary.light}
              style={styles.emptyIcon}
            />
            <ThemedText variant="headline3" color="primary">
              No appointments yet
            </ThemedText>
            <ThemedText variant="body3" color="secondary" style={styles.emptyText}>
              Book your first appointment to get started.
            </ThemedText>
          </ThemedCard>
        )}
      </ScrollView>

      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="headline3" color="primary">
                Cancel appointment?
              </ThemedText>
            </View>
            <ThemedText variant="body3" color="secondary" style={styles.modalText}>
              {selectedAppointment?.serviceLabel} with {selectedAppointment?.doctorName}
            </ThemedText>
            <ThemedText variant="caption1" color="secondary" style={styles.modalSubtext}>
              {selectedAppointment?.dateLabel} at {selectedAppointment?.timeLabel}
            </ThemedText>

            <View style={styles.modalActions}>
              <Button
                label="Keep appointment"
                variant="secondary"
                size="sm"
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedAppointment(null);
                }}
              />
              <Button
                label="Cancel appointment"
                variant="primary"
                size="sm"
                onPress={handleCancelConfirm}
              />
            </View>
          </ThemedCard>
        </View>
      </Modal>

      <Modal visible={showRescheduleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="headline3" color="primary">
                Reschedule appointment
              </ThemedText>
            </View>
            <ThemedText variant="body3" color="secondary" style={styles.modalText}>
              {selectedAppointment?.serviceLabel}
            </ThemedText>

            <View style={styles.rescheduleInputs}>
              <View>
                <ThemedText variant="caption1" color="secondary">
                  New date
                </ThemedText>
                <View style={styles.input}>
                  <ThemedText variant="body3" color="primary">
                    {rescheduleDate || 'Select date'}
                  </ThemedText>
                </View>
              </View>
              <View>
                <ThemedText variant="caption1" color="secondary">
                  New time
                </ThemedText>
                <View style={styles.input}>
                  <ThemedText variant="body3" color="primary">
                    {rescheduleTime || 'Select time'}
                  </ThemedText>
                </View>
              </View>
            </View>

            <ThemedText variant="caption1" color="secondary" style={styles.helperText}>
              Select your preferred date and time from the calendar.
            </ThemedText>

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="secondary"
                size="sm"
                onPress={() => {
                  setShowRescheduleModal(false);
                  setRescheduleDate('');
                  setRescheduleTime('');
                  setSelectedAppointment(null);
                }}
              />
              <Button
                label="Reschedule"
                variant="primary"
                size="sm"
                disabled={!rescheduleDate || !rescheduleTime}
                onPress={handleRescheduleConfirm}
              />
            </View>
          </ThemedCard>
        </View>
      </Modal>
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
  section: {
    gap: theme.spacing.md,
  },
  appointmentsList: {
    gap: theme.spacing.md,
  },
  appointmentCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  pastCard: {
    opacity: 0.7,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  appointmentInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 1.5,
    borderRadius: theme.borderRadius.full,
  },
  appointmentDetails: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalHeader: {
    marginBottom: theme.spacing.sm,
  },
  modalText: {
    marginBottom: theme.spacing.xs,
  },
  modalSubtext: {
    marginBottom: theme.spacing.md,
  },
  rescheduleInputs: {
    gap: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.card,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
});

export default PatientAppointmentsScreen;
