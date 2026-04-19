import { CompanyType } from '../entities/company.entity';

export const DEFAULT_COMPANY_COUNTRY = 'AR';
export const TAX_ID_FORMAT = 'NN-NNNNNNNN-N';
export const TAX_ID_REGEX = /^\d{2}-\d{8}-\d$/;
export const COMPANY_TYPES = [CompanyType.PYME, CompanyType.CORPORATIVA] as const;
