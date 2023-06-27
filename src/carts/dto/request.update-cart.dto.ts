import { IsNumber, Min } from 'class-validator';
import { VALIDATION_ERROR } from 'src/utils/constants/validation-error.enum';

export class RequestUpdateCartDto {
  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @Min(1, { message: VALIDATION_ERROR.POSITIVE_NUMBER })
  quantity: number;
}
