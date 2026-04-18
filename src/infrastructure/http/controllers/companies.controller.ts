import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../../../application/use-cases/get-companies-with-transfers-last-month.use-case';
import { CompaniesWithTransfersLastMonthResponseDto } from '../dto/companies-with-transfers-last-month.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompaniesWithTransfersLastMonthUseCase: GetCompaniesWithTransfersLastMonthUseCase,
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
}
