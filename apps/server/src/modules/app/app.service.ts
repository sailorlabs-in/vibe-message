import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App as AppEntity } from './app.entity';
import { User } from '../user/user.entity';
import { AppWithStats, CreateAppRequest, UpdateAppRequest, UserRole } from '../../types';
import { generateAppId, generateSecretKey } from '../../utils/crypto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AppEntity)
    private appRepository: Repository<AppEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserApps(userId: number, role: UserRole, targetUserId?: number): Promise<AppEntity[]> {
    const filterId = (role === 'SUPER_ADMIN' && targetUserId) ? targetUserId : userId;
    return this.appRepository.find({
      where: { user_id: filterId },
      order: { created_at: 'DESC' },
    });
  }

  async getAppById(publicAppId: string, userId: number, role: UserRole): Promise<AppWithStats> {
    const queryBuilder = this.appRepository.createQueryBuilder('a')
      .leftJoin('a.devices', 'dt', 'dt.is_active = true')
      .leftJoin('a.notifications', 'n')
      .select(['a.*', 'COUNT(DISTINCT dt.id) as device_count', 'COUNT(DISTINCT n.id) as notification_count'])
      .where('a.public_app_id = :publicAppId', { publicAppId });

    if (role !== 'SUPER_ADMIN') {
      queryBuilder.andWhere('a.user_id = :userId', { userId });
    }

    queryBuilder.groupBy('a.id');

    const result = await queryBuilder.getRawOne();

    if (!result) {
      throw new NotFoundException('App not found');
    }

    // Map raw result to entity format
    const app = new AppEntity();
    Object.assign(app, result);
    // Strip raw prefix from fields like a_id -> id
    for (const key in result) {
      if (key.startsWith('a_')) {
        (app as any)[key.replace('a_', '')] = result[key];
      }
    }

    return {
      ...app as unknown as AppWithStats,
      device_count: parseInt(result.device_count || '0', 10),
      notification_count: parseInt(result.notification_count || '0', 10),
    };
  }

  async createApp(userId: number, data: CreateAppRequest): Promise<AppEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'APPROVED' && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Your account must be approved to create apps');
    }

    if (user.app_limit !== null) {
      const currentCount = await this.appRepository.count({ where: { user_id: userId } });
      if (currentCount >= user.app_limit) {
        throw new ForbiddenException(`You have reached your app limit of ${user.app_limit}`);
      }
    }

    const app = this.appRepository.create({
      user_id: userId,
      name: data.name,
      description: data.description || null,
      public_app_id: generateAppId(),
      public_key: generateSecretKey(),
      secret_key: generateSecretKey(),
    });

    return this.appRepository.save(app);
  }

  async updateApp(publicAppId: string, userId: number, role: UserRole, data: UpdateAppRequest): Promise<AppEntity> {
    const app = await this.appRepository.findOne({ where: { public_app_id: publicAppId } });
    
    if (!app || (role !== 'SUPER_ADMIN' && app.user_id !== userId)) {
      throw new NotFoundException('App not found');
    }

    if (data.retention_days !== undefined && role !== 'SUPER_ADMIN') {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user?.can_manage_retention) {
        throw new ForbiddenException('You do not have permission to change the auto-delete retention period.');
      }
    }

    if (data.name !== undefined) app.name = data.name;
    if (data.description !== undefined) app.description = data.description;
    if (data.is_active !== undefined) app.is_active = data.is_active;
    if (data.retention_days !== undefined) app.retention_days = data.retention_days;

    return this.appRepository.save(app);
  }

  async rotateAppSecret(publicAppId: string, userId: number, role: UserRole): Promise<AppEntity> {
    const app = await this.appRepository.findOne({ where: { public_app_id: publicAppId } });
    
    if (!app || (role !== 'SUPER_ADMIN' && app.user_id !== userId)) {
      throw new NotFoundException('App not found');
    }

    app.secret_key = generateSecretKey();
    return this.appRepository.save(app);
  }

  async deleteApp(publicAppId: string, userId: number, role: UserRole): Promise<void> {
    const app = await this.appRepository.findOne({ where: { public_app_id: publicAppId } });
    
    if (!app || (role !== 'SUPER_ADMIN' && app.user_id !== userId)) {
      throw new NotFoundException('App not found');
    }

    await this.appRepository.remove(app);
  }

  async getAppByPublicId(publicAppId: string): Promise<AppEntity | null> {
    return this.appRepository.findOne({ where: { public_app_id: publicAppId, is_active: true } });
  }

  async validateAppCredentials(publicAppId: string, secretKey: string): Promise<AppEntity> {
    const app = await this.appRepository.findOne({ where: { public_app_id: publicAppId, secret_key: secretKey } });

    if (!app) {
      throw new ForbiddenException('Invalid app credentials');
    }

    if (!app.is_active) {
      throw new ForbiddenException('app is not activated');
    }

    return app;
  }

  async validateSdkCredentials(publicAppId: string, publicKey: string): Promise<AppEntity> {
    const app = await this.appRepository.findOne({ where: { public_app_id: publicAppId, public_key: publicKey } });

    if (!app) {
      throw new ForbiddenException('Invalid SDK credentials');
    }

    if (!app.is_active) {
      throw new ForbiddenException('app is not activated');
    }

    return app;
  }
}
