import { IsNumber, IsPositive, Min } from 'class-validator';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class ResponseUpdateCartDto {
  @IsNumber({}, { message: ValidationErrorMessage.NUMBER_TYPE })
  @Min(1, { message: ValidationErrorMessage.POSITIVE_NUMBER })
  id: number;

  @IsNumber({}, { message: ValidationErrorMessage.NUMBER_TYPE })
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  totalPrice: number;

  @IsNumber({}, { message: ValidationErrorMessage.NUMBER_TYPE })
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  totalQuantity: number;
}
