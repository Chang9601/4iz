import { IsNotEmpty } from 'class-validator';
import { Item } from '../item.entity';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class GetItemByIdDto {
  @IsNotEmpty({ message: ValidationErrorMessage.ITEM_TPYE })
  item: Item;
}
