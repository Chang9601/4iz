import {
  IsDate,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { OrderStatusLabel } from 'src/utils/constants/order-status-enum';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class ResponseCreateOrderDto {
  @IsNumber()
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  totalPrice: number;

  @IsNumber()
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  totalQuantity: number;

  @IsString()
  orderNumber: string;

  @IsDate()
  orderDate: Date;

  @IsEnum(OrderStatusLabel)
  orderStatus: OrderStatusLabel;
}
