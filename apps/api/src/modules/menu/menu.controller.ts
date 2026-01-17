import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * Get general menu (public endpoint for QR menu without table)
   * GET /api/menu
   */
  @Get()
  async getGeneralMenu() {
    return this.menuService.getGeneralMenu();
  }

  /**
   * Get menu for a table (public endpoint for QR menu)
   * GET /api/menu/:tableId
   * Requirements: 5.1, 5.2, 5.3, 5.4
   */
  @Get(':tableId')
  async getMenu(@Param('tableId', ParseUUIDPipe) tableId: string) {
    return this.menuService.getMenu(tableId);
  }

  /**
   * Call waiter for a table
   * POST /api/menu/:tableId/call-waiter
   * Requirements: 5.5, 5.6
   */
  @Post(':tableId/call-waiter')
  async callWaiter(@Param('tableId', ParseUUIDPipe) tableId: string) {
    return this.menuService.callWaiter(tableId);
  }
}
