import * as fc from 'fast-check';

/**
 * Property Test: Mutfak Sipariş Sırası (Kitchen Order FIFO)
 * 
 * **Property 5: Mutfak Sipariş Sırası**
 * **Validates: Requirements 4.1, 4.2**
 * 
 * For any kitchen display, orders should be sorted by creation time (FIFO - oldest first).
 */

// Domain types for testing
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

interface Order {
  id: string;
  tableId: string;
  orderNumber: string;
  status: 'open' | 'kitchen' | 'ready' | 'paid' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  createdAt: Date;
}

// Pure functions that model the business logic

/**
 * Filters orders to get only kitchen orders
 */
function getKitchenOrders(orders: Order[]): Order[] {
  return orders.filter(order => order.status === 'kitchen');
}

/**
 * Sorts orders by creation time (FIFO - oldest first)
 * Property 5: Kitchen orders should be sorted by createdAt ASC
 */
function sortOrdersByCreationTime(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/**
 * Gets kitchen orders sorted by FIFO
 */
function getKitchenOrdersFIFO(orders: Order[]): Order[] {
  const kitchenOrders = getKitchenOrders(orders);
  return sortOrdersByCreationTime(kitchenOrders);
}

/**
 * Validates if orders are sorted by creation time (FIFO)
 */
function areOrdersSortedFIFO(orders: Order[]): boolean {
  if (orders.length <= 1) return true;
  
  for (let i = 1; i < orders.length; i++) {
    if (orders[i].createdAt.getTime() < orders[i - 1].createdAt.getTime()) {
      return false;
    }
  }
  return true;
}

/**
 * Sends an order to kitchen
 */
function sendOrderToKitchen(order: Order): Order {
  if (order.status !== 'open') {
    throw new Error('Only open orders can be sent to kitchen');
  }
  return {
    ...order,
    status: 'kitchen',
    items: order.items.map(item => ({ ...item, status: 'preparing' as const })),
  };
}

/**
 * Marks an order as ready
 */
function markOrderReady(order: Order): Order {
  if (order.status !== 'kitchen') {
    throw new Error('Only kitchen orders can be marked as ready');
  }
  return {
    ...order,
    status: 'ready',
    items: order.items.map(item => ({ ...item, status: 'ready' as const })),
  };
}

// Generators
const uuidArb = fc.uuid();
const productNameArb = fc.stringMatching(/^[A-Za-z ]{2,20}$/);
const priceArb = fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true })
  .map(p => Math.round(p * 100) / 100);
const quantityArb = fc.integer({ min: 1, max: 10 });

const orderItemArb: fc.Arbitrary<OrderItem> = fc.record({
  id: uuidArb,
  productId: uuidArb,
  productName: productNameArb,
  quantity: quantityArb,
  unitPrice: priceArb,
  totalPrice: priceArb,
  status: fc.constant<OrderItem['status']>('preparing'),
});

// Generate a date within a reasonable range
const dateArb = fc.date({
  min: new Date('2026-01-01T00:00:00Z'),
  max: new Date('2026-12-31T23:59:59Z'),
});

const kitchenOrderArb: fc.Arbitrary<Order> = fc.record({
  id: uuidArb,
  tableId: uuidArb,
  orderNumber: fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
  status: fc.constant<Order['status']>('kitchen'),
  totalAmount: priceArb,
  items: fc.array(orderItemArb, { minLength: 1, maxLength: 5 }),
  createdAt: dateArb,
});

const mixedStatusOrderArb: fc.Arbitrary<Order> = fc.record({
  id: uuidArb,
  tableId: uuidArb,
  orderNumber: fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
  status: fc.constantFrom<Order['status']>('open', 'kitchen', 'ready', 'paid', 'cancelled'),
  totalAmount: priceArb,
  items: fc.array(orderItemArb, { minLength: 1, maxLength: 5 }),
  createdAt: dateArb,
});

