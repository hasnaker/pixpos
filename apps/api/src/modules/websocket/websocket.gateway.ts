import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Order } from '../../entities/order.entity';
import { Table } from '../../entities/table.entity';

export type WebSocketRoom = 'pos' | 'kitchen' | 'waiter' | 'display';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handle client joining a room (pos, kitchen, waiter, display)
   * Requirements: Gerçek zamanlı iletişim
   */
  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: WebSocketRoom },
  ): void {
    const { room } = data;
    
    if (!['pos', 'kitchen', 'waiter', 'display'].includes(room)) {
      this.logger.warn(`Invalid room: ${room}`);
      return;
    }

    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    
    client.emit('room:joined', { room, success: true });
  }

  /**
   * Handle customer display joining
   */
  @SubscribeMessage('join:display')
  handleJoinDisplay(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId?: string },
  ): void {
    client.join('display');
    if (data?.tableId) {
      client.join(`display:${data.tableId}`);
    }
    this.logger.log(`Display client ${client.id} joined`);
    client.emit('room:joined', { room: 'display', success: true });
  }

  /**
   * Handle POS sending order to customer display
   * POS'tan gelen sipariş bilgisini müşteri ekranına ilet
   */
  @SubscribeMessage('display:show-order')
  handleDisplayShowOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() order: Order | null,
  ): void {
    // Broadcast to all display clients
    this.server.to('display').emit('display:show-order', order);
    if (order?.tableId) {
      this.server.to(`display:${order.tableId}`).emit('display:show-order', order);
    }
    this.logger.log(`POS sent order to display: ${order?.orderNumber || 'cleared'}`);
  }

  /**
   * Emit new order event to kitchen and pos rooms
   * Requirements: 3.6, 4.1
   */
  emitOrderNew(order: Order): void {
    this.server.to('kitchen').to('pos').emit('order:new', { order });
    this.logger.log(`Emitted order:new for order ${order.orderNumber}`);
  }

  /**
   * Emit order updated event to all rooms
   * Requirements: 3.6, 4.1
   */
  emitOrderUpdated(order: Order): void {
    this.server.to('kitchen').to('pos').to('waiter').emit('order:updated', { order });
    // Also update customer display
    this.emitDisplayUpdate(order);
    this.logger.log(`Emitted order:updated for order ${order.orderNumber}`);
  }

  /**
   * Emit order ready event to pos and waiter rooms
   * Requirements: 4.7
   */
  emitOrderReady(orderId: string, tableId: string): void {
    this.server.to('pos').to('waiter').emit('order:ready', { orderId, tableId });
    this.logger.log(`Emitted order:ready for order ${orderId}`);
  }

  /**
   * Emit table updated event to all rooms
   */
  emitTableUpdated(table: Table): void {
    this.server.to('pos').to('waiter').emit('table:updated', { table });
    this.logger.log(`Emitted table:updated for table ${table.name}`);
  }

  /**
   * Emit waiter called event to pos room
   * Requirements: 5.6
   */
  emitWaiterCalled(tableId: string, tableName: string): void {
    this.server.to('pos').emit('waiter:called', { tableId, tableName });
    this.logger.log(`Emitted waiter:called for table ${tableName}`);
  }

  /**
   * Emit display update event to customer display
   * Shows current order on second monitor
   */
  emitDisplayUpdate(order: Order | null): void {
    this.server.to('display').emit('display:update', order);
    if (order?.tableId) {
      this.server.to(`display:${order.tableId}`).emit('display:update', order);
    }
    this.logger.log(`Emitted display:update for order ${order?.orderNumber || 'cleared'}`);
  }

  /**
   * Clear customer display (show logo)
   */
  emitDisplayClear(): void {
    this.server.to('display').emit('display:update', null);
    this.server.to('display').emit('order:cleared');
    this.logger.log('Emitted display:clear');
  }
}
