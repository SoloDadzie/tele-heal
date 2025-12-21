import type { CurrencyCode, RegionConfig } from '../config/regions';

export type CurrencyFormatConfig = {
  currencyCode: CurrencyCode;
  currencySymbol: string;
  locale: string;
};

export const DEFAULT_CURRENCY_FORMAT_CONFIG: CurrencyFormatConfig = {
  currencyCode: 'GHS',
  currencySymbol: 'GH₵',
  locale: 'en-GH',
};

export const toCurrencyFormatConfig = (region: RegionConfig): CurrencyFormatConfig => ({
  currencyCode: region.currencyCode,
  currencySymbol: region.currencySymbol,
  locale: region.locale,
});

export const formatCurrencyWithConfig = (
  value: number,
  config: CurrencyFormatConfig = DEFAULT_CURRENCY_FORMAT_CONFIG,
  options?: Intl.NumberFormatOptions,
) => {
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currencyCode,
      maximumFractionDigits: 0,
      ...options,
    }).format(value || 0);
  } catch {
    return `${config.currencySymbol}${value ?? 0}`;
  }
};

export const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) =>
  formatCurrencyWithConfig(value, DEFAULT_CURRENCY_FORMAT_CONFIG, options);
