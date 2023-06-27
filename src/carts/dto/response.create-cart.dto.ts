import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Option } from 'src/items/option.entity';
import { VALIDATION_ERROR } from 'src/utils/constants/validation-error.enum';

export class ResponseCreateCartDto {
  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @IsPositive({ message: VALIDATION_ERROR.POSITIVE_NUMBER })
  totalPrice: number;

  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @IsPositive({ message: VALIDATION_ERROR.POSITIVE_NUMBER })
  totalQuantity: number;

  @IsNotEmpty({ message: VALIDATION_ERROR.OPTION_TYPE })
  option: Option;
}
