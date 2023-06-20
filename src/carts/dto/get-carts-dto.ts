import { IsArray, IsNumber, IsPositive, Min } from 'class-validator';
import { Cart } from '../cart.entity';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class GetCartsDto {
  @IsNumber()
  @Min(1, { message: ValidationErrorMessage.NON_NEGATIVE_NUMBER })
  total: number;

  @IsNumber()
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  offset: number;

  @IsArray({ message: ValidationErrorMessage.CART_ARRAY })
  carts: Cart[];
}
