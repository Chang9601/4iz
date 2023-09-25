import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CacheKey } from '@nestjs/cache-manager';

// import { CustomCacheService } from '../cache/custom-cache.service';
import { PaginationDto } from '../../dtos/pagination.dto';
import { ItemsDto } from '../../dtos/items.dto';
import { ItemDto } from '../../dtos/item.dto';
import { ItemsService } from './items.service';
import { HttpCacheInterceptor } from '../../interceptors/cache.interceptor';
import { Serialize } from '../../interceptors/serialize.interceptor';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(
    // private readonly customCacheService: CustomCacheService,
    private readonly itemsService: ItemsService,
  ) {}

  // 데코레이터 적용 순서 알아보기.
  @ApiNotFoundResponse({
    description: '상품 검색 실패.',
  })
  @ApiOkResponse({
    type: ItemDto,
    description: '상품 검색 성공.',
  })
  @HttpCode(HttpStatus.OK)
  @Serialize(ItemDto)
  @CacheKey('items')
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/:id')
  async getItem(@Param('id', ParseIntPipe) id: number) {
    return await this.itemsService.findOne(id);
  }

  // 캐시 적용 방법 알아보기.
  @ApiOkResponse({
    type: ItemsDto,
    description: '상품 목록 검색 성공.',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 페이지.',
  })
  @ApiQuery({
    type: PaginationDto,
  })
  @HttpCode(HttpStatus.OK)
  @Serialize(ItemsDto)
  @UseInterceptors(HttpCacheInterceptor)
  @Get('')
  async getItems(
    @Query()
    paginationDto: PaginationDto,
  ) {
    return await this.itemsService.find(paginationDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/options/:id')
  async getItemByOptionId(@Param('id', ParseIntPipe) id: number) {
    return await this.itemsService.findOneByOptionId(id);
  }

  // @Get('/options')
  // @HttpCode(HttpStatus.OK)
  // async getOptions(
  //   @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
  //   getOptions: GetOptionsDto,
  // ) {
  //   console.log(getOptions);
  //   return await this.itemsService.findOptions(getOptions);
  // }
}
