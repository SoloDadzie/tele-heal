import React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import OnboardingCarouselScreen from './src/screens/OnboardingCarouselScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import VerifyNumberScreen from './src/screens/VerifyNumberScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import DoctorListScreen, { type DoctorListItem } from './src/screens/DoctorListScreen';
import ServiceScreen from './src/screens/ServiceScreen';
import SelectHospitalScreen, { HOSPITALS, type HospitalItem } from './src/screens/SelectHospitalScreen';
import PickTimeScreen from './src/screens/PickTimeScreen';
import BookingConfirmationScreen from './src/screens/BookingConfirmationScreen';
import DoctorInfoScreen from './src/screens/DoctorInfoScreen';
import DoctorReviewsScreen from './src/screens/DoctorReviewsScreen';
import ScheduleScreen, { type Appointment } from './src/screens/ScheduleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProfileSetupScreen, { type PatientProfile } from './src/screens/ProfileSetupScreen';
import VisitDetailsScreen, { type VisitDetails } from './src/screens/VisitDetailsScreen';
import PreConsultationScreen from './src/screens/PreConsultationScreen';
import VirtualConsultationScreen from './src/screens/VirtualConsultationScreen';
import PostConsultationScreen from './src/screens/PostConsultationScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import ChatScreen from './src/screens/ChatScreen';
import PrescriptionsScreen, { type PrescriptionItem } from './src/screens/PrescriptionsScreen';
import LabsScreen, { type LabRequest, type LabUpload } from './src/screens/LabsScreen';
import DocumentArchiveScreen from './src/screens/DocumentArchiveScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ProviderInviteScreen, { type ProviderInviteContext } from './src/screens/ProviderInviteScreen';
import ProviderOnboardingScreen, { type ProviderProfileDraft } from './src/screens/ProviderOnboardingScreen';
import ProviderPendingScreen from './src/screens/ProviderPendingScreen';
import ProviderDashboardScreen from './src/screens/ProviderDashboardScreen';
import ProviderConsultWorkspaceScreen from './src/screens/ProviderConsultWorkspaceScreen';
import ProviderCallScreen, { type ProviderCallMessage } from './src/screens/ProviderCallScreen';
import ProviderScheduleSettingsScreen, {
  type ProviderScheduleSettings as ProviderScheduleSettingsDraft,
} from './src/screens/ProviderScheduleSettingsScreen';
import ProviderVisitWrapUpScreen from './src/screens/ProviderVisitWrapUpScreen';
import type { DocumentRecord } from './src/types/documents';
import type { PaymentIntent } from './src/types/payments';
import type { CurrencyCode } from './src/config/regions';
import Button from './src/components/Button';
import ThemedText from './src/components/ThemedText';
import { theme } from './src/theme';
import { formatCurrency } from './src/utils/currency';

type Route =
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'verify-signup'
  | 'verify-forgot'
  | 'forgotPassword'
  | 'profileSetup'
  | 'visitDetails'
  | 'preConsultation'
  | 'virtualConsultation'
  | 'postConsultation'
  | 'home'
  | 'doctorList'
  | 'service'
  | 'selectHospital'
  | 'pickTime'
  | 'bookingConfirmation'
  | 'doctorInfo'
  | 'doctorReviews'
  | 'schedule'
  | 'profile'
  | 'chat'
  | 'notification'
  | 'payment'
  | 'prescriptions'
  | 'labs'
  | 'documents'
  | 'providerInvite'
  | 'providerOnboarding'
  | 'providerPending'
  | 'providerDashboard'
  | 'providerConsult'
  | 'providerCall'
  | 'providerScheduleSettings'
  | 'providerWrapUp';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
};

type ProviderConsultContext = {
  id: string;
  patientName: string;
  reason: string;
  scheduledTime: string;
};

type ProviderCallSession = ProviderConsultContext & {
  status: 'waiting' | 'live';
  patientReady: boolean;
  chat: ProviderCallMessage[];
  notes: string[];
};

type IntakePreview = {
  id: string;
  patient: string;
  reason: string;
  questionnaire: string;
  medications: string[];
  flags?: string;
};

const PROVIDER_APPOINTMENT_LOOKUP: Record<string, ProviderConsultContext> = {
  'queue-1': {
    id: 'queue-1',
    patientName: 'Ama Mensah',
    reason: 'Migraine follow-up',
    scheduledTime: 'Today · 09:00',
  },
  'queue-2': {
    id: 'queue-2',
    patientName: 'Kwesi Boateng',
    reason: 'Skin rash photo review',
    scheduledTime: 'Async review · due 12:00',
  },
  'queue-3': {
    id: 'queue-3',
    patientName: 'Linda Asare',
    reason: 'Hypertension check-in',
    scheduledTime: 'Today · 10:30',
  },
  'sched-1': {
    id: 'sched-1',
    patientName: 'Ama Mensah',
    reason: 'Migraine follow-up',
    scheduledTime: '09:00 – 09:25',
  },
  'sched-2': {
    id: 'sched-2',
    patientName: 'Linda Asare',
    reason: 'Hypertension check-in',
    scheduledTime: '10:30 – 11:00',
  },
  'sched-3': {
    id: 'sched-3',
    patientName: 'Kwesi Boateng',
    reason: 'Skin rash photo review',
    scheduledTime: 'Async · due 12:00',
  },
};

