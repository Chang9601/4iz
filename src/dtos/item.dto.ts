import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import * as moment from 'moment';
import { Moment } from 'moment';

import { Option } from '../entities/option.entity';
import { Category } from '../entities/category.entity';
import { Image } from '../entities/image.entity';

export class ItemDto {
  @ApiProperty({
    example: 29,
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: '나이키코트 에지 슈즈',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 189000,
  })
  @Expose()
  price: number;

  @ApiProperty({
    example: '남성',
  })
  @Expose()
  gender: string;

  @ApiProperty({
    example: '에지한 신발',
  })
  @Expose()
  description: string;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  @Expose()
  isNew: boolean;

  @ApiProperty({
    example: 5,
  })
  @Expose()
  discountRate: number;

  @ApiProperty({
    type: Date,
    example: '2015-01-14',
  })
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
  @Type(() => Date)
  @Expose()
  releaseDate: Moment;

  @ApiProperty({
    // description: '옵션 아이디 배열',
    example: [
      {
        id: 726,
        color: '회색',
        size: '245',
        stock: 100,
      },
      {
        id: 6,
        color: '흰색',
        size: '220',
        stock: 100,
      },
    ],
  })
  // 아이디 외에 전달하는 것의 성능과 아이디만 전달하고 API 호출하는 성능 중 어느 것이 더 좋은지 비교가 필요하다.
  // @Transform(({ obj }) => obj.options.map((option: Option) => option.id))
  // options: number[];
  @Transform(({ obj }) => obj.options)
  @Type(() => Option)
  @Expose()
  options: Option[];

  @ApiProperty({
    description: '이미지 아이디 배열',
    example: [29],
  })
  @Transform(({ obj }) => obj.images.map((image: Image) => image.id))
  @Type(() => Image)
  @Expose()
  images: number[];

  @ApiProperty({
    description: '카테고리 아이디 배열',
    example: [3, 5, 6],
  })
  @Transform(({ obj }) =>
    obj.categories.map((category: Category) => category.id),
  )
  @Type(() => Category)
  @Expose()
  categories: number[];
}
