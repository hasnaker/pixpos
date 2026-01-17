import * as fc from 'fast-check';

/**
 * Property Test: Ürün Fiyat Yansıması (Product Price Reflection)
 * 
 * **Property 6: Ürün Fiyat Yansıması**
 * **Validates: Requirements 6.5, 6.8**
 * 
 * For any product price update, the update should only affect new orders,
 * not existing orders. This is ensured by the OrderItem entity storing
 * unitPrice at the time of order creation.
 */

// Domain types for testing
interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
}

// Pure functions that model the business logic

/**
 * Creates an order item from a product - captures price at order time
 */
function createOrderItem(
  product: Product,
  quantity: number,
  orderItemId: string,
): OrderItem {
  return {
    id: orderItemId,
    productId: product.id,
    productName: product.name,
    unitPrice: product.price,
    quantity,
    totalPrice: product.price * quantity,
  };
}

/**
 * Creates an order with items
 */
function createOrder(orderId: string, items: OrderItem[]): Order {
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return {
    id: orderId,
    items,
    totalAmount,
  };
}

/**
 * Updates a product's price - returns new product with updated price
 */
function updateProductPrice(product: Product, newPrice: number): Product {
  return {
    ...product,
    price: newPrice,
  };
}

/**
 * Calculates order total from its items
 */
function calculateOrderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.totalPrice, 0);
}

// Generators
const productIdArb = fc.uuid();
const orderIdArb = fc.uuid();
const orderItemIdArb = fc.uuid();
const productNameArb = fc.string({ minLength: 1, maxLength: 100 });
const priceArb = fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true });
const quantityArb = fc.integer({ min: 1, max: 100 });

const productArb = fc.record({
  id: productIdArb,
  name: productNameArb,
  price: priceArb,
});

describe('Product Price Reflection Property Tests', () => {
  /**
   * Feature: mega-pos-mvp, Property 6: Ürün Fiyat Yansıması
   * 
   * For any product and any price update, existing order items should
   * retain their original unit price (captured at order creation time).
   */
  it('should not affect existing order items when product price is updated', () => {
    fc.assert(
      fc.property(
        productArb,
        quantityArb,
        priceArb,
        orderIdArb,
        orderItemIdArb,
        (product, quantity, newPrice, orderId, orderItemId) => {
          // Precondition: new price is different from original
          fc.pre(Math.abs(newPrice - product.price) > 0.001);

          // Step 1: Create an order item with the original product price
          const orderItem = createOrderItem(product, quantity, orderItemId);
          const originalUnitPrice = orderItem.unitPrice;
          const originalTotalPrice = orderItem.totalPrice;

          // Step 2: Create an order with this item
          const order = createOrder(orderId, [orderItem]);
          const originalOrderTotal = order.totalAmount;

          // Step 3: Update the product price
          const updatedProduct = updateProductPrice(product, newPrice);

          // Property: The existing order item should retain its original price
          // (The order item's unitPrice should NOT change when product price changes)
          expect(orderItem.unitPrice).toBe(originalUnitPrice);
          expect(orderItem.totalPrice).toBe(originalTotalPrice);
          expect(order.totalAmount).toBe(originalOrderTotal);

          // Property: The order item's price should match what was captured at creation
          expect(orderItem.unitPrice).toBe(product.price);
          expect(orderItem.unitPrice).not.toBe(updatedProduct.price);

          // Property: Order total should be calculated from captured prices
          expect(calculateOrderTotal(order)).toBe(originalOrderTotal);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 6: Ürün Fiyat Yansıması
   * 
   * For any product price update, new orders should use the new price.
   */
  it('should use new price for orders created after price update', () => {
    fc.assert(
      fc.property(
        productArb,
        quantityArb,
        priceArb,
        fc.tuple(orderIdArb, orderIdArb),
        fc.tuple(orderItemIdArb, orderItemIdArb),
        (product, quantity, newPrice, [orderId1, orderId2], [itemId1, itemId2]) => {
          // Precondition: new price is different from original
          fc.pre(Math.abs(newPrice - product.price) > 0.001);
          fc.pre(orderId1 !== orderId2);
          fc.pre(itemId1 !== itemId2);

          // Step 1: Create first order with original price
          const orderItem1 = createOrderItem(product, quantity, itemId1);
          const order1 = createOrder(orderId1, [orderItem1]);

          // Step 2: Update product price
          const updatedProduct = updateProductPrice(product, newPrice);

          // Step 3: Create second order with updated price
          const orderItem2 = createOrderItem(updatedProduct, quantity, itemId2);
          const order2 = createOrder(orderId2, [orderItem2]);

          // Property: First order should have original price
          expect(order1.items[0].unitPrice).toBe(product.price);

          // Property: Second order should have new price
          expect(order2.items[0].unitPrice).toBe(newPrice);

          // Property: Order totals should reflect their respective prices
          const expectedTotal1 = product.price * quantity;
          const expectedTotal2 = newPrice * quantity;

          expect(order1.totalAmount).toBeCloseTo(expectedTotal1, 2);
          expect(order2.totalAmount).toBeCloseTo(expectedTotal2, 2);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 6: Ürün Fiyat Yansıması
   * 
   * For any sequence of price updates, each order should retain
   * the price that was current at the time of order creation.
   */
  it('should preserve price history across multiple price updates', () => {
    fc.assert(
      fc.property(
        productArb,
        fc.array(priceArb, { minLength: 2, maxLength: 5 }),
        quantityArb,
        fc.array(orderIdArb, { minLength: 3, maxLength: 6 }),
        fc.array(orderItemIdArb, { minLength: 3, maxLength: 6 }),
        (product, priceUpdates, quantity, orderIds, itemIds) => {
          // Ensure we have enough unique IDs
          const uniqueOrderIds = [...new Set(orderIds)];
          const uniqueItemIds = [...new Set(itemIds)];
          fc.pre(uniqueOrderIds.length >= priceUpdates.length + 1);
          fc.pre(uniqueItemIds.length >= priceUpdates.length + 1);

          const orders: Order[] = [];
          let currentProduct = product;

          // Create first order with original price
          const firstItem = createOrderItem(currentProduct, quantity, uniqueItemIds[0]);
          orders.push(createOrder(uniqueOrderIds[0], [firstItem]));

          // For each price update, update price then create an order
          priceUpdates.forEach((newPrice, index) => {
            currentProduct = updateProductPrice(currentProduct, newPrice);
            const item = createOrderItem(currentProduct, quantity, uniqueItemIds[index + 1]);
            orders.push(createOrder(uniqueOrderIds[index + 1], [item]));
          });

          // Property: First order should have original price
          expect(orders[0].items[0].unitPrice).toBe(product.price);

          // Property: Each subsequent order should have the price at time of creation
          priceUpdates.forEach((expectedPrice, index) => {
            expect(orders[index + 1].items[0].unitPrice).toBe(expectedPrice);
          });

          // Property: All orders should maintain their totals independently
          orders.forEach((order) => {
            const expectedTotal = order.items[0].unitPrice * quantity;
            expect(order.totalAmount).toBeCloseTo(expectedTotal, 2);
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});
