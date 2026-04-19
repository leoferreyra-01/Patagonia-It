import { TAX_ID_REGEX } from '../constants/company.constants';

export const isValidTaxId = (taxId: string): boolean => TAX_ID_REGEX.test(taxId);
