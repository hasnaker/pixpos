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

export type TableStatus = 'empty' | 'occupied' | 'paying';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', nullable: true })
  storeId: string | null;

  @ManyToOne(() => Store, store => store.tables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, default: 'Salon' })
  zone: string;

  @Column({ default: 4 })
  capacity: number;

  @Column({ length: 20, default: 'empty' })
  status: TableStatus;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];
}
