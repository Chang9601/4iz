import { Cart } from 'src/carts/cart.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 300, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  password: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  phoneNumber: string;

  @Column({ type: 'date', nullable: false })
  birthday: Date;

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

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];
}
