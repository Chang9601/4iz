import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  //Index,
} from 'typeorm';
import { User } from 'src/auth/user.entity';
import { Option } from 'src/items/option.entity';

@Entity('carts')
//@Index(['user', 'options.id'], { unique: true })
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'total_quantity', nullable: false })
  totalQuantity: number;

  @Column({
    type: 'decimal',
    name: 'total_price',
    precision: 65,
    scale: 3,
    nullable: false,
  })
  totalPrice: number;

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

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: User;

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
