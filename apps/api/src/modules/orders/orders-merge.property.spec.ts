import * as fc from 'fast-check';

/**
 * Property Test: Masa Birleştirme Tutarlılığı (Order Merge Consistency)
 * 
 * **Property 4: Masa Birleştirme Tutarlılığı**
 * **Validates: Requirements 2.7, 2.8**
 * 
 * For any order merge operation, the merged order's total should equal
 * the sum of all original orders' totals.
 */

// Domain types for testing
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  tableId: string;
  orderNumber: string;
  status: 'open' | 'kitchen' | 'ready' | 'paid' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  notes: string | null;
}

// Pure functions that model the business logic

/**
 * Calculates the order total from items
 */
function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
}

/**
 * Creates an order item
 */
function createOrderItem(
  itemId: string,
  productId: string,
  productName: string,
  quantity: number,
  unitPrice: number,
): OrderItem {
  return {
    id: itemId,
    productId,
    productName,
    quantity,
    unitPrice,
    totalPrice: quantity * unitPrice,
  };
}

/**
 * Creates an order with items
 */
function createOrder(
  orderId: string,
  tableId: string,
  orderNumber: string,
  items: OrderItem[],
  notes: string | null = null,
): Order {
  return {
    id: orderId,
    tableId,
    orderNumber,
    status: 'open',
    items,
    totalAmount: calculateOrderTotal(items),
    notes,
  };
}

/**
 * Merges multiple orders into one
 * Property 4: Merged order total = sum of all original orders' totals
 */
function mergeOrders(
  orders: Order[],
  targetTableId: string,
  newOrderId: string,
  newOrderNumber: string,
): { mergedOrder: Order; cancelledOrders: Order[] } | { error: string } {
  if (orders.length < 2) {
    return { error: 'Need at least 2 orders to merge' };
  }
  
  // Validate all orders are open
  for (const order of orders) {
    if (order.status !== 'open') {
      return { error: `Order ${order.orderNumber} is not open` };
    }
  }
  
  // Collect all items from all orders
  const allItems: OrderItem[] = [];
  orders.forEach(order => {
    allItems.push(...order.items);
  });
  
  // Combine notes
  const combinedNotes = orders
    .map(o => o.notes)
    .filter(Boolean)
    .join(' | ') || null;
  
  // Create merged order
  const mergedOrder: Order = {
    id: newOrderId,
    tableId: targetTableId,
    orderNumber: newOrderNumber,
    status: 'open',
    items: allItems,
    totalAmount: calculateOrderTotal(allItems),
    notes: combinedNotes,
  };
  
  // Mark original orders as cancelled
  const cancelledOrders = orders.map(order => ({
    ...order,
    status: 'cancelled' as const,
  }));
  
  return { mergedOrder, cancelledOrders };
}

/**
 * Validates if merge operation preserved total
 */
function isMergeTotalPreserved(
  originalOrders: Order[],
  mergedOrder: Order,
): boolean {
  const originalTotal = originalOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  return Math.abs(mergedOrder.totalAmount - originalTotal) < 0.01;
}

// Generators
const uuidArb = fc.uuid();
const productNameArb = fc.stringMatching(/^[A-Za-z ]{2,15}$/);
const priceArb = fc.float({ min: Math.fround(0.01), max: Math.fround(200), noNaN: true })
  .map(p => Math.round(p * 100) / 100);
const quantityArb = fc.integer({ min: 1, max: 20 });
const notesArb = fc.option(fc.stringMatching(/^[A-Za-z0-9 ]{0,50}$/), { nil: null });

const orderItemArb = fc.tuple(
  uuidArb,
  uuidArb,
  productNameArb,
  quantityArb,
  priceArb,
).map(([itemId, productId, name, qty, price]) => 
  createOrderItem(itemId, productId, name, qty, price)
);

const orderArb = fc.tuple(
  uuidArb,
  uuidArb,
  fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
  fc.array(orderItemArb, { minLength: 1, maxLength: 5 }),
  notesArb,
).map(([orderId, tableId, orderNumber, items, notes]) => {
  // Ensure unique item IDs within order
  const uniqueItems = items.map((item, index) => ({
    ...item,
    id: `${orderId}-item-${index}`,
  }));
  return createOrder(orderId, tableId, orderNumber, uniqueItems, notes);
});

