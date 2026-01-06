import React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import i18n from './src/i18n/config';
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
import ProviderTasksScreen from './src/screens/ProviderTasksScreen';
import ProviderMessagingScreen from './src/screens/ProviderMessagingScreen';
import ProviderCalendarScreen from './src/screens/ProviderCalendarScreen';
import PatientAppointmentsScreen from './src/screens/PatientAppointmentsScreen';
import PatientPrescriptionSharingScreen from './src/screens/PatientPrescriptionSharingScreen';
import PatientDocumentSharingScreen from './src/screens/PatientDocumentSharingScreen';
import type { DocumentRecord } from './src/types/documents';
import type { PaymentIntent } from './src/types/payments';
import type { CurrencyCode } from './src/config/regions';
import Button from './src/components/Button';
import ThemedText from './src/components/ThemedText';
import { theme } from './src/theme';
import { formatCurrency } from './src/utils/currency';
import {
  MOCK_DOCTORS,
  MOCK_PATIENT_PROFILE,
  MOCK_APPOINTMENTS,
  MOCK_PRESCRIPTIONS,
  MOCK_LAB_REQUESTS,
  MOCK_LAB_UPLOADS,
  MOCK_DOCUMENTS,
  MOCK_PROVIDER_PATIENTS,
} from './src/data/mockData';

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
  | 'patientProfileSetup'
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
  | 'providerWrapUp'
  | 'providerTasks'
  | 'providerMessaging'
  | 'providerCalendar'
  | 'patientAppointments'
  | 'patientPrescriptionSharing'
  | 'patientDocumentSharing';

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

type PatientHistoryEntry = {
  id: string;
  title: string;
  date: string;
  summary: string;
};

type ProviderOrder = {
  id: string;
  type: 'prescription' | 'lab';
  detail: string;
  timestamp: string;
};

type TreatmentPlan = {
  summary: string;
  goals: string[];
};

type WrapUpSummary = {
  id: string;
  patientName: string;
  reason: string;
  scheduledTime: string;
  notes: string;
  billingCode: string;
  followUp: string;
  followUpDetails: string;
  followUpDate?: string;
  followUpTime?: string;
  followUpScheduled: boolean;
};

