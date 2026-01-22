import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../entities/store.entity';

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      store?: Store;
      storeId?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip tenant resolution for certain paths
    const skipPaths = ['/api/health', '/api/stores', '/api/auth/super-admin'];
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Try to get store from various sources
    let store: Store | null = null;

    // 1. From X-Store-ID header (for API clients)
    const storeIdHeader = req.headers['x-store-id'] as string;
    if (storeIdHeader) {
      store = await this.storeRepository.findOne({ where: { id: storeIdHeader, isActive: true } });
    }

    // 2. From subdomain (queen.pixpos.cloud -> queen)
    if (!store) {
      const host = req.headers.host || '';
      const subdomain = this.extractSubdomain(host);
      if (subdomain && subdomain !== 'api' && subdomain !== 'www') {
        store = await this.storeRepository.findOne({ where: { subdomain, isActive: true } });
      }
    }

    // 3. From query param (for testing)
    if (!store && req.query.storeId) {
      store = await this.storeRepository.findOne({ 
        where: { id: req.query.storeId as string, isActive: true } 
      });
    }

    if (store) {
      // Check store status
      if (store.status === 'suspended') {
        return res.status(403).json({ 
          error: 'STORE_SUSPENDED', 
          message: 'Bu işletme askıya alınmış' 
        });
      }
      if (store.status === 'cancelled') {
        return res.status(403).json({ 
          error: 'STORE_CANCELLED', 
          message: 'Bu işletme iptal edilmiş' 
        });
      }

      req.store = store;
      req.storeId = store.id;
    }

    next();
  }

  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const hostname = host.split(':')[0];
    
    // Handle localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return null;
    }

    // Extract subdomain from hostname
    // queen.pixpos.cloud -> queen
    // api.pixpos.cloud -> api
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }

    return null;
  }
}
