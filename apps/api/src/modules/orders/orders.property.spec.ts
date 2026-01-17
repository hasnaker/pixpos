import * as fc from 'fast-check';

/**
 * Property Test: Sipariş Tutarı Tutarlılığı (Order Total Consistency)
 * 
 * **Property 1: Sipariş Tutarı Tutarlılığı**
 * **Validates: Requirements 1.5, 2.1**
 * 
 * For any order, the total amount should equal the sum of (quantity × unitPrice) for all items.
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

interface Product {
  id: string;
  name: string;
  price: number;
}

// Pure functions that model the business logic

/**
 * Calculates the total price for an order item
 */
function calculateItemTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/**
 * Calculates the order total from items
 * Property 1: Order total = sum of (quantity × unitPrice) for all items
 */
function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
}

/**
 * Creates an order item from a product
 */
function createOrderItem(
  itemId: string,
  product: Product,
  quantity: number,
  notes?: string,
): OrderItem {
  const totalPrice = calculateItemTotal(quantity, product.price);
  return {
    id: itemId,
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    totalPrice,
  };
}

/**
 * Adds an item to an order and recalculates total
 */
function addItemToOrder(order: Order, item: OrderItem): Order {
  const newItems = [...order.items, item];
  return {
    ...order,
    items: newItems,
    totalAmount: calculateOrderTotal(newItems),
  };
}

/**
 * Removes an item from an order and recalculates total
 */
function removeItemFromOrder(order: Order, itemId: string): Order {
  const newItems = order.items.filter(item => item.id !== itemId);
  return {
    ...order,
    items: newItems,
    totalAmount: calculateOrderTotal(newItems),
  };
}

/**
 * Updates item quantity and recalculates totals
 */
function updateItemQuantity(order: Order, itemId: string, newQuantity: number): Order {
  const newItems = order.items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        quantity: newQuantity,
        totalPrice: calculateItemTotal(newQuantity, item.unitPrice),
      };
    }
    return item;
  });
  return {
    ...order,
    items: newItems,
    totalAmount: calculateOrderTotal(newItems),
  };
}

/**
 * Validates if order total is consistent with items
 */
function isOrderTotalConsistent(order: Order): boolean {
  const expectedTotal = calculateOrderTotal(order.items);
  // Use a small epsilon for floating point comparison
  return Math.abs(order.totalAmount - expectedTotal) < 0.01;
}

/**
 * Validates if each item's totalPrice is consistent
 */
function areItemTotalsConsistent(order: Order): boolean {
  return order.items.every(item => {
    const expectedItemTotal = calculateItemTotal(item.quantity, item.unitPrice);
    return Math.abs(item.totalPrice - expectedItemTotal) < 0.01;
  });
}

// Generators
const uuidArb = fc.uuid();
const productNameArb = fc.stringMatching(/^[A-Za-zÇçĞğİıÖöŞşÜü ]{2,30}$/);
const priceArb = fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true })
  .map(p => Math.round(p * 100) / 100); // Round to 2 decimal places
const quantityArb = fc.integer({ min: 1, max: 100 });

const productArb = fc.record({
  id: uuidArb,
  name: productNameArb,
  price: priceArb,
});

const orderItemArb = fc.tuple(uuidArb, productArb, quantityArb).map(([itemId, product, quantity]) => 
  createOrderItem(itemId, product, quantity)
);

const emptyOrderArb: fc.Arbitrary<Order> = fc.record({
  id: uuidArb,
  tableId: uuidArb,
  orderNumber: fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/),
  status: fc.constant<Order['status']>('open'),
  totalAmount: fc.constant(0),
  items: fc.constant<OrderItem[]>([]),
});

