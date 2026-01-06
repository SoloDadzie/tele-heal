/**
 * Comprehensive interconnected mock data for Tele Heal
 * Doctors, patients, appointments, and medical records are linked for realistic testing
 */

import type { Appointment } from '../screens/ScheduleScreen';
import type { PrescriptionItem } from '../screens/PrescriptionsScreen';
import type { LabRequest, LabUpload } from '../screens/LabsScreen';
import type { DocumentRecord } from '../types/documents';

// Custom doctor type for mock data (simplified from DoctorListItem)
export type MockDoctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  image: string;
  availability: string;
  fee: number;
  languages: string[];
  experience: string;
  bio: string;
  hospital: string;
  insuranceAccepted: string[];
};

// ============================================================================
// DOCTORS DATA
// ============================================================================

export const MOCK_DOCTORS: MockDoctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    rating: 4.8,
    reviewCount: 342,
    image: 'https://via.placeholder.com/80?text=SJ',
    availability: 'Available today',
    fee: 650,
    languages: ['English', 'Spanish'],
    experience: '12 years',
    bio: 'Board-certified family medicine physician with expertise in preventive care and chronic disease management.',
    hospital: 'Metropolitan Medical Center',
    insuranceAccepted: ['Blue Shield', 'Aetna', 'United Healthcare'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Mark Lee',
    specialty: 'Cardiology',
    rating: 4.9,
    reviewCount: 287,
    image: 'https://via.placeholder.com/80?text=ML',
    availability: 'Available Tue, Thu',
    fee: 1200,
    languages: ['English', 'Mandarin'],
    experience: '15 years',
    bio: 'Interventional cardiologist specializing in heart disease prevention and management.',
    hospital: 'Heart & Vascular Institute',
    insuranceAccepted: ['Blue Shield', 'Cigna', 'Humana'],
  },
  {
    id: 'doc-3',
    name: 'Dr. Amina Khan',
    specialty: 'Internal Medicine',
    rating: 4.7,
    reviewCount: 215,
    image: 'https://via.placeholder.com/80?text=AK',
    availability: 'Available today',
    fee: 750,
    languages: ['English', 'Urdu', 'Hindi'],
    experience: '10 years',
    bio: 'Internal medicine specialist focused on complex medical conditions and diagnostic excellence.',
    hospital: 'Metropolitan Medical Center',
    insuranceAccepted: ['Blue Shield', 'Aetna', 'United Healthcare'],
  },
  {
    id: 'doc-4',
    name: 'Dr. James Wilson',
    specialty: 'Dermatology',
    rating: 4.6,
    reviewCount: 198,
    image: 'https://via.placeholder.com/80?text=JW',
    availability: 'Available Wed, Fri',
    fee: 550,
    languages: ['English'],
    experience: '8 years',
    bio: 'Dermatologist specializing in skin conditions, cosmetic procedures, and preventive skincare.',
    hospital: 'Skin & Wellness Clinic',
    insuranceAccepted: ['Blue Shield', 'Cigna', 'Aetna'],
  },
  {
    id: 'doc-5',
    name: 'Dr. Lisa Chen',
    specialty: 'Pediatrics',
    rating: 4.9,
    reviewCount: 421,
    image: 'https://via.placeholder.com/80?text=LC',
    availability: 'Available today',
    fee: 500,
    languages: ['English', 'Mandarin', 'Cantonese'],
    experience: '11 years',
    bio: 'Pediatrician dedicated to child health, development, and family-centered care.',
    hospital: 'Children\'s Medical Center',
    insuranceAccepted: ['Blue Shield', 'United Healthcare', 'Medicaid'],
  },
];

// ============================================================================
// PATIENT DATA
// ============================================================================

export const MOCK_PATIENT_PROFILE = {
  fullName: 'David Martinez',
  phone: '+1 (555) 234-5678',
  email: 'david.martinez@email.com',
  gender: 'Male',
  dateOfBirth: '1985-06-15',
  address: '742 Oak Street, San Francisco, CA 94102',

  medicalHistory: 'Hypertension (diagnosed 2018), mild dizziness episodes (2024), family history of heart disease',
  allergies: 'Penicillin (rash), Shellfish (anaphylaxis risk)',
  medications: 'Losartan 50mg daily, Hydrochlorothiazide 25mg daily',

  insuranceProvider: 'Blue Shield',
  insuranceMemberId: 'BS-987654321',
  insuranceFrontUri: null,
  insuranceBackUri: null,

  consentTelemedicine: true,
  consentPrivacy: true,
  completedAt: '2024-08-15T10:30:00Z',
};

// ============================================================================
// APPOINTMENTS DATA - Linked to doctors
// ============================================================================

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    code: '#0012345678',
    serviceLabel: 'Blood pressure check & follow-up',
    total: '$650.00',
    amountValue: 650,
    currency: 'USD',
    status: 'paid',
    doctorName: 'Dr. Sarah Johnson',
    dateLabel: 'Today',
    timeLabel: '09:00 AM',
    group: 'today',
    visitType: 'virtual',
    locationLabel: 'Virtual visit · Tele Heal',
    prepStatus: 'complete',
    prepNote: 'Pre-consultation checklist completed',
  },
  {
    id: 'appt-2',
    code: '#0012345679',
    serviceLabel: 'Cardiology consultation',
    total: '$1,200.00',
    amountValue: 1200,
    currency: 'USD',
    status: 'paid',
    doctorName: 'Dr. Mark Lee',
    dateLabel: 'Friday, Dec 15',
    timeLabel: '02:30 PM',
    group: 'upcoming',
    visitType: 'virtual',
    locationLabel: 'Virtual visit · Tele Heal',
    prepStatus: 'notStarted',
  },
  {
    id: 'appt-3',
    code: '#0012345680',
    serviceLabel: 'General checkup',
    total: '$750.00',
    amountValue: 750,
    currency: 'USD',
    status: 'pendingPayment',
    doctorName: 'Dr. Amina Khan',
    dateLabel: 'Monday, Dec 18',
    timeLabel: '10:00 AM',
    group: 'upcoming',
    visitType: 'virtual',
    locationLabel: 'Virtual visit · Tele Heal',
    prepStatus: 'notStarted',
  },
];

// ============================================================================
// PRESCRIPTIONS DATA - Linked to doctors and medical conditions
// ============================================================================

export const MOCK_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: 'rx-1',
    name: 'Losartan 50mg',
    dosage: '1 tablet',
    instructions: 'Take once daily in the morning with or without food. Monitor blood pressure regularly.',
    issuedBy: 'Dr. Sarah Johnson',
    issuedOn: 'Aug 28, 2024',
    refillsRemaining: 3,
  },
  {
    id: 'rx-2',
    name: 'Hydrochlorothiazide 25mg',
    dosage: '1 tablet',
    instructions: 'Take once daily in the morning. May cause increased urination. Stay hydrated.',
    issuedBy: 'Dr. Sarah Johnson',
    issuedOn: 'Aug 28, 2024',
    refillsRemaining: 2,
  },
  {
    id: 'rx-3',
    name: 'Meclizine 25mg',
    dosage: '1 tablet',
    instructions: 'Take every 8 hours as needed for dizziness. May cause drowsiness; avoid driving.',
    issuedBy: 'Dr. Sarah Johnson',
    issuedOn: 'Sep 5, 2024',
    refillsRemaining: 5,
  },
  {
    id: 'rx-4',
    name: 'Vitamin D 1000 IU',
    dosage: '1 capsule',
    instructions: 'Take once daily with food to improve absorption.',
    issuedBy: 'Dr. Sarah Johnson',
    issuedOn: 'Aug 28, 2024',
    refillsRemaining: 8,
  },
  {
    id: 'rx-5',
    name: 'Aspirin 81mg',
    dosage: '1 tablet',
    instructions: 'Take once daily for cardiovascular protection. Take with food if stomach upset occurs.',
    issuedBy: 'Dr. Mark Lee',
    issuedOn: 'Sep 10, 2024',
    refillsRemaining: 4,
  },
];

// ============================================================================
// LAB REQUESTS & RESULTS - Linked to medical conditions and doctors
// ============================================================================

export const MOCK_LAB_REQUESTS: LabRequest[] = [
  {
    id: 'lab-1',
    name: 'Complete Blood Count (CBC)',
    orderingDoctor: 'Dr. Sarah Johnson',
    orderedOn: 'Aug 29, 2024',
    status: 'ready',
    instructions: 'Results available to review in the app.',
  },
  {
    id: 'lab-2',
    name: 'Comprehensive Metabolic Panel (CMP)',
    orderingDoctor: 'Dr. Sarah Johnson',
    orderedOn: 'Aug 29, 2024',
    status: 'ready',
    instructions: 'Includes kidney and liver function tests.',
  },
  {
    id: 'lab-3',
    name: 'Lipid Panel',
    orderingDoctor: 'Dr. Mark Lee',
    orderedOn: 'Sep 10, 2024',
    status: 'processing',
    instructions: 'Fasting results recommended. Visit any partner lab this week.',
  },
  {
    id: 'lab-4',
    name: 'Thyroid Function Test (TSH)',
    orderingDoctor: 'Dr. Amina Khan',
    orderedOn: 'Sep 12, 2024',
    status: 'scheduled',
    instructions: 'Scheduled for Sep 18 · 9:00 AM at Quest Diagnostics.',
  },
  {
    id: 'lab-5',
    name: 'Electrocardiogram (EKG)',
    orderingDoctor: 'Dr. Mark Lee',
    orderedOn: 'Sep 10, 2024',
    status: 'scheduled',
    instructions: 'Scheduled for Sep 20 · 2:00 PM at Heart & Vascular Institute.',
  },
];

export const MOCK_LAB_UPLOADS: LabUpload[] = [
  {
    id: 'upload-1',
    name: 'CBC_Results_Aug2024.pdf',
    submittedAt: 'Aug 31, 2024',
    uri: '',
    status: 'reviewed',
  },
  {
    id: 'upload-2',
    name: 'CMP_Results_Aug2024.pdf',
    submittedAt: 'Sep 1, 2024',
    uri: '',
    status: 'reviewed',
  },
];

