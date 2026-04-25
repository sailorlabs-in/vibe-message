import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Warning } from './warning.entity';
import { App } from '../app/app.entity';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Warning, App]), forwardRef(() => SystemModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
