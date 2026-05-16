/**
 * phone-vn.ts — Vietnamese phone normalization + masking.
 *
 * Matches DB constraint: `^(\+84|0)\d{9,10}$` (10-11 digit mobile/landline).
 * Server normalizes paste/typed variants into single canonical form `0XXXXXXXXX`.
 */

const VN_PHONE_CANONICAL = /^0\d{9,10}$/;

/**
 * Normalize a VN phone string to canonical `0XXXXXXXXX` form.
 * Accepts inputs with spaces, dashes, parens, +84 prefix, leading 84.
 * Returns null if input cannot be normalized.
 */
export function normalizeVnPhone(input: string): string | null {
  if (!input) return null;
  // Strip everything except digits and leading +
  const trimmed = input.trim().replace(/[^\d+]/g, '');

  let digits: string;
  if (trimmed.startsWith('+84')) {
    digits = '0' + trimmed.slice(3);
  } else if (trimmed.startsWith('84') && trimmed.length >= 11) {
    digits = '0' + trimmed.slice(2);
  } else if (trimmed.startsWith('0')) {
    digits = trimmed;
  } else {
    return null;
  }

  return VN_PHONE_CANONICAL.test(digits) ? digits : null;
}

/**
 * Format canonical phone for display: `0XXX XXX XXXX` (10-digit) or
 * `0XXXX XXX XXX` (11-digit). Returns input as-is if not canonical.
 */
export function formatVnPhoneDisplay(phone: string): string {
  if (!VN_PHONE_CANONICAL.test(phone)) return phone;
  if (phone.length === 10) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
  }
  // 11-digit
  return `${phone.slice(0, 4)} ${phone.slice(4, 8)} ${phone.slice(8)}`;
}

/**
 * Mask phone for thank-you / public display: show first 4 + last 4 digits.
 * `0901234567` → `0901 xxx 4567`
 */
export function maskVnPhone(phone: string): string {
  if (!VN_PHONE_CANONICAL.test(phone)) return phone;
  return `${phone.slice(0, 4)} xxx ${phone.slice(-4)}`;
}
