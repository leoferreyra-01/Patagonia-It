import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'JOINED_LAST_MONTH_FETCH_FAILED' })
  code!: string;

  @ApiProperty({ example: 'Failed to fetch companies joined in the last month' })
  message!: string;

  @ApiProperty({ example: 500 })
  statusCode!: number;
}