// ============================================================================
// DOCUMENTS - Linked to appointments and doctors
// ============================================================================

export const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-1',
    title: 'Visit Summary · Sep 5',
    subtitle: 'Dr. Sarah Johnson • PDF · 2.3 MB',
    date: '2d ago',
    summary:
      'Follow-up visit for hypertension management. Blood pressure readings: 138/86 (slightly elevated). Discussed medication adherence and lifestyle modifications. Meclizine prescribed for dizziness episodes. Continue current antihypertensive regimen.',
    author: 'Dr. Sarah Johnson',
    downloadUrl: 'https://example.com/docs/visit-sep5.pdf',
  },
  {
    id: 'doc-2',
    title: 'Lab Results · Complete Blood Count',
    subtitle: 'Quest Diagnostics • PDF · 640 KB',
    date: '1w ago',
    summary:
      'CBC panel completed Aug 31, 2024. All values within normal ranges. RBC: 4.8M, WBC: 7.2K, Platelets: 245K. No abnormalities detected. Results reviewed by Dr. Sarah Johnson.',
    author: 'Quest Diagnostics',
    downloadUrl: 'https://example.com/docs/cbc-aug31.pdf',
  },
  {
    id: 'doc-3',
    title: 'Lab Results · Metabolic Panel',
    subtitle: 'Quest Diagnostics • PDF · 720 KB',
    date: '1w ago',
    summary:
      'Comprehensive metabolic panel completed Aug 31, 2024. Kidney function normal (Creatinine: 0.9). Liver function normal (AST: 28, ALT: 32). Electrolytes balanced. Glucose: 98 mg/dL (fasting). No concerns noted.',
    author: 'Quest Diagnostics',
    downloadUrl: 'https://example.com/docs/cmp-aug31.pdf',
  },
  {
    id: 'doc-4',
    title: 'Prescription List · Current Medications',
    subtitle: 'Tele Heal • PDF · 185 KB',
    date: '3d ago',
    summary:
      'Current active prescriptions as of Sep 3, 2024: Losartan 50mg (daily), Hydrochlorothiazide 25mg (daily), Meclizine 25mg (as needed), Vitamin D 1000 IU (daily), Aspirin 81mg (daily). All medications reviewed for interactions.',
    author: 'Tele Heal System',
    downloadUrl: 'https://example.com/docs/prescriptions-current.pdf',
  },
  {
    id: 'doc-5',
    title: 'Insurance Verification',
    subtitle: 'Blue Shield • PDF · 512 KB',
    date: '2w ago',
    summary:
      'Insurance verification for Blue Shield member #BS-987654321. Coverage active and in good standing. Copay: $40 for specialist visits. Deductible: $1,500 (met). Coverage includes preventive care, lab work, and telemedicine visits.',
    author: 'Blue Shield',
    downloadUrl: 'https://example.com/docs/insurance-verify.pdf',
  },
];

// ============================================================================
// PROVIDER MOCK DATA - For provider dashboard
// ============================================================================

export const MOCK_PROVIDER_PATIENTS = [
  {
    id: 'patient-1',
    name: 'David Martinez',
    condition: 'Hypertension follow-up',
    lastVisit: 'Sep 5, 2024',
    nextAppointment: 'Today · 9:00 AM',
    status: 'ready',
  },
  {
    id: 'patient-2',
    name: 'Jennifer Wong',
    condition: 'Diabetes management',
    lastVisit: 'Aug 20, 2024',
    nextAppointment: 'Sep 15, 2024 · 11:00 AM',
    status: 'pending',
  },
  {
    id: 'patient-3',
    name: 'Robert Thompson',
    condition: 'Post-surgery follow-up',
    lastVisit: 'Aug 28, 2024',
    nextAppointment: 'Sep 18, 2024 · 3:00 PM',
    status: 'pending',
  },
];

export const MOCK_INTAKE_PREVIEWS = [
  {
    id: 'intake-1',
    patientName: 'David Martinez',
    appointmentTime: 'Today · 9:00 AM',
    condition: 'Hypertension follow-up',
    prepStatus: 'complete' as const,
    questionsAnswered: 8,
    totalQuestions: 8,
  },
  {
    id: 'intake-2',
    patientName: 'Jennifer Wong',
    appointmentTime: 'Sep 15 · 11:00 AM',
    condition: 'Diabetes management',
    prepStatus: 'notStarted' as const,
    questionsAnswered: 0,
    totalQuestions: 12,
  },
];

export const MOCK_PATIENT_HISTORY = {
  'patient-1': [
    {
      date: 'Sep 5, 2024',
      type: 'Visit',
      title: 'Hypertension follow-up',
      details: 'BP: 138/86. Discussed medication adherence.',
    },
    {
      date: 'Aug 28, 2024',
      type: 'Lab',
      title: 'Complete Blood Count',
      details: 'All values normal. No abnormalities.',
    },
    {
      date: 'Aug 15, 2024',
      type: 'Visit',
      title: 'Initial consultation',
      details: 'Established care. Started antihypertensive therapy.',
    },
  ],
};
