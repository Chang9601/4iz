import { Cart } from '../carts/cart.entity';
import { Order } from '../orders/order.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 300, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  password: string;

  @Column({
    type: 'varchar',
    name: 'phone_number',
    length: 300,
    nullable: false,
  })
  phoneNumber: string;

  @Column({ type: 'date', nullable: false })
  birthday: Date;

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

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
