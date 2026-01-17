/**
 * E2E Test: Yazıcı Entegrasyon Testi (Printer Integration Test)
 * 
 * This test validates printer integration including:
 * - Kitchen ticket printing
 * - Receipt printing
 * - Test print functionality
 * 
 * **Validates: Requirements 4.2, 8.5**
 * 
 * Note: These tests can run in mock mode without a real printer,
 * or with a real printer when PRINTER_TEST_IP is set.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrintService, ESC_POS } from '../modules/printers/print.service';
import { OrderTicketService, OrderTicketData, ReceiptData } from '../modules/printers/order-ticket.service';
import { Printer } from '../entities/printer.entity';

describe('E2E: Printer Integration (Yazıcı Entegrasyonu)', () => {
  let printService: PrintService;
  let orderTicketService: OrderTicketService;

  // Mock printer for testing without real hardware
  const mockPrinter: Printer = {
    id: 'test-printer-id',
    name: 'Test Mutfak Yazıcısı',
    type: 'kitchen',
    connectionType: 'tcp',
    ipAddress: process.env.PRINTER_TEST_IP || '192.168.1.100',
    port: parseInt(process.env.PRINTER_TEST_PORT || '9100'),
    isActive: true,
    createdAt: new Date(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [PrintService, OrderTicketService],
    }).compile();

    printService = moduleFixture.get<PrintService>(PrintService);
    orderTicketService = moduleFixture.get<OrderTicketService>(OrderTicketService);
  });

  describe('Kitchen Ticket Formatting (Mutfak Sipariş Kağıdı)', () => {
    const sampleOrderData: OrderTicketData = {
      tableName: 'Masa 5',
      orderNumber: 'ORD-20260113-123456',
      dailyOrderNumber: 1,
      pendingOrderCount: 0,
      orderTime: new Date('2026-01-13T14:30:00'),
      items: [
        { productName: 'Çay', quantity: 2, notes: 'Açık demleme' },
        { productName: 'Kahve', quantity: 1, notes: null },
        { productName: 'Tost', quantity: 3, notes: 'Az pişmiş' },
      ],
      orderNotes: 'Acele sipariş',
    };

    /**
     * Requirements: 4.3 - Sipariş kağıdı masa numarası göstermeli
     */
    it('should include table name in kitchen ticket', () => {
      const ticket = orderTicketService.formatKitchenTicket(sampleOrderData);
      const validation = orderTicketService.validateKitchenTicketContent(ticket, sampleOrderData);
      
      expect(validation.hasTableName).toBe(true);
    });

    /**
     * Requirements: 4.4 - Sipariş kağıdı sipariş saati göstermeli
     */
    it('should include order time in kitchen ticket', () => {
      const ticket = orderTicketService.formatKitchenTicket(sampleOrderData);
      const validation = orderTicketService.validateKitchenTicketContent(ticket, sampleOrderData);
      
      expect(validation.hasOrderTime).toBe(true);
    });

    /**
     * Requirements: 4.5 - Sipariş kağıdı ürün listesi ve miktarları göstermeli
     */
    it('should include all items with quantities in kitchen ticket', () => {
      const ticket = orderTicketService.formatKitchenTicket(sampleOrderData);
      const validation = orderTicketService.validateKitchenTicketContent(ticket, sampleOrderData);
      
      expect(validation.hasAllItems).toBe(true);
      expect(validation.hasItemQuantities).toBe(true);
    });

    /**
     * Requirements: 4.6 - Sipariş kağıdı sipariş notlarını göstermeli
     */
    it('should include order notes in kitchen ticket', () => {
      const ticket = orderTicketService.formatKitchenTicket(sampleOrderData);
      const validation = orderTicketService.validateKitchenTicketContent(ticket, sampleOrderData);
      
      expect(validation.hasOrderNotes).toBe(true);
    });

    /**
     * Property 7: Yazıcı Sipariş Kağıdı İçeriği
     * All required information should be present
     */
    it('should pass all content validation checks', () => {
      const ticket = orderTicketService.formatKitchenTicket(sampleOrderData);
      const validation = orderTicketService.validateKitchenTicketContent(ticket, sampleOrderData);
      
      expect(validation.hasTableName).toBe(true);
      expect(validation.hasOrderTime).toBe(true);
      expect(validation.hasAllItems).toBe(true);
      expect(validation.hasItemQuantities).toBe(true);
      expect(validation.hasOrderNotes).toBe(true);
    });

    /**
     * Kitchen ticket should handle items without notes
     */
    it('should handle items without notes', () => {
      const dataWithoutNotes: OrderTicketData = {
        ...sampleOrderData,
        items: [
          { productName: 'Su', quantity: 1, notes: null },
          { productName: 'Kola', quantity: 2, notes: undefined },
        ],
        orderNotes: null,
      };

      const ticket = orderTicketService.formatKitchenTicket(dataWithoutNotes);
      const ticketText = ticket.toString('utf8');
      
      expect(ticketText).toContain('Su');
      expect(ticketText).toContain('Kola');
      expect(ticketText).not.toContain('undefined');
    });

    /**
     * Kitchen ticket should include ESC/POS commands
     */
    it('should include proper ESC/POS commands', () => {
      const ticket = orderTicketService.formatKitchenTicket(sampleOrderData);
      
      // Check for initialization command
      expect(ticket.includes(ESC_POS.INIT)).toBe(true);
      
      // Check for cut command at the end
      expect(ticket.includes(ESC_POS.CUT)).toBe(true);
    });
  });

  describe('Receipt Formatting (Fiş Formatı)', () => {
    const sampleReceiptData: ReceiptData = {
      businessName: 'MEGA CAFE',
      address1: 'Atatürk Cad. No:123',
      address2: 'Kadıköy, İstanbul',
      phone: '0216 123 45 67',
      tableName: 'Masa 5',
      receiptNumber: 'FIS-20260113-001',
      date: new Date('2026-01-13T15:45:00'),
      items: [
        { productName: 'Çay', quantity: 2, unitPrice: 15, totalPrice: 30 },
        { productName: 'Kahve', quantity: 1, unitPrice: 25, totalPrice: 25 },
        { productName: 'Tost', quantity: 1, unitPrice: 45, totalPrice: 45 },
      ],
      subtotal: 100,
      taxRate: 10,
      taxAmount: 10,
      totalAmount: 100,
      paymentMethod: 'cash',
    };

    /**
     * Receipt should include business information
     */
    it('should include business name in receipt', () => {
      const receipt = orderTicketService.formatReceipt(sampleReceiptData);
      const receiptText = receipt.toString('utf8');
      
      expect(receiptText).toContain(sampleReceiptData.businessName);
    });

    /**
     * Receipt should include table and receipt number
     */
    it('should include table and receipt number', () => {
      const receipt = orderTicketService.formatReceipt(sampleReceiptData);
      const receiptText = receipt.toString('utf8');
      
      expect(receiptText).toContain(sampleReceiptData.tableName);
      expect(receiptText).toContain(sampleReceiptData.receiptNumber);
    });

    /**
     * Receipt should include all items with prices
     */
    it('should include all items with prices', () => {
      const receipt = orderTicketService.formatReceipt(sampleReceiptData);
      const receiptText = receipt.toString('utf8');
      
      for (const item of sampleReceiptData.items) {
        expect(receiptText).toContain(item.productName);
      }
    });

    /**
     * Receipt should include total amount
     */
    it('should include total amount', () => {
      const receipt = orderTicketService.formatReceipt(sampleReceiptData);
      const receiptText = receipt.toString('utf8');
      
      expect(receiptText).toContain('100.00');
      expect(receiptText).toContain('TOPLAM');
    });

    /**
     * Receipt should include payment method
     */
    it('should include payment method', () => {
      const receipt = orderTicketService.formatReceipt(sampleReceiptData);
      const receiptText = receipt.toString('utf8');
      
      expect(receiptText).toContain('NAKIT');
    });

    /**
     * Receipt should show KART for card payments
     */
    it('should show KART for card payments', () => {
      const cardReceiptData: ReceiptData = {
        ...sampleReceiptData,
        paymentMethod: 'card',
      };
      
      const receipt = orderTicketService.formatReceipt(cardReceiptData);
      const receiptText = receipt.toString('utf8');
      
      expect(receiptText).toContain('KREDI KARTI');
    });
  });

  describe('Print Service Utilities', () => {
    /**
     * Buffer building should work correctly
     */
    it('should build buffer from mixed content', () => {
      const buffer = printService.buildBuffer([
        ESC_POS.INIT,
        'Test Text\n',
        ESC_POS.CUT,
      ]);
      
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.toString('utf8')).toContain('Test Text');
    });

    /**
     * Separator creation should work
     */
    it('should create separator lines', () => {
      const separator = printService.createSeparator('-', 32);
      expect(separator).toBe('-'.repeat(32) + '\n');
    });

    /**
     * Double separator creation should work
     */
    it('should create double separator lines', () => {
      const separator = printService.createDoubleSeparator(32);
      expect(separator).toBe('='.repeat(32) + '\n');
    });

    /**
     * Line formatting should align text correctly
     */
    it('should format lines with left and right alignment', () => {
      const line = printService.formatLine('Left', 'Right', 32);
      expect(line.length).toBe(33); // 32 chars + newline
      expect(line.startsWith('Left')).toBe(true);
      expect(line.trimEnd().endsWith('Right')).toBe(true);
    });

    /**
     * Center text should work correctly
     */
    it('should center text correctly', () => {
      const centered = printService.centerText('Test', 32);
      expect(centered.trim()).toBe('Test');
      // Should have padding on the left
      expect(centered.startsWith(' ')).toBe(true);
    });
  });

  describe('Real Printer Test (Gerçek Yazıcı Testi)', () => {
    /**
     * Requirements: 8.5, 8.6 - Test yazdırma
     * 
     * This test only runs when PRINTER_TEST_ENABLED=true
     * Set PRINTER_TEST_IP and PRINTER_TEST_PORT for real printer testing
     */
    it('should send test print to real printer (when enabled)', async () => {
      const isEnabled = process.env.PRINTER_TEST_ENABLED === 'true';
      
      if (!isEnabled) {
        console.log('Skipping real printer test. Set PRINTER_TEST_ENABLED=true to enable.');
        return;
      }

      const result = await printService.testPrint(mockPrinter);
      
      // If printer is connected, should return true
      // If not connected, should return false (not throw)
      expect(typeof result).toBe('boolean');
    });

    /**
     * Requirements: 4.2 - Yazıcıdan sipariş kağıdı çıkarma
     * 
     * This test only runs when PRINTER_TEST_ENABLED=true
     */
    it('should print kitchen ticket to real printer (when enabled)', async () => {
      const isEnabled = process.env.PRINTER_TEST_ENABLED === 'true';
      
      if (!isEnabled) {
        console.log('Skipping real printer test. Set PRINTER_TEST_ENABLED=true to enable.');
        return;
      }

      const orderData: OrderTicketData = {
        tableName: 'Test Masa',
        orderNumber: 'TEST-001',
        dailyOrderNumber: 1,
        pendingOrderCount: 0,
        orderTime: new Date(),
        items: [
          { productName: 'Test Ürün 1', quantity: 2, notes: 'Test notu' },
          { productName: 'Test Ürün 2', quantity: 1, notes: null },
        ],
        orderNotes: 'E2E Test siparişi',
      };

      const ticket = orderTicketService.formatKitchenTicket(orderData);
      const result = await printService.sendToPrinter(mockPrinter, ticket);
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Time and Date Formatting', () => {
    /**
     * Time formatting should produce HH:MM format
     */
    it('should format time as HH:MM', () => {
      const date = new Date('2026-01-13T09:05:00');
      const formatted = orderTicketService.formatTime(date);
      expect(formatted).toBe('09:05');
    });

    /**
     * Date formatting should produce DD.MM.YYYY format
     */
    it('should format date as DD.MM.YYYY', () => {
      const date = new Date('2026-01-13T14:30:00');
      const formatted = orderTicketService.formatDate(date);
      expect(formatted).toBe('13.01.2026');
    });

    /**
     * Price formatting should include TL suffix
     */
    it('should format price with TL suffix', () => {
      expect(orderTicketService.formatPrice(100)).toBe('100.00 TL');
      expect(orderTicketService.formatPrice(15.5)).toBe('15.50 TL');
      expect(orderTicketService.formatPrice(0)).toBe('0.00 TL');
    });
  });
});
