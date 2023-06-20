import { IsArray, IsNumber, IsPositive, Min } from 'class-validator';
import { Item } from '../item.entity';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class GetItemsDto {
  @IsNumber()
  @Min(1, { message: ValidationErrorMessage.NON_NEGATIVE_NUMBER })
  total: number;

  @IsNumber()
  @IsPositive({ message: ValidationErrorMessage.POSITIVE_NUMBER })
  offset: number;

  @IsArray({ message: ValidationErrorMessage.ITEM_ARRAY })
  items: Item[];
}
