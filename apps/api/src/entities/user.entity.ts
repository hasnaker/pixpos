import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';

export type UserRole = 'admin' | 'manager' | 'cashier' | 'waiter';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  pin: string; // Hashed olacak (bcrypt ~60 karakter)

  @Column({
    type: 'enum',
    enum: ['admin', 'manager', 'cashier', 'waiter'],
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
