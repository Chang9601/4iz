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
//@Index(['user', 'options.id'], { unique: true }) -> Correct syntax?
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
