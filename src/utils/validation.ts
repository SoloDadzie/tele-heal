import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

/**
 * Phone number validation schema
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be at most 15 digits');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be at most 128 characters');

/**
 * Full name validation schema
 */
export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name must be at most 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes');

/**
 * Date of birth validation schema
 */
export const dateOfBirthSchema = z
  .string()
  .refine((date: string) => {
    if (!date) return false;
    const parts = date.split(/[/-]/);
    if (parts.length !== 3) return false;
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    
    if (year < 1900 || year > new Date().getFullYear()) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    const birthDate = new Date(year, month - 1, day);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 120;
  }, 'Must be a valid date of birth (age 18+)');

/**
 * Address validation schema
 */
export const addressSchema = z
  .string()
  .min(5, 'Address must be at least 5 characters')
  .max(200, 'Address must be at most 200 characters')
  .optional()
  .or(z.literal(''));

/**
 * Medical history validation schema
 */
export const medicalHistorySchema = z
  .string()
  .max(1000, 'Medical history must be at most 1000 characters')
  .optional()
  .or(z.literal(''));

/**
 * Allergies validation schema
 */
export const allergiesSchema = z
  .string()
  .max(500, 'Allergies must be at most 500 characters')
  .optional()
  .or(z.literal(''));

/**
 * Medications validation schema
 */
export const medicationsSchema = z
  .string()
  .max(500, 'Medications must be at most 500 characters')
  .optional()
  .or(z.literal(''));

/**
 * Insurance provider validation schema
 */
export const insuranceProviderSchema = z
  .string()
  .min(2, 'Insurance provider must be at least 2 characters')
  .max(100, 'Insurance provider must be at most 100 characters')
  .optional()
  .or(z.literal(''));

/**
 * Insurance member ID validation schema
 */
export const insuranceMemberIdSchema = z
  .string()
  .min(3, 'Insurance member ID must be at least 3 characters')
  .max(50, 'Insurance member ID must be at most 50 characters')
  .optional()
  .or(z.literal(''));

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Sign up form validation schema
 */
export const signUpSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Profile setup form validation schema
 */
export const profileSetupSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  gender: z.string().optional().or(z.literal('')),
  dateOfBirth: dateOfBirthSchema.optional().or(z.literal('')),
  address: addressSchema,
  medicalHistory: medicalHistorySchema,
  allergies: allergiesSchema,
  medications: medicationsSchema,
  insuranceProvider: insuranceProviderSchema,
  insuranceMemberId: insuranceMemberIdSchema,
  consentTelemedicine: z.boolean().refine((val) => val === true, {
    message: 'You must accept telemedicine consent',
  }),
  consentPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must accept privacy policy',
  }),
});

export type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;

/**
 * Validate form data and return errors
 */
export const validateForm = <T>(schema: z.ZodSchema, data: T): { valid: boolean; errors: Record<string, string> } => {
  try {
    schema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { form: 'Validation error' } };
  }
};

/**
 * Validate a single field
 */
export const validateField = (schema: z.ZodSchema, value: unknown): string | null => {
  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid value';
    }
    return 'Validation error';
  }
};
