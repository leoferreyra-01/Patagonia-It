import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateCompanyUseCase } from '../../../application/use-cases/create-company.use-case';
import { GetJoinedLastMonthUseCase } from '../../../application/use-cases/get-joined-last-month.use-case';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../../../application/use-cases/get-companies-with-transfers-last-month.use-case';
import { ListCompaniesUseCase } from '../../../application/use-cases/list-companies.use-case';
import {
  CreateCompanyRequestDto,
  CreateCompanyResponseDto,
} from '../dto/create-company.dto';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { JoinedLastMonthResponseDto } from '../dto/joined-last-month.dto';
import { CompaniesWithTransfersLastMonthResponseDto } from '../dto/companies-with-transfers-last-month.dto';
import {
  ListCompaniesQueryDto,
  PaginatedResponseDto,
} from '../dto/list-companies-query.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompaniesWithTransfersLastMonthUseCase: GetCompaniesWithTransfersLastMonthUseCase,
    private readonly getJoinedLastMonthUseCase: GetJoinedLastMonthUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List companies with optional filtering and pagination',
  })
  @ApiOkResponse({
    description: 'Paginated list of companies',
    type: PaginatedResponseDto,
  })
  async listCompanies(
    @Query() query: ListCompaniesQueryDto,
  ): Promise<PaginatedResponseDto<CreateCompanyResponseDto>> {
    const result = await this.listCompaniesUseCase.execute({
      type: query.type,
      country: query.country,
      limit: query.limit ?? 10,
      offset: query.offset ?? 0,
    });

    return {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      items: result.items.map((c) => ({
        id: c.id,
        taxId: c.taxId,
        name: c.name,
        type: c.type,
        country: c.country,
        registrationDate: c.registrationDate.toISOString(),
      })),
    };
  }

  @Get('with-transfers/last-month')
  @ApiOperation({
    summary: 'Get companies that performed transfers in the last month',
  })
  @ApiOkResponse({
    description: 'List of companies with transfer summary for the last month',
    type: CompaniesWithTransfersLastMonthResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected failure while fetching transfer summary',
    type: ErrorResponseDto,
  })
  async getCompaniesWithTransfersLastMonth(): Promise<CompaniesWithTransfersLastMonthResponseDto> {
    const items = await this.getCompaniesWithTransfersLastMonthUseCase.execute();

    return {
      total: items.length,
      items,
    };
  }

  @Get('joined-last-month')
  @ApiOperation({
    summary: 'Get companies that joined (registered) in the last 30 days',
  })
  @ApiOkResponse({
    description: 'List of companies registered in the last 30 days, sorted by registration date descending',
    type: JoinedLastMonthResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected failure while fetching recently joined companies',
    type: ErrorResponseDto,
  })
  async getJoinedLastMonth(): Promise<JoinedLastMonthResponseDto> {
    const companies = await this.getJoinedLastMonthUseCase.execute();

    return {
      total: companies.length,
      items: companies.map((c) => ({
        id: c.id,
        taxId: c.taxId,
        name: c.name,
        type: c.type,
        country: c.country,
        registrationDate: c.registrationDate.toISOString(),
      })),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Register a new company',
  })
  @ApiCreatedResponse({
    description: 'Company created successfully',
    type: CreateCompanyResponseDto,
  })
  @ApiConflictResponse({
    description: 'Company with the same taxId already exists',
  })
  async createCompany(
    @Body() request: CreateCompanyRequestDto,
  ): Promise<CreateCompanyResponseDto> {
    const company = await this.createCompanyUseCase.execute(request);

    return {
      id: company.id,
      taxId: company.taxId,
      name: company.name,
      type: company.type,
      country: company.country,
      registrationDate: company.registrationDate.toISOString(),
    };
  }
}
