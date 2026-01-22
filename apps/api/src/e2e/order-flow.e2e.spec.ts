/**
 * End-to-End Test: Tam Sipariş Akışı (Complete Order Flow)
 * 
 * This test validates the complete order flow from table selection to payment.
 * 
 * **Validates: Test Senaryosu from Requirements**
 * 
 * Test Flow:
 * 1. Setup: Create tables, categories, products
 * 2. Order Flow: Create order → Add items → Send to kitchen → Mark ready → Payment
 * 3. Order Operations: Split, transfer, merge orders
 * 4. Cleanup: Verify table status after payment
 * 
 * NOTE: These tests require a running PostgreSQL database.
 * Set E2E_TEST_ENABLED=true and configure database connection to run.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Services
import { CategoriesService } from '../modules/categories/categories.service';
import { ProductsService } from '../modules/products/products.service';
import { TablesService } from '../modules/tables/tables.service';
import { OrdersService } from '../modules/orders/orders.service';
import { KitchenService } from '../modules/kitchen/kitchen.service';
import { PaymentsService } from '../modules/payments/payments.service';

// Modules
import { CategoriesModule } from '../modules/categories';
import { ProductsModule } from '../modules/products';
import { TablesModule } from '../modules/tables';
import { OrdersModule } from '../modules/orders';
import { KitchenModule } from '../modules/kitchen';
import { PaymentsModule } from '../modules/payments';
import { WebsocketModule } from '../modules/websocket';

// Entities
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Table } from '../entities/table.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Payment } from '../entities/payment.entity';
import { Printer } from '../entities/printer.entity';
import { Setting } from '../modules/settings/settings.entity';

// Check if E2E tests should run
const isE2EEnabled = process.env.E2E_TEST_ENABLED === 'true';

// Conditionally run tests
const describeOrSkip = isE2EEnabled ? describe : describe.skip;

describeOrSkip('E2E: Complete Order Flow (Tam Sipariş Akışı)', () => {
  let app: INestApplication;
  let categoriesService: CategoriesService;
  let productsService: ProductsService;
  let tablesService: TablesService;
  let ordersService: OrdersService;
  let kitchenService: KitchenService;
  let paymentsService: PaymentsService;

  // Test data IDs
  let categoryId: string;
  let productIds: string[] = [];
  let tableIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'megapos_test',
          entities: [Category, Product, Table, Order, OrderItem, Payment, Printer, Setting],
          synchronize: true, // Only for testing
          dropSchema: true, // Clean database before tests
        }),
        CategoriesModule,
        ProductsModule,
        TablesModule,
        OrdersModule,
        KitchenModule,
        PaymentsModule,
        WebsocketModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    categoriesService = moduleFixture.get<CategoriesService>(CategoriesService);
    productsService = moduleFixture.get<ProductsService>(ProductsService);
    tablesService = moduleFixture.get<TablesService>(TablesService);
    ordersService = moduleFixture.get<OrdersService>(OrdersService);
    kitchenService = moduleFixture.get<KitchenService>(KitchenService);
    paymentsService = moduleFixture.get<PaymentsService>(PaymentsService);
  }, 30000); // 30 second timeout for setup

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Phase 1: Setup (Hazırlık)', () => {
    /**
     * Test Senaryosu Step 1: Boss ekranından masa ekle
     * Requirements: 9.1, 9.2, 9.3
     */
    it('should create tables (Masa 1, 2, 3)', async () => {
      const tableNames = ['Masa 1', 'Masa 2', 'Masa 3'];
      
      for (const name of tableNames) {
        const table = await tablesService.create({ name, capacity: 4 });
        tableIds.push(table.id);
        expect(table.name).toBe(name);
        expect(table.status).toBe('empty');
      }

      expect(tableIds.length).toBe(3);
    });

    /**
     * Test Senaryosu Step 2: Boss ekranından kategori ekle
     * Requirements: 6.7
     */
    it('should create category (İçecekler)', async () => {
      const category = await categoriesService.create({ name: 'İçecekler' });
      categoryId = category.id;
      expect(category.name).toBe('İçecekler');
      expect(category.isActive).toBe(true);
    });

    /**
     * Test Senaryosu Step 3: Boss ekranından ürün ekle
     * Requirements: 6.1, 6.2, 6.3
     */
    it('should create products (Çay, Kahve, Tost)', async () => {
      const products = [
        { name: 'Çay', price: 15, categoryId },
        { name: 'Kahve', price: 25, categoryId },
        { name: 'Tost', price: 45, categoryId },
      ];

      for (const productData of products) {
        const product = await productsService.create(productData);
        productIds.push(product.id);
        expect(product.name).toBe(productData.name);
        expect(Number(product.price)).toBe(productData.price);
      }

      expect(productIds.length).toBe(3);
    });
  });

  describe('Phase 2: Basic Order Flow (Temel Sipariş Akışı)', () => {
    let orderId: string;

    /**
     * Test Senaryosu Step 5: Satış ekranından Masa 1'i aç → Sipariş al
     * Requirements: 1.1, 1.2, 1.3
     */
    it('should create order on Masa 1', async () => {
      const order = await ordersService.create({ tableId: tableIds[0] });
      orderId = order.id;
      
      expect(order.tableId).toBe(tableIds[0]);
      expect(order.status).toBe('open');
      expect(Number(order.totalAmount)).toBe(0);
    });

    /**
     * Requirements: 1.3 - Ürüne tıklandığında sepete ekle
     */
    it('should add items to order', async () => {
      // Add 2x Çay
      await ordersService.addItem(orderId, { productId: productIds[0], quantity: 2 });
      
      // Add 1x Kahve
      await ordersService.addItem(orderId, { productId: productIds[1], quantity: 1 });
      
      const order = await ordersService.findOne(orderId);
      
      expect(order.items.length).toBe(2);
      // 2x15 + 1x25 = 55
      expect(Number(order.totalAmount)).toBe(55);
    });

    /**
     * Requirements: 1.1, 1.6 - Masa durumu kontrolü
     * Property 2: Masa Durumu Tutarlılığı
     */
    it('should update table status to occupied', async () => {
      const table = await tablesService.findOne(tableIds[0]);
      expect(table.status).toBe('occupied');
    });

    /**
     * Test Senaryosu Step 5: Kaydet → Mutfağa gönder
     * Requirements: 1.5, 3.5
     */
    it('should send order to kitchen', async () => {
      const order = await ordersService.sendToKitchen(orderId);
      
      expect(order.status).toBe('kitchen');
      expect(order.items.every(item => item.status === 'preparing')).toBe(true);
    });

    /**
     * Test Senaryosu Step 6: Mutfakta sipariş kağıdı çıktığını kontrol et
     * Requirements: 4.1
     * Property 5: Mutfak Sipariş Sırası (FIFO)
     */
    it('should show order in kitchen queue', async () => {
      const kitchenOrders = await kitchenService.getKitchenOrders();
      
      expect(kitchenOrders.length).toBeGreaterThanOrEqual(1);
      const ourOrder = kitchenOrders.find(o => o.id === orderId);
      expect(ourOrder).toBeDefined();
      expect(ourOrder!.status).toBe('kitchen');
    });

    /**
     * Test Senaryosu Step 7: Mutfak ekranında siparişi gör → Hazır işaretle
     * Requirements: 4.7
     */
    it('should mark order as ready', async () => {
      const order = await kitchenService.markOrderReady(orderId);
      
      expect(order.status).toBe('ready');
      expect(order.items.every(item => item.status === 'ready')).toBe(true);
    });

    /**
     * Test Senaryosu Step 17: Ödeme al → Masayı kapat
     * Requirements: 1.6
     */
    it('should process payment and close table', async () => {
      const order = await ordersService.findOne(orderId);
      
      const payment = await paymentsService.create({
        orderId,
        amount: Number(order.totalAmount),
        paymentMethod: 'cash',
      });

      expect(payment.amount).toBe(Number(order.totalAmount));
      expect(payment.paymentMethod).toBe('cash');

      // Verify order is paid
      const paidOrder = await ordersService.findOne(orderId);
      expect(paidOrder.status).toBe('paid');

      // Verify table is empty
      const table = await tablesService.findOne(tableIds[0]);
      expect(table.status).toBe('empty');
    });
  });

  describe('Phase 3: Waiter Tablet Order Flow (Garson Tablet Sipariş)', () => {
    let waiterOrderId: string;

    /**
     * Test Senaryosu Step 8: Tabletten Masa 2'yi aç → Sipariş al → Gönder
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
     */
    it('should create order from waiter tablet on Masa 2', async () => {
      const order = await ordersService.create({ 
        tableId: tableIds[1],
        notes: 'Garson notu: Acele sipariş',
      });
      waiterOrderId = order.id;
      
      expect(order.tableId).toBe(tableIds[1]);
      expect(order.notes).toBe('Garson notu: Acele sipariş');
    });

    /**
     * Requirements: 3.3, 3.4 - Ürün ve not ekleme
     */
    it('should add items with notes', async () => {
      await ordersService.addItem(waiterOrderId, { 
        productId: productIds[2], // Tost
        quantity: 2,
        notes: 'Az pişmiş',
      });

      const order = await ordersService.findOne(waiterOrderId);
      expect(order.items.length).toBe(1);
      expect(order.items[0].notes).toBe('Az pişmiş');
      expect(Number(order.totalAmount)).toBe(90); // 2x45
    });

    /**
     * Requirements: 3.5, 3.6, 3.7 - Mutfağa gönder
     */
    it('should send waiter order to kitchen', async () => {
      const order = await ordersService.sendToKitchen(waiterOrderId);
      expect(order.status).toBe('kitchen');
    });

    /**
     * Test Senaryosu Step 9: Mutfakta sipariş kağıdı çıktığını kontrol et
     */
    it('should appear in kitchen queue', async () => {
      const kitchenOrders = await kitchenService.getKitchenOrders();
      const ourOrder = kitchenOrders.find(o => o.id === waiterOrderId);
      expect(ourOrder).toBeDefined();
    });
  });

  describe('Phase 4: Order Operations (Sipariş Düzenleme)', () => {
    let orderForOperations: string;
    let secondOrderId: string;

    beforeAll(async () => {
      // Create a fresh order on Masa 1 for operations
      const order = await ordersService.create({ tableId: tableIds[0] });
      orderForOperations = order.id;
      
      // Add multiple items
      await ordersService.addItem(orderForOperations, { productId: productIds[0], quantity: 3 }); // 3x Çay = 45
      await ordersService.addItem(orderForOperations, { productId: productIds[1], quantity: 2 }); // 2x Kahve = 50
      await ordersService.addItem(orderForOperations, { productId: productIds[2], quantity: 1 }); // 1x Tost = 45
    });

    /**
     * Test Senaryosu Step 10: Masa 1'e ürün ekle
     * Requirements: 2.1
     */
    it('should add item to existing order', async () => {
      const orderBefore = await ordersService.findOne(orderForOperations);
      const totalBefore = Number(orderBefore.totalAmount);
      
      await ordersService.addItem(orderForOperations, { productId: productIds[0], quantity: 1 }); // +1x Çay = 15
      
      const orderAfter = await ordersService.findOne(orderForOperations);
      expect(Number(orderAfter.totalAmount)).toBe(totalBefore + 15);
    });

    /**
     * Test Senaryosu Step 11: Masa 1'den ürün çıkar
     * Requirements: 2.1
     */
    it('should remove item from order', async () => {
      const orderBefore = await ordersService.findOne(orderForOperations);
      const lastItem = orderBefore.items[orderBefore.items.length - 1];
      const itemTotal = Number(lastItem.quantity) * Number(lastItem.unitPrice);
      const totalBefore = Number(orderBefore.totalAmount);
      
      await ordersService.removeItem(orderForOperations, lastItem.id);
      
      const orderAfter = await ordersService.findOne(orderForOperations);
      expect(Number(orderAfter.totalAmount)).toBe(totalBefore - itemTotal);
    });

    /**
     * Test Senaryosu Step 12: Masa 1'i Masa 3'e aktar
     * Requirements: 2.5, 2.6
     */
    it('should transfer order to another table', async () => {
      const order = await ordersService.transferOrder(orderForOperations, {
        targetTableId: tableIds[2], // Masa 3
      });

      expect(order.tableId).toBe(tableIds[2]);

      // Verify source table is empty (no other orders)
      const sourceTable = await tablesService.findOne(tableIds[0]);
      expect(sourceTable.status).toBe('empty');

      // Verify target table is occupied
      const targetTable = await tablesService.findOne(tableIds[2]);
      expect(targetTable.status).toBe('occupied');
    });

    /**
     * Prepare for merge test - create order on Masa 2
     */
    it('should create second order for merge test', async () => {
      // First, complete the waiter order on Masa 2
      const kitchenOrders = await kitchenService.getKitchenOrders();
      for (const order of kitchenOrders) {
        if (order.tableId === tableIds[1]) {
          await kitchenService.markOrderReady(order.id);
          const readyOrder = await ordersService.findOne(order.id);
          await paymentsService.create({
            orderId: order.id,
            amount: Number(readyOrder.totalAmount),
            paymentMethod: 'card',
          });
        }
      }

      // Create new order on Masa 2
      const order = await ordersService.create({ tableId: tableIds[1] });
      secondOrderId = order.id;
      await ordersService.addItem(secondOrderId, { productId: productIds[1], quantity: 2 }); // 2x Kahve = 50
    });

    /**
     * Test Senaryosu Step 13: Masa 2 ve 3'ü birleştir
     * Requirements: 2.7, 2.8
     * Property 4: Masa Birleştirme Tutarlılığı
     */
    it('should merge orders from two tables', async () => {
      const order1 = await ordersService.findOne(orderForOperations);
      const order2 = await ordersService.findOne(secondOrderId);
      const expectedTotal = Number(order1.totalAmount) + Number(order2.totalAmount);

      const mergedOrder = await ordersService.mergeOrders({
        orderIds: [orderForOperations, secondOrderId],
        targetTableId: tableIds[2], // Merge to Masa 3
      });

      // Property 4: Total should equal sum of original orders
      expect(Number(mergedOrder.totalAmount)).toBe(expectedTotal);

      // Verify source table (Masa 2) is empty
      const sourceTable = await tablesService.findOne(tableIds[1]);
      expect(sourceTable.status).toBe('empty');

      // Update reference for split test
      orderForOperations = mergedOrder.id;
    });

    /**
     * Test Senaryosu Step 14: Siparişi böl (2 ayrı hesap)
     * Requirements: 2.3, 2.4
     * Property 3: Sipariş Bölme Tutarlılığı
     */
    it('should split order into two separate bills', async () => {
      const orderBefore = await ordersService.findOne(orderForOperations);
      const originalTotal = Number(orderBefore.totalAmount);
      
      // Split first item to new order
      const itemToSplit = orderBefore.items[0];
      
      const { originalOrder, newOrder } = await ordersService.splitOrder(orderForOperations, {
        itemIds: [itemToSplit.id],
      });

      // Property 3: Sum of split orders should equal original
      const splitTotal = Number(originalOrder.totalAmount) + Number(newOrder.totalAmount);
      expect(splitTotal).toBe(originalTotal);

      // Both orders should be on same table
      expect(originalOrder.tableId).toBe(newOrder.tableId);
    });
  });

  describe('Phase 5: Reports Verification (Rapor Doğrulama)', () => {
    /**
     * Test Senaryosu Step 18: Boss ekranından günlük raporu kontrol et
     * Requirements: 7.1, 7.2, 7.3
     */
    it('should have completed orders in the system', async () => {
      const allOrders = await ordersService.findAll();
      const paidOrders = allOrders.filter(o => o.status === 'paid');
      
      // We should have at least 2 paid orders from our tests
      expect(paidOrders.length).toBeGreaterThanOrEqual(2);
    });
  });
});
