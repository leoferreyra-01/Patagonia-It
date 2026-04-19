import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCompanyUseCase } from '../../../application/use-cases/create-company.use-case';
import { GetJoinedLastMonthUseCase } from '../../../application/use-cases/get-joined-last-month.use-case';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../../../application/use-cases/get-companies-with-transfers-last-month.use-case';
import {
  CreateCompanyRequestDto,
  CreateCompanyResponseDto,
} from '../dto/create-company.dto';
import { JoinedLastMonthResponseDto } from '../dto/joined-last-month.dto';
import { CompaniesWithTransfersLastMonthResponseDto } from '../dto/companies-with-transfers-last-month.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompaniesWithTransfersLastMonthUseCase: GetCompaniesWithTransfersLastMonthUseCase,
    private readonly getJoinedLastMonthUseCase: GetJoinedLastMonthUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
  ) {}

  @Get('with-transfers/last-month')
  @ApiOperation({
    summary: 'Get companies that performed transfers in the last month',
  })
  @ApiOkResponse({
    description: 'List of companies with transfer summary for the last month',
    type: CompaniesWithTransfersLastMonthResponseDto,
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
