import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import * as moment from 'moment';
import { Moment } from 'moment';

import { OrderStatus } from '../entities/order-status.entity';
import { Option } from '../entities/option.entity';
import { OrderToOption } from '../entities/order-option.entity';

export class OrderDto {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 12,
  })
  @Expose()
  totalQuantity: number;

  @ApiProperty({
    example: 361450,
  })
  @Expose()
  totalPrice: number;

  @ApiProperty({
    example: '1fdfarl2302312',
  })
  @Expose()
  orderNumber: string;

  @ApiProperty({
    example: '2023-11-03',
  })
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
  @Type(() => Date)
  @Expose()
  orderDate: Moment;

  @ApiProperty({
    example: '결제완료',
  })
  @Transform(({ obj }) => obj.orderStatus.status)
  @Type(() => OrderStatus)
  @Expose()
  orderStatus: string;

  @ApiProperty({
    example: '',
  })
  @Transform(({ obj }) =>
    obj.options.map((option: Option) => ({
      id: option.id,
      color: option.color,
      size: option.size,
    })),
  )
  @Type(() => Option)
  @Expose()
  options: Option[];

  @ApiProperty({
    example: '',
  })
  @Transform(({ obj }) =>
    obj.orderToOptions.map((optionToOption: OrderToOption) => ({
      id: optionToOption.id,
      totalQuantity: optionToOption.totalQuantity,
    })),
  )
  @Type(() => OrderToOption)
  @Expose()
  orderToOptions: OrderToOption[];
}
