import { IsNumber, Min } from 'class-validator';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class RequestUpdateCartDto {
  @IsNumber({}, { message: ValidationErrorMessage.NUMBER_TYPE })
  @Min(1, { message: ValidationErrorMessage.POSITIVE_NUMBER })
  quantity: number;
}
