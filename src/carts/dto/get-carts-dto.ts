import { IsArray, IsNumber, IsPositive, Min } from 'class-validator';
import { Cart } from '../cart.entity';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class GetCartsDto {
  @IsNumber({}, { message: ValidationErrorMessage.NUMBER_TYPE })
  @Min(1, { message: ValidationErrorMessage.NON_NEGATIVE_NUMBER })
  total: number;

  @IsNumber({}, { message: ValidationErrorMessage.NUMBER_TYPE })
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  offset: number;

  @IsArray({ message: ValidationErrorMessage.CART_ARRAY })
  carts: Cart[];
}