describe('Order Merge Consistency Property Tests', () => {
  /**
   * Feature: mega-pos-mvp, Property 4: Masa Birleştirme Tutarlılığı
   * 
   * For any valid merge, the merged order total equals sum of original totals.
   */
  it('should preserve total amount when merging orders', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 2, maxLength: 5 }),
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orders, targetTableId, newOrderId, newOrderNumber) => {
          // Ensure unique order IDs
          const uniqueOrders = orders.map((order, index) => ({
            ...order,
            id: `order-${index}`,
          }));
          
          const originalTotalSum = uniqueOrders.reduce((sum, o) => sum + o.totalAmount, 0);
          
          const result = mergeOrders(uniqueOrders, targetTableId, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property 4: Merged order total equals sum of original totals
            expect(isMergeTotalPreserved(uniqueOrders, result.mergedOrder)).toBe(true);
            
            // Verify exact total
            expect(Math.abs(result.mergedOrder.totalAmount - originalTotalSum)).toBeLessThan(0.01);
          }
        },
      ),
      { numRuns: 100 },
    );
  });


  /**
   * Feature: mega-pos-mvp, Property 4: Masa Birleştirme Tutarlılığı
   * 
   * All items from all orders should be in the merged order.
   */
  it('should include all items from all orders in merged order', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 2, maxLength: 4 }),
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orders, targetTableId, newOrderId, newOrderNumber) => {
          // Ensure unique order IDs
          const uniqueOrders = orders.map((order, index) => ({
            ...order,
            id: `order-${index}`,
          }));
          
          const totalItemCount = uniqueOrders.reduce((sum, o) => sum + o.items.length, 0);
          
          const result = mergeOrders(uniqueOrders, targetTableId, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property: Merged order should have all items
            expect(result.mergedOrder.items.length).toBe(totalItemCount);
            
            // Property: All original item IDs should be in merged order
            const mergedItemIds = new Set(result.mergedOrder.items.map(i => i.id));
            uniqueOrders.forEach(order => {
              order.items.forEach(item => {
                expect(mergedItemIds.has(item.id)).toBe(true);
              });
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 4: Masa Birleştirme Tutarlılığı
   * 
   * Original orders should be marked as cancelled after merge.
   */
  it('should cancel original orders after merge', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 2, maxLength: 4 }),
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orders, targetTableId, newOrderId, newOrderNumber) => {
          // Ensure unique order IDs
          const uniqueOrders = orders.map((order, index) => ({
            ...order,
            id: `order-${index}`,
          }));
          
          const result = mergeOrders(uniqueOrders, targetTableId, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property: All original orders should be cancelled
            expect(result.cancelledOrders.length).toBe(uniqueOrders.length);
            result.cancelledOrders.forEach(order => {
              expect(order.status).toBe('cancelled');
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 4: Masa Birleştirme Tutarlılığı
   * 
   * Cannot merge less than 2 orders.
   */
  it('should reject merge with less than 2 orders', () => {
    fc.assert(
      fc.property(
        orderArb,
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (order, targetTableId, newOrderId, newOrderNumber) => {
          // Try to merge single order
          const result = mergeOrders([order], targetTableId, newOrderId, newOrderNumber);
          
          // Property: Should return error
          expect('error' in result).toBe(true);
          if ('error' in result) {
            expect(result.error).toBe('Need at least 2 orders to merge');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 4: Masa Birleştirme Tutarlılığı
   * 
   * Item details should be preserved after merge.
   */
  it('should preserve item details after merge', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 2, maxLength: 3 }),
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orders, targetTableId, newOrderId, newOrderNumber) => {
          // Ensure unique order IDs
          const uniqueOrders = orders.map((order, index) => ({
            ...order,
            id: `order-${index}`,
          }));
          
          // Create a map of original items
          const originalItemsMap = new Map<string, OrderItem>();
          uniqueOrders.forEach(order => {
            order.items.forEach(item => {
              originalItemsMap.set(item.id, item);
            });
          });
          
          const result = mergeOrders(uniqueOrders, targetTableId, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property: Each item in merged order should match original
            result.mergedOrder.items.forEach(mergedItem => {
              const originalItem = originalItemsMap.get(mergedItem.id);
              expect(originalItem).toBeDefined();
              if (originalItem) {
                expect(mergedItem.productId).toBe(originalItem.productId);
                expect(mergedItem.productName).toBe(originalItem.productName);
                expect(mergedItem.quantity).toBe(originalItem.quantity);
                expect(mergedItem.unitPrice).toBe(originalItem.unitPrice);
                expect(mergedItem.totalPrice).toBe(originalItem.totalPrice);
              }
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 4: Masa Birleştirme Tutarlılığı
   * 
   * Merged order should be assigned to target table.
   */
  it('should assign merged order to target table', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 2, maxLength: 4 }),
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orders, targetTableId, newOrderId, newOrderNumber) => {
          // Ensure unique order IDs
          const uniqueOrders = orders.map((order, index) => ({
            ...order,
            id: `order-${index}`,
          }));
          
          const result = mergeOrders(uniqueOrders, targetTableId, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property: Merged order should be on target table
            expect(result.mergedOrder.tableId).toBe(targetTableId);
            expect(result.mergedOrder.id).toBe(newOrderId);
            expect(result.mergedOrder.orderNumber).toBe(newOrderNumber);
            expect(result.mergedOrder.status).toBe('open');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 4: Masa Birleştirme Tutarlılığı
   * 
   * Notes from all orders should be combined.
   */
  it('should combine notes from all orders', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 2, maxLength: 3 }),
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orders, targetTableId, newOrderId, newOrderNumber) => {
          // Ensure unique order IDs and add notes
          const uniqueOrders = orders.map((order, index) => ({
            ...order,
            id: `order-${index}`,
            notes: `Note ${index}`,
          }));
          
          const result = mergeOrders(uniqueOrders, targetTableId, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property: All notes should be in combined notes
            uniqueOrders.forEach(order => {
              if (order.notes) {
                expect(result.mergedOrder.notes).toContain(order.notes);
              }
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
