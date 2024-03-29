import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Image } from './image.entity';
import { Category } from './category.entity';
import { Option } from './option.entity';
import { DecimalColumnTransformer } from '../common/factories/decimal-column.factory';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 300, unique: true, nullable: false })
  name: string;

  @Column({
    type: 'decimal',
    precision: 65,
    scale: 3,
    nullable: false,
    transformer: new DecimalColumnTransformer(),
  })
  price: number;

  @Column({ length: 20, nullable: false })
  gender: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ name: 'is_new', default: false, nullable: false })
  isNew: boolean;

  @Column({ type: 'int', name: 'discount_rate', default: 0, nullable: false })
  discountRate: number;

  @Column({ name: 'release_date', nullable: false })
  releaseDate: Date;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    name: 'updated_at',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @OneToMany(() => Image, (image) => image.item)
  images: Image[];

  @OneToMany(() => Option, (option) => option.item)
  options: Option[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'item_categories',
    joinColumn: {
      name: 'item_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];
}
