import { ArrayMinSize, IsArray, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

import { ValidationError } from '../common/enums/common.enum';

export class GetOptionsDto {
  @ArrayMinSize(1, { message: ValidationError.ARRAY_SIZE })
  @IsArray({ message: ValidationError.ARRAY_TYPE })
  @IsInt({ each: true, message: ValidationError.INTEGER_TYPE })
  @Transform(({ value }) => value.split(',').map((id: string) => Number(id)))
  ids: number[];
}