describe('Kitchen Order FIFO Property Tests', () => {
  /**
   * Feature: mega-pos-mvp, Property 5: Mutfak Sipariş Sırası
   * 
   * For any set of kitchen orders, they should be sorted by creation time (oldest first).
   * Validates: Requirements 4.1, 4.2
   */
  it('should return kitchen orders sorted by creation time (FIFO)', () => {
    fc.assert(
      fc.property(
        fc.array(kitchenOrderArb, { minLength: 0, maxLength: 20 }),
        (orders) => {
          // Get kitchen orders sorted by FIFO
          const sortedOrders = getKitchenOrdersFIFO(orders);
          
          // Property: Orders should be sorted by createdAt ASC
          expect(areOrdersSortedFIFO(sortedOrders)).toBe(true);
          
          // Property: All returned orders should have 'kitchen' status
          sortedOrders.forEach(order => {
            expect(order.status).toBe('kitchen');
          });
          
          // Property: Number of returned orders should match input kitchen orders
          expect(sortedOrders.length).toBe(orders.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 5: Mutfak Sipariş Sırası
   * 
   * Only kitchen status orders should appear in kitchen display.
   * Validates: Requirements 4.1
   */
  it('should only include kitchen status orders', () => {
    fc.assert(
      fc.property(
        fc.array(mixedStatusOrderArb, { minLength: 0, maxLength: 20 }),
        (orders) => {
          // Get kitchen orders
          const kitchenOrders = getKitchenOrdersFIFO(orders);
          
          // Property: All returned orders should have 'kitchen' status
          kitchenOrders.forEach(order => {
            expect(order.status).toBe('kitchen');
          });
          
          // Property: Count should match number of kitchen orders in input
          const expectedCount = orders.filter(o => o.status === 'kitchen').length;
          expect(kitchenOrders.length).toBe(expectedCount);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 5: Mutfak Sipariş Sırası
   * 
   * Earlier orders should appear before later orders.
   * Validates: Requirements 4.1, 4.2
   */
  it('should maintain FIFO order - earlier orders first', () => {
    fc.assert(
      fc.property(
        fc.array(kitchenOrderArb, { minLength: 2, maxLength: 10 }),
        (orders) => {
          const sortedOrders = getKitchenOrdersFIFO(orders);
          
          // Property: For any two consecutive orders, the first should have earlier or equal createdAt
          for (let i = 1; i < sortedOrders.length; i++) {
            const prevOrder = sortedOrders[i - 1];
            const currOrder = sortedOrders[i];
            expect(prevOrder.createdAt.getTime()).toBeLessThanOrEqual(currOrder.createdAt.getTime());
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 5: Mutfak Sipariş Sırası
   * 
   * Sorting should be idempotent - sorting twice gives same result.
   * Validates: Requirements 4.1
   */
  it('should be idempotent - sorting twice gives same result', () => {
    fc.assert(
      fc.property(
        fc.array(kitchenOrderArb, { minLength: 0, maxLength: 15 }),
        (orders) => {
          const sortedOnce = getKitchenOrdersFIFO(orders);
          const sortedTwice = getKitchenOrdersFIFO(sortedOnce);
          
          // Property: Sorting twice should give same order
          expect(sortedOnce.length).toBe(sortedTwice.length);
          for (let i = 0; i < sortedOnce.length; i++) {
            expect(sortedOnce[i].id).toBe(sortedTwice[i].id);
            expect(sortedOnce[i].createdAt.getTime()).toBe(sortedTwice[i].createdAt.getTime());
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 5: Mutfak Sipariş Sırası
   * 
   * Empty input should return empty result.
   */
  it('should return empty array for empty input', () => {
    const result = getKitchenOrdersFIFO([]);
    expect(result).toEqual([]);
  });

  /**
   * Feature: mega-pos-mvp, Property 5: Mutfak Sipariş Sırası
   * 
   * Single order should be returned as-is.
   */
  it('should return single order as-is', () => {
    fc.assert(
      fc.property(
        kitchenOrderArb,
        (order) => {
          const result = getKitchenOrdersFIFO([order]);
          
          expect(result.length).toBe(1);
          expect(result[0].id).toBe(order.id);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 5: Mutfak Sipariş Sırası
   * 
   * Marking an order as ready should remove it from kitchen orders.
   * Validates: Requirements 4.7
   */
  it('should remove order from kitchen list when marked ready', () => {
    fc.assert(
      fc.property(
        fc.array(kitchenOrderArb, { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (orders, indexToMark) => {
          fc.pre(indexToMark < orders.length);
          
          const initialKitchenOrders = getKitchenOrdersFIFO(orders);
          const orderToMark = orders[indexToMark];
          
          // Mark order as ready
          const markedOrder = markOrderReady(orderToMark);
          
          // Update orders array
          const updatedOrders = orders.map(o => 
            o.id === orderToMark.id ? markedOrder : o
          );
          
          const finalKitchenOrders = getKitchenOrdersFIFO(updatedOrders);
          
          // Property: Kitchen orders count should decrease by 1
          expect(finalKitchenOrders.length).toBe(initialKitchenOrders.length - 1);
          
          // Property: Marked order should not be in kitchen list
          expect(finalKitchenOrders.find(o => o.id === orderToMark.id)).toBeUndefined();
          
          // Property: Remaining orders should still be sorted FIFO
          expect(areOrdersSortedFIFO(finalKitchenOrders)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
