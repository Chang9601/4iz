import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { OrderStatusLabel } from 'src/utils/enum';

export class ResponseCreateOrderDto {
  @IsNumber()
  totalPrice: number;

  @IsNumber()
  totalQuantity: number;

  @IsString()
  orderNumber: string;

  @IsDate()
  orderDate: Date;

  @IsEnum(OrderStatusLabel)
  orderStatus: OrderStatusLabel;
}
