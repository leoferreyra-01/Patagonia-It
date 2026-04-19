import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCompanyRequestDto } from '../../src/infrastructure/http/dto/create-company.dto';
import { CompanyType } from '../../src/domain/entities/company.entity';

describe('CreateCompanyRequestDto - Validation', () => {
  it('should validate a valid create company request', async () => {
    const dto: CreateCompanyRequestDto = plainToInstance(CreateCompanyRequestDto, {
      taxId: '30-99999999-7',
      name: 'Valid Company',
      type: CompanyType.PYME,
      country: 'AR',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when taxId is missing', async () => {
    const dto: CreateCompanyRequestDto = plainToInstance(CreateCompanyRequestDto, {
      name: 'Company Name',
      type: CompanyType.PYME,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('taxId');
    expect(errors[0].constraints).toEqual(
      expect.objectContaining({
        isNotEmpty: expect.any(String),
      }),
    );
  });

  it('should fail validation when taxId format is invalid', async () => {
    const dto: CreateCompanyRequestDto = plainToInstance(CreateCompanyRequestDto, {
      taxId: 'invalid-tax-id',
      name: 'Company Name',
      type: CompanyType.PYME,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('taxId');
    expect(errors[0].constraints).toEqual(
      expect.objectContaining({
        matches: expect.any(String),
      }),
    );
  });

  it('should fail validation when name is missing', async () => {
    const dto: CreateCompanyRequestDto = plainToInstance(CreateCompanyRequestDto, {
      taxId: '30-99999999-7',
      type: CompanyType.PYME,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail validation when type is invalid', async () => {
    const dto: CreateCompanyRequestDto = plainToInstance(CreateCompanyRequestDto, {
      taxId: '30-99999999-7',
      name: 'Company Name',
      type: 'INVALID_TYPE',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('type');
    expect(errors[0].constraints).toEqual(
      expect.objectContaining({
        isEnum: expect.any(String),
      }),
    );
  });

  it('should fail validation when name exceeds max length', async () => {
    const longName = 'A'.repeat(256);
    const dto: CreateCompanyRequestDto = plainToInstance(CreateCompanyRequestDto, {
      taxId: '30-99999999-7',
      name: longName,
      type: CompanyType.PYME,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toEqual(
      expect.objectContaining({
        maxLength: expect.any(String),
      }),
    );
  });

  it('should validate with optional country field omitted', async () => {
    const dto: CreateCompanyRequestDto = plainToInstance(CreateCompanyRequestDto, {
      taxId: '30-99999999-7',
      name: 'Company Name',
      type: CompanyType.CORPORATIVA,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
