import * as fc from 'fast-check';

/**
 * Property Test: Sipariş Bölme Tutarlılığı (Order Split Consistency)
 * 
 * **Property 3: Sipariş Bölme Tutarlılığı**
 * **Validates: Requirements 2.3, 2.4**
 * 
 * For any order split operation, the sum of the split orders' totals
 * should equal the original order's total.
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
 * Splits an order by moving specified items to a new order
 * Property 3: Sum of split orders = original order total
 */
function splitOrder(
  order: Order,
  itemIdsToMove: string[],
  newOrderId: string,
  newOrderNumber: string,
): { originalOrder: Order; newOrder: Order } | { error: string } {
  // Validate items exist
  const itemsToMove = order.items.filter(item => itemIdsToMove.includes(item.id));
  
  if (itemsToMove.length !== itemIdsToMove.length) {
    return { error: 'Some items not found in the order' };
  }
  
  if (itemsToMove.length === 0) {
    return { error: 'No items to move' };
  }
  
  if (itemsToMove.length === order.items.length) {
    return { error: 'Cannot move all items to new order' };
  }
  
  // Items remaining in original order
  const remainingItems = order.items.filter(item => !itemIdsToMove.includes(item.id));
  
  // Create updated original order
  const originalOrder: Order = {
    ...order,
    items: remainingItems,
    totalAmount: calculateOrderTotal(remainingItems),
  };
  
  // Create new order with moved items
  const newOrder: Order = {
    id: newOrderId,
    tableId: order.tableId,
    orderNumber: newOrderNumber,
    status: 'open',
    items: itemsToMove,
    totalAmount: calculateOrderTotal(itemsToMove),
  };
  
  return { originalOrder, newOrder };
}

/**
 * Validates if split operation preserved total
 */
function isSplitTotalPreserved(
  originalTotal: number,
  splitResult: { originalOrder: Order; newOrder: Order },
): boolean {
  const combinedTotal = splitResult.originalOrder.totalAmount + splitResult.newOrder.totalAmount;
  return Math.abs(combinedTotal - originalTotal) < 0.01;
}

// Generators
const uuidArb = fc.uuid();
const productNameArb = fc.stringMatching(/^[A-Za-z ]{2,20}$/);
const priceArb = fc.float({ min: Math.fround(0.01), max: Math.fround(500), noNaN: true })
  .map(p => Math.round(p * 100) / 100);
const quantityArb = fc.integer({ min: 1, max: 50 });

const orderItemArb = fc.tuple(
  uuidArb,
  uuidArb,
  productNameArb,
  quantityArb,
  priceArb,
).map(([itemId, productId, name, qty, price]) => 
  createOrderItem(itemId, productId, name, qty, price)
);

function createOrderWithItems(
  orderId: string,
  tableId: string,
  orderNumber: string,
  items: OrderItem[],
): Order {
  return {
    id: orderId,
    tableId,
    orderNumber,
    status: 'open',
    items,
    totalAmount: calculateOrderTotal(items),
  };
}

