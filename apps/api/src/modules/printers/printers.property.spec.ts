import * as fc from 'fast-check';
import { OrderTicketService, OrderTicketData } from './order-ticket.service';
import { PrintService } from './print.service';

/**
 * Property Test: Yazıcı Sipariş Kağıdı İçeriği (Kitchen Ticket Content)
 * 
 * **Property 7: Yazıcı Sipariş Kağıdı İçeriği**
 * **Validates: Requirements 4.3, 4.4, 4.5, 4.6**
 * 
 * For any kitchen ticket, it must contain:
 * - Table number (4.3)
 * - Order time (4.4)
 * - Product list with quantities (4.5)
 * - Order notes (4.6)
 */

// Create service instances for testing
const printService = new PrintService();
const orderTicketService = new OrderTicketService(printService);

// Generators
const tableNameArb = fc.stringMatching(/^Masa [0-9]{1,3}$/);
const orderNumberArb = fc.stringMatching(/^ORD-[0-9]{8}-[0-9]{6}$/);
const productNameArb = fc.stringMatching(/^[A-Za-z ]{2,20}$/);
const quantityArb = fc.integer({ min: 1, max: 99 });
const notesArb = fc.option(fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/), { nil: null });

// Generate a date within a reasonable range
const dateArb = fc.date({
  min: new Date('2026-01-01T00:00:00Z'),
  max: new Date('2026-12-31T23:59:59Z'),
});

// Order item generator
const orderItemArb = fc.record({
  productName: productNameArb,
  quantity: quantityArb,
  notes: notesArb,
});

// Order ticket data generator
const orderTicketDataArb: fc.Arbitrary<OrderTicketData> = fc.record({
  tableName: tableNameArb,
  orderNumber: orderNumberArb,
  dailyOrderNumber: fc.integer({ min: 1, max: 999 }),
  pendingOrderCount: fc.integer({ min: 0, max: 50 }),
  orderTime: dateArb,
  items: fc.array(orderItemArb, { minLength: 1, maxLength: 10 }),
  orderNotes: notesArb,
});

describe('Kitchen Ticket Content Property Tests', () => {
  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * For any kitchen ticket, it must contain the table name.
   * Validates: Requirements 4.3
   */
  it('should include table name in kitchen ticket', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb,
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const ticketText = ticketBuffer.toString('utf8');
          
          // Property: Ticket must contain the table name
          expect(ticketText).toContain(data.tableName);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * For any kitchen ticket, it must contain the order time.
   * Validates: Requirements 4.4
   */
  it('should include order time in kitchen ticket', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb,
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const ticketText = ticketBuffer.toString('utf8');
          
          // Format time as HH:MM
          const formattedTime = orderTicketService.formatTime(data.orderTime);
          
          // Property: Ticket must contain the formatted time
          expect(ticketText).toContain(formattedTime);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * For any kitchen ticket, it must contain all product names.
   * Validates: Requirements 4.5
   */
  it('should include all product names in kitchen ticket', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb,
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const ticketText = ticketBuffer.toString('utf8');
          
          // Property: Ticket must contain all product names
          for (const item of data.items) {
            expect(ticketText).toContain(item.productName);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * For any kitchen ticket, it must contain all item quantities.
   * Validates: Requirements 4.5
   */
  it('should include all item quantities in kitchen ticket', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb,
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const ticketText = ticketBuffer.toString('utf8');
          
          // Property: Ticket must contain all quantities
          for (const item of data.items) {
            // Check for quantity format "Nx" where N is the quantity
            expect(ticketText).toContain(`${item.quantity}x`);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * For any kitchen ticket with order notes, it must contain the notes.
   * Validates: Requirements 4.6
   */
  it('should include order notes in kitchen ticket when present', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb.filter(data => data.orderNotes !== null && data.orderNotes !== undefined),
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const ticketText = ticketBuffer.toString('utf8');
          
          // Property: Ticket must contain the order notes
          expect(ticketText).toContain(data.orderNotes!);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * For any kitchen ticket with item notes, it must contain the item notes.
   * Validates: Requirements 4.6
   */
  it('should include item notes in kitchen ticket when present', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb.filter(data => data.items.some(item => item.notes !== null && item.notes !== undefined)),
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const ticketText = ticketBuffer.toString('utf8');
          
          // Property: Ticket must contain all item notes that are present
          for (const item of data.items) {
            if (item.notes) {
              expect(ticketText).toContain(item.notes);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * Combined validation: All required fields must be present.
   * Validates: Requirements 4.3, 4.4, 4.5, 4.6
   */
  it('should include all required fields in kitchen ticket', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb,
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const validation = orderTicketService.validateKitchenTicketContent(ticketBuffer, data);
          
          // Property: All required fields must be present
          expect(validation.hasTableName).toBe(true);
          expect(validation.hasOrderTime).toBe(true);
          expect(validation.hasAllItems).toBe(true);
          expect(validation.hasItemQuantities).toBe(true);
          expect(validation.hasOrderNotes).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * Kitchen ticket should include order number.
   */
  it('should include order number in kitchen ticket', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb,
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const ticketText = ticketBuffer.toString('utf8');
          
          // Property: Ticket must contain the order number
          expect(ticketText).toContain(data.orderNumber);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * Kitchen ticket should be non-empty for any valid input.
   */
  it('should produce non-empty ticket for any valid input', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb,
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          
          // Property: Ticket buffer should not be empty
          expect(ticketBuffer.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: mega-pos-mvp, Property 7: Yazıcı Sipariş Kağıdı İçeriği
   * 
   * Kitchen ticket should contain "YENI SIPARIS" header.
   */
  it('should include kitchen order header', () => {
    fc.assert(
      fc.property(
        orderTicketDataArb,
        (data) => {
          const ticketBuffer = orderTicketService.formatKitchenTicket(data);
          const ticketText = ticketBuffer.toString('utf8');
          
          // Property: Ticket must contain the header
          expect(ticketText).toContain('YENI SIPARIS');
        },
      ),
      { numRuns: 100 },
    );
  });
});
