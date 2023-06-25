import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class RequestCreateCartDto {
  @IsNumber({}, { message: ValidationErrorMessage.NUMBER_TYPE })
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  itemId: number;

  @IsArray({ message: ValidationErrorMessage.ARRAY_TYPE })
  @IsString({ each: true, message: ValidationErrorMessage.OPTION_ELEMENT })
  @ArrayMinSize(1, { message: ValidationErrorMessage.ARRAY_SIZE })
  options: string[];
}
