import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_status')
export class OrderStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'status',
    length: 100,
    unique: true,
    nullable: false,
  })
  status: string;

  @OneToMany(() => Order, (order) => order.orderStatus)
  orders: Order[];
}
