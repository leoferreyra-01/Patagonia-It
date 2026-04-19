import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransferUseCase } from '../../../application/use-cases/create-transfer.use-case';
import {
  CreateTransferRequestDto,
  CreateTransferResponseDto,
} from '../dto/create-transfer.dto';
import { ErrorResponseDto } from '../dto/error-response.dto';

@ApiTags('Transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly createTransferUseCase: CreateTransferUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new transfer',
  })
  @ApiCreatedResponse({
    description: 'Transfer created successfully',
    type: CreateTransferResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation error in request payload',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Company with provided companyId does not exist',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected failure while creating transfer',
    type: ErrorResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Persistence dependency is temporarily unavailable',
    type: ErrorResponseDto,
  })
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