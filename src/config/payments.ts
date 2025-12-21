// Prefer configuring EXPO_PUBLIC_PAYSTACK_KEY in app config/env. We fall back to our sandbox key if unset.
export const PAYSTACK_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_PAYSTACK_KEY ?? 'pk_test_44881d8acd0c85bc916680bf3f27021320af835d';

// Utility to convert a major currency amount (e.g., NGN) to the “minor” units Paystack expects.
export const toPaystackMinorUnit = (amountMajor: number) => Math.max(0, Math.round(amountMajor * 100));
