import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Table } from '../entities/table.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Payment } from '../entities/payment.entity';
import { Printer } from '../entities/printer.entity';
import { Setting } from '../entities/setting.entity';
import { InitialSchema1736780400000 } from '../migrations/1736780400000-InitialSchema';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'megapos',
  entities: [Category, Product, Table, Order, OrderItem, Payment, Printer, Setting],
  migrations: [InitialSchema1736780400000],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
