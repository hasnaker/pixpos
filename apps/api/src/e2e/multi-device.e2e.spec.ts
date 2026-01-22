/**
 * E2E Test: Multi-Device Test (Çoklu Cihaz Testi)
 * 
 * This test validates that the system works correctly when multiple devices
 * (PC, Tablet, Phone) are connected simultaneously.
 * 
 * **Validates: Tüm sistem - Multi-device concurrent access**
 * 
 * Test Scenarios:
 * 1. Concurrent order creation from different devices
 * 2. Real-time updates across devices (WebSocket)
 * 3. Data consistency under concurrent access
 * 4. Table status synchronization
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

describeOrSkip('E2E: Multi-Device Concurrent Access (Çoklu Cihaz Eşzamanlı Erişim)', () => {
  let app: INestApplication;
  let categoriesService: CategoriesService;
  let productsService: ProductsService;
  let tablesService: TablesService;
  let ordersService: OrdersService;
  let kitchenService: KitchenService;
  let paymentsService: PaymentsService;

  // Test data
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
          synchronize: true,
          dropSchema: true,
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

    // Setup test data
    const category = await categoriesService.create({ name: 'Test Kategori' });
    categoryId = category.id;

    const products = [
      { name: 'Ürün A', price: 10, categoryId },
      { name: 'Ürün B', price: 20, categoryId },
      { name: 'Ürün C', price: 30, categoryId },
    ];

    for (const p of products) {
      const product = await productsService.create(p);
      productIds.push(product.id);
    }

    // Create 5 tables for concurrent testing
    for (let i = 1; i <= 5; i++) {
      const table = await tablesService.create({ name: `Masa ${i}`, capacity: 4 });
      tableIds.push(table.id);
    }
  }, 30000); // 30 second timeout for setup

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Concurrent Order Creation (Eşzamanlı Sipariş Oluşturma)', () => {
    /**
     * Simulates POS (PC) and Waiter Tablet creating orders simultaneously
     * on different tables
     */
    it('should handle concurrent order creation on different tables', async () => {
      // Simulate 3 devices creating orders at the same time
      const orderPromises = [
        // POS creates order on Masa 1
        ordersService.create({ tableId: tableIds[0], notes: 'POS siparişi' }),
        // Waiter Tablet 1 creates order on Masa 2
        ordersService.create({ tableId: tableIds[1], notes: 'Garson 1 siparişi' }),
        // Waiter Tablet 2 creates order on Masa 3
        ordersService.create({ tableId: tableIds[2], notes: 'Garson 2 siparişi' }),
      ];

      const orders = await Promise.all(orderPromises);

      // All orders should be created successfully
      expect(orders.length).toBe(3);
      expect(orders[0].tableId).toBe(tableIds[0]);
      expect(orders[1].tableId).toBe(tableIds[1]);
      expect(orders[2].tableId).toBe(tableIds[2]);

      // All orders should have unique order numbers
      const orderNumbers = orders.map(o => o.orderNumber);
      const uniqueNumbers = new Set(orderNumbers);
      expect(uniqueNumbers.size).toBe(3);

      // All tables should be occupied
      for (let i = 0; i < 3; i++) {
        const table = await tablesService.findOne(tableIds[i]);
        expect(table.status).toBe('occupied');
      }
    });

    /**
     * Simulates multiple devices adding items to different orders concurrently
     */
    it('should handle concurrent item additions to different orders', async () => {
      // Get existing orders
      const allOrders = await ordersService.findAll('open');
      const orderIds = allOrders.slice(0, 3).map(o => o.id);

      // Simulate concurrent item additions
      const addItemPromises = [
        // POS adds items to order 1
        ordersService.addItem(orderIds[0], { productId: productIds[0], quantity: 2 }),
        ordersService.addItem(orderIds[0], { productId: productIds[1], quantity: 1 }),
        // Waiter 1 adds items to order 2
        ordersService.addItem(orderIds[1], { productId: productIds[1], quantity: 3 }),
        ordersService.addItem(orderIds[1], { productId: productIds[2], quantity: 2 }),
        // Waiter 2 adds items to order 3
        ordersService.addItem(orderIds[2], { productId: productIds[0], quantity: 1 }),
        ordersService.addItem(orderIds[2], { productId: productIds[2], quantity: 1 }),
      ];

      await Promise.all(addItemPromises);

      // Verify all items were added correctly
      const order1 = await ordersService.findOne(orderIds[0]);
      const order2 = await ordersService.findOne(orderIds[1]);
      const order3 = await ordersService.findOne(orderIds[2]);

      expect(order1.items.length).toBe(2);
      expect(order2.items.length).toBe(2);
      expect(order3.items.length).toBe(2);

      // Verify totals are calculated correctly
      // Order 1: 2*10 + 1*20 = 40
      expect(Number(order1.totalAmount)).toBe(40);
      // Order 2: 3*20 + 2*30 = 120
      expect(Number(order2.totalAmount)).toBe(120);
      // Order 3: 1*10 + 1*30 = 40
      expect(Number(order3.totalAmount)).toBe(40);
    });
  });

  describe('Concurrent Kitchen Operations (Eşzamanlı Mutfak İşlemleri)', () => {
    let kitchenOrderIds: string[] = [];

    beforeAll(async () => {
      // Send all open orders to kitchen
      const openOrders = await ordersService.findAll('open');
      for (const order of openOrders) {
        if (order.items && order.items.length > 0) {
          const sentOrder = await ordersService.sendToKitchen(order.id);
          kitchenOrderIds.push(sentOrder.id);
        }
      }
    });

    /**
     * Kitchen display should show all orders in FIFO order
     * Property 5: Mutfak Sipariş Sırası
     */
    it('should display kitchen orders in FIFO order', async () => {
      const kitchenOrders = await kitchenService.getKitchenOrders();
      
      // Orders should be sorted by createdAt ASC
      for (let i = 1; i < kitchenOrders.length; i++) {
        const prevTime = new Date(kitchenOrders[i - 1].createdAt).getTime();
        const currTime = new Date(kitchenOrders[i].createdAt).getTime();
        expect(prevTime).toBeLessThanOrEqual(currTime);
      }
    });

    /**
     * Multiple kitchen staff marking orders ready concurrently
     */
    it('should handle concurrent order ready marking', async () => {
      const kitchenOrders = await kitchenService.getKitchenOrders();
      
      if (kitchenOrders.length >= 2) {
        // Two kitchen staff mark different orders ready at the same time
        const readyPromises = [
          kitchenService.markOrderReady(kitchenOrders[0].id),
          kitchenService.markOrderReady(kitchenOrders[1].id),
        ];

        const readyOrders = await Promise.all(readyPromises);

        expect(readyOrders[0].status).toBe('sent');
        expect(readyOrders[1].status).toBe('sent');
      }
    });
  });

  describe('Concurrent Payment Processing (Eşzamanlı Ödeme İşleme)', () => {
    /**
     * Multiple cashiers processing payments concurrently
     */
    it('should handle concurrent payments on different orders', async () => {
      // Get ready orders
      const allOrders = await ordersService.findAll('sent');
      
      if (allOrders.length >= 2) {
        const paymentPromises = allOrders.slice(0, 2).map(order => 
          paymentsService.create({
            orderId: order.id,
            amount: Number(order.totalAmount),
            paymentMethod: 'cash',
          })
        );

        const payments = await Promise.all(paymentPromises);

        expect(payments.length).toBe(2);
        
        // Verify orders are marked as paid
        for (const payment of payments) {
          const order = await ordersService.findOne(payment.orderId);
          expect(order.status).toBe('paid');
        }
      }
    });
  });

  describe('Data Consistency Under Concurrent Access', () => {
    /**
     * Verify table status consistency after concurrent operations
     */
    it('should maintain table status consistency', async () => {
      // Create new order on empty table
      const emptyTables = await Promise.all(
        tableIds.map(id => tablesService.findOne(id))
      ).then(tables => tables.filter(t => t.status === 'empty'));

      if (emptyTables.length > 0) {
        const tableId = emptyTables[0].id;
        
        // Create order
        const order = await ordersService.create({ tableId });
        
        // Table should be occupied
        let table = await tablesService.findOne(tableId);
        expect(table.status).toBe('occupied');

        // Add item and send to kitchen
        await ordersService.addItem(order.id, { productId: productIds[0], quantity: 1 });
        await ordersService.sendToKitchen(order.id);
        await kitchenService.markOrderReady(order.id);

        // Pay and close
        const readyOrder = await ordersService.findOne(order.id);
        await paymentsService.create({
          orderId: order.id,
          amount: Number(readyOrder.totalAmount),
          paymentMethod: 'card',
        });

        // Table should be empty again
        table = await tablesService.findOne(tableId);
        expect(table.status).toBe('empty');
      }
    });

    /**
     * Verify order total consistency after concurrent item operations
     */
    it('should maintain order total consistency under concurrent modifications', async () => {
      // Create a new order
      const emptyTables = await Promise.all(
        tableIds.map(id => tablesService.findOne(id))
      ).then(tables => tables.filter(t => t.status === 'empty'));

      if (emptyTables.length > 0) {
        const order = await ordersService.create({ tableId: emptyTables[0].id });

        // Add multiple items concurrently
        const addPromises = [
          ordersService.addItem(order.id, { productId: productIds[0], quantity: 2 }), // 20
          ordersService.addItem(order.id, { productId: productIds[1], quantity: 1 }), // 20
          ordersService.addItem(order.id, { productId: productIds[2], quantity: 1 }), // 30
        ];

        await Promise.all(addPromises);

        // Verify final total
        const finalOrder = await ordersService.findOne(order.id);
        
        // Calculate expected total from items
        const expectedTotal = finalOrder.items.reduce((sum, item) => 
          sum + (Number(item.quantity) * Number(item.unitPrice)), 0
        );

        expect(Number(finalOrder.totalAmount)).toBe(expectedTotal);
      }
    });
  });

  describe('Stress Test: Rapid Sequential Operations', () => {
    /**
     * Simulate rapid order operations from multiple devices
     */
    it('should handle rapid sequential operations', async () => {
      const emptyTables = await Promise.all(
        tableIds.map(id => tablesService.findOne(id))
      ).then(tables => tables.filter(t => t.status === 'empty'));

      if (emptyTables.length > 0) {
        const tableId = emptyTables[0].id;
        
        // Rapid order creation and modification
        const order = await ordersService.create({ tableId });
        
        // Rapid item additions
        for (let i = 0; i < 5; i++) {
          await ordersService.addItem(order.id, { 
            productId: productIds[i % productIds.length], 
            quantity: 1 
          });
        }

        const finalOrder = await ordersService.findOne(order.id);
        expect(finalOrder.items.length).toBe(5);

        // Verify total is correct
        const expectedTotal = finalOrder.items.reduce((sum, item) => 
          sum + (Number(item.quantity) * Number(item.unitPrice)), 0
        );
        expect(Number(finalOrder.totalAmount)).toBe(expectedTotal);
      }
    });
  });
});
