import { IsObject, IsOptional } from 'class-validator';
import { Item } from '../item.entity';
import { VALIDATION_ERROR } from '../../utils/constants/validation-error.enum';

export class GetItemByIdDto {
  @IsOptional({ message: VALIDATION_ERROR.OBJECT_TYPE })
  @IsObject()
  item?: Item;
}
