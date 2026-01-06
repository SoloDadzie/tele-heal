import { describe, it, expect } from '@jest/globals';
import {
  emailSchema,
  phoneSchema,
  passwordSchema,
  fullNameSchema,
  dateOfBirthSchema,
  addressSchema,
  loginSchema,
  signUpSchema,
  profileSetupSchema,
  validateForm,
  validateField,
} from './validation';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      const result = emailSchema.safeParse('user@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const result = emailSchema.safeParse('invalid-email');
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = emailSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should validate local format phone numbers', () => {
      const result = phoneSchema.safeParse('0501234567');
      expect(result.success).toBe(true);
    });

    it('should validate international format phone numbers', () => {
      const result = phoneSchema.safeParse('+233501234567');
      expect(result.success).toBe(true);
    });

    it('should validate international format without plus sign', () => {
      const result = phoneSchema.safeParse('233501234567');
      expect(result.success).toBe(true);
    });

    it('should reject phone numbers with less than 9 digits', () => {
      const result = phoneSchema.safeParse('050123');
      expect(result.success).toBe(false);
    });

    it('should reject empty phone', () => {
      const result = phoneSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject phone numbers with invalid characters', () => {
      const result = phoneSchema.safeParse('050-123-4567');
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const result = passwordSchema.safeParse('SecurePass123!');
      expect(result.success).toBe(true);
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('Short1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without uppercase', () => {
      const result = passwordSchema.safeParse('securepass123!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      const result = passwordSchema.safeParse('SecurePass!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      const result = passwordSchema.safeParse('SecurePass123');
      expect(result.success).toBe(false);
    });
  });

  describe('fullNameSchema', () => {
    it('should validate correct full names', () => {
      const result = fullNameSchema.safeParse('John Doe');
      expect(result.success).toBe(true);
    });

    it('should reject names shorter than 2 characters', () => {
      const result = fullNameSchema.safeParse('J');
      expect(result.success).toBe(false);
    });

    it('should reject empty names', () => {
      const result = fullNameSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('dateOfBirthSchema', () => {
    it('should validate correct dates', () => {
      const result = dateOfBirthSchema.safeParse('1990/05/15');
      expect(result.success).toBe(true);
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateStr = `${futureDate.getFullYear()}/${String(futureDate.getMonth() + 1).padStart(2, '0')}/${String(futureDate.getDate()).padStart(2, '0')}`;
      const result = dateOfBirthSchema.safeParse(dateStr);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date formats', () => {
      const result = dateOfBirthSchema.safeParse('05-15-1990');
      expect(result.success).toBe(false);
    });
  });

  describe('addressSchema', () => {
    it('should validate correct addresses', () => {
      const result = addressSchema.safeParse('123 Main St, Springfield, IL 62704');
      expect(result.success).toBe(true);
    });

    it('should reject addresses shorter than 5 characters', () => {
      const result = addressSchema.safeParse('123');
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        phone: '0501234567',
        password: 'SecurePass123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject login with invalid phone', () => {
      const result = loginSchema.safeParse({
        phone: '050',
        password: 'SecurePass123!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject login with invalid password', () => {
      const result = loginSchema.safeParse({
        phone: '0501234567',
        password: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('signUpSchema', () => {
    it('should validate correct signup data', () => {
      const result = signUpSchema.safeParse({
        phone: '0501234567',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject signup with mismatched passwords', () => {
      const result = signUpSchema.safeParse({
        phone: '0501234567',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject signup with invalid phone', () => {
      const result = signUpSchema.safeParse({
        phone: '050',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('profileSetupSchema', () => {
    it('should validate complete profile data', () => {
      const result = profileSetupSchema.safeParse({
        fullName: 'John Doe',
        phone: '0501234567',
        email: 'john@example.com',
        gender: 'Male',
        dateOfBirth: '1990/05/15',
        address: '123 Main St, Springfield, IL 62704',
        medicalHistory: 'No major illnesses',
        allergies: 'Penicillin',
        medications: 'None',
        insuranceProvider: 'Health Insurance Co',
        insuranceMemberId: 'HIC123456',
        insuranceFrontUri: null,
        insuranceBackUri: null,
        consentTelemedicine: true,
        consentPrivacy: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject profile with missing required fields', () => {
      const result = profileSetupSchema.safeParse({
        fullName: '',
        phone: '0501234567',
        email: 'john@example.com',
        gender: 'Male',
        dateOfBirth: '1990/05/15',
        address: '123 Main St, Springfield, IL 62704',
        medicalHistory: '',
        allergies: '',
        medications: '',
        insuranceProvider: '',
        insuranceMemberId: '',
        insuranceFrontUri: null,
        insuranceBackUri: null,
        consentTelemedicine: true,
        consentPrivacy: true,
      });
      expect(result.success).toBe(false);
    });

    it('should reject profile with invalid email', () => {
      const result = profileSetupSchema.safeParse({
        fullName: 'John Doe',
        phone: '0501234567',
        email: 'invalid-email',
        gender: 'Male',
        dateOfBirth: '1990/05/15',
        address: '123 Main St, Springfield, IL 62704',
        medicalHistory: 'No major illnesses',
        allergies: 'Penicillin',
        medications: 'None',
        insuranceProvider: 'Health Insurance Co',
        insuranceMemberId: 'HIC123456',
        insuranceFrontUri: null,
        insuranceBackUri: null,
        consentTelemedicine: true,
        consentPrivacy: true,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation Utilities', () => {
  describe('validateForm', () => {
    it('should return valid result for correct data', () => {
      const result = validateForm(loginSchema, {
        phone: '0501234567',
        password: 'SecurePass123!',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return invalid result with errors for incorrect data', () => {
      const result = validateForm(loginSchema, {
        phone: '050',
        password: 'weak',
      });
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('should collect all field errors', () => {
      const result = validateForm(loginSchema, {
        phone: '050',
        password: 'weak',
      });
      expect(result.errors.phone).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('validateField', () => {
    it('should validate individual fields', () => {
      const result = validateField(emailSchema, 'user@example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid field', () => {
      const result = validateField(emailSchema, 'invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should provide error message for invalid field', () => {
      const result = validateField(phoneSchema, '050');
      expect(result.valid).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(result.error!.length).toBeGreaterThan(0);
    });
  });
});
