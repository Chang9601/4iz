import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { Cart } from './cart.entity';
import { Order } from './order.entity';
import { OAuthProvider, Role } from '../common/enums/common.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 300, nullable: false })
  name: string;

  @Column({ length: 500, unique: true, nullable: false })
  email: string;

  @Column({ length: 500, nullable: false })
  password: string;

  @Column({
    name: 'phone_number',
    length: 300,
    nullable: false,
  })
  phoneNumber: string;

  @Column({ nullable: false })
  birthday: Date;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'refresh_token',
    nullable: true,
    default: null,
  })
  refreshToken: string | null;

  @Column({ name: 'oauth_provider', length: 100, default: OAuthProvider.NONE })
  oAuthProvider: string;

  @Column({
    name: 'oauth_provider_id',
    length: 300,
    nullable: true,
    default: null,
  })
  oAuthProviderId: string;

  @Column({
    name: 'oauth_provider_refresh_token',
    length: 500,
    nullable: true,
    default: null,
  })
  oAuthProviderRefreshToken: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: [Role.USER],
  })
  roles: Role[];

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
  updatedAt: Date;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
