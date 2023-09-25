import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

import { ValidationError } from '../common/enums/common.enum';

export class UpdateCartDto {
  @ApiProperty({
    example: 3,
  })
  @IsNumber({}, { message: ValidationError.NUMBER_TYPE })
  @Min(1, { message: ValidationError.POSITIVE_NUMBER })
  quantity: number;
}
