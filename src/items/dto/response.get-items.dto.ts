import { IsArray, IsNumber, IsPositive, Min } from 'class-validator';
import { Item } from '../item.entity';
import { VALIDATION_ERROR } from '../../utils/constants/validation-error.enum';

export class ResponseGetItemsDto {
  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @Min(0, { message: VALIDATION_ERROR.NON_NEGATIVE_NUMBER })
  total: number;

  @IsNumber({}, { message: VALIDATION_ERROR.NUMBER_TYPE })
  @IsPositive({ message: VALIDATION_ERROR.POSITIVE_NUMBER })
  offset: number;

  @IsArray({ message: VALIDATION_ERROR.ITEM_ARRAY })
  items: Item[];
}
