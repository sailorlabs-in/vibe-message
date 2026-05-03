import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App as AppEntity } from '../app/app.entity';
import { User } from '../user/user.entity';
import { Notification } from '../push/notification.entity';
import { initServerClient } from 'vibe-message';
import { generateAppId, generateSecretKey } from '../../utils/crypto';
import { getVapidPublicKey } from '../../utils/webPush';

const INTERNAL_APP_NAME = "Admin Panel Notifications";

@Injectable()
export class InternalNotificationService {
  private readonly logger = new Logger(InternalNotificationService.name);

  constructor(
    @InjectRepository(AppEntity)
    private appRepository: Repository<AppEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getOrCreateInternalApp(): Promise<AppEntity> {
    let existingApp = await this.appRepository.findOne({
      where: {
        name: INTERNAL_APP_NAME,
        description: "Internal app for admin panel notifications",
      }
    });

    if (existingApp) {
      return existingApp;
    }

    const superAdmin = await this.userRepository.findOne({
      where: { role: 'SUPER_ADMIN' },
      order: { created_at: 'ASC' }
    });

    if (!superAdmin) {
      throw new Error("No super admin found to create internal app");
    }

    const publicAppId = process.env.ADMIN_APP_ID || generateAppId();
    const secretKey = process.env.ADMIN_SECRET_KEY || generateSecretKey();
    const publicKey = process.env.ADMIN_PUBLIC_KEY || getVapidPublicKey();

    const newApp = this.appRepository.create({
      user_id: superAdmin.id,
      name: INTERNAL_APP_NAME,
      description: "Internal app for admin panel notifications",
      public_app_id: publicAppId,
      public_key: publicKey,
      secret_key: secretKey,
      is_active: true,
    });

    return this.appRepository.save(newApp);
  }

  async notifySuperAdmins(title: string, body: string, data?: any): Promise<void> {
    try {
      const internalApp = await this.getOrCreateInternalApp();

      const superAdmins = await this.userRepository.find({
        where: { role: 'SUPER_ADMIN', status: 'APPROVED' }
      });

      if (superAdmins.length === 0) return;

      const externalUserIds = superAdmins.map(admin => admin.email);

      const vibe = initServerClient({
        baseUrl: process.env.NOTIFICATION_URL || "http://localhost:3000",
        appId: internalApp.public_app_id,
        secretKey: internalApp.secret_key,
      });

      await vibe.notification({
        notificationData: {
          title,
          body,
          icon: "/admin-icon.png",
          data,
        },
        externalUsers: externalUserIds,
      });
    } catch (error) {
      this.logger.error("Failed to notify super admins:", error);
    }
  }

  async notifyUser(userId: number, title: string, body: string, data?: any): Promise<void> {
    try {
      const internalApp = await this.getOrCreateInternalApp();
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        this.logger.error(`User ${userId} not found`);
        return;
      }

      const vibe = initServerClient({
        baseUrl: process.env.NOTIFICATION_URL || "http://localhost:3000",
        appId: internalApp.public_app_id,
        secretKey: internalApp.secret_key,
      });

      await vibe.notification({
        notificationData: {
          title,
          body,
          icon: "/admin-icon.png",
          data,
        },
        externalUsers: [user.email],
      });
    } catch (error) {
      this.logger.error(`Failed to notify user ${userId}:`, error);
    }
  }

  async notifySuperAdminNewUser(userName: string, userEmail: string): Promise<void> {
    await this.notifySuperAdmins(
      "New User Signup",
      `${userName} (${userEmail}) has signed up and is awaiting approval`,
      { type: "new_user", email: userEmail },
    );
  }

  async notifyUserApproved(userId: number, userName: string): Promise<void> {
    await this.notifyUser(
      userId,
      "Account Approved! 🎉",
      `Welcome ${userName}! Your account has been approved. You can now create apps.`,
      { type: "account_approved" },
    );
  }

  async notifyUserBanned(userId: number): Promise<void> {
    await this.notifyUser(
      userId,
      "Account Suspended",
      "Your account has been suspended. Please contact the administrator.",
      { type: "account_banned" },
    );
  }

  async notifyUserWarned(userId: number, message: string): Promise<void> {
    await this.notifyUser(userId, "Warning from Administrator", message, { type: "warning" });
  }

  async notifyUserAppLimitChanged(userId: number, newLimit: number | null): Promise<void> {
    const limitText = newLimit === null ? "unlimited" : newLimit.toString();
    await this.notifyUser(
      userId,
      "App Limit Updated",
      `Your app creation limit has been updated to: ${limitText}`,
    );
  }

  async getAdminNotifications(limit: number = 20): Promise<any[]> {
    const internalApp = await this.getOrCreateInternalApp();

    const notifications = await this.notificationRepository.find({
      where: { app_id: internalApp.id },
      order: { created_at: 'DESC' },
      take: limit,
    });

    return notifications.map(notif => {
      const payload = typeof notif.payload_json === 'string' ? JSON.parse(notif.payload_json) : notif.payload_json;
      return {
        id: notif.id,
        ...payload,
        timestamp: notif.created_at,
      };
    });
  }
}
