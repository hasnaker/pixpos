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
import { Product } from './product.entity';
import { Printer } from './printer.entity';
import { Menu } from './menu.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'menu_id', type: 'uuid', nullable: true })
  menuId: string | null;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'printer_id', type: 'uuid', nullable: true })
  printerId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Menu, (menu) => menu.categories, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu | null;

  @ManyToOne(() => Printer, { nullable: true })
  @JoinColumn({ name: 'printer_id' })
  printer: Printer | null;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
