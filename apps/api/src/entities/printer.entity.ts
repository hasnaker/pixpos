import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Store } from './store.entity';

export type PrinterType = 'kitchen' | 'bar' | 'receipt';
export type ConnectionType = 'tcp' | 'usb';

@Entity('printers')
@Index(['storeId'])
export class Printer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'uuid', nullable: true })
  storeId: string | null;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  type: PrinterType;

  @Column({ name: 'connection_type', length: 20 })
  connectionType: ConnectionType;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ default: 9100 })
  port: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Store, (store) => store.printers)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
