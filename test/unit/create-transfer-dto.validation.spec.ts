import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TransferStatus } from '../../src/domain/entities/transfer.entity';
import { CreateTransferRequestDto } from '../../src/infrastructure/http/dto/create-transfer.dto';

describe('CreateTransferRequestDto - Validation', () => {
  it('validates a valid transfer request', async () => {
    const dto: CreateTransferRequestDto = plainToInstance(CreateTransferRequestDto, {
      amount: 1200.5,
      companyId: 'company-1',
      status: TransferStatus.COMPLETED,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails when amount is missing', async () => {
    const dto: CreateTransferRequestDto = plainToInstance(CreateTransferRequestDto, {
      companyId: 'company-1',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('fails when amount is not positive', async () => {
    const dto: CreateTransferRequestDto = plainToInstance(CreateTransferRequestDto, {
      amount: 0,
      companyId: 'company-1',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('fails when companyId is missing', async () => {
    const dto: CreateTransferRequestDto = plainToInstance(CreateTransferRequestDto, {
      amount: 100,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('companyId');
  });

  it('fails when status is invalid', async () => {
    const dto: CreateTransferRequestDto = plainToInstance(CreateTransferRequestDto, {
      amount: 100,
      companyId: 'company-1',
      status: 'UNKNOWN',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });
});