import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetJoinedLastMonthUseCase } from '../../../application/use-cases/get-joined-last-month.use-case';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../../../application/use-cases/get-companies-with-transfers-last-month.use-case';
import { JoinedLastMonthResponseDto } from '../dto/joined-last-month.dto';
import { CompaniesWithTransfersLastMonthResponseDto } from '../dto/companies-with-transfers-last-month.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompaniesWithTransfersLastMonthUseCase: GetCompaniesWithTransfersLastMonthUseCase,
    private readonly getJoinedLastMonthUseCase: GetJoinedLastMonthUseCase,
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
}
