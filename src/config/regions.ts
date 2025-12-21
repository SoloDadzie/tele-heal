export type CurrencyCode = 'GHS' | 'NGN' | 'KES' | 'ZAR' | 'EGP' | 'USD' | 'GBP' | 'CAD' | 'EUR' | 'INR';

export type RegionConfig = {
  countryCode: string;
  countryName: string;
  dialCode: string;
  flag: string;
  currencyCode: CurrencyCode;
  currencySymbol: string;
  locale: string;
};

export const REGION_CONFIGS: RegionConfig[] = [
  {
    countryCode: 'GH',
    countryName: 'Ghana',
    dialCode: '+233',
    flag: '🇬🇭',
    currencyCode: 'GHS',
    currencySymbol: 'GH₵',
    locale: 'en-GH',
  },
  {
    countryCode: 'NG',
    countryName: 'Nigeria',
    dialCode: '+234',
    flag: '🇳🇬',
    currencyCode: 'NGN',
    currencySymbol: '₦',
    locale: 'en-NG',
  },
  {
    countryCode: 'KE',
    countryName: 'Kenya',
    dialCode: '+254',
    flag: '🇰🇪',
    currencyCode: 'KES',
    currencySymbol: 'KSh',
    locale: 'en-KE',
  },
  {
    countryCode: 'ZA',
    countryName: 'South Africa',
    dialCode: '+27',
    flag: '🇿🇦',
    currencyCode: 'ZAR',
    currencySymbol: 'R',
    locale: 'en-ZA',
  },
  {
    countryCode: 'EG',
    countryName: 'Egypt',
    dialCode: '+20',
    flag: '🇪🇬',
    currencyCode: 'EGP',
    currencySymbol: 'E£',
    locale: 'ar-EG',
  },
  {
    countryCode: 'US',
    countryName: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    currencyCode: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
  },
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    currencyCode: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
  },
  {
    countryCode: 'CA',
    countryName: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    currencyCode: 'CAD',
    currencySymbol: '$',
    locale: 'en-CA',
  },
  {
    countryCode: 'DE',
    countryName: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    currencyCode: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
  },
  {
    countryCode: 'IN',
    countryName: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    currencyCode: 'INR',
    currencySymbol: '₹',
    locale: 'en-IN',
  },
];

export const DEFAULT_REGION = REGION_CONFIGS[0];

const normalizeDialCode = (value?: string) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const digitsOnly = trimmed.replace(/[^\d+]/g, '');
  if (!digitsOnly) return '';
  if (digitsOnly.startsWith('+')) {
    return digitsOnly;
  }
  if (digitsOnly.startsWith('00')) {
    return `+${digitsOnly.slice(2)}`;
  }
  return digitsOnly.startsWith('+') ? digitsOnly : `+${digitsOnly}`;
};

export const findRegionByDialCode = (dialCode?: string): RegionConfig => {
  const normalized = normalizeDialCode(dialCode);
  if (!normalized) {
    return DEFAULT_REGION;
  }
  return REGION_CONFIGS.find((region) => normalizeDialCode(region.dialCode) === normalized) ?? DEFAULT_REGION;
};

export const findRegionByPhoneNumber = (phone?: string): RegionConfig => {
  const normalizedPhone = normalizeDialCode(phone);
  if (!normalizedPhone) {
    return DEFAULT_REGION;
  }
  const region = REGION_CONFIGS.find((candidate) => normalizedPhone.startsWith(normalizeDialCode(candidate.dialCode)));
  return region ?? DEFAULT_REGION;
};
