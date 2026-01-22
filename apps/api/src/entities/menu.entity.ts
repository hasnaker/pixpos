import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Store } from './store.entity';

@Entity('menus')
@Index(['storeId'])
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'uuid', nullable: true })
  storeId: string | null;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  // Zaman kısıtlaması (opsiyonel) - örn: "08:00-11:00" kahvaltı için
  @Column({ name: 'time_start', type: 'time', nullable: true })
  timeStart: string | null;

  @Column({ name: 'time_end', type: 'time', nullable: true })
  timeEnd: string | null;

  // Hangi günlerde aktif (opsiyonel) - örn: [1,2,3,4,5] hafta içi
  @Column({ name: 'active_days', type: 'simple-array', nullable: true })
  activeDays: number[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Store, (store) => store.menus)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => Category, (category) => category.menu)
  categories: Category[];
}