const mapAppointmentToContext = (appointmentId: string): ProviderConsultContext =>
  PROVIDER_APPOINTMENT_LOOKUP[appointmentId] ?? {
    id: appointmentId,
    patientName: 'Tele Heal Patient',
    reason: 'General consultation',
    scheduledTime: 'Today · 09:00',
  };

const DEFAULT_PROVIDER_CHAT: ProviderCallMessage[] = [
  { id: 'chat-1', author: 'patient', text: 'Hi doctor! I’m ready whenever you are.' },
  { id: 'chat-2', author: 'provider', text: 'Thanks Ama, reviewing your intake now.' },
];

const DEFAULT_PROVIDER_NOTES = ['Pre-visit summary shared with patient.'];

type PatientHistoryEntry = {
  id: string;
  title: string;
  date: string;
  summary: string;
};

const MOCK_PATIENT_HISTORY: Record<string, PatientHistoryEntry[]> = {
  'queue-1': [
    {
      id: 'hist-1',
      title: 'Follow-up · Aug 10',
      date: 'Aug 10',
      summary: 'Discussed migraine triggers, started magnesium supplement.',
    },
    {
      id: 'hist-2',
      title: 'Labs reviewed · Jul 02',
      date: 'Jul 02',
      summary: 'Normal CMP, slightly elevated LDL, lifestyle coaching.',
    },
  ],
  'queue-2': [
    {
      id: 'hist-3',
      title: 'Derm triage · Sep 01',
      date: 'Sep 01',
      summary: 'Sent photo series, recommended OTC hydrocortisone.',
    },
  ],
};

const createCallSession = (context: ProviderConsultContext): ProviderCallSession => ({
  ...context,
  status: 'waiting',
  patientReady: true,
  chat: [...DEFAULT_PROVIDER_CHAT],
  notes: [...DEFAULT_PROVIDER_NOTES],
});

const DEFAULT_SCHEDULE_SETTINGS: ProviderScheduleSettingsDraft = {
  timezone: 'GMT',
  availabilityNote: 'Mon–Thu 09:00-14:00 · Fri async follow-ups',
  availabilitySlots: {
    Mon: ['Morning'],
    Tue: ['Morning', 'Afternoon'],
    Wed: ['Morning'],
    Thu: ['Morning'],
    Fri: ['Afternoon'],
    Sat: [],
    Sun: [],
  },
  feeCurrency: 'GHS',
  feeAmount: '120',
};

const MOCK_INTAKE_PREVIEWS: IntakePreview[] = [
  {
    id: 'intake-1',
    patient: 'Ama Mensah',
    reason: 'Migraine follow-up',
    questionnaire: 'Reports 3 migraines/week, bright light trigger, nausea.',
    medications: ['Sumatriptan', 'Magnesium supplement'],
    flags: 'Photosensitivity, track blood pressure',
  },
  {
    id: 'intake-2',
    patient: 'Linda Asare',
    reason: 'Hypertension check-in',
    questionnaire: 'Home BP avg 135/88, mild dizziness mornings.',
    medications: ['Losartan', 'Hydrochlorothiazide'],
  },
];

