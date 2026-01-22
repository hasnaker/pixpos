// Electron API type definitions
declare global {
  interface Window {
    electronAPI?: {
      // Display
      getDisplays: () => Promise<any[]>;
      openCustomerDisplay: () => Promise<boolean>;
      
      // Printer discovery
      scanPrinters: (subnet?: string) => Promise<{ success: boolean; printers: any[]; error?: string }>;
      testPrinter: (ip: string, port?: number) => Promise<{ success: boolean; message: string }>;
      checkPrinter: (ip: string, port?: number) => Promise<{ success: boolean; responseTime?: number }>;
      getLocalSubnet: () => Promise<string | null>;
      
      // Direct printing
      printReceipt: (data: {
        order: {
          orderNumber: string;
          tableName: string;
          items: Array<{
            productName: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            notes?: string;
          }>;
          totalAmount: number;
          discountAmount?: number;
        };
        printerIp: string;
        printerPort: number;
        businessName?: string;
      }) => Promise<{ success: boolean; message: string }>;
      
      printKitchenTicket: (data: {
        order: {
          orderNumber: string;
          tableName: string;
          items: Array<{
            productName: string;
            quantity: number;
            notes?: string;
          }>;
        };
        printerIp: string;
        printerPort: number;
      }) => Promise<{ success: boolean; message: string }>;
      
      // ÖKC (Ingenico)
      okcTestConnection: (ip: string, port: number) => Promise<{ success: boolean; responseTime?: number; error?: string }>;
      okcScanPorts: (ip: string) => Promise<number[]>;
      
      // Platform info
      platform: string;
      version: string;
      isElectron: boolean;
    };
  }
}

export {};
