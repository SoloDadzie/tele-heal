import { supabase } from './supabase';

export interface PaymentInitData {
  appointmentId: string;
  amount: number;
  email: string;
  fullName: string;
}

export interface PaymentVerifyData {
  reference: string;
  appointmentId: string;
}

/**
 * Initialize payment with Paystack
 */
export const initializePayment = async (data: PaymentInitData) => {
  try {
    const { appointmentId, amount, email, fullName } = data;

    // Call edge function to initialize Paystack payment
    const { data: response, error } = await supabase.functions.invoke('initialize-payment', {
      body: {
        appointmentId,
        amount: Math.round(amount * 100), // Convert to pesewas
        email,
        fullName,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Verify payment with Paystack
 */
export const verifyPayment = async (data: PaymentVerifyData) => {
  try {
    const { reference, appointmentId } = data;

    // Call edge function to verify Paystack payment
    const { data: response, error } = await supabase.functions.invoke('verify-payment', {
      body: {
        reference,
        appointmentId,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (response.status === 'success') {
      // Update appointment payment status
      await supabase
        .from('appointments')
        .update({ payment_status: 'paid', payment_reference: reference })
        .eq('id', appointmentId);

      return { success: true, data: response };
    } else {
      return { success: false, error: 'Payment verification failed' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get payment history for user
 */
export const getPaymentHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Refund payment
 */
export const refundPayment = async (paymentId: string, reason: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'refunded', refund_reason: reason, refunded_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Create payment record
 */
export const createPaymentRecord = async (
  userId: string,
  appointmentId: string,
  amount: number,
  reference: string
) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: userId,
          appointment_id: appointmentId,
          amount,
          reference,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