describe('Order Total Consistency Property Tests', () => {
  /**
   * Feature: mega-pos-mvp, Property 1: Sipariş Tutarı Tutarlılığı
   * 
   * For any order, the total should equal sum of (quantity × unitPrice) for all items.
   */
  it('should have total equal to sum of item totals', () => {
    fc.assert(
      fc.property(
        emptyOrderArb,
        fc.array(orderItemArb, { minLength: 1, maxLength: 10 }),
        (order, items) => {
          // Add all items to order
          let currentOrder = order;
          items.forEach(item => {
            currentOrder = addItemToOrder(currentOrder, item);
          });
          
          // Property: Order total should be consistent
          expect(isOrderTotalConsistent(currentOrder)).toBe(true);
          
          // Property: Each item total should be consistent
          expect(areItemTotalsConsistent(currentOrder)).toBe(true);
          
          // Property: Total should equal sum of item totals
          const expectedTotal = items.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0
          );
          expect(Math.abs(currentOrder.totalAmount - expectedTotal)).toBeLessThan(0.01);
        },
      ),
      { numRuns: 100 },
    );
  });


  /**
   * Feature: mega-pos-mvp, Property 1: Sipariş Tutarı Tutarlılığı
   * 
   * Adding an item should increase total by (quantity × unitPrice).
   * Validates: Requirement 2.1
   */
  it('should increase total correctly when adding item', () => {
    fc.assert(
      fc.property(
        emptyOrderArb,
        fc.array(orderItemArb, { minLength: 0, maxLength: 5 }),
        orderItemArb,
        (order, existingItems, newItem) => {
          // Build order with existing items
          let currentOrder = order;
          existingItems.forEach(item => {
            currentOrder = addItemToOrder(currentOrder, item);
          });
          
          const totalBefore = currentOrder.totalAmount;
          const expectedIncrease = newItem.quantity * newItem.unitPrice;
          
          // Add new item
          const updatedOrder = addItemToOrder(currentOrder, newItem);
          
          // Property: Total should increase by item total
          const actualIncrease = updatedOrder.totalAmount - totalBefore;
          expect(Math.abs(actualIncrease - expectedIncrease)).toBeLessThan(0.01);
          
          // Property: Order should remain consistent
          expect(isOrderTotalConsistent(updatedOrder)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 1: Sipariş Tutarı Tutarlılığı
   * 
   * Removing an item should decrease total by (quantity × unitPrice).
   * Validates: Requirement 2.1
   */
  it('should decrease total correctly when removing item', () => {
    fc.assert(
      fc.property(
        emptyOrderArb,
        fc.array(orderItemArb, { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (order, items, removeIndex) => {
          fc.pre(removeIndex < items.length);
          
          // Build order with items
          let currentOrder = order;
          items.forEach(item => {
            currentOrder = addItemToOrder(currentOrder, item);
          });
          
          const itemToRemove = currentOrder.items[removeIndex];
          const totalBefore = currentOrder.totalAmount;
          const expectedDecrease = itemToRemove.quantity * itemToRemove.unitPrice;
          
          // Remove item
          const updatedOrder = removeItemFromOrder(currentOrder, itemToRemove.id);
          
          // Property: Total should decrease by item total
          const actualDecrease = totalBefore - updatedOrder.totalAmount;
          expect(Math.abs(actualDecrease - expectedDecrease)).toBeLessThan(0.01);
          
          // Property: Order should remain consistent
          expect(isOrderTotalConsistent(updatedOrder)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 1: Sipariş Tutarı Tutarlılığı
   * 
   * Updating item quantity should update total correctly.
   * Validates: Requirement 2.1
   */
  it('should update total correctly when changing quantity', () => {
    fc.assert(
      fc.property(
        emptyOrderArb,
        fc.array(orderItemArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        quantityArb,
        (order, items, updateIndex, newQuantity) => {
          fc.pre(updateIndex < items.length);
          
          // Build order with items
          let currentOrder = order;
          items.forEach(item => {
            currentOrder = addItemToOrder(currentOrder, item);
          });
          
          const itemToUpdate = currentOrder.items[updateIndex];
          const oldItemTotal = itemToUpdate.quantity * itemToUpdate.unitPrice;
          const newItemTotal = newQuantity * itemToUpdate.unitPrice;
          const expectedChange = newItemTotal - oldItemTotal;
          const totalBefore = currentOrder.totalAmount;
          
          // Update quantity
          const updatedOrder = updateItemQuantity(currentOrder, itemToUpdate.id, newQuantity);
          
          // Property: Total should change by the difference
          const actualChange = updatedOrder.totalAmount - totalBefore;
          expect(Math.abs(actualChange - expectedChange)).toBeLessThan(0.01);
          
          // Property: Order should remain consistent
          expect(isOrderTotalConsistent(updatedOrder)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 1: Sipariş Tutarı Tutarlılığı
   * 
   * Empty order should have zero total.
   */
  it('should have zero total for empty order', () => {
    fc.assert(
      fc.property(
        emptyOrderArb,
        (order) => {
          // Property: Empty order should have zero total
          expect(order.totalAmount).toBe(0);
          expect(order.items.length).toBe(0);
          expect(isOrderTotalConsistent(order)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 1: Sipariş Tutarı Tutarlılığı
   * 
   * Order total should be non-negative.
   */
  it('should always have non-negative total', () => {
    fc.assert(
      fc.property(
        emptyOrderArb,
        fc.array(orderItemArb, { minLength: 0, maxLength: 10 }),
        (order, items) => {
          // Build order with items
          let currentOrder = order;
          items.forEach(item => {
            currentOrder = addItemToOrder(currentOrder, item);
          });
          
          // Property: Total should be non-negative
          expect(currentOrder.totalAmount).toBeGreaterThanOrEqual(0);
          
          // Property: All item totals should be non-negative
          currentOrder.items.forEach(item => {
            expect(item.totalPrice).toBeGreaterThanOrEqual(0);
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 1: Sipariş Tutarı Tutarlılığı
   * 
   * Adding and then removing the same item should restore original total.
   */
  it('should restore original total after add then remove', () => {
    fc.assert(
      fc.property(
        emptyOrderArb,
        fc.array(orderItemArb, { minLength: 0, maxLength: 5 }),
        orderItemArb,
        (order, existingItems, newItem) => {
          // Build order with existing items
          let currentOrder = order;
          existingItems.forEach(item => {
            currentOrder = addItemToOrder(currentOrder, item);
          });
          
          const totalBefore = currentOrder.totalAmount;
          
          // Add item
          const orderWithItem = addItemToOrder(currentOrder, newItem);
          
          // Remove the same item
          const orderAfterRemove = removeItemFromOrder(orderWithItem, newItem.id);
          
          // Property: Total should be restored
          expect(Math.abs(orderAfterRemove.totalAmount - totalBefore)).toBeLessThan(0.01);
          
          // Property: Order should remain consistent
          expect(isOrderTotalConsistent(orderAfterRemove)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
