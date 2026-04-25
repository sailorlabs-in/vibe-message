import { Module, forwardRef } from '@nestjs/common';
import { SdkController } from './sdk.controller';
import { AppModule } from '../app/app.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => DeviceModule),
  ],
  controllers: [SdkController],
})
export class SdkModule {}
