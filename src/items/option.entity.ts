import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Item } from './item.entity';

@Entity('options')
@Index(['item.id', 'color', 'size'], { unique: true })
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 300, nullable: false })
  color: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  size: string;

  @Column({ type: 'int', nullable: false })
  stock: number;

  @ManyToOne(() => Item, (item) => item.options)
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