describe('Order Split Consistency Property Tests', () => {
  /**
   * Feature: mega-pos-mvp, Property 3: Sipariş Bölme Tutarlılığı
   * 
   * For any valid split, the sum of split orders equals original total.
   */
  it('should preserve total amount when splitting order', () => {
    fc.assert(
      fc.property(
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        fc.array(orderItemArb, { minLength: 2, maxLength: 10 }),
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        fc.integer({ min: 1, max: 9 }),
        (orderId, tableId, orderNumber, items, newOrderId, newOrderNumber, splitCount) => {
          // Ensure unique item IDs
          const uniqueItems = items.map((item, index) => ({
            ...item,
            id: `${item.id}-${index}`,
          }));
          
          fc.pre(uniqueItems.length >= 2);
          
          const order = createOrderWithItems(orderId, tableId, orderNumber, uniqueItems);
          const originalTotal = order.totalAmount;
          
          // Select items to move (at least 1, but not all)
          const itemsToMoveCount = Math.min(splitCount, uniqueItems.length - 1);
          fc.pre(itemsToMoveCount >= 1);
          
          const itemIdsToMove = uniqueItems.slice(0, itemsToMoveCount).map(i => i.id);
          
          const result = splitOrder(order, itemIdsToMove, newOrderId, newOrderNumber);
          
          // Should not be an error
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property 3: Sum of split orders equals original total
            expect(isSplitTotalPreserved(originalTotal, result)).toBe(true);
            
            // Additional checks
            expect(result.originalOrder.items.length).toBe(uniqueItems.length - itemsToMoveCount);
            expect(result.newOrder.items.length).toBe(itemsToMoveCount);
          }
        },
      ),
      { numRuns: 100 },
    );
  });


  /**
   * Feature: mega-pos-mvp, Property 3: Sipariş Bölme Tutarlılığı
   * 
   * Items should be correctly distributed between orders after split.
   */
  it('should correctly distribute items between orders', () => {
    fc.assert(
      fc.property(
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        fc.array(orderItemArb, { minLength: 3, maxLength: 8 }),
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orderId, tableId, orderNumber, items, newOrderId, newOrderNumber) => {
          // Ensure unique item IDs
          const uniqueItems = items.map((item, index) => ({
            ...item,
            id: `${item.id}-${index}`,
          }));
          
          fc.pre(uniqueItems.length >= 3);
          
          const order = createOrderWithItems(orderId, tableId, orderNumber, uniqueItems);
          
          // Move first half of items
          const halfCount = Math.floor(uniqueItems.length / 2);
          const itemIdsToMove = uniqueItems.slice(0, halfCount).map(i => i.id);
          
          const result = splitOrder(order, itemIdsToMove, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property: All original items should be in one of the two orders
            const allItemIds = [
              ...result.originalOrder.items.map(i => i.id),
              ...result.newOrder.items.map(i => i.id),
            ];
            
            uniqueItems.forEach(item => {
              expect(allItemIds).toContain(item.id);
            });
            
            // Property: No item should be in both orders
            const originalIds = new Set(result.originalOrder.items.map(i => i.id));
            const newIds = new Set(result.newOrder.items.map(i => i.id));
            
            originalIds.forEach(id => {
              expect(newIds.has(id)).toBe(false);
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 3: Sipariş Bölme Tutarlılığı
   * 
   * Cannot split if trying to move all items.
   */
  it('should reject split when trying to move all items', () => {
    fc.assert(
      fc.property(
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        fc.array(orderItemArb, { minLength: 1, maxLength: 5 }),
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orderId, tableId, orderNumber, items, newOrderId, newOrderNumber) => {
          // Ensure unique item IDs
          const uniqueItems = items.map((item, index) => ({
            ...item,
            id: `${item.id}-${index}`,
          }));
          
          const order = createOrderWithItems(orderId, tableId, orderNumber, uniqueItems);
          
          // Try to move ALL items
          const allItemIds = uniqueItems.map(i => i.id);
          
          const result = splitOrder(order, allItemIds, newOrderId, newOrderNumber);
          
          // Property: Should return error
          expect('error' in result).toBe(true);
          if ('error' in result) {
            expect(result.error).toBe('Cannot move all items to new order');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 3: Sipariş Bölme Tutarlılığı
   * 
   * Both orders should have correct individual totals after split.
   */
  it('should have correct individual totals after split', () => {
    fc.assert(
      fc.property(
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        fc.array(orderItemArb, { minLength: 2, maxLength: 6 }),
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orderId, tableId, orderNumber, items, newOrderId, newOrderNumber) => {
          // Ensure unique item IDs
          const uniqueItems = items.map((item, index) => ({
            ...item,
            id: `${item.id}-${index}`,
          }));
          
          fc.pre(uniqueItems.length >= 2);
          
          const order = createOrderWithItems(orderId, tableId, orderNumber, uniqueItems);
          
          // Move first item only
          const itemIdsToMove = [uniqueItems[0].id];
          
          const result = splitOrder(order, itemIdsToMove, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Property: Original order total should equal sum of remaining items
            const expectedOriginalTotal = calculateOrderTotal(result.originalOrder.items);
            expect(Math.abs(result.originalOrder.totalAmount - expectedOriginalTotal)).toBeLessThan(0.01);
            
            // Property: New order total should equal sum of moved items
            const expectedNewTotal = calculateOrderTotal(result.newOrder.items);
            expect(Math.abs(result.newOrder.totalAmount - expectedNewTotal)).toBeLessThan(0.01);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 3: Sipariş Bölme Tutarlılığı
   * 
   * Split should preserve item details (quantity, price, etc.)
   */
  it('should preserve item details after split', () => {
    fc.assert(
      fc.property(
        uuidArb,
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        fc.array(orderItemArb, { minLength: 2, maxLength: 5 }),
        uuidArb,
        fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
        (orderId, tableId, orderNumber, items, newOrderId, newOrderNumber) => {
          // Ensure unique item IDs
          const uniqueItems = items.map((item, index) => ({
            ...item,
            id: `${item.id}-${index}`,
          }));
          
          fc.pre(uniqueItems.length >= 2);
          
          const order = createOrderWithItems(orderId, tableId, orderNumber, uniqueItems);
          
          // Move first item
          const itemToMove = uniqueItems[0];
          const itemIdsToMove = [itemToMove.id];
          
          const result = splitOrder(order, itemIdsToMove, newOrderId, newOrderNumber);
          
          expect('error' in result).toBe(false);
          
          if (!('error' in result)) {
            // Find the moved item in new order
            const movedItem = result.newOrder.items.find(i => i.id === itemToMove.id);
            
            expect(movedItem).toBeDefined();
            if (movedItem) {
              // Property: Item details should be preserved
              expect(movedItem.productId).toBe(itemToMove.productId);
              expect(movedItem.productName).toBe(itemToMove.productName);
              expect(movedItem.quantity).toBe(itemToMove.quantity);
              expect(movedItem.unitPrice).toBe(itemToMove.unitPrice);
              expect(movedItem.totalPrice).toBe(itemToMove.totalPrice);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
