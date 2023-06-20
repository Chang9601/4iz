import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Option } from 'src/items/option.entity';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class ResponseCreateCartDto {
  @IsNumber()
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  totalPrice: number;

  @IsNumber()
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  totalQuantity: number;

  @IsNotEmpty({ message: ValidationErrorMessage.OPTION_TYPE })
  option: Option;
}
