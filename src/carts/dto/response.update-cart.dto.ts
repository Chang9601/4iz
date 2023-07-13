import { IsNumber, IsPositive, Min } from 'class-validator';
import { VALIDATION_ERROR } from '../../utils/constants/validation-error.enum';

export class ResponseUpdateCartDto {
  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @Min(1, { message: VALIDATION_ERROR.POSITIVE_NUMBER })
  id: number;

  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @IsPositive({ message: VALIDATION_ERROR.POSITIVE_NUMBER })
  totalPrice: number;

  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @IsPositive({ message: VALIDATION_ERROR.POSITIVE_NUMBER })
  totalQuantity: number;
}
