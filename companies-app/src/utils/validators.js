/**
 * Validates a Brazilian CNPJ number.
 * @param {string} cnpj The CNPJ number to validate.
 * @returns {boolean} True if the CNPJ is valid, false otherwise.
 */
export function validateCnpj(cnpj) {
  if (!cnpj) return false;

  // Remove non-digit characters
  const cnpjClean = cnpj.replace(/\D/g, '');

  // CNPJ must have 14 digits and not be a sequence of the same digit
  if (cnpjClean.length !== 14 || /^(\d)\1+$/.test(cnpjClean)) {
    return false;
  }

  // --- Verification Digit 1 ---
  let length = 12;
  let numbers = cnpjClean.substring(0, length);
  const digits = cnpjClean.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(0)) {
    return false;
  }

  // --- Verification Digit 2 ---
  length = 13;
  numbers = cnpjClean.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result == digits.charAt(1);
}
