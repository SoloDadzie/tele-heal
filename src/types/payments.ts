import type { CurrencyCode } from '../config/regions';

export type PaymentIntent = {
  appointmentId: string;
  serviceLabel: string;
  amountValue: number;
  currency: CurrencyCode;
  patientName: string;
  patientEmail: string;
  reference: string;
  originRoute: 'schedule' | 'postConsultation';
};
