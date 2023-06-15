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
    name: 'total_amount',
    type: 'decimal',
    precision: 65,
    scale: 3,
    nullable: false,
  })
  totalAmount: number;

  @Column({
    name: 'payment_number',
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  paymentNumber: string;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  paymentMethod: string;

  @Column({
    name: 'payment_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  paymentDate: Date;

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

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
