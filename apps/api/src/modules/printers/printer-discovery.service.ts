import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';

export interface DiscoveredPrinter {
  ip: string;
  port: number;
  hostname?: string;
  responseTime: number;
}

@Injectable()
export class PrinterDiscoveryService {
  private readonly logger = new Logger(PrinterDiscoveryService.name);
  private readonly DEFAULT_PORT = 9100;
  private readonly TIMEOUT = 1000; // 1 second timeout per host

  /**
   * Scan network for printers on port 9100
   * Scans the local subnet (e.g., 192.168.1.1-254)
   */
  async scanNetwork(baseIp?: string): Promise<DiscoveredPrinter[]> {
    const subnet = baseIp || await this.detectSubnet();
    if (!subnet) {
      this.logger.warn('Could not detect subnet');
      return [];
    }

    this.logger.log(`Scanning subnet: ${subnet}.1-254 for printers...`);
    
    const discovered: DiscoveredPrinter[] = [];
    const scanPromises: Promise<DiscoveredPrinter | null>[] = [];

    // Scan all IPs in subnet (1-254)
    for (let i = 1; i <= 254; i++) {
      const ip = `${subnet}.${i}`;
      scanPromises.push(this.checkPrinter(ip, this.DEFAULT_PORT));
    }

    const results = await Promise.all(scanPromises);
    
    for (const result of results) {
      if (result) {
        discovered.push(result);
      }
    }

    this.logger.log(`Found ${discovered.length} printer(s)`);
    return discovered.sort((a, b) => a.responseTime - b.responseTime);
  }

  /**
   * Check if a specific IP:port has a printer
   */
  async checkPrinter(ip: string, port: number = this.DEFAULT_PORT): Promise<DiscoveredPrinter | null> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const socket = new net.Socket();

      socket.setTimeout(this.TIMEOUT);

      socket.on('connect', () => {
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({
          ip,
          port,
          responseTime,
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(null);
      });

      socket.connect(port, ip);
    });
  }


  /**
   * Test connection to a specific printer
   */
  async testConnection(ip: string, port: number = this.DEFAULT_PORT): Promise<{ success: boolean; responseTime?: number; error?: string }> {
    try {
      const result = await this.checkPrinter(ip, port);
      if (result) {
        return { success: true, responseTime: result.responseTime };
      }
      return { success: false, error: 'Connection timeout' };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Detect local subnet from network interfaces
   */
  private async detectSubnet(): Promise<string | null> {
    try {
      const os = await import('os');
      const interfaces = os.networkInterfaces();
      
      for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        if (!iface) continue;
        
        for (const alias of iface) {
          // Skip internal and non-IPv4
          if (alias.internal || alias.family !== 'IPv4') continue;
          
          // Get subnet (first 3 octets)
          const parts = alias.address.split('.');
          if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}`;
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to detect subnet: ${error}`);
    }
    return null;
  }

  /**
   * Scan specific IP range
   */
  async scanRange(startIp: string, endIp: string, port: number = this.DEFAULT_PORT): Promise<DiscoveredPrinter[]> {
    const startParts = startIp.split('.').map(Number);
    const endParts = endIp.split('.').map(Number);
    
    if (startParts.length !== 4 || endParts.length !== 4) {
      throw new Error('Invalid IP format');
    }

    const discovered: DiscoveredPrinter[] = [];
    const scanPromises: Promise<DiscoveredPrinter | null>[] = [];

    // Simple range scan (assumes same /24 subnet)
    const subnet = `${startParts[0]}.${startParts[1]}.${startParts[2]}`;
    const start = startParts[3];
    const end = endParts[3];

    for (let i = start; i <= end; i++) {
      const ip = `${subnet}.${i}`;
      scanPromises.push(this.checkPrinter(ip, port));
    }

    const results = await Promise.all(scanPromises);
    
    for (const result of results) {
      if (result) {
        discovered.push(result);
      }
    }

    return discovered;
  }
}
