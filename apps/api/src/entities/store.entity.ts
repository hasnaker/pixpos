import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Table } from './table.entity';
import { Zone } from './zone.entity';
import { Category } from './category.entity';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { Printer } from './printer.entity';
import { Menu } from './menu.entity';

export type StoreStatus = 'active' | 'suspended' | 'trial' | 'cancelled';
export type StorePlan = 'free' | 'starter' | 'professional' | 'enterprise';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  slug: string; // URL-friendly identifier (e.g., "queen-waffle")

  @Column({ length: 100, unique: true, nullable: true })
  subdomain: string; // e.g., "queen" for queen.pixpos.cloud

  @Column({ length: 255, nullable: true })
  customDomain: string; // e.g., "pos.queenwaffle.com"

  @Column({ length: 255, nullable: true })
  logoUrl: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  taxNumber: string;

  @Column({ type: 'enum', enum: ['active', 'suspended', 'trial', 'cancelled'], default: 'trial' })
  status: StoreStatus;

  @Column({ type: 'enum', enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' })
  plan: StorePlan;

  @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ name: 'subscription_ends_at', type: 'timestamp', nullable: true })
  subscriptionEndsAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>; // Store-specific settings

  @Column({ type: 'jsonb', nullable: true })
  features: string[]; // Enabled features for this store

  @Column({ name: 'max_users', default: 5 })
  maxUsers: number;

  @Column({ name: 'max_tables', default: 20 })
  maxTables: number;

  @Column({ name: 'max_products', default: 100 })
  maxProducts: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, user => user.store)
  users: User[];

  @OneToMany(() => Table, table => table.store)
  tables: Table[];

  @OneToMany(() => Zone, zone => zone.store)
  zones: Zone[];

  @OneToMany(() => Category, category => category.store)
  categories: Category[];

  @OneToMany(() => Product, product => product.store)
  products: Product[];

  @OneToMany(() => Order, order => order.store)
  orders: Order[];

  @OneToMany(() => Printer, printer => printer.store)
  printers: Printer[];

  @OneToMany(() => Menu, menu => menu.store)
  menus: Menu[];
}
