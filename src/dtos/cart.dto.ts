import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CartDto {
  @ApiProperty({
    example: 12,
  })
  @Expose()
  totalQuantity: number;

  @ApiProperty({
    example: 593000,
  })
  @Expose()
  totalPrice: number;
}
