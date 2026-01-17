import { Injectable } from '@nestjs/common';
import { Order } from '../../entities/order.entity';
import { PrintService, ESC_POS } from './print.service';

export interface OrderTicketData {
  tableName: string;
  orderNumber: string;
  dailyOrderNumber: number;
  pendingOrderCount: number;
  orderTime: Date;
  waiterName?: string;
  items: Array<{
    productName: string;
    quantity: number;
    notes?: string | null;
  }>;
  orderNotes?: string | null;
}

export interface ReceiptData {
  businessName: string;
  address1?: string;
  address2?: string;
  phone?: string;
  tableName: string;
  receiptNumber: string;
  waiterName?: string;
  date: Date;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'online';
  amountReceived?: number;
  changeAmount?: number;
}

@Injectable()
export class OrderTicketService {
  private readonly PAPER_WIDTH = 48;
  
  // Günlük sipariş sayacı
  private dailyOrderCounter = 0;
  private lastResetDate: string = '';

  constructor(private readonly printService: PrintService) {}

  /**
   * Queen Waffle ASCII Art Logo
   */
  private getQueenLogo(): string {
    return `
   ____  _   _ _____ _____ _   _ 
  / __ \\| | | | ____| ____| \\ | |
 | |  | | | | |  _| |  _| |  \\| |
 | |__| | |_| | |___| |___| |\\  |
  \\___\\_\\\\___/|_____|_____|_| \\_|
                                 
 __        __    _____ _____ _     _____ 
 \\ \\      / /   |  ___|  ___| |   | ____|
  \\ \\ /\\ / /    | |_  | |_  | |   |  _|  
   \\ V  V /     |  _| |  _| | |___| |___ 
    \\_/\\_/      |_|   |_|   |_____|_____|
`;
  }

  /**
   * Basit Queen Waffle Logo (daha kompakt)
   */
  private getSimpleLogo(): string {
    return `
    *****************************
    *                           *
    *    Q U E E N   W A F F L E    *
    *                           *
    *    Premium Waffle House   *
    *                           *
    *****************************
`;
  }

  /**
   * Taç ASCII Art
   */
  private getCrownArt(): string {
    return `
       .:::.
      :::::::
    .::::::::::.
    ':::::::::'
      ':::::'
`;
  }

  /**
   * Günlük sipariş numarası al
   */
  getDailyOrderNumber(): number {
    const today = new Date().toISOString().slice(0, 10);
    if (this.lastResetDate !== today) {
      this.dailyOrderCounter = 0;
      this.lastResetDate = today;
    }
    this.dailyOrderCounter++;
    return this.dailyOrderCounter;
  }

  /**
   * Ürünleri grupla (aynı ürünleri birleştir)
   */
  private groupItems(items: OrderTicketData['items']): OrderTicketData['items'] {
    const grouped = new Map<string, { productName: string; quantity: number; notes: string[] }>();
    
    for (const item of items) {
      const key = item.productName;
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.quantity += item.quantity;
        if (item.notes) {
          existing.notes.push(item.notes);
        }
      } else {
        grouped.set(key, {
          productName: item.productName,
          quantity: item.quantity,
          notes: item.notes ? [item.notes] : [],
        });
      }
    }
    
