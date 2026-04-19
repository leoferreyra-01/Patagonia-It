import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transfer, TransferStatus } from '../../domain/entities/transfer.entity';
import { ERROR_CATALOG } from '../../domain/errors/error-codes';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company-repository.port';
import {
  TRANSFER_REPOSITORY,
  TransferRepository,
} from '../../domain/ports/transfer-repository.port';

export interface GetTransfersByCompanyQuery {
  taxId: string;
  status?: TransferStatus;
  limit: number;
  offset: number;
}

export interface GetTransfersByCompanyResult {
  items: Transfer[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class GetTransfersByCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(TRANSFER_REPOSITORY)
    private readonly transferRepository: TransferRepository,
  ) {}

  async execute(query: GetTransfersByCompanyQuery): Promise<GetTransfersByCompanyResult> {
    const company = await this.companyRepository.findByTaxId(query.taxId);

    if (!company) {
      throw new NotFoundException({
        code: ERROR_CATALOG.COMPANY_TAX_ID_NOT_FOUND.code,
        message: ERROR_CATALOG.COMPANY_TAX_ID_NOT_FOUND.message.replace('%s', query.taxId),
        statusCode: ERROR_CATALOG.COMPANY_TAX_ID_NOT_FOUND.status,
      });
    }

    const result = await this.transferRepository.findByCompanyIdWithFilters(company.id, {
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    });

    return {
      items: result.items,
      total: result.total,
      limit: query.limit,
      offset: query.offset,
    };
  }
}
