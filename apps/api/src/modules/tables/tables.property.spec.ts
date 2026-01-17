import * as fc from 'fast-check';

/**
 * Property Test: Masa Durumu Tutarlılığı (Table Status Consistency)
 * 
 * **Property 2: Masa Durumu Tutarlılığı**
 * **Validates: Requirements 1.1, 1.6**
 * 
 * For any table, if the table has open orders, the status should be "occupied",
 * if it has no open orders, the status should be "empty".
 */

// Domain types for testing
type TableStatus = 'empty' | 'occupied' | 'paying';
type OrderStatus = 'open' | 'kitchen' | 'ready' | 'paid' | 'cancelled';

interface Table {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
}

interface Order {
  id: string;
  tableId: string;
  status: OrderStatus;
  totalAmount: number;
}

// Pure functions that model the business logic

/**
 * Checks if an order is considered "open" (not completed)
 */
function isOpenOrder(order: Order): boolean {
  return order.status === 'open' || order.status === 'kitchen' || order.status === 'ready';
}

/**
 * Checks if a table has any open orders
 */
function hasOpenOrders(table: Table, orders: Order[]): boolean {
  return orders.some(order => order.tableId === table.id && isOpenOrder(order));
}

/**
 * Determines the expected status for a table based on its orders
 * Property 2: If table has open orders → occupied, else → empty
 */
function getExpectedTableStatus(table: Table, orders: Order[]): TableStatus {
  // Special case: if table is in paying state, it should stay paying
  // (payment in progress is a valid intermediate state)
  if (table.status === 'paying') {
    return 'paying';
  }
  
  return hasOpenOrders(table, orders) ? 'occupied' : 'empty';
}

/**
 * Validates if a table's status is consistent with its orders
 */
function isTableStatusConsistent(table: Table, orders: Order[]): boolean {
  const tableOrders = orders.filter(o => o.tableId === table.id);
  const hasOpen = tableOrders.some(isOpenOrder);
  
  // Paying is a valid intermediate state during payment process
  if (table.status === 'paying') {
    return hasOpen; // Should have orders if paying
  }
  
  if (hasOpen) {
    return table.status === 'occupied';
  } else {
    return table.status === 'empty';
  }
}

/**
 * Synchronizes table status based on its orders
 */
function syncTableStatus(table: Table, orders: Order[]): Table {
  // Don't change status if in paying state
  if (table.status === 'paying') {
    return table;
  }
  
  const expectedStatus = getExpectedTableStatus(table, orders);
  return {
    ...table,
    status: expectedStatus,
  };
}

/**
 * Creates a new order on a table
 */
function createOrderOnTable(
  table: Table,
  orderId: string,
  totalAmount: number,
): { table: Table; order: Order } {
  const order: Order = {
    id: orderId,
    tableId: table.id,
    status: 'open',
    totalAmount,
  };
  
  // When creating an order, table should become occupied
  const updatedTable: Table = {
    ...table,
    status: 'occupied',
  };
  
  return { table: updatedTable, order };
}

/**
 * Closes an order (marks as paid)
 */
function closeOrder(order: Order): Order {
  return {
    ...order,
    status: 'paid',
  };
}

/**
 * Closes a table after payment
 */
function closeTable(table: Table): Table {
  return {
    ...table,
    status: 'empty',
  };
}

// Generators
const tableIdArb = fc.uuid();
const orderIdArb = fc.uuid();
const tableNameArb = fc.stringMatching(/^Masa [1-9][0-9]?$/);
const capacityArb = fc.integer({ min: 1, max: 20 });
const totalAmountArb = fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true });

const tableStatusArb = fc.constantFrom<TableStatus>('empty', 'occupied', 'paying');
const orderStatusArb = fc.constantFrom<OrderStatus>('open', 'kitchen', 'ready', 'paid', 'cancelled');
const openOrderStatusArb = fc.constantFrom<OrderStatus>('open', 'kitchen', 'ready');
const closedOrderStatusArb = fc.constantFrom<OrderStatus>('paid', 'cancelled');

const tableArb = fc.record({
  id: tableIdArb,
  name: tableNameArb,
  status: tableStatusArb,
  capacity: capacityArb,
});

const emptyTableArb = fc.record({
  id: tableIdArb,
  name: tableNameArb,
  status: fc.constant<TableStatus>('empty'),
  capacity: capacityArb,
});

