import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Store } from './store.entity';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'waiter';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', nullable: true })
  storeId: string | null; // null for super_admin

  @ManyToOne(() => Store, store => store.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @Column({ length: 100 })
  pin: string; // Hashed olacak (bcrypt ~60 karakter)

  @Column({
    type: 'enum',
    enum: ['super_admin', 'admin', 'manager', 'cashier', 'waiter'],
    default: 'waiter',
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // İlişkiler
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
