import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Transfer,
  TransferStatus,
} from '../../domain/entities/transfer.entity';
import { ERROR_CATALOG } from '../../domain/errors/error-codes';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company-repository.port';
import {
  TRANSFER_REPOSITORY,
  TransferRepository,
} from '../../domain/ports/transfer-repository.port';

export type CreateTransferCommand = {
  amount: number;
  companyId: string;
  status?: TransferStatus;
};

@Injectable()
export class CreateTransferUseCase {
  constructor(
    @Inject(TRANSFER_REPOSITORY)
    private readonly transferRepository: TransferRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(command: CreateTransferCommand): Promise<Transfer> {
    this.validate(command);

    const companyId = command.companyId.trim();
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException({
        code: ERROR_CATALOG.COMPANY_ID_NOT_FOUND.code,
        message: ERROR_CATALOG.COMPANY_ID_NOT_FOUND.message.replace('%s', companyId),
        statusCode: ERROR_CATALOG.COMPANY_ID_NOT_FOUND.status,
      });
    }

    const transfer = Transfer.create(
      command.amount,
      companyId,
      command.status,
    );

    return this.transferRepository.save(transfer);
  }

  private validate(command: CreateTransferCommand): void {
    if (typeof command.amount !== 'number' || !Number.isFinite(command.amount)) {
      throw new BadRequestException('amount must be a valid number');
    }

    if (command.amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    if (!command.companyId || typeof command.companyId !== 'string' || !command.companyId.trim()) {
      throw new BadRequestException('companyId is required and must be a non-empty string');
    }

    if (command.status !== undefined && !Object.values(TransferStatus).includes(command.status)) {
      throw new BadRequestException(
        `status must be one of: ${Object.values(TransferStatus).join(', ')}`,
      );
    }
  }
}