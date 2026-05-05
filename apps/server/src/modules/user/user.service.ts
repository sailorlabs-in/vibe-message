import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import {
  UserResponse,
  UserStatus,
  UpdateUserStatusRequest,
  UpdateUserRoleRequest,
  UpdateAppLimitRequest,
  CreateWarningRequest,
} from "../../types";
import { User } from "./user.entity";
import { Warning } from "./warning.entity";
import { App } from "../app/app.entity";
import { InternalNotificationService } from "../system/internal-notification.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Warning)
    private warningRepository: Repository<Warning>,
    @InjectRepository(App)
    private appRepository: Repository<App>,
    private internalNotificationService: InternalNotificationService,
  ) {}

  private userToResponse(user: User): UserResponse {
    const { password_hash, ...userResponse } = user as any;
    return userResponse;
  }

  async getAllUsers(statusFilter?: UserStatus): Promise<UserResponse[]> {
    const where = statusFilter ? { status: statusFilter } : {};
    const users = await this.userRepository.find({
      where,
      order: { created_at: "DESC" },
    });
    return users.map((u) => this.userToResponse(u));
  }

  async updateUserStatus(
    userId: number,
    data: UpdateUserStatusRequest,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(
        "User not found or cannot modify super admin",
      );
    }

    user.status = data.status;
    await this.userRepository.save(user);

    try {
      if (data.status === "APPROVED") {
        this.internalNotificationService
          .notifyUserApproved(userId, user.name)
          .catch((err: any) => console.error(err));
      } else if (data.status === "BANNED") {
        this.internalNotificationService
          .notifyUserBanned(userId)
          .catch((err: any) => console.error(err));
      }
    } catch (e) {}

    return this.userToResponse(user);
  }

  async updateUserRole(
    userId: number,
    data: UpdateUserRoleRequest,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.role = data.role;
    if (data.role === "SUPER_ADMIN") {
      user.app_limit = null;
    }
    await this.userRepository.save(user);

    return this.userToResponse(user);
  }

  async updateUserAppLimit(
    userId: number,
    data: UpdateAppLimitRequest,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(
        "User not found or cannot modify super admin",
      );
    }

    user.app_limit = data.appLimit;
    await this.userRepository.save(user);

    try {
      this.internalNotificationService
        .notifyUserAppLimitChanged(userId, data.appLimit)
        .catch((err: any) => console.error(err));
    } catch (e) {}

    return this.userToResponse(user);
  }

  async createWarning(
    userId: number,
    createdBy: number,
    data: CreateWarningRequest,
  ): Promise<Warning> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const warning = this.warningRepository.create({
      user_id: userId,
      message: data.message,
      created_by: createdBy,
    });

    const savedWarning = await this.warningRepository.save(warning);

    try {
      this.internalNotificationService
        .notifyUserWarned(userId, data.message)
        .catch((err: any) => console.error(err));
    } catch (e) {}

    return savedWarning;
  }

  async getUserWarnings(userId: number): Promise<Warning[]> {
    return this.warningRepository.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    });
  }

  async updateUserProfile(
    userId: number,
    name?: string,
    email?: string,
  ): Promise<UserResponse> {
    if (email) {
      const emailCheck = await this.userRepository.findOne({
        where: { email, id: Not(userId) },
      });
      if (emailCheck) {
        throw new ForbiddenException("Email is already in use");
      }
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (!name && !email) {
      throw new BadRequestException(
        "At least one field (name or email) must be provided",
      );
    }

    await this.userRepository.save(user);

    return this.userToResponse(user);
  }

  async updateUserRetentionPermission(
    userId: number,
    canManageRetention: boolean,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.can_manage_retention = canManageRetention;
    await this.userRepository.save(user);

    return this.userToResponse(user);
  }

  async deleteUserAccount(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role === "SUPER_ADMIN") {
      throw new ForbiddenException(
        "Super admin cannot delete their own account",
      );
    }

    await this.userRepository.remove(user);
  }

  async deleteUserBySuperAdmin(
    targetUserId: number,
    superAdminId: number,
  ): Promise<{ deletedAppsCount: number }> {
    const superAdmin = await this.userRepository.findOne({
      where: { id: superAdminId },
    });
    if (!superAdmin || superAdmin.role !== "SUPER_ADMIN") {
      throw new ForbiddenException("Only super admin can delete users");
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException("User not found");
    }

    if (targetUser.role === "SUPER_ADMIN") {
      throw new ForbiddenException("Cannot delete super admin accounts");
    }

    const appsCount = await this.appRepository.count({
      where: { user_id: targetUserId },
    });
    await this.userRepository.remove(targetUser);

    return { deletedAppsCount: appsCount };
  }
}
