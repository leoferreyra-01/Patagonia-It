import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ERROR_CATALOG } from '../../../domain/errors/error-codes';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { HealthReadinessService } from '../services/health-readiness.service';

class HealthResponse {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'Hello from NestJS' })
  message!: string;
}

class ReadinessResponse {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({
    example: {
      persistence: 'up',
    },
  })
  checks!: {
    persistence: 'up';
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly readinessService: HealthReadinessService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({
    description: 'API is running',
    type: HealthResponse,
  })
  getHealth() {
    return {
      status: 'ok',
      message: 'Hello from NestJS',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiOkResponse({
    description: 'API is ready to serve traffic',
    type: ReadinessResponse,
  })
  @ApiServiceUnavailableResponse({
    description: 'API is not ready due to dependency checks failing',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected readiness check failure',
    type: ErrorResponseDto,
  })
  async getReadiness() {
    try {
      await this.readinessService.checkPersistence();

      return {
        status: 'ok',
        checks: {
          persistence: 'up' as const,
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        code: ERROR_CATALOG.READINESS_PERSISTENCE_CHECK_FAILED.code,
        message: ERROR_CATALOG.READINESS_PERSISTENCE_CHECK_FAILED.message,
        statusCode: ERROR_CATALOG.READINESS_PERSISTENCE_CHECK_FAILED.status,
      });
    }
  }
}