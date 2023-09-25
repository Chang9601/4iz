import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Order } from './order.entity';
import { Option } from './option.entity';

@Entity('order_to_options')
export class OrderToOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'total_quantity', nullable: false })
  totalQuantity: number;

  @ManyToOne(() => Order, (order) => order.orderToOptions)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Option, (option) => option.orderToOptions)
  @JoinColumn({ name: 'option_id' })
  option: Option;
}
