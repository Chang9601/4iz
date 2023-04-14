import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Item } from './item.entity';

@Entity('options')
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  color: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  size: string;

  @Column({ type: 'int', nullable: false })
  stock: number;

  @ManyToOne(() => Item, (item) => item.options)
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
