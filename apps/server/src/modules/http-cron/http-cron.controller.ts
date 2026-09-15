import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApprovedGuard } from '../../common/guards/approved.guard';
import { HttpCronService } from './http-cron.service';
import { CreateCronJobDto, UpdateCronJobDto } from './http-cron.types';

@ApiTags('Cron Jobs')
@ApiBearerAuth()
@UseGuards(AuthGuard, ApprovedGuard)
@Controller('cron-jobs')
export class HttpCronController {
  constructor(private readonly cronService: HttpCronService) {}

  @Get()
  @ApiOperation({ summary: 'List all scheduled HTTP cron jobs for the current user' })
  @ApiResponse({ status: 200, description: 'List of cron jobs with latest status' })
  async listCronJobs(@Req() req: any) {
    const jobs = await this.cronService.findAll(req.user.userId);
    return { success: true, data: jobs };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new scheduled HTTP cron job' })
  @ApiResponse({ status: 201, description: 'Created cron job' })
  async createCronJob(@Req() req: any, @Body() dto: CreateCronJobDto) {
    const job = await this.cronService.create(req.user.userId, dto);
    return { success: true, data: job };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific cron job' })
  @ApiResponse({ status: 200, description: 'Cron job details' })
  async getCronJob(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const job = await this.cronService.findOne(id, req.user.userId);
    return { success: true, data: job };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cron job configuration' })
  @ApiResponse({ status: 200, description: 'Updated cron job' })
  async updateCronJob(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCronJobDto
  ) {
    const job = await this.cronService.update(id, req.user.userId, dto);
    return { success: true, data: job };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cron job and stop its scheduler' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  async deleteCronJob(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.cronService.delete(id, req.user.userId);
    return { success: true, message: 'Cron job deleted successfully' };
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Trigger an immediate run of the cron job' })
  @ApiResponse({ status: 200, description: 'Execution triggered' })
  async runNow(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const result = await this.cronService.runNow(id, req.user.userId);
    return result;
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle enable/pause state of the cron job' })
  @ApiResponse({ status: 200, description: 'New state of the cron job' })
  async toggleCronJob(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const job = await this.cronService.toggleEnabled(id, req.user.userId);
    return { success: true, data: job };
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get execution history logs for a cron job' })
  @ApiResponse({ status: 200, description: 'List of execution logs' })
  async getLogs(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const logs = await this.cronService.getLogs(id, req.user.userId, limitNum);
    return { success: true, data: logs };
  }
}
