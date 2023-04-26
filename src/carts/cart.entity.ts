import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Option } from 'src/items/option.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_quantity', type: 'int', nullable: false })
  totalQuantity: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 65,
    scale: 3,
    nullable: false,
  })
  totalPrice: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  // User Entity: Many-to-One

  @ManyToMany(() => Option)
  @JoinTable({
    name: 'cart_options',
    joinColumn: {
      name: 'cart_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'option_id',
      referencedColumnName: 'id',
    },
  })
  options: Option[];
}