type ProviderCallSession = ProviderConsultContext & {
  status: 'waiting' | 'live';
  patientReady: boolean;
  chat: ProviderCallMessage[];
  notes: string[];
  orders: ProviderOrder[];
  treatmentPlan: TreatmentPlan;
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

const DEFAULT_TREATMENT_PLAN: TreatmentPlan = {
  summary: 'Continue tracking migraine triggers and hydration.',
  goals: ['Maintain headache diary', 'Take magnesium supplement nightly', 'Schedule follow-up in 4 weeks'],
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
  orders: [],
  treatmentPlan: DEFAULT_TREATMENT_PLAN,
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
  const [profileSetupDraft, setProfileSetupDraft] = React.useState<Omit<PatientProfile, 'completedAt'> | null>(null);
  const [authPhone, setAuthPhone] = React.useState('');
  const [authCountryCode, setAuthCountryCode] = React.useState<string | undefined>(undefined);
  const [providerInviteContext, setProviderInviteContext] = React.useState<ProviderInviteContext | null>(null);
  const [providerDraft, setProviderDraft] = React.useState<ProviderProfileDraft | null>(null);
  const [providerConsultContext, setProviderConsultContext] = React.useState<ProviderConsultContext | null>(null);
  const [providerCallSession, setProviderCallSession] = React.useState<ProviderCallSession | null>(null);
  const [appointments, setAppointments] = React.useState<Appointment[]>(MOCK_APPOINTMENTS);

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
  const [wrapUpSummaries, setWrapUpSummaries] = React.useState<WrapUpSummary[]>([]);
  const [providerScheduleSettings, setProviderScheduleSettings] =
    React.useState<ProviderScheduleSettingsDraft>(DEFAULT_SCHEDULE_SETTINGS);
  const [pendingWrapUpContext, setPendingWrapUpContext] = React.useState<ProviderConsultContext | null>(null);
  const [consultWorkspaceStates, setConsultWorkspaceStates] = React.useState<
    Record<string, { notes: string[]; messages: Array<{ id: string; author: string; text: string }>; isMuted: boolean; isVideoOff: boolean; isSharingScreen: boolean; lastUpdated: string }>
  >({});

  const appendProviderChat = React.useCallback((text: string) => {
    setProviderCallSession((prev) =>
      prev ? { ...prev, chat: [...prev.chat, { id: `chat-${Date.now()}`, author: 'provider', text }] } : prev,
    );
  }, []);

  const appendProviderNote = React.useCallback((text: string) => {
    setProviderCallSession((prev) => (prev ? { ...prev, notes: [text, ...prev.notes] } : prev));
  }, []);

  const appendProviderOrder = React.useCallback((type: 'prescription' | 'lab', detail: string) => {
    setProviderCallSession((prev) =>
      prev
        ? {
            ...prev,
            orders: [
              {
                id: `order-${Date.now()}`,
                type,
                detail,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
              ...prev.orders,
            ],
          }
        : prev,
    );
  }, []);

  const updateTreatmentPlan = React.useCallback((plan: TreatmentPlan) => {
    setProviderCallSession((prev) => (prev ? { ...prev, treatmentPlan: plan } : prev));
  }, []);

  const addWrapUpSummary = React.useCallback(
    (payload: Omit<WrapUpSummary, 'id' | 'patientName' | 'reason' | 'scheduledTime' | 'followUpScheduled'>) => {
      if (!pendingWrapUpContext) return;
      setWrapUpSummaries((prev) => [
        {
          id: `wrap-${Date.now()}`,
          patientName: pendingWrapUpContext.patientName,
          reason: pendingWrapUpContext.reason,
          scheduledTime: pendingWrapUpContext.scheduledTime,
          followUpScheduled: false,
          ...payload,
        },
        ...prev,
      ]);
    },
    [pendingWrapUpContext],
  );

  const markFollowUpScheduled = React.useCallback((wrapId: string) => {
    setWrapUpSummaries((prev) =>
      prev.map((item) => (item.id === wrapId ? { ...item, followUpScheduled: true } : item)),
    );
    Alert.alert('Follow-up scheduled', 'This wrap-up has been marked as scheduled.');
  }, []);

  const handleCreatePrescription = React.useCallback((note: string) => {
    appendProviderOrder('prescription', note);
  }, [appendProviderOrder]);

  const handleOrderLab = React.useCallback((note: string) => {
    appendProviderOrder('lab', note);
  }, [appendProviderOrder]);
  const [documents] = React.useState<DocumentRecord[]>(MOCK_DOCUMENTS);
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionItem[]>(MOCK_PRESCRIPTIONS);
  const [labRequests, setLabRequests] = React.useState<LabRequest[]>(MOCK_LAB_REQUESTS);
  const [labUploads, setLabUploads] = React.useState<LabUpload[]>(MOCK_LAB_UPLOADS);

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
      total: 'GHS 3,900.00',
      amountValue: 3900,
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
      onOpenAppointments={() => setRoute('patientAppointments')}
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
  } else if (route === 'patientProfileSetup') {
    screen = (
      <ProfileSetupScreen
        initialEmail={authPhone}
        onDone={(profile) => {
          setPatientProfile(profile);
          setProfileSetupDraft(null);
          setRoute('home');
        }}
        onBack={() => setRoute('home')}
        initialDraft={profileSetupDraft}
        onDraftChange={setProfileSetupDraft}
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
          setProfileSetupDraft(null);
          setRoute('home');
        }}
        initialDraft={profileSetupDraft}
        onDraftChange={setProfileSetupDraft}
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
        workspaceState={
          consultWorkspaceStates[activeConsultation.id]
            ? {
                appointmentId: activeConsultation.id,
                ...consultWorkspaceStates[activeConsultation.id],
              }
            : undefined
        }
        onWorkspaceStateChange={(state) => {
          setConsultWorkspaceStates((prev) => ({
            ...prev,
            [state.appointmentId]: {
              notes: state.notes,
              messages: state.messages,
              isMuted: state.isMuted,
              isVideoOff: state.isVideoOff,
              isSharingScreen: state.isSharingScreen,
              lastUpdated: state.lastUpdated,
            },
          }));
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
            setProviderScheduleSettings({
              timezone: draft.timezone,
              availabilityNote: draft.availabilityNote,
              availabilitySlots: draft.availabilitySlots,
              feeCurrency: draft.feeCurrency,
              feeAmount: draft.hourlyRate,
            });
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
          wrapUpSummaries={wrapUpSummaries}
          onScheduleFollowUp={(id) => markFollowUpScheduled(id)}
          onOpenTasks={() => setRoute('providerTasks')}
          onOpenMessages={() => setRoute('providerMessaging')}
          onOpenSchedule={() => setRoute('providerCalendar')}
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
          orders={session?.orders ?? []}
          treatmentPlan={session?.treatmentPlan}
          onCreatePrescription={handleCreatePrescription}
          onOrderLab={handleOrderLab}
          onUpdateTreatmentPlan={updateTreatmentPlan}
          onBack={() => setRoute('providerDashboard')}
          onComplete={() => {
            setPendingWrapUpContext(providerConsultContext);
            setRoute('providerWrapUp');
          }}
          onAddOrder={() => {
            Alert.alert(
              'Order created',
              'The order has been added to the patient record and will be processed after the visit.',
              [{ text: 'OK', onPress: () => {} }],
            );
          }}
          onSendMessage={() => {
            Alert.alert(
              'Message sent',
              'Your message has been delivered to the patient securely.',
              [{ text: 'OK', onPress: () => {} }],
            );
          }}
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
          onSubmit={(payload) => {
            addWrapUpSummary(payload);
            Alert.alert('Wrap-up saved', 'Notes, billing, and follow-up have been recorded.');
            setPendingWrapUpContext(null);
            setRoute('providerDashboard');
          }}
        />
      );
    }
  } else if (route === 'providerTasks') {
    screen = (
      <ProviderTasksScreen
        onBack={() => setRoute('providerDashboard')}
      />
    );
  } else if (route === 'providerMessaging') {
    screen = (
      <ProviderMessagingScreen
        onBack={() => setRoute('providerDashboard')}
      />
    );
  } else if (route === 'providerCalendar') {
    screen = (
      <ProviderCalendarScreen
        onBack={() => setRoute('providerDashboard')}
      />
    );
  } else if (route === 'patientAppointments') {
    screen = (
      <PatientAppointmentsScreen
        appointments={appointments}
        onBack={() => setRoute('schedule')}
        onCancelAppointment={handleCancelAppointment}
        onRescheduleAppointment={handleRescheduleAppointment}
      />
    );
  } else if (route === 'patientPrescriptionSharing') {
    screen = (
      <PatientPrescriptionSharingScreen
        prescriptions={prescriptions}
        onBack={() => setRoute('prescriptions')}
      />
    );
  } else if (route === 'patientDocumentSharing') {
    screen = (
      <PatientDocumentSharingScreen
        documents={documents}
        onBack={() => setRoute('documents')}
      />
    );
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
        onOpenAppointments={() => setRoute('patientAppointments')}
        onOpenProfileSetup={() => setRoute('patientProfileSetup')}
        prescriptionCount={prescriptions.length}
        labRequestCount={labRequests.length}
        pendingLabUploads={labUploads.filter((upload) => upload.status === 'pendingReview').length}
        documents={documents}
        unreadCount={unreadNotificationCount}
        userName={patientProfile?.fullName ?? null}
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
