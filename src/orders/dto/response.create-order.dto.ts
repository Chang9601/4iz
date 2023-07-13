import {
  IsDate,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { ORDER_STATUS } from '../../utils/constants/order-status.enum';
import { VALIDATION_ERROR } from '../../utils/constants/validation-error.enum';

export class ResponseCreateOrderDto {
  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @IsPositive({ message: VALIDATION_ERROR.POSITIVE_NUMBER })
  totalPrice: number;

  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @IsPositive({ message: VALIDATION_ERROR.POSITIVE_NUMBER })
  totalQuantity: number;

  @IsString()
  orderNumber: string;

  @IsDate()
  orderDate: Date;

  @IsEnum(ORDER_STATUS)
  orderStatus: ORDER_STATUS;
}
