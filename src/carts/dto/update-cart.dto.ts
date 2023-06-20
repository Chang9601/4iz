import { IsNumber, Min } from 'class-validator';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class UpdateCartDto {
  @IsNumber({})
  @Min(1, { message: ValidationErrorMessage.POSITIVE_NUMBER })
  quantity: number;
}
