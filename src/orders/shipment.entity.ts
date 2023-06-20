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
    type: 'varchar',
    name: 'name',
    length: 200,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'street',
    length: 500,
    nullable: false,
  })
  street: string;

  @Column({
    type: 'varchar',
    name: 'address',
    length: 500,
    nullable: false,
  })
  address: string;

  @Column({
    type: 'varchar',
    name: 'zipcode',
    length: 300,
    nullable: false,
  })
  zipcode: string;

  @Column({
    type: 'varchar',
    name: 'phone_number',
    length: 300,
    nullable: false,
  })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: false })
  detail: string;

  @Column({
    type: 'varchar',
    name: 'tracking_number',
    length: 500,
    nullable: false,
  })
  trackingNumber: string;

  @Column({
    type: 'timestamp',
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
