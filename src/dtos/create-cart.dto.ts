import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

import { ValidationError } from '../common/enums/common.enum';

export class CreateCartDto {
  @ApiProperty({
    example: 17,
  })
  @Min(1, { message: ValidationError.POSITIVE_NUMBER })
  @IsNumber({}, { message: ValidationError.NUMBER_TYPE })
  itemId: number;

  @ApiProperty({
    type: Array,
    description:
      '옵션은 반드시 "색상/가격/수량" 형식으로 이루어진 문자열을 포함하는 배열. 각 문자열은 하나의 옵션을 나타내며 반드시 슬래시(/)로 구분된 세 부분으로 구성.',
    example: '["검정색/220/2", "노란색/290/4", "멀티컬러/260/6"]',
  })
  @ArrayMinSize(1, { message: ValidationError.ARRAY_SIZE })
  @IsString({ each: true, message: ValidationError.OPTION_ELEMENT })
  @IsArray({ message: ValidationError.ARRAY_TYPE })
  options: string[];
}
