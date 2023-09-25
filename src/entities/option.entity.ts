import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Item } from './item.entity';
import { OrderToOption } from './order-option.entity';

@Entity('options')
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 300, nullable: false })
  color: string;

  @Column({ length: 300, nullable: false })
  size: string;

  @Column({ type: 'int', nullable: false })
  stock: number;

  @ManyToOne(() => Item, (item) => item.options)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @OneToMany(() => OrderToOption, (orderToOption) => orderToOption.option)
  orderToOptions: OrderToOption[];
}
