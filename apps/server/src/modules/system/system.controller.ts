import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpStatus,
  Res,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SystemSettings } from "./system_settings.entity";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("System")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("system")
export class SystemController {
  constructor(
    @InjectRepository(SystemSettings)
    private systemSettingsRepository: Repository<SystemSettings>,
  ) {}

  @Get("settings")
  async getSettings() {
    const settings = await this.systemSettingsRepository.findOne({
      where: { id: 1 },
    });
    return {
      success: true,
      data: {
        default_retention_days: settings ? settings.default_retention_days : 14,
      },
    };
  }

  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN")
  @Put("settings")
  async updateSettings(@Body() body: any, @Res() res: Response) {
    const { default_retention_days } = body;

    if (
      typeof default_retention_days !== "number" ||
      default_retention_days < 1
    ) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "Invalid retention days value." });
    }

    let settings = await this.systemSettingsRepository.findOne({
      where: { id: 1 },
    });
    if (!settings) {
      settings = this.systemSettingsRepository.create({
        id: 1,
        default_retention_days,
      });
    } else {
      settings.default_retention_days = default_retention_days;
    }

    await this.systemSettingsRepository.save(settings);

    return res.json({
      success: true,
      data: { default_retention_days },
    });
  }
}
