import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'JOINED_LAST_MONTH_FETCH_FAILED' })
  code!: string;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Failed to fetch companies joined in the last month' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['taxId format must be NN-NNNNNNNN-N'],
      },
    ],
  })
  message!: string | string[];

  @ApiProperty({ example: 500 })
  statusCode!: number;
}
