import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';
import { OrderStatus } from './order-status.entity';
import { Option } from './option.entity';
import { OrderToOption } from './order-option.entity';
import { DecimalColumnTransformer } from '../common/factories/decimal-column.factory';

@Entity('orders')
export class Order {
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
    transformer: new DecimalColumnTransformer(),
  })
  totalPrice: number;

  @Column({
    name: 'street_address',
    length: 500,
    nullable: false,
  })
  streetAddress: string;

  @Column({
    length: 300,
    nullable: false,
  })
  address: string;

  @Column({
    length: 200,
    nullable: false,
  })
  zipcode: string;

  @Column({
    name: 'order_number',
    length: 500,
    nullable: false,
  })
  orderNumber: string;

  @Column({
    name: 'order_date',
    default: () => 'CURRENT_TIMESTAMP',
  })
  orderDate: Date;

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

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => OrderStatus, (orderStatus) => orderStatus.orders)
  @JoinColumn({ name: 'order_status_id' })
  orderStatus: OrderStatus;

  @ManyToMany(() => Option)
  @JoinTable({
    name: 'order_options',
    joinColumn: {
      name: 'order_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'option_id',
      referencedColumnName: 'id',
    },
  })
  options: Option[];

  @OneToMany(() => OrderToOption, (orderToOption) => orderToOption.order)
  orderToOptions: OrderToOption[];
}
