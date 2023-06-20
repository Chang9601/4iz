import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    precision: 65,
    scale: 3,
    nullable: false,
  })
  totalAmount: number;

  @Column({
    type: 'varchar',
    name: 'payment_number',
    length: 500,
    nullable: false,
  })
  paymentNumber: string;

  @Column({
    type: 'varchar',
    name: 'payment_method',
    length: 300,
    nullable: false,
  })
  paymentMethod: string;

  @Column({
    type: 'timestamp',
    name: 'payment_date',
    default: () => 'CURRENT_TIMESTAMP',
  })
  paymentDate: Date;

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

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
