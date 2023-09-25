import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Order } from './order.entity';

@Entity('shipment')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 200,
    nullable: false,
  })
  name: string;

  @Column({
    length: 500,
    nullable: false,
  })
  street: string;

  @Column({
    length: 500,
    nullable: false,
  })
  address: string;

  @Column({
    length: 300,
    nullable: false,
  })
  zipcode: string;

  @Column({
    name: 'phone_number',
    length: 300,
    nullable: false,
  })
  phoneNumber: string;

  @Column({ length: 300, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: false })
  detail: string;

  @Column({
    name: 'tracking_number',
    length: 500,
    nullable: false,
  })
  trackingNumber: string;

  @Column({
    name: 'shipment_date',
    default: () => 'CURRENT_TIMESTAMP',
  })
  shipmentDate: Date;

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