    return Array.from(grouped.values()).map(g => ({
      productName: g.productName,
      quantity: g.quantity,
      notes: g.notes.length > 0 ? g.notes.join(', ') : null,
    }));
  }

  /**
   * Premium Queen Waffle Mutfak Fişi
   */
  formatKitchenTicket(data: OrderTicketData): Buffer {
    const time = this.formatTime(data.orderTime);
    const date = this.formatDate(data.orderTime);
    const groupedItems = this.groupItems(data.items);
    
    // Motivasyon mesajları
    const messages = [
      'Her tabak bir sanat eseri!',
      'Mutluluk pisiyor!',
      'Lezzet ustasi sizsiniz!',
      'Harika is cikariyorsunuz!',
      'Bugun de muhtesemsiniz!',
      'Eller altin, tatlar enfes!',
      'Mutfagin yildizlari!',
      'Basarilar devam ediyor!',
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    return this.printService.buildBuffer([
      ESC_POS.INIT,
      
      // ══════════════════════════════════════════════
      // LOGO
      // ══════════════════════════════════════════════
      ESC_POS.ALIGN_CENTER,
      '\n',
      '       .:::.       \n',
      '      :::::::      \n',
      '    .::::::::::.   \n',
      ESC_POS.TEXT_DOUBLE,
      ESC_POS.BOLD_ON,
      '\n',
      'QUEEN WAFFLE\n',
      ESC_POS.BOLD_OFF,
      ESC_POS.TEXT_NORMAL,
      'Premium Waffle & Dessert\n',
      '\n',
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      
      // ══════════════════════════════════════════════
      // SIPARIS NUMARASI (BUYUK)
      // ══════════════════════════════════════════════
      ESC_POS.ALIGN_CENTER,
      ESC_POS.TEXT_DOUBLE,
      ESC_POS.BOLD_ON,
      `#${data.dailyOrderNumber}\n`,
      ESC_POS.BOLD_OFF,
      ESC_POS.TEXT_NORMAL,
      '\n',
      this.printService.createSeparator('-', this.PAPER_WIDTH),
      
      // ══════════════════════════════════════════════
      // MASA & ZAMAN
      // ══════════════════════════════════════════════
      ESC_POS.ALIGN_LEFT,
      ESC_POS.TEXT_DOUBLE_HEIGHT,
      ESC_POS.BOLD_ON,
      `MASA: ${data.tableName}\n`,
      ESC_POS.BOLD_OFF,
      ESC_POS.TEXT_NORMAL,
      '\n',
      this.printService.formatLine(`Tarih: ${date}`, `Saat: ${time}`, this.PAPER_WIDTH),
      ...(data.waiterName ? [`Garson: ${data.waiterName}\n`] : []),
      '\n',
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      
      // ══════════════════════════════════════════════
      // SIPARIS DETAYLARI
      // ══════════════════════════════════════════════
      ESC_POS.ALIGN_CENTER,
      ESC_POS.BOLD_ON,
      '[ SIPARIS DETAYI ]\n',
      ESC_POS.BOLD_OFF,
      ESC_POS.ALIGN_LEFT,
      '\n',
      
      ...this.formatKitchenItems(groupedItems),
      
      // ══════════════════════════════════════════════
      // SIPARIS NOTLARI
      // ══════════════════════════════════════════════
      ...this.formatOrderNotes(data.orderNotes),
      
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      
      // ══════════════════════════════════════════════
      // BEKLEYEN SIPARIS
      // ══════════════════════════════════════════════
      ESC_POS.ALIGN_CENTER,
      data.pendingOrderCount > 0 
        ? `Sirada ${data.pendingOrderCount} siparis bekliyor\n`
        : 'Sirada bekleyen siparis yok\n',
      '\n',
      this.printService.createSeparator('-', this.PAPER_WIDTH),
      
      // ══════════════════════════════════════════════
      // MOTIVASYON MESAJI
      // ══════════════════════════════════════════════
      '\n',
      ESC_POS.ALIGN_CENTER,
      ESC_POS.BOLD_ON,
      `*** ${randomMsg} ***\n`,
      ESC_POS.BOLD_OFF,
      '\n',
      
      // ══════════════════════════════════════════════
      // FOOTER
      // ══════════════════════════════════════════════
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      ESC_POS.ALIGN_CENTER,
      `Ref: ${data.orderNumber}\n`,
      '\n',
      '    powered by PIXPOS    \n',
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      
      ESC_POS.FEED_5_LINES,
      ESC_POS.CUT,
    ]);
  }

  /**
   * Mutfak fişi için ürün formatı
   */
  private formatKitchenItems(items: OrderTicketData['items']): (Buffer | string)[] {
    const result: (Buffer | string)[] = [];
    
    for (const item of items) {
      result.push(ESC_POS.TEXT_DOUBLE_HEIGHT);
      result.push(ESC_POS.BOLD_ON);
      result.push(`  ${item.quantity}x ${item.productName}\n`);
      result.push(ESC_POS.BOLD_OFF);
      result.push(ESC_POS.TEXT_NORMAL);
      
      if (item.notes) {
        result.push(`     >> ${item.notes}\n`);
      }
      result.push('\n');
    }
    
    return result;
  }

  /**
   * Sipariş notları formatı
   */
  private formatOrderNotes(notes?: string | null): (Buffer | string)[] {
    if (!notes) return [];
    
    return [
      '\n',
      this.printService.createSeparator('-', this.PAPER_WIDTH),
      ESC_POS.BOLD_ON,
      'OZEL NOT:\n',
      ESC_POS.BOLD_OFF,
      `${notes}\n`,
      '\n',
    ];
  }

  /**
   * Müşteri fişi formatı
   */
  formatReceipt(data: ReceiptData): Buffer {
    const dateStr = this.formatDate(data.date);
    const timeStr = this.formatTime(data.date);
    
    return this.printService.buildBuffer([
      ESC_POS.INIT,
      
      // Header
      ESC_POS.ALIGN_CENTER,
      '\n',
      '       .:::.       \n',
      '      :::::::      \n',
      ESC_POS.TEXT_DOUBLE,
      ESC_POS.BOLD_ON,
      '\n',
      'QUEEN WAFFLE\n',
      ESC_POS.BOLD_OFF,
      ESC_POS.TEXT_NORMAL,
      'Premium Waffle & Dessert\n',
      ...(data.address1 ? [`${data.address1}\n`] : []),
      ...(data.phone ? [`Tel: ${data.phone}\n`] : []),
      '\n',
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      
      // Fis bilgileri
      ESC_POS.ALIGN_LEFT,
      this.printService.formatLine(`Tarih: ${dateStr}`, `Saat: ${timeStr}`, this.PAPER_WIDTH),
      this.printService.formatLine(`Masa: ${data.tableName}`, `Fis: #${data.receiptNumber}`, this.PAPER_WIDTH),
      ...(data.waiterName ? [`Garson: ${data.waiterName}\n`] : []),
      this.printService.createSeparator('-', this.PAPER_WIDTH),
      
      // Urunler
      ...this.formatReceiptItems(data.items),
      
      this.printService.createSeparator('-', this.PAPER_WIDTH),
      
      // Toplamlar
      this.printService.formatLine('Ara Toplam:', this.formatPrice(data.subtotal), this.PAPER_WIDTH),
      this.printService.formatLine(`KDV (%${data.taxRate}):`, this.formatPrice(data.taxAmount), this.PAPER_WIDTH),
      ...(data.discountAmount && data.discountAmount > 0 
        ? [this.printService.formatLine('Indirim:', `-${this.formatPrice(data.discountAmount)}`, this.PAPER_WIDTH)]
        : []),
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      
      // Genel toplam
      ESC_POS.BOLD_ON,
      ESC_POS.TEXT_DOUBLE,
      ESC_POS.ALIGN_CENTER,
      `TOPLAM: ${this.formatPrice(data.totalAmount)}\n`,
      ESC_POS.TEXT_NORMAL,
      ESC_POS.BOLD_OFF,
      ESC_POS.ALIGN_LEFT,
      
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      
      // Odeme bilgisi
      `Odeme: ${this.getPaymentMethodText(data.paymentMethod)}\n`,
      ...(data.amountReceived !== undefined && data.paymentMethod === 'cash'
        ? [
            this.printService.formatLine('Alinan:', this.formatPrice(data.amountReceived), this.PAPER_WIDTH),
            this.printService.formatLine('Para Ustu:', this.formatPrice(data.changeAmount || 0), this.PAPER_WIDTH),
          ]
        : []),
      
      this.printService.createSeparator('-', this.PAPER_WIDTH),
      
      // Footer
      ESC_POS.ALIGN_CENTER,
      '\n',
      'Bizi tercih ettiginiz icin\n',
      'tesekkur ederiz!\n',
      '\n',
      'www.queenwaffle.com\n',
      '\n',
      '    powered by PIXPOS    \n',
      this.printService.createDoubleSeparator(this.PAPER_WIDTH),
      
      ESC_POS.FEED_5_LINES,
      ESC_POS.CUT,
    ]);
  }

  /**
   * Fis için ürün formatı
   */
  private formatReceiptItems(items: ReceiptData['items']): (Buffer | string)[] {
    const result: (Buffer | string)[] = [];
    
    for (const item of items) {
      result.push(`${item.productName}\n`);
      result.push(
        this.printService.formatLine(
          `  ${item.quantity} x ${this.formatPrice(item.unitPrice)}`,
          this.formatPrice(item.totalPrice),
          this.PAPER_WIDTH
        )
      );
    }
    
    return result;
  }

  private getPaymentMethodText(method: 'cash' | 'card' | 'online'): string {
    switch (method) {
      case 'cash': return 'NAKIT';
      case 'card': return 'KREDI KARTI';
      case 'online': return 'ONLINE';
    }
  }

  orderToTicketData(order: Order, waiterName?: string, pendingOrderCount: number = 0): OrderTicketData {
    return {
      tableName: order.table?.name || 'Bilinmiyor',
      orderNumber: order.orderNumber,
      dailyOrderNumber: this.getDailyOrderNumber(),
      pendingOrderCount,
      orderTime: order.createdAt,
      waiterName,
      items: (order.items || []).map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        notes: item.notes,
      })),
      orderNotes: order.notes,
    };
  }

  orderToReceiptData(
    order: Order,
    businessInfo: { name: string; address1?: string; address2?: string; phone?: string },
    paymentMethod: 'cash' | 'card' | 'online',
    amountReceived?: number,
    waiterName?: string,
  ): ReceiptData {
    const subtotal = Number(order.totalAmount);
    const taxRate = 10;
    const taxAmount = subtotal * (taxRate / 100);
    
    return {
      businessName: businessInfo.name,
      address1: businessInfo.address1,
      address2: businessInfo.address2,
      phone: businessInfo.phone,
      tableName: order.table?.name || 'Bilinmiyor',
      receiptNumber: order.orderNumber,
      waiterName,
      date: new Date(),
      items: (order.items || []).map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      subtotal,
      taxRate,
      taxAmount,
      totalAmount: subtotal,
      paymentMethod,
      amountReceived,
      changeAmount: amountReceived ? amountReceived - subtotal : undefined,
    };
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  formatPrice(amount: number): string {
    return `${Number(amount).toFixed(2)} TL`;
  }

  validateKitchenTicketContent(ticketBuffer: Buffer, data: OrderTicketData): {
    hasTableName: boolean;
    hasOrderTime: boolean;
    hasAllItems: boolean;
    hasItemQuantities: boolean;
    hasOrderNotes: boolean;
    hasDailyOrderNumber: boolean;
  } {
    const ticketText = ticketBuffer.toString('utf8');
    
    return {
      hasTableName: ticketText.includes(data.tableName),
      hasOrderTime: ticketText.includes(this.formatTime(data.orderTime)),
      hasAllItems: data.items.every(item => ticketText.includes(item.productName)),
      hasItemQuantities: data.items.every(item => 
        ticketText.includes(`${item.quantity}x`) || ticketText.includes(`${item.quantity} x`)
      ),
      hasOrderNotes: !data.orderNotes || ticketText.includes(data.orderNotes),
      hasDailyOrderNumber: ticketText.includes(`#${data.dailyOrderNumber}`),
    };
  }

  validateReceiptContent(receiptBuffer: Buffer, data: ReceiptData): {
    hasBusinessName: boolean;
    hasTableName: boolean;
    hasReceiptNumber: boolean;
    hasAllItems: boolean;
    hasTotal: boolean;
    hasPaymentMethod: boolean;
  } {
    const receiptText = receiptBuffer.toString('utf8');
    
    return {
      hasBusinessName: receiptText.includes(data.businessName),
      hasTableName: receiptText.includes(data.tableName),
      hasReceiptNumber: receiptText.includes(data.receiptNumber),
      hasAllItems: data.items.every(item => receiptText.includes(item.productName)),
      hasTotal: receiptText.includes(this.formatPrice(data.totalAmount)),
      hasPaymentMethod: receiptText.includes(this.getPaymentMethodText(data.paymentMethod)),
    };
  }
}
