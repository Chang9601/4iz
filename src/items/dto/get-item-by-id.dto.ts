import { IsNotEmpty } from 'class-validator';
import { Item } from '../item.entity';
import { VALIDATION_ERROR } from 'src/utils/constants/validation-error.enum';

export class GetItemByIdDto {
  @IsNotEmpty({ message: VALIDATION_ERROR.ITEM_TPYE })
  item: Item;
}