export default function App() {
  const [fontsLoaded] = useFonts({
    'Avenir-Black': require('./assets/fonts/Avenir-Black.ttf'),
    'Avenir-Heavy': require('./assets/fonts/Avenir-Heavy.ttf'),
    'Avenir-Medium': require('./assets/fonts/Avenir-Medium.ttf'),
  });

  const [route, setRoute] = React.useState<Route>('onboarding');
  const [patientProfile, setPatientProfile] = React.useState<PatientProfile | null>(null);
  const [authPhone, setAuthPhone] = React.useState('');
  const [authCountryCode, setAuthCountryCode] = React.useState<string | undefined>(undefined);
  const [providerInviteContext, setProviderInviteContext] = React.useState<ProviderInviteContext | null>(null);
  const [providerDraft, setProviderDraft] = React.useState<ProviderProfileDraft | null>(null);
  const [providerConsultContext, setProviderConsultContext] = React.useState<ProviderConsultContext | null>(null);
  const [providerCallSession, setProviderCallSession] = React.useState<ProviderCallSession | null>(null);
  const [appointments, setAppointments] = React.useState<Appointment[]>([
    {
      id: 'appt-1',
      code: '#0012345678',
      serviceLabel: 'Blood test package',
      total: formatCurrency(1200),
      amountValue: 1200,
      currency: 'GHS',
      status: 'pendingPayment' as const,
      doctorName: 'Dr. Sarah Johnson',
      dateLabel: 'Today',
      timeLabel: '09:00 AM',
      group: 'today' as const,
    },
    {
      id: 'appt-2',
      code: '#0012345679',
      serviceLabel: 'Dental check-up',
      total: formatCurrency(850),
      amountValue: 850,
      currency: 'GHS',
      status: 'paid' as const,
      doctorName: 'Dr. Mark Lee',
      dateLabel: 'Friday, 15 Dec',
      timeLabel: '02:30 PM',
      group: 'upcoming' as const,
    },
  ]);

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'The doctor has ended his consultation',
      body:
        'Your consultation is timed and finished, please rate us so we can serve you better!',
      timeLabel: 'Today · 09:30',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'New message from Dr. Sarah',
      body: 'Please remember to check your latest lab results in the app.',
      timeLabel: 'Yesterday · 16:10',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Your appointment is confirmed',
      body: 'Your follow-up appointment has been scheduled successfully.',
      timeLabel: 'Monday · 10:00',
      read: true,
    },
  ]);
  const [selectedHospital, setSelectedHospital] = React.useState<HospitalItem | null>(null);
  const [selectedDoctor, setSelectedDoctor] = React.useState<DoctorListItem | null>(null);
  const [visitDetails, setVisitDetails] = React.useState<VisitDetails | null>(null);
  const [bookingData, setBookingData] = React.useState<{ appointment: { dayLabel: string; time: string } } | null>(
    null,
  );

  const handleRemovePrescription = React.useCallback((id: string) => {
    setPrescriptions((prev) => prev.filter((rx) => rx.id !== id));
  }, []);
  const [selectedDocumentId, setSelectedDocumentId] = React.useState<string | null>(null);
  const [preConsultAppointment, setPreConsultAppointment] = React.useState<Appointment | null>(null);
  const [activeConsultation, setActiveConsultation] = React.useState<Appointment | null>(null);
  const [postConsultAppointment, setPostConsultAppointment] = React.useState<Appointment | null>(null);
  const [providerScheduleSettings, setProviderScheduleSettings] =
    React.useState<ProviderScheduleSettingsDraft>(DEFAULT_SCHEDULE_SETTINGS);
  const [pendingWrapUpContext, setPendingWrapUpContext] = React.useState<ProviderConsultContext | null>(null);

  const appendProviderChat = React.useCallback((text: string) => {
    setProviderCallSession((prev) =>
      prev ? { ...prev, chat: [...prev.chat, { id: `chat-${Date.now()}`, author: 'provider', text }] } : prev,
    );
  }, []);

  const appendProviderNote = React.useCallback((text: string) => {
    setProviderCallSession((prev) => (prev ? { ...prev, notes: [text, ...prev.notes] } : prev));
  }, []);

  const handleCreatePrescription = React.useCallback((note: string) => {
    Alert.alert('Prescription sent', note);
  }, []);

  const handleOrderLab = React.useCallback((note: string) => {
    Alert.alert('Lab ordered', note);
  }, []);
  const [documents] = React.useState<DocumentRecord[]>([
    {
      id: 'doc-1',
      title: 'Visit Summary · Aug 28',
      subtitle: 'Dr. Sarah Johnson • PDF · 2 MB',
      date: '2d ago',
      summary:
        'Overview of your visit discussing dizziness, hydration improvements, and the monitoring plan for blood pressure.',
      author: 'Dr. Sarah Johnson',
      downloadUrl: 'https://example.com/docs/doc-1.pdf',
    },
    {
      id: 'doc-2',
      title: 'Lab results · Basic panel',
      subtitle: 'Quest Diagnostics • PDF · 640 KB',
      date: '1w ago',
      summary: 'CBC and electrolyte panel completed. No abnormalities detected.',
      author: 'Quest Diagnostics',
      downloadUrl: 'https://example.com/docs/doc-2.pdf',
    },
  ]);
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      name: 'Meclizine 25mg',
      dosage: '1 tablet',
      instructions: 'Take every 8 hours as needed for dizziness.',
      issuedBy: 'Dr. Sarah Johnson',
      issuedOn: 'Aug 28, 2025',
      refillsRemaining: 2,
    },
    {
      id: 'rx-2',
      name: 'Vitamin D 1000 IU',
      dosage: '1 capsule',
      instructions: 'Take once daily with food.',
      issuedBy: 'Dr. Sarah Johnson',
      issuedOn: 'Aug 28, 2025',
      refillsRemaining: 5,
    },
  ]);
  const [labRequests, setLabRequests] = React.useState<LabRequest[]>([
    {
      id: 'lab-1',
      name: 'Complete blood count (CBC)',
      orderingDoctor: 'Dr. Sarah Johnson',
      orderedOn: 'Aug 29, 2025',
      status: 'processing',
      instructions: 'Visit any partner lab this week.',
    },
    {
      id: 'lab-2',
      name: 'Electrolyte panel',
      orderingDoctor: 'Dr. Sarah Johnson',
      orderedOn: 'Aug 29, 2025',
      status: 'ready',
      instructions: 'Results available to review.',
    },
    {
      id: 'lab-3',
      name: 'Head CT',
      orderingDoctor: 'Dr. Mark Lee',
      orderedOn: 'Aug 30, 2025',
      status: 'scheduled',
      instructions: 'Scheduled for Sep 2 · 9:00 AM.',
    },
  ]);
  const [labUploads, setLabUploads] = React.useState<LabUpload[]>([
    {
      id: 'upload-1',
      name: 'CBC results.pdf',
      submittedAt: 'Aug 31, 2025',
      uri: '',
      status: 'reviewed',
    },
  ]);

  const [paymentIntent, setPaymentIntent] = React.useState<PaymentIntent | null>(null);

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((appt) => appt.id !== id));
  };

  const handleRescheduleAppointment = (
    id: string,
    dateLabel: string,
    timeLabel: string,
    group: Appointment['group'],
  ) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, dateLabel, timeLabel, group } : appt,
      ),
    );
  };

  const unreadNotificationCount = React.useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const handleUploadLabResult = React.useCallback(
    ({ uri, name }: { uri: string; name?: string }) => {
      setLabUploads((prev) => [
        {
          id: `upload-${Date.now()}`,
          name: name ?? `Lab result ${prev.length + 1}`,
          submittedAt: 'Just now',
          uri,
          status: 'pendingReview',
        },
        ...prev,
      ]);
    },
    [],
  );

  let screen: React.ReactNode;

  const handleTimeSelected = (payload: { appointment: { dayLabel: string; time: string } }) => {
    setBookingData(payload);
    setRoute('bookingConfirmation');
  };

  const handleBookingConfirmed = () => {
    if (!selectedHospital || !bookingData) return;
    const newAppointment: Appointment = {
      id: `appt-${Date.now()}`,
      code: `#${Math.floor(Math.random() * 1_000_000)
        .toString()
        .padStart(6, '0')}`,
      serviceLabel: selectedDoctor ? `${selectedDoctor.name} consultation` : `${selectedHospital.name} visit`,
      total: formatCurrency(650),
      amountValue: 650,
      currency: 'GHS',
      status: 'pendingPayment',
      doctorName: selectedDoctor?.name ?? selectedHospital.name,
      dateLabel: bookingData.appointment.dayLabel,
      timeLabel: bookingData.appointment.time,
      group: 'upcoming',
    };
    setAppointments((prev) => [...prev, newAppointment]);
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setVisitDetails(null);
    setBookingData(null);
    setRoute('schedule');
  };

  const startPaymentFlow = React.useCallback(
    (appointment: Appointment, originRoute: PaymentIntent['originRoute']) => {
      const amountValue =
        typeof appointment.amountValue === 'number'
          ? appointment.amountValue
          : Number(String(appointment.total).replace(/[^\d.]/g, ''));

      if (!amountValue || Number.isNaN(amountValue)) {
        Alert.alert('Payment unavailable', 'This appointment does not have a payable amount.');
        return;
      }

      const currency: CurrencyCode = (appointment.currency as CurrencyCode | undefined) ?? 'GHS';
      const intent: PaymentIntent = {
        appointmentId: appointment.id,
        serviceLabel: appointment.serviceLabel,
        amountValue,
        currency,
        patientName: patientProfile?.fullName ?? 'TeleHeal Patient',
        patientEmail: patientProfile?.email ?? 'patient@example.com',
        reference: `TH-${Date.now()}`,
        originRoute,
      };
      setPaymentIntent(intent);
      setRoute('payment');
    },
    [patientProfile],
  );

  const scheduleScreen = (
    <ScheduleScreen
      onGoHome={() => setRoute('home')}
      onOpenService={() => setRoute('service')}
      onOpenProfile={() => setRoute('profile')}
      onOpenChat={() => setRoute('chat')}
      appointments={appointments}
      onCancelAppointment={handleCancelAppointment}
      onRescheduleAppointment={handleRescheduleAppointment}
      onOpenPreConsultation={(appointment) => {
        setPreConsultAppointment(appointment);
        setRoute('preConsultation');
      }}
      onPayAppointment={(appointment) => startPaymentFlow(appointment, 'schedule')}
    />
  );

  if (!fontsLoaded) {
    console.log('Fonts not loaded yet');
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  console.log('Fonts loaded, rendering app');

  if (route === 'onboarding') {
    screen = (
      <OnboardingCarouselScreen
        onDone={() => setRoute('login')}
        onSkip={() => setRoute('login')}
        onOpenProviderAccess={() => setRoute('providerInvite')}
      />
    );
  } else if (route === 'profile') {
    screen = (
      <ProfileScreen
        onGoHome={() => setRoute('home')}
        onOpenSchedule={() => setRoute('schedule')}
        onOpenChat={() => setRoute('chat')}
        profile={patientProfile}
      />
    );
  } else if (route === 'profileSetup') {
    screen = (
      <ProfileSetupScreen
        initialPhone={authPhone}
        initialCountryCode={authCountryCode}
        onBack={() => setRoute('login')}
        onDone={(profile) => {
          setPatientProfile(profile);
          setRoute('home');
        }}
      />
    );
  } else if (route === 'login') {
    screen = (
      <LoginScreen
        onSignUp={() => setRoute('signup')}
        onForgotPassword={() => setRoute('forgotPassword')}
        initialPhone={authPhone}
        initialCountryCode={authCountryCode}
        onPhoneChange={setAuthPhone}
        onCountryCodeChange={setAuthCountryCode}
        onLogin={() => setRoute(patientProfile ? 'home' : 'profileSetup')}
      />
    );
  } else if (route === 'signup') {
    screen = (
      <SignUpScreen
        onBack={() => setRoute('login')}
        onVerified={() => setRoute('verify-signup')}
        onLogin={() => setRoute('login')}
      />
    );
  } else if (route === 'forgotPassword') {
    screen = (
      <ForgotPasswordScreen
        onBack={() => setRoute('login')}
        onCodeSent={() => setRoute('verify-forgot')}
      />
    );
  } else if (route === 'verify-signup') {
    screen = (
      <VerifyNumberScreen
        onBack={() => setRoute('signup')}
        onDone={() => setRoute('profileSetup')}
      />
    );
  } else if (route === 'verify-forgot') {
    screen = (
      <VerifyNumberScreen
        onBack={() => setRoute('forgotPassword')}
        onDone={() => setRoute(patientProfile ? 'home' : 'profileSetup')}
      />
    );
  } else if (route === 'doctorList') {
    screen = (
      <DoctorListScreen
        onBack={() => setRoute(selectedHospital ? 'selectHospital' : 'home')}
        selectedHospital={selectedHospital}
        onSelectDoctor={(doctor, hospital) => {
          setSelectedDoctor(doctor);
          setSelectedHospital(hospital);
          setRoute('doctorInfo');
        }}
      />
    );
  } else if (route === 'service') {
    screen = (
      <ServiceScreen
        onBack={() => setRoute('home')}
        onOpenSelectHospital={() => setRoute('selectHospital')}
        onOpenDoctorList={() => setRoute('doctorList')}
      />
    );
  } else if (route === 'selectHospital') {
    screen = (
      <SelectHospitalScreen
        onBack={() => setRoute('service')}
        onSelectHospital={(hospital) => {
          setSelectedHospital(hospital);
          setRoute('doctorList');
        }}
        selectedHospitalId={selectedHospital?.id}
      />
    );
  } else if (route === 'pickTime') {
    screen = selectedHospital ? (
      <PickTimeScreen
        onBack={() => setRoute('visitDetails')}
        hospital={selectedHospital}
        visitDetails={visitDetails}
        onEditVisitDetails={() => setRoute('visitDetails')}
        onUpdateVisitDetails={(details) => setVisitDetails(details)}
        onConfirm={handleTimeSelected}
      />
    ) : (
      <SelectHospitalScreen
        onBack={() => setRoute('service')}
        onSelectHospital={(hospital) => {
          setSelectedHospital(hospital);
          setRoute('doctorList');
        }}
      />
    );
  } else if (route === 'bookingConfirmation') {
    screen = selectedHospital && bookingData ? (
      <BookingConfirmationScreen
        hospital={selectedHospital}
        appointmentTime={bookingData.appointment}
        doctor={selectedDoctor}
        visitDetails={visitDetails}
        onConfirm={handleBookingConfirmed}
        onBack={() => setRoute('pickTime')}
      />
    ) : (
      <SelectHospitalScreen
        onBack={() => setRoute('service')}
        onSelectHospital={(hospital) => {
          setSelectedHospital(hospital);
          setRoute('doctorList');
        }}
      />
    );
  } else if (route === 'doctorInfo') {
    screen = selectedDoctor ? (
      <DoctorInfoScreen
        onBack={() => setRoute('doctorList')}
        onSchedule={() => setRoute('visitDetails')}
        onOpenChat={() => setRoute('chat')}
        onSeeAllReviews={() => setRoute('doctorReviews')}
        doctor={selectedDoctor}
        hospital={selectedHospital}
      />
    ) : (
      <DoctorListScreen
        onBack={() => setRoute(selectedHospital ? 'selectHospital' : 'home')}
        onSelectDoctor={(doctor) => {
          setSelectedDoctor(doctor);
          setRoute('doctorInfo');
        }}
      />
    );
  } else if (route === 'visitDetails') {
    screen = selectedDoctor ? (
      <VisitDetailsScreen
        onBack={() => setRoute('doctorInfo')}
        onContinue={(details) => {
          setVisitDetails(details);
          setRoute('pickTime');
        }}
      />
    ) : (
      <DoctorListScreen
        onBack={() => setRoute(selectedHospital ? 'selectHospital' : 'home')}
        selectedHospital={selectedHospital}
        onSelectDoctor={(doctor, hospital) => {
          setSelectedDoctor(doctor);
          setSelectedHospital(hospital);
          setRoute('doctorInfo');
        }}
      />
    );
  } else if (route === 'doctorReviews') {
    screen = (
      <DoctorReviewsScreen
        onBack={() => setRoute('doctorInfo')}
        onStartChat={() => setRoute('chat')}
      />
    );
  } else if (route === 'notification') {
    screen = (
      <NotificationScreen
        onBack={() => setRoute('home')}
        notifications={notifications}
        onMarkAsRead={(id) =>
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
          )
        }
        onRemove={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
      />
    );
  } else if (route === 'chat') {
    screen = (
      <ChatScreen
        onGoHome={() => setRoute('home')}
        onOpenSchedule={() => setRoute('schedule')}
        onOpenProfile={() => setRoute('profile')}
      />
    );
  } else if (route === 'schedule') {
    screen = scheduleScreen;
  } else if (route === 'postConsultation') {
    screen = postConsultAppointment ? (
      <PostConsultationScreen
        appointment={postConsultAppointment}
        onBack={() => setRoute('schedule')}
        onDone={() => {
          setPostConsultAppointment(null);
          setRoute('schedule');
        }}
        onOpenPayment={() => startPaymentFlow(postConsultAppointment, 'postConsultation')}
        onOpenMessages={() => setRoute('chat')}
        prescriptions={prescriptions}
        labRequests={labRequests}
        labUploads={labUploads}
        onOpenPrescriptions={() => setRoute('prescriptions')}
        onOpenLabs={() => setRoute('labs')}
      />
    ) : (
      scheduleScreen
    );
  } else if (route === 'virtualConsultation') {
    screen = activeConsultation ? (
      <VirtualConsultationScreen
        appointment={activeConsultation}
        onBack={() => setRoute('schedule')}
        onEndConsultation={() => {
          setActiveConsultation(null);
          setRoute('postConsultation');
        }}
      />
    ) : (
      scheduleScreen
    );
  } else if (route === 'preConsultation') {
    screen = preConsultAppointment ? (
      <PreConsultationScreen
        appointment={preConsultAppointment}
        onBack={() => setRoute('schedule')}
        onEnterWaitingRoom={() => setActiveConsultation(preConsultAppointment)}
        onJoinConsultation={(appointment) => {
          setActiveConsultation(appointment);
          setRoute('virtualConsultation');
        }}
      />
    ) : (
      scheduleScreen
    );
  } else if (route === 'payment') {
    screen = paymentIntent ? (
      <PaymentScreen
        intent={paymentIntent}
        onClose={() => {
          setPaymentIntent(null);
          setRoute(paymentIntent.originRoute === 'schedule' ? 'schedule' : 'postConsultation');
        }}
        onSuccess={(reference) => {
          setAppointments((prev) =>
            prev.map((appt) =>
              appt.id === paymentIntent.appointmentId
                ? { ...appt, status: 'paid' as const }
                : appt,
            ),
          );
          Alert.alert(
            'Payment successful',
            'Your appointment is confirmed. A receipt has been sent to your email.',
            [
              {
                text: 'Continue',
                onPress: () => {
                  setPaymentIntent(null);
                  setRoute(paymentIntent.originRoute === 'schedule' ? 'schedule' : 'postConsultation');
                },
              },
            ],
          );
        }}
        onError={(message) => {
          Alert.alert('Payment failed', message ?? 'Please try again.');
        }}
      />
    ) : (
      scheduleScreen
    );
  } else if (route === 'prescriptions') {
    screen = (
      <PrescriptionsScreen
        onBack={() => setRoute('home')}
        prescriptions={prescriptions}
        onRemovePrescription={handleRemovePrescription}
      />
    );
  } else if (route === 'labs') {
    screen = (
      <LabsScreen
        onBack={() => setRoute('home')}
        labRequests={labRequests}
        uploadedResults={labUploads}
        onUploadResult={handleUploadLabResult}
      />
    );
  } else if (route === 'documents') {
    screen = (
      <DocumentArchiveScreen
        onBack={() => {
          setSelectedDocumentId(null);
          setRoute('home');
        }}
        documents={documents}
        initialDocumentId={selectedDocumentId}
      />
    );
  } else if (route === 'providerInvite') {
    screen = (
      <ProviderInviteScreen
        onBack={() => setRoute('onboarding')}
        onInviteValidated={(context) => {
          setProviderInviteContext(context);
          setRoute('providerOnboarding');
        }}
      />
    );
  } else if (route === 'providerOnboarding') {
    if (!providerInviteContext) {
      screen = (
        <ProviderInviteScreen
          onBack={() => setRoute('onboarding')}
          onInviteValidated={(context) => {
            setProviderInviteContext(context);
            setRoute('providerOnboarding');
          }}
        />
      );
    } else {
      screen = (
        <ProviderOnboardingScreen
          inviteContext={providerInviteContext}
          onBack={() => setRoute('providerInvite')}
          onCancel={() => setRoute('onboarding')}
          onSubmit={(draft) => {
            setProviderDraft(draft);
            setRoute('providerPending');
          }}
        />
      );
    }
  } else if (route === 'providerPending') {
    if (!providerDraft) {
      screen = (
        <ProviderInviteScreen
          onBack={() => setRoute('onboarding')}
          onInviteValidated={(context) => {
            setProviderInviteContext(context);
            setRoute('providerOnboarding');
          }}
        />
      );
    } else {
      screen = (
        <ProviderPendingScreen
          draft={providerDraft}
          onBackToStart={() => {
            setProviderDraft(null);
            setProviderInviteContext(null);
            setRoute('onboarding');
          }}
          onOpenDashboard={() => {
            setRoute('providerDashboard');
          }}
          onViewPatientApp={() => {
            setRoute(patientProfile ? 'home' : 'login');
          }}
        />
      );
    }
  } else if (route === 'providerDashboard') {
    if (!providerDraft) {
      screen = (
        <ProviderInviteScreen
          onBack={() => setRoute('onboarding')}
          onInviteValidated={(context) => {
            setProviderInviteContext(context);
            setRoute('providerOnboarding');
          }}
        />
      );
    } else {
      const providerName = providerDraft.fullName || providerInviteContext?.fullName || 'Tele Heal Provider';

      const mapAppointmentToContext = (appointmentId: string): ProviderConsultContext => {
        const fallback: ProviderConsultContext = {
          id: appointmentId,
          patientName: 'Tele Heal Patient',
          reason: 'General consultation',
          scheduledTime: 'Today · 09:00',
        };

        const lookup: Record<string, ProviderConsultContext> = {
          'queue-1': {
            id: 'queue-1',
            patientName: 'Ama Mensah',
            reason: 'Migraine follow-up',
            scheduledTime: 'Today · 09:00',
          },
          'queue-2': {
            id: 'queue-2',
            patientName: 'Kwesi Boateng',
            reason: 'Skin rash photo review',
            scheduledTime: 'Async review · due 12:00',
          },
          'queue-3': {
            id: 'queue-3',
            patientName: 'Linda Asare',
            reason: 'Hypertension check-in',
            scheduledTime: 'Today · 10:30',
          },
          'sched-1': {
            id: 'sched-1',
            patientName: 'Ama Mensah',
            reason: 'Migraine follow-up',
            scheduledTime: '09:00 – 09:25',
          },
          'sched-2': {
            id: 'sched-2',
            patientName: 'Linda Asare',
            reason: 'Hypertension check-in',
            scheduledTime: '10:30 – 11:00',
          },
          'sched-3': {
            id: 'sched-3',
            patientName: 'Kwesi Boateng',
            reason: 'Skin rash photo review',
            scheduledTime: 'Async · due 12:00',
          },
        };

        return lookup[appointmentId] ?? fallback;
      };

      const createCallSession = (context: ProviderConsultContext): ProviderCallSession => ({
        ...context,
        status: 'waiting',
        patientReady: true,
        chat: [
          { id: 'chat-1', author: 'patient', text: 'Hi doctor! I’m ready whenever you are.' },
          { id: 'chat-2', author: 'provider', text: 'Thanks Ama, reviewing your intake now.' },
        ],
        notes: [
          'Pre-visit summary shared with patient.',
        ],
      });

      const updateCallSession = (updater: (session: ProviderCallSession) => ProviderCallSession) => {
        setProviderCallSession((prev) => (prev ? updater(prev) : prev));
      };

      const appendProviderChat = (text: string) => {
        updateCallSession((session) => ({
          ...session,
          chat: [...session.chat, { id: `chat-${Date.now()}`, author: 'provider', text }],
        }));
      };

      const appendProviderNote = (text: string) => {
        updateCallSession((session) => ({
          ...session,
          notes: [text, ...session.notes],
        }));
      };

      const handleComingSoon = (title: string, body: string) => {
        Alert.alert(title, body);
      };

      screen = (
        <ProviderDashboardScreen
          providerName={providerName}
          onBack={() => setRoute('providerPending')}
          onOpenConsult={(appointmentId) => {
            const consultContext = mapAppointmentToContext(appointmentId);
            setProviderConsultContext(consultContext);
            setProviderCallSession(createCallSession(consultContext));
            setRoute('providerConsult');
          }}
          onOpenSettings={() => setRoute('providerScheduleSettings')}
          scheduleSettings={providerScheduleSettings}
          intakePreviews={MOCK_INTAKE_PREVIEWS}
          onOpenTasks={() =>
            handleComingSoon(
              'Task center coming soon',
              'We’ll surface full documentation tasks and billing follow-ups here.',
            )
          }
          onOpenMessages={() =>
            handleComingSoon('Provider messaging', 'Secure provider chat will be wired once the backend is ready.')
          }
          onOpenSchedule={() =>
            handleComingSoon('Calendar view', 'We’ll open a dedicated provider calendar experience here.')
          }
        />
      );
    }
  } else if (route === 'providerConsult') {
    if (!providerConsultContext) {
      setRoute('providerDashboard');
      screen = null;
    } else {
      const session = providerCallSession;
      screen = (
        <ProviderConsultWorkspaceScreen
          patientName={providerConsultContext.patientName}
          appointmentReason={providerConsultContext.reason}
          scheduledTime={providerConsultContext.scheduledTime}
          initialPatientReady={session?.patientReady ?? true}
          initialCallStatus={session?.status ?? 'waiting'}
          chatMessages={session?.chat ?? []}
          sharedNotes={session?.notes ?? []}
          patientHistory={MOCK_PATIENT_HISTORY[providerConsultContext.id] ?? []}
          onCreatePrescription={handleCreatePrescription}
          onOrderLab={handleOrderLab}
          onBack={() => setRoute('providerDashboard')}
          onComplete={() => {
            setPendingWrapUpContext(providerConsultContext);
            setRoute('providerWrapUp');
          }}
          onAddOrder={() =>
            Alert.alert(
              'Orders coming soon',
              'Lab and prescription ordering will be available once backend services are ready.',
            )
          }
          onSendMessage={() =>
            Alert.alert('Messaging coming soon', 'Secure provider messaging will be enabled in a future update.')
          }
          onAdmitPatient={() => {
            if (!providerCallSession && providerConsultContext) {
              setProviderCallSession(createCallSession(providerConsultContext));
            }
            setProviderCallSession((prev) =>
              prev ? { ...prev, status: 'live', patientReady: true } : prev,
            );
            setRoute('providerCall');
          }}
          onSendChatMessage={(message) => appendProviderChat(message)}
          onShareVisitNote={(note) => appendProviderNote(note)}
        />
      );
    }
  } else if (route === 'providerCall') {
    if (!providerCallSession) {
      setRoute('providerConsult');
      screen = null;
    } else {
      screen = (
        <ProviderCallScreen
          patientName={providerCallSession.patientName}
          appointmentReason={providerCallSession.reason}
          scheduledTime={providerCallSession.scheduledTime}
          chatMessages={providerCallSession.chat}
          sharedNotes={providerCallSession.notes}
          onBack={() => setRoute('providerConsult')}
          onOpenWorkspace={() => setRoute('providerConsult')}
          onSendChatMessage={(message) => appendProviderChat(message)}
          onAddSharedNote={(note) => appendProviderNote(note)}
          onEndCall={() => {
            setProviderCallSession((prev) => (prev ? { ...prev, status: 'waiting' } : prev));
            setPendingWrapUpContext(providerCallSession ?? providerConsultContext);
            setRoute('providerWrapUp');
          }}
        />
      );
    }
  } else if (route === 'providerScheduleSettings') {
    screen = (
      <ProviderScheduleSettingsScreen
        settings={providerScheduleSettings}
        onBack={() => setRoute('providerDashboard')}
        onSave={(next: ProviderScheduleSettingsDraft) => {
          setProviderScheduleSettings(next);
          Alert.alert('Schedule updated', 'Your availability and fees have been saved.');
          setRoute('providerDashboard');
        }}
      />
    );
  } else if (route === 'providerWrapUp') {
    if (!pendingWrapUpContext) {
      setRoute('providerDashboard');
      screen = null;
    } else {
      screen = (
        <ProviderVisitWrapUpScreen
          patientName={pendingWrapUpContext.patientName}
          appointmentReason={pendingWrapUpContext.reason}
          scheduledTime={pendingWrapUpContext.scheduledTime}
          onBack={() => setRoute('providerDashboard')}
          onSubmit={() => {
            Alert.alert('Wrap-up saved', 'Notes, billing, and follow-up have been recorded.');
            setPendingWrapUpContext(null);
            setRoute('providerDashboard');
          }}
        />
      );
    }
  } else {
    screen = (
      <HomeScreen
        onSeeAllDoctors={() => setRoute('doctorList')}
        onOpenService={() => setRoute('service')}
        onOpenSchedule={() => setRoute('schedule')}
        onOpenProfile={() => setRoute('profile')}
        onOpenChat={() => setRoute('chat')}
        onOpenNotifications={() => setRoute('notification')}
        onOpenPrescriptions={() => setRoute('prescriptions')}
        onOpenLabs={() => setRoute('labs')}
        onOpenDocuments={(docId) => {
          setSelectedDocumentId(docId ?? null);
          setRoute('documents');
        }}
        prescriptionCount={prescriptions.length}
        labRequestCount={labRequests.length}
        pendingLabUploads={labUploads.filter((upload) => upload.status === 'pendingReview').length}
        documents={documents}
        unreadCount={unreadNotificationCount}
      />
    );
  }

  return (
    <SafeAreaProvider>
      {screen}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
