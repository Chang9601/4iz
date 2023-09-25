import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

import { Item } from './item.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 300, unique: true, nullable: false })
  name: string;

  @ManyToMany(() => Item)
  categories: Item[];
}
