import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import { App as AppEntity } from "./app.entity";
import { AppMember } from "./app-member.entity";
import { User } from "../user/user.entity";
import {
  AppWithStats,
  CreateAppRequest,
  UpdateAppRequest,
  UserRole,
} from "../../types";
import { generateAppId, generateSecretKey } from "../../utils/crypto";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AppEntity)
    private appRepository: Repository<AppEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AppMember)
    private appMemberRepository: Repository<AppMember>,
    private redisService: RedisService,
  ) {}

  private getCacheKey(publicAppId: string): string {
    return `vibe:app:public_id:${publicAppId}`;
  }

  private async invalidateCache(publicAppId: string): Promise<void> {
    try {
      await this.redisService.client.del(this.getCacheKey(publicAppId));
    } catch (err) {
      console.error("[App Service] Redis delete cache error:", err);
    }
  }

  async getUserApps(
    userId: number,
    role: UserRole,
    targetUserId?: number,
  ): Promise<AppEntity[]> {
    const filterId =
      role === "SUPER_ADMIN" && targetUserId ? targetUserId : userId;

    return this.appRepository
      .createQueryBuilder("a")
      .leftJoin("app_members", "am", "am.app_id = a.id")
      .where("a.user_id = :filterId", { filterId })
      .orWhere("am.user_id = :filterId", { filterId })
      .orderBy("a.created_at", "DESC")
      .getMany();
  }

  async getAppById(
    publicAppId: string,
    userId: number,
    role: UserRole,
  ): Promise<AppWithStats> {
    const queryBuilder = this.appRepository
      .createQueryBuilder("a")
      .leftJoin("a.devices", "dt", "dt.is_active = true")
      .leftJoin("a.notifications", "n")
      .leftJoin("app_members", "am", "am.app_id = a.id")
      .select([
        "a.*",
        "COUNT(DISTINCT dt.id) as device_count",
        "COUNT(DISTINCT n.id) as notification_count",
      ])
      .where("a.public_app_id = :publicAppId", { publicAppId });

    if (role !== "SUPER_ADMIN") {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("a.user_id = :userId", { userId })
            .orWhere("am.user_id = :userId", { userId });
        })
      );
    }

    queryBuilder.groupBy("a.id");

    const result = await queryBuilder.getRawOne();

    if (!result) {
      throw new NotFoundException("App not found");
    }

    // Map raw result to entity format
    const app = new AppEntity();
    Object.assign(app, result);
    // Strip raw prefix from fields like a_id -> id
    for (const key in result) {
      if (key.startsWith("a_")) {
        (app as any)[key.replace("a_", "")] = result[key];
      }
    }

    // Resolve currentUserRole
    let currentUserRole: "owner" | "moderator" | "viewer" | "superadmin" = "viewer";
    if (role === "SUPER_ADMIN") {
      currentUserRole = "superadmin";
    } else if (app.user_id === userId) {
      currentUserRole = "owner";
    } else {
      const member = await this.appMemberRepository.findOne({
        where: { app_id: app.id, user_id: userId },
      });
      if (member) {
        currentUserRole = member.role;
      }
    }

    return {
      ...(app as unknown as AppWithStats),
      device_count: parseInt(result.device_count || "0", 10),
      notification_count: parseInt(result.notification_count || "0", 10),
      currentUserRole,
    };
  }

  async createApp(userId: number, data: CreateAppRequest): Promise<AppEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.status !== "APPROVED" && user.role !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "Your account must be approved to create apps",
      );
    }

    if (user.app_limit !== null) {
      const currentCount = await this.appRepository.count({
        where: { user_id: userId },
      });
      if (currentCount >= user.app_limit) {
        throw new ForbiddenException(
          `You have reached your app limit of ${user.app_limit}`,
        );
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

  private async checkAppAccessAndRole(
    publicAppId: string,
    userId: number,
    role: UserRole,
  ): Promise<{ app: AppEntity; currentUserRole: "owner" | "moderator" | "viewer" | "superadmin" }> {
    const app = await this.appRepository.findOne({
      where: { public_app_id: publicAppId },
    });

    if (!app) {
      throw new NotFoundException("App not found");
    }

    if (role === "SUPER_ADMIN") {
      return { app, currentUserRole: "superadmin" };
    }

    if (app.user_id === userId) {
      return { app, currentUserRole: "owner" };
    }

    const member = await this.appMemberRepository.findOne({
      where: { app_id: app.id, user_id: userId },
    });

    if (!member) {
      throw new NotFoundException("App not found");
    }

    return { app, currentUserRole: member.role };
  }

  async updateApp(
    publicAppId: string,
    userId: number,
    role: UserRole,
    data: UpdateAppRequest,
  ): Promise<AppEntity> {
    const { app, currentUserRole } = await this.checkAppAccessAndRole(publicAppId, userId, role);

    if (currentUserRole === "viewer") {
      throw new ForbiddenException("You do not have permission to edit this app");
    }

    if (data.retention_days !== undefined && currentUserRole !== "superadmin") {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user?.can_manage_retention) {
        throw new ForbiddenException(
          "You do not have permission to change the auto-delete retention period.",
        );
      }
    }

    if (data.name !== undefined) app.name = data.name;
    if (data.description !== undefined) app.description = data.description;
    if (data.is_active !== undefined) app.is_active = data.is_active;
    if (data.retention_days !== undefined)
      app.retention_days = data.retention_days;

    const saved = await this.appRepository.save(app);
    await this.invalidateCache(publicAppId);
    return saved;
  }

  async rotateAppSecret(
    publicAppId: string,
    userId: number,
    role: UserRole,
  ): Promise<AppEntity> {
    const { app, currentUserRole } = await this.checkAppAccessAndRole(publicAppId, userId, role);

    if (currentUserRole !== "superadmin" && currentUserRole !== "owner") {
      throw new ForbiddenException("Only the owner can rotate the secret key");
    }

    app.secret_key = generateSecretKey();
    const saved = await this.appRepository.save(app);
    await this.invalidateCache(publicAppId);
    return saved;
  }

  async deleteApp(
    publicAppId: string,
    userId: number,
    role: UserRole,
  ): Promise<void> {
    const { app, currentUserRole } = await this.checkAppAccessAndRole(publicAppId, userId, role);

    if (currentUserRole !== "superadmin" && currentUserRole !== "owner") {
      throw new ForbiddenException("Only the owner can delete this app");
    }

    await this.appRepository.remove(app);
    await this.invalidateCache(publicAppId);
  }

  async getAppMembers(
    publicAppId: string,
    userId: number,
    role: UserRole,
  ) {
    const { app } = await this.checkAppAccessAndRole(publicAppId, userId, role);

    const owner = await this.userRepository.findOne({
      where: { id: app.user_id },
    });

    const dbMembers = await this.appMemberRepository.find({
      where: { app_id: app.id },
      relations: ["user"],
    });

    const membersList: any[] = [];
    if (owner) {
      membersList.push({
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: "owner",
        joined_at: app.created_at,
      });
    }

    for (const m of dbMembers) {
      if (m.user) {
        membersList.push({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
          joined_at: m.created_at,
        });
      }
    }

    return membersList;
  }

  async shareApp(
    publicAppId: string,
    userId: number,
    role: UserRole,
    email: string,
    shareRole: "moderator" | "viewer",
  ) {
    const { app, currentUserRole } = await this.checkAppAccessAndRole(publicAppId, userId, role);

    if (currentUserRole !== "superadmin" && currentUserRole !== "owner") {
      throw new ForbiddenException("Only the owner can share this app");
    }

    const targetUser = await this.userRepository.findOne({
      where: { email },
    });

    if (!targetUser) {
      throw new NotFoundException("User with this email not found");
    }

    if (targetUser.id === app.user_id) {
      throw new BadRequestException("This user is already the owner of the app");
    }

    const existingMember = await this.appMemberRepository.findOne({
      where: { app_id: app.id, user_id: targetUser.id },
    });

    if (existingMember) {
      throw new BadRequestException("This user is already a member of this app");
    }

    const newMember = this.appMemberRepository.create({
      app_id: app.id,
      user_id: targetUser.id,
      role: shareRole,
    });

    await this.appMemberRepository.save(newMember);
    return {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: shareRole,
      joined_at: newMember.created_at || new Date(),
    };
  }

  async updateAppMemberRole(
    publicAppId: string,
    userId: number,
    role: UserRole,
    memberUserId: number,
    shareRole: "moderator" | "viewer",
  ) {
    const { app, currentUserRole } = await this.checkAppAccessAndRole(publicAppId, userId, role);

    if (currentUserRole !== "superadmin" && currentUserRole !== "owner") {
      throw new ForbiddenException("Only the owner can manage members");
    }

    const member = await this.appMemberRepository.findOne({
      where: { app_id: app.id, user_id: memberUserId },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    member.role = shareRole;
    await this.appMemberRepository.save(member);
    return { success: true };
  }

  async removeAppMember(
    publicAppId: string,
    userId: number,
    role: UserRole,
    memberUserId: number,
  ) {
    const { app, currentUserRole } = await this.checkAppAccessAndRole(publicAppId, userId, role);

    if (currentUserRole !== "superadmin" && currentUserRole !== "owner") {
      throw new ForbiddenException("Only the owner can manage members");
    }

    const member = await this.appMemberRepository.findOne({
      where: { app_id: app.id, user_id: memberUserId },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    await this.appMemberRepository.remove(member);
    return { success: true };
  }

  async getAppByPublicId(publicAppId: string): Promise<AppEntity | null> {
    const cacheKey = this.getCacheKey(publicAppId);
    
    try {
      const cached = await this.redisService.client.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        const app = new AppEntity();
        Object.assign(app, data);
        return app;
      }
    } catch (err) {
      console.error("[App Service] Redis read error:", err);
    }

    const app = await this.appRepository.findOne({
      where: { public_app_id: publicAppId, is_active: true },
    });

    if (app) {
      try {
        await this.redisService.client.set(
          cacheKey,
          JSON.stringify(app),
          "PX",
          3600000 // Cache for 1 hour
        );
      } catch (err) {
        console.error("[App Service] Redis write error:", err);
      }
    }

    return app;
  }

  async validateAppCredentials(
    publicAppId: string,
    secretKey: string,
  ): Promise<AppEntity> {
    const app = await this.getAppByPublicId(publicAppId);

    if (!app || app.secret_key !== secretKey) {
      throw new ForbiddenException("Invalid app credentials");
    }

    if (!app.is_active) {
      throw new ForbiddenException("app is not activated");
    }

    return app;
  }

  async validateSdkCredentials(
    publicAppId: string,
    publicKey: string,
  ): Promise<AppEntity> {
    const app = await this.getAppByPublicId(publicAppId);

    if (!app || app.public_key !== publicKey) {
      throw new ForbiddenException("Invalid SDK credentials");
    }

    if (!app.is_active) {
      throw new ForbiddenException("app is not activated");
    }

    return app;
  }
}
