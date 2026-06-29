import { Controller, Post, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

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

  @Post('verify-license')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify an enterprise license key from a self-hosted instance' })
  @ApiResponse({ status: 200, description: 'License verification status' })
  async verifyLicense(@Body() body: { licenseKey: string }) {
    const result = await this.userService.verifyLicenseKey(body.licenseKey);
    return { success: true, data: result };
  }
}
