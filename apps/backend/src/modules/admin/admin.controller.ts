import { Controller, Get } from '@nestjs/common';

import { AdminService } from './admin.service';

// TODO: gate behind an admin-role guard once role-based access control exists (see identity
// module) — deliberately left unguarded-by-role here since this is a placeholder endpoint.
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('system-health')
  systemHealth() {
    return this.adminService.systemHealth();
  }
}
