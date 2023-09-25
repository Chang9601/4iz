import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Option } from './option.entity';
import { DecimalColumnTransformer } from '../common/factories/decimal-column.factory';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'total_quantity', nullable: false })
  totalQuantity: number;

  @Column({
    type: 'decimal',
    name: 'total_price',
    precision: 65,
    scale: 3,
    nullable: false,
    transformer: new DecimalColumnTransformer(),
  })
  totalPrice: number;

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

  // @JoinColumn() 데코레이터는 외래 키를 매핑할 때 사용하며 name 속성에는 매핑할 외래 키 이름을 지정한다.
  // @JoinColumn() 데코레이터는 매핑할 외래 키의 이름을 지정해 주는 것 이외의 역할을 하지 않는다.
  // @ManyToOne() 데코레이터를 통해서 테이블을 연결하기에 생략이 가능하다.
  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Option)
  @JoinTable({
    name: 'cart_options',
    joinColumn: {
      name: 'cart_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'option_id',
      referencedColumnName: 'id',
    },
  })
  options: Option[];
}
