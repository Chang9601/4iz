import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PAGINATION } from '../../utils/constants/pagination.enum';
import { VALIDATION_ERROR } from 'src/utils/constants/validation-error.enum';

export class RequestGetItemsDto {
  @IsNumber()
  @Min(1, { message: VALIDATION_ERROR.POSITIVE_NUMBER })
  limit: number = PAGINATION.LIMIT;

  @IsNumber()
  @Min(1, { message: VALIDATION_ERROR.POSITIVE_NUMBER })
  offset: number = PAGINATION.OFFSET;

  @IsString()
  search: string = PAGINATION.SEARCH;

  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  sort: string = PAGINATION.SORT;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  size?: string[];

  @IsOptional()
  color?: string[];

  @IsOptional()
  gender?: string[];
}
