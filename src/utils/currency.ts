/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a numeric value as Indian Rupee (INR) using correct local formatting patterns (e.g. 1,00,000 instead of 100,000).
 */
export const formatCurrency = (value: number, showSymbol: boolean = true): string => {
  const sanitizedValue = typeof value === 'number' ? value : Number(value || 0);
  const formatted = sanitizedValue.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Fast abbreviation helper for Indian Lakhs/Crores or Thousands
 */
export const formatAbbreviatedCurrency = (value: number, showSymbol: boolean = true): string => {
  const sanitizedValue = typeof value === 'number' ? value : Number(value || 0);
  const prefix = showSymbol ? '₹' : '';
  if (sanitizedValue >= 10000000) {
    return `${prefix}${(sanitizedValue / 10000000).toFixed(1)} Cr`;
  }
  if (sanitizedValue >= 100000) {
    return `${prefix}${(sanitizedValue / 100000).toFixed(1)} Lakh`;
  }
  if (sanitizedValue >= 1000) {
    return `${prefix}${(sanitizedValue / 1000).toFixed(1)}k`;
  }
  return `${prefix}${sanitizedValue}`;
};
