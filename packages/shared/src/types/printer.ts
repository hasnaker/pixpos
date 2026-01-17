export type PrinterType = 'kitchen' | 'receipt';
export type ConnectionType = 'tcp' | 'usb';

export interface Printer {
  id: string;
  name: string;
  type: PrinterType;
  connectionType: ConnectionType;
  ipAddress: string | null;
  port: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreatePrinterDto {
  name: string;
  type: PrinterType;
  connectionType: ConnectionType;
  ipAddress?: string;
  port?: number;
  isActive?: boolean;
}

export interface UpdatePrinterDto {
  name?: string;
  type?: PrinterType;
  connectionType?: ConnectionType;
  ipAddress?: string;
  port?: number;
  isActive?: boolean;
}
