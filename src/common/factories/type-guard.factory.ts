import { IItem } from '../../interfaces/types.interface';

export const isItem = (obj: any): obj is IItem => {
  return (
    obj.price !== undefined &&
    obj.gender !== undefined &&
    obj.description !== undefined &&
    obj.isNew !== undefined &&
    obj.discountRate !== undefined
  );
};
