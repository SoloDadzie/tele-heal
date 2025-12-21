import React from 'react';
import type { RegionConfig } from '../config/regions';
import { DEFAULT_CURRENCY_FORMAT_CONFIG, type CurrencyFormatConfig, formatCurrencyWithConfig, toCurrencyFormatConfig } from '../utils/currency';

export type CurrencyContextValue = {
  config: CurrencyFormatConfig;
  region?: RegionConfig;
  formatCurrency: (value: number, options?: Intl.NumberFormatOptions) => string;
};

const CurrencyContext = React.createContext<CurrencyContextValue>({
  config: DEFAULT_CURRENCY_FORMAT_CONFIG,
  formatCurrency: (value, options) => formatCurrencyWithConfig(value, DEFAULT_CURRENCY_FORMAT_CONFIG, options),
});

export type CurrencyProviderProps = {
  region?: RegionConfig;
  children: React.ReactNode;
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ region, children }) => {
  const config = React.useMemo(
    () => (region ? toCurrencyFormatConfig(region) : DEFAULT_CURRENCY_FORMAT_CONFIG),
    [region],
  );

  const value = React.useMemo<CurrencyContextValue>(
    () => ({
      config,
      region,
      formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) =>
        formatCurrencyWithConfig(amount, config, options),
    }),
    [config, region],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => React.useContext(CurrencyContext);
