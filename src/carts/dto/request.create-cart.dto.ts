import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { VALIDATION_ERROR } from '../../utils/constants/validation-error.enum';

export class RequestCreateCartDto {
  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @IsPositive({ message: VALIDATION_ERROR.POSITIVE_NUMBER })
  itemId: number;

  @IsArray({ message: VALIDATION_ERROR.ARRAY_TYPE })
  @IsString({ each: true, message: VALIDATION_ERROR.OPTION_ELEMENT })
  @ArrayMinSize(1, { message: VALIDATION_ERROR.ARRAY_SIZE })
  options: string[];
}
