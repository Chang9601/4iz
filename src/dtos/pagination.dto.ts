import { Expose, Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ValidationError, Pagination } from '../common/enums/common.enum';

export class PaginationDto {
  @ApiProperty({
    description: '기준점',
    example: 1,
  })
  @Min(0, { message: ValidationError.NON_NEGATIVE_NUMBER })
  @IsInt({ message: ValidationError.INTEGER_TYPE })
  @IsNumber()
  // 일반 객체를 클래스 객체로 변환 시 타입을 명시한다.
  @Type(() => Number)
  offset: number = Pagination.OFFSET;

  @ApiProperty({
    description: '최대 개수',
    example: 10,
  })
  @Min(1, { message: ValidationError.POSITIVE_NUMBER })
  @IsInt({ message: ValidationError.INTEGER_TYPE })
  @IsNumber()
  @Type(() => Number)
  limit: number = Pagination.LIMIT;

  @ApiProperty({
    description: '검색어',
    example: '조던',
  })
  @IsString({ message: ValidationError.STRING_TYPE })
  @IsOptional()
  search?: string = Pagination.SEARCH;

  @ApiProperty({
    description: '정렬 기준',
    example: 'high',
  })
  @IsString({ message: ValidationError.STRING_TYPE })
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  sort?: string = Pagination.SORT;

  @ApiProperty({
    description: '카테고리',
    example: '축구',
  })
  @IsString({ message: ValidationError.STRING_TYPE })
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: '크기',
    example: 260,
  })
  @IsOptional()
  size?: string;

  @ApiProperty({
    description: '색상',
    example: '검정',
  })
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: '성별',
    example: '남성',
  })
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: '주문 상태',
    example: '결제완료',
  })
  @IsOptional()
  status?: string;

  @Expose()
  get skip() {
    return this.offset <= 0 ? 0 : (this.offset - 1) * this.limit;
  }
}
