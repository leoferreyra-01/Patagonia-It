import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransferUseCase } from '../../../application/use-cases/create-transfer.use-case';
import { GetTransfersByCompanyUseCase } from '../../../application/use-cases/get-transfers-by-company.use-case';
import {
  CreateTransferRequestDto,
  CreateTransferResponseDto,
} from '../dto/create-transfer.dto';
import {
  ListTransfersQueryDto,
  ListTransfersResponseDto,
} from '../dto/list-transfers-query.dto';
import { ErrorResponseDto } from '../dto/error-response.dto';

@ApiTags('Transfers')
@Controller('transfers')
export class TransfersController {
  constructor(
    private readonly createTransferUseCase: CreateTransferUseCase,
    private readonly getTransfersByCompanyUseCase: GetTransfersByCompanyUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List transfers for a company by taxId with optional status filter and pagination' })
  @ApiOkResponse({ description: 'Paginated list of transfers', type: ListTransfersResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error in query parameters', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Company with provided taxId does not exist', type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure while listing transfers', type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ description: 'Persistence dependency is temporarily unavailable', type: ErrorResponseDto })
  async listTransfers(
    @Query() query: ListTransfersQueryDto,
  ): Promise<ListTransfersResponseDto> {
    const result = await this.getTransfersByCompanyUseCase.execute({
      taxId: query.taxId,
      status: query.status,
      limit: query.limit ?? 10,
      offset: query.offset ?? 0,
    });

    return {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      items: result.items.map((t) => ({
        id: t.id,
        amount: t.amount,
        companyId: t.companyId,
        date: t.date.toISOString(),
        status: t.status,
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transfer' })
  @ApiCreatedResponse({ description: 'Transfer created successfully', type: CreateTransferResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error in request payload', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Company with provided companyId does not exist', type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: 'Unexpected failure while creating transfer', type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ description: 'Persistence dependency is temporarily unavailable', type: ErrorResponseDto })
  async createTransfer(
    @Body() request: CreateTransferRequestDto,
  ): Promise<CreateTransferResponseDto> {
    const transfer = await this.createTransferUseCase.execute(request);

    return {
      id: transfer.id,
      amount: transfer.amount,
      companyId: transfer.companyId,
      date: transfer.date.toISOString(),
      status: transfer.status,
    };
  }
}