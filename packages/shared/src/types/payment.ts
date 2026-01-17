export type PaymentMethod = 'cash' | 'card';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
}

export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}
