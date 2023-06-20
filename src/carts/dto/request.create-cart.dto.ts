import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class RequestCreateCartDto {
  @IsNumber()
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  itemId: number;

  @IsArray({ message: ValidationErrorMessage.OPTION_ARRAY })
  @IsString({ each: true, message: ValidationErrorMessage.OPTION_ELEMENT })
  @ArrayMinSize(1, { message: ValidationErrorMessage.ARRAY_SIZE })
  options: string[];
}
