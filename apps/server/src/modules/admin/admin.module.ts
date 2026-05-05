import { Module, forwardRef } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { UserModule } from "../user/user.module";
import { DeviceModule } from "../device/device.module";
import { SystemModule } from "../system/system.module";

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => DeviceModule),
    forwardRef(() => SystemModule),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
