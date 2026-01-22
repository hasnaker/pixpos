import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Store } from '../../entities/store.entity';

/**
 * Get current store from request
 * Usage: @CurrentStore() store: Store
 */
export const CurrentStore = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Store => {
    const request = ctx.switchToHttp().getRequest();
    return request.store;
  },
);

/**
 * Get current store ID from request
 * Usage: @StoreId() storeId: string
 */
export const StoreId = createParamDecorator(
  (data: { required?: boolean } = { required: true }, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const storeId = request.storeId;
    
    if (data.required && !storeId) {
      throw new UnauthorizedException('Store ID gerekli');
    }
    
    return storeId;
  },
);