describe('Table Status Consistency Property Tests', () => {
  /**
   * Feature: mega-pos-mvp, Property 2: Masa Durumu Tutarlılığı
   * 
   * For any table with open orders, the status should be "occupied".
   */
  it('should have occupied status when table has open orders', () => {
    fc.assert(
      fc.property(
        emptyTableArb,
        orderIdArb,
        totalAmountArb,
        (table, orderId, totalAmount) => {
          // Create an order on the table
          const { table: updatedTable, order } = createOrderOnTable(table, orderId, totalAmount);
          
          // Property: Table with open order should be occupied
          expect(updatedTable.status).toBe('occupied');
          expect(order.status).toBe('open');
          
          // Property: Status should be consistent
          expect(isTableStatusConsistent(updatedTable, [order])).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 2: Masa Durumu Tutarlılığı
   * 
   * For any table with no open orders, the status should be "empty".
   */
  it('should have empty status when table has no open orders', () => {
    fc.assert(
      fc.property(
        emptyTableArb,
        fc.array(
          fc.record({
            id: orderIdArb,
            tableId: tableIdArb, // Different table
            status: closedOrderStatusArb,
            totalAmount: totalAmountArb,
          }),
          { minLength: 0, maxLength: 5 },
        ),
        (table, otherOrders) => {
          // Property: Table with no orders should be empty
          expect(isTableStatusConsistent(table, otherOrders)).toBe(true);
          
          // Property: Sync should keep it empty
          const synced = syncTableStatus(table, otherOrders);
          expect(synced.status).toBe('empty');
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 2: Masa Durumu Tutarlılığı
   * 
   * After closing all orders on a table, the table should become empty.
   * Validates: Requirement 1.6 (ödeme sonrası masa kapatma)
   */
  it('should become empty after all orders are closed', () => {
    fc.assert(
      fc.property(
        emptyTableArb,
        fc.array(orderIdArb, { minLength: 1, maxLength: 5 }),
        fc.array(totalAmountArb, { minLength: 1, maxLength: 5 }),
        (table, orderIds, amounts) => {
          const uniqueOrderIds = [...new Set(orderIds)];
          fc.pre(uniqueOrderIds.length >= 1);
          
          // Create orders on the table
          let currentTable = table;
          const orders: Order[] = [];
          
          uniqueOrderIds.forEach((orderId, index) => {
            const amount = amounts[index % amounts.length];
            const result = createOrderOnTable(currentTable, orderId, amount);
            currentTable = result.table;
            orders.push(result.order);
          });
          
          // Property: Table should be occupied with open orders
          expect(currentTable.status).toBe('occupied');
          expect(isTableStatusConsistent(currentTable, orders)).toBe(true);
          
          // Close all orders
          const closedOrders = orders.map(closeOrder);
          
          // Sync table status
          const syncedTable = syncTableStatus(currentTable, closedOrders);
          
          // Property: Table should be empty after all orders closed
          expect(syncedTable.status).toBe('empty');
          expect(isTableStatusConsistent(syncedTable, closedOrders)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 2: Masa Durumu Tutarlılığı
   * 
   * Sync operation should always result in consistent status.
   */
  it('should always produce consistent status after sync', () => {
    fc.assert(
      fc.property(
        tableArb,
        fc.array(
          fc.record({
            id: orderIdArb,
            tableId: tableIdArb,
            status: orderStatusArb,
            totalAmount: totalAmountArb,
          }),
          { minLength: 0, maxLength: 10 },
        ),
        (table, allOrders) => {
          // Make some orders belong to this table
          const tableOrders = allOrders.map((order, index) => ({
            ...order,
            tableId: index % 2 === 0 ? table.id : order.tableId,
          }));
          
          // Skip paying tables (special intermediate state)
          fc.pre(table.status !== 'paying');
          
          // Sync the table
          const syncedTable = syncTableStatus(table, tableOrders);
          
          // Property: After sync, status should be consistent
          expect(isTableStatusConsistent(syncedTable, tableOrders)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 2: Masa Durumu Tutarlılığı
   * 
   * Table status should remain occupied as long as at least one order is open.
   */
  it('should remain occupied while any order is still open', () => {
    fc.assert(
      fc.property(
        emptyTableArb,
        fc.array(orderIdArb, { minLength: 2, maxLength: 5 }),
        fc.array(totalAmountArb, { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 0, max: 3 }),
        (table, orderIds, amounts, closeCount) => {
          const uniqueOrderIds = [...new Set(orderIds)];
          fc.pre(uniqueOrderIds.length >= 2);
          
          // Create multiple orders
          let currentTable = table;
          const orders: Order[] = [];
          
          uniqueOrderIds.forEach((orderId, index) => {
            const amount = amounts[index % amounts.length];
            const result = createOrderOnTable(currentTable, orderId, amount);
            currentTable = result.table;
            orders.push(result.order);
          });
          
          // Close some orders but not all
          const ordersToClose = Math.min(closeCount, orders.length - 1);
          const updatedOrders = orders.map((order, index) => 
            index < ordersToClose ? closeOrder(order) : order
          );
          
          // Sync table
          const syncedTable = syncTableStatus(currentTable, updatedOrders);
          
          // Property: Table should still be occupied if any order is open
          const hasAnyOpen = updatedOrders.some(isOpenOrder);
          if (hasAnyOpen) {
            expect(syncedTable.status).toBe('occupied');
          }
          
          // Property: Status should be consistent
          expect(isTableStatusConsistent(syncedTable, updatedOrders)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 2: Masa Durumu Tutarlılığı
   * 
   * Order status transitions should maintain table consistency.
   * Tests: open → kitchen → ready → paid flow
   */
  it('should maintain consistency through order status transitions', () => {
    fc.assert(
      fc.property(
        emptyTableArb,
        orderIdArb,
        totalAmountArb,
        (table, orderId, totalAmount) => {
          // Create order (open)
          const { table: tableWithOrder, order } = createOrderOnTable(table, orderId, totalAmount);
          expect(tableWithOrder.status).toBe('occupied');
          expect(isTableStatusConsistent(tableWithOrder, [order])).toBe(true);
          
          // Transition to kitchen
          const kitchenOrder: Order = { ...order, status: 'kitchen' };
          expect(isTableStatusConsistent(tableWithOrder, [kitchenOrder])).toBe(true);
          
          // Transition to ready
          const readyOrder: Order = { ...order, status: 'ready' };
          expect(isTableStatusConsistent(tableWithOrder, [readyOrder])).toBe(true);
          
          // Transition to paid
          const paidOrder: Order = { ...order, status: 'paid' };
          const syncedAfterPaid = syncTableStatus(tableWithOrder, [paidOrder]);
          expect(syncedAfterPaid.status).toBe('empty');
          expect(isTableStatusConsistent(syncedAfterPaid, [paidOrder])).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
