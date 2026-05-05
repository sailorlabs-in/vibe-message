import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DripService } from "./drip.service";
import { DripCampaign, DripStep, DripSentLog } from "./drip.entity";

@Module({
  imports: [TypeOrmModule.forFeature([DripCampaign, DripStep, DripSentLog])],
  controllers: [],
  providers: [DripService],
  exports: [DripService],
})
export class DripModule {}
