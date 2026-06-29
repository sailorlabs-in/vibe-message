import { Controller, Get, Post, Body, Query, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Internal App APIs')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('enterprise-key/request')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request an enterprise license key for self-hosting' })
  async requestEnterpriseKey(@Request() req: any) {
    const result = await this.userService.requestEnterpriseKey(req.user.userId);
    return { success: true, data: result };
  }

  @Post('enterprise-key/shuffle')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Regenerate/shuffle the enterprise license key' })
  async shuffleEnterpriseKey(@Request() req: any) {
    const result = await this.userService.shuffleEnterpriseKey(req.user.userId);
    return { success: true, data: result };
  }

  @Get('verify-license')
  @ApiTags('External Notifications APIs')
  @ApiOperation({ summary: 'Verify an enterprise license key from a self-hosted instance' })
  @ApiQuery({ name: 'licenseKey', description: 'The enterprise license key to verify', required: true })
  @ApiResponse({ status: 200, description: 'License verification status' })
  async verifyLicense(@Query('licenseKey') licenseKey: string) {
    const result = await this.userService.verifyLicenseKey(licenseKey);
    return { success: true, data: result };
  }
}
