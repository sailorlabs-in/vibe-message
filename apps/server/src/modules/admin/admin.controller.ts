import { Controller, Get, Patch, Post, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { DeviceService } from '../device/device.service';
import { InternalNotificationService } from '../system/internal-notification.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserStatus, UpdateUserStatusRequest, UpdateUserRoleRequest, UpdateAppLimitRequest, CreateWarningRequest } from '../../types';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly deviceService: DeviceService,
    private readonly internalNotificationService: InternalNotificationService,
  ) {}

  @Get('notifications')
  async getNotifications() {
    const notifications = await this.internalNotificationService.getAdminNotifications();
    return { success: true, data: notifications };
  }

  @Get('users')
  async getUsers(@Query('status') status?: UserStatus) {
    const users = await this.userService.getAllUsers(status);
    return { success: true, data: users };
  }

  @Patch('users/:id/status')
  async updateUserStatus(@Param('id') id: string, @Body() data: UpdateUserStatusRequest) {
    const user = await this.userService.updateUserStatus(parseInt(id, 10), data);
    return { success: true, data: user };
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() data: UpdateUserRoleRequest) {
    const user = await this.userService.updateUserRole(parseInt(id, 10), data);
    return { success: true, data: user };
  }

  @Patch('users/:id/retention-permission')
  async updateUserRetentionPermission(@Param('id') id: string, @Body() data: { canManageRetention: boolean }) {
    const user = await this.userService.updateUserRetentionPermission(parseInt(id, 10), data.canManageRetention);
    return { success: true, data: user };
  }

  @Patch('users/:id/app-limit')
  async updateUserAppLimit(@Param('id') id: string, @Body() data: UpdateAppLimitRequest) {
    const user = await this.userService.updateUserAppLimit(parseInt(id, 10), data);
    return { success: true, data: user };
  }

  @Post('users/:id/warn')
  async warnUser(@Req() req: any, @Param('id') id: string, @Body() data: CreateWarningRequest) {
    const warning = await this.userService.createWarning(parseInt(id, 10), req.user.userId, data);
    return { success: true, data: warning };
  }

  @Delete('users/:id')
  async deleteUser(@Req() req: any, @Param('id') id: string) {
    const result = await this.userService.deleteUserBySuperAdmin(parseInt(id, 10), req.user.userId);
    return { success: true, message: 'User deleted successfully', data: result };
  }

  @Delete('devices')
  async deleteAllDevicesSystemWide() {
    await this.deviceService.unregisterAllDevicesSystemWide();
    return { success: true, message: 'All devices unregistered globally' };
  }
}
