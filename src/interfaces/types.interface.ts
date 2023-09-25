import { Category } from '../entities/category.entity';
import { Image } from '../entities/image.entity';
import { Option } from '../entities/option.entity';

export interface IItem {
  id: number;
  name: string;
  price: number;
  gender: string;
  description: string;
  isNew: boolean;
  discountRate: number;
  releaseDate: Date;
  createdAt: Date;
  updatedAt: Date | null;
  images: Image[];
  options: Option[];
  categories: Category[];
}

export interface ICart {
  totalPrice: number;
  totalQuantity: number;
}
