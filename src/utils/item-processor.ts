import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ValidationErrorMessage } from './validation-error-message';
import { Pagination } from './constants/pagination';

export class ItemProcessor {
  @IsNumber()
  @Min(1, { message: ValidationErrorMessage.POSITIVE_NUMBER })
  limit: number = Pagination.LIMIT;

  @IsNumber()
  @Min(1, { message: ValidationErrorMessage.POSITIVE_NUMBER })
  offset: number = Pagination.OFFSET;

  @IsString()
  search: string = Pagination.SEARCH;

  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  sort: string = Pagination.SORT;

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
