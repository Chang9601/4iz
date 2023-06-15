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
    name: 'name',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'street',
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  street: string;

  @Column({
    name: 'address',
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  address: string;

  @Column({
    name: 'zipcode',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  zipcode: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: false })
  detail: string;

  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  trackingNumber: string;

  @Column({
    name: 'shipment_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  shipmentDate: Date;

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
