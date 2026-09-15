import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { SystemSettings } from '../system/system_settings.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemSettings])],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
