export const normalizeIndianPhoneForWhatsApp = (
  value: string,
  defaultCountryCode = '91'
): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `${defaultCountryCode}${digits.slice(1)}`;
  }

  return digits;
};
