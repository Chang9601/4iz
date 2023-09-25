import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import * as moment from 'moment';

import { PageStateDto } from './page-state.dto';
import { Item } from '../entities/item.entity';
import { Image } from '../entities/image.entity';
import { Category } from '../entities/category.entity';

export class ItemsDto {
  @ApiProperty({
    example: {
      total: 30,
      limit: 10,
      offset: 1,
      currentPage: 1,
      lastPage: 3,
      isPreviousPageValid: false,
      isNextPageValid: true,
    },
  })
  @Transform(({ obj }) => obj.state)
  @Type(() => PageStateDto)
  @Expose()
  pageState: PageStateDto;

  @ApiProperty({
    example: [
      {
        id: 14,
        name: '나이키 퓨전 슈즈',
        price: 329000,
        gender: '남성',
        isNew: false,
        discountRate: 0,
        releaseDate: '2014-05-14',
        images: [14],
        categories: [1, 2, 5, 6],
      },
      {
        id: 13,
        name: '나이키 컴포터 슈즈',
        price: 309000,
        gender: '여성',
        isNew: false,
        discountRate: 15,
        releaseDate: '2009-01-02',
        images: [13],
        categories: [1, 2, 5],
      },
    ],
  })
  @Transform(({ obj }) =>
    obj.data.map((item: Item) => ({
      ...item,
      releaseDate: moment(item.releaseDate).format('YYYY-MM-DD'),
      images: item.images.map((image: Image) => image.id),
      categories: item.categories.map((category: Category) => category.id),
    })),
  )
  @Type(() => Item)
  @Expose()
  items: Item[];
}
