import { randomUUID } from 'node:crypto';

export enum CompanyType {
  PYME = 'PYME',
  CORPORATIVA = 'CORPORATIVA',
}

export class Company {
  constructor(
    public readonly id: string,
    public readonly taxId: string,
    public readonly name: string,
    public readonly type: CompanyType,
    public readonly registrationDate: Date,
    public readonly country: string,
  ) {}

  static create(
    taxId: string,
    name: string,
    type: CompanyType,
    country = 'AR',
  ): Company {
    return new Company(randomUUID(), taxId, name, type, new Date(), country);
  }
}
