/**
 * Security utilities for Tele Heal
 * Implements input validation, sanitization, and security checks
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate license number format
 */
export const validateLicenseNumber = (license: string): boolean => {
  // License format: LIC-XXXXXX (6 alphanumeric characters)
  const licenseRegex = /^LIC-[A-Z0-9]{6}$/;
  return licenseRegex.test(license.toUpperCase());
};

/**
 * Validate specialization
 */
export const validateSpecialization = (specialization: string): boolean => {
  const validSpecializations = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Psychiatry',
    'Orthopedics',
    'Ophthalmology',
    'ENT',
    'Gynecology',
  ];

  return validSpecializations.includes(specialization);
};

/**
 * Validate years of experience
 */
export const validateYearsOfExperience = (years: number): boolean => {
  return years >= 0 && years <= 70;
};

/**
 * Validate appointment reason
 */
export const validateAppointmentReason = (reason: string): boolean => {
  return reason.length > 0 && reason.length <= 500;
};

/**
 * Validate medication details
 */
export const validateMedicationDetails = (
  medication: string,
  dosage: string,
  frequency: string,
  duration: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!medication || medication.length === 0) {
    errors.push('Medication name is required');
  }

  if (!dosage || dosage.length === 0) {
    errors.push('Dosage is required');
  }

  if (!frequency || frequency.length === 0) {
    errors.push('Frequency is required');
  }

  if (!duration || duration.length === 0) {
    errors.push('Duration is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate payment amount
 */
export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000; // Max 1 million
};

/**
 * Validate currency code
 */
export const validateCurrencyCode = (currency: string): boolean => {
  const validCurrencies = ['GHS', 'USD', 'EUR', 'GBP', 'ZAR'];
  return validCurrencies.includes(currency.toUpperCase());
};

/**
 * Hash sensitive data (basic implementation)
 */
export const hashData = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Check if user is authorized for operation
 */
export const isAuthorizedUser = (
  userId: string,
  targetUserId: string,
  isAdmin: boolean = false
): boolean => {
  return userId === targetUserId || isAdmin;
};

/**
 * Validate request rate limiting
 */
export const checkRateLimit = (
  userId: string,
  operation: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } => {
  // This would be implemented with a proper rate limiting service
  // For now, returning a basic implementation
  return {
    allowed: true,
    remaining: maxRequests,
  };
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  fileName: string,
  fileSize: number,
  allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  if (!fileName || fileName.length === 0) {
    errors.push('File name is required');
  }

  if (fileSize > maxFileSize) {
    errors.push(`File size exceeds maximum of ${maxFileSize / 1024 / 1024}MB`);
  }

  if (fileSize === 0) {
    errors.push('File is empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate consultation notes
 */
export const validateConsultationNotes = (notes: string): boolean => {
  return notes.length > 0 && notes.length <= 5000;
};

/**
 * Security configuration
 */
export const securityConfig = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
  maxFileUploadSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
};
