import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Item } from './item.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 3000, nullable: false })
  url: string;

  @ManyToOne(() => Item, (item) => item.images)
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
