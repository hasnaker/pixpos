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

export type WebSocketRoom = 'pos' | 'kitchen' | 'waiter';

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
   * Handle client joining a room (pos, kitchen, waiter)
   * Requirements: Gerçek zamanlı iletişim
   */
  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: WebSocketRoom },
  ): void {
    const { room } = data;
    
    if (!['pos', 'kitchen', 'waiter'].includes(room)) {
      this.logger.warn(`Invalid room: ${room}`);
      return;
    }

    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    
    client.emit('room:joined', { room, success: true });
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
}
