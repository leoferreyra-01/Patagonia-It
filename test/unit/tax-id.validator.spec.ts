import { isValidTaxId } from '../../src/domain/validators/tax-id.validator';

describe('isValidTaxId', () => {
  it('returns true for a valid taxId', () => {
    expect(isValidTaxId('30-12345678-9')).toBe(true);
  });

  it('returns false for an invalid taxId', () => {
    expect(isValidTaxId('30123456789')).toBe(false);
  });
});
