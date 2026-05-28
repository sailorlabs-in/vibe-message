import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { config } from "../../config/env";
import {
  UserResponse,
  SignupRequest,
  LoginRequest,
  AuthResponse,
  JwtPayload,
} from "../../types";
import { User } from "../user/user.entity";
import { RedisService } from "../redis/redis.service";
import { MailService } from "../mail/mail.service";

import { InternalNotificationService } from "../system/internal-notification.service";

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const RESET_TOKEN_PREFIX = "pwd_reset:";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private internalNotificationService: InternalNotificationService,
    private redisService: RedisService,
    private mailService: MailService,
  ) {}

  private userToResponse(user: User): UserResponse {
    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    return jwt.sign(payload, config.jwt.secret, { expiresIn: "7d" });
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const { name, email, password } = data;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = this.userRepository.create({
      name,
      email,
      password_hash,
      role: "ADMIN",
      status: "PENDING",
      app_limit: 5,
    });

    await this.userRepository.save(user);

    const token = this.generateToken(user);

    try {
      this.internalNotificationService
        .notifySuperAdminNewUser(name, email)
        .catch((err: any) =>
          console.error("Failed to send new user notification:", err),
        );
    } catch (e) {}

    return { token, user: this.userToResponse(user) };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.generateToken(user);

    return { token, user: this.userToResponse(user) };
  }

  async getUserById(userId: number): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.userToResponse(user);
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.role === "SUPER_ADMIN") {
      throw new BadRequestException(
        "Super admins cannot delete their own accounts",
      );
    }
    await this.userRepository.remove(user);
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.save(user);
  }

  async forgotPassword(email: string): Promise<void> {
    // Always resolve successfully to prevent email enumeration
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const redisKey = `${RESET_TOKEN_PREFIX}${token}`;

    await this.redisService.client.set(
      redisKey,
      String(user.id),
      "EX",
      RESET_TOKEN_TTL_SECONDS,
    );

    const frontendUrl = config.frontendUrl;
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.mailService.sendPasswordResetEmail(user.email, {
        name: user.name,
        resetUrl,
      });
    } catch (err) {
      // Don't leak errors — just log
      console.error("Failed to send password reset email:", err);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const redisKey = `${RESET_TOKEN_PREFIX}${token}`;
    const userIdStr = await this.redisService.client.get(redisKey);

    if (!userIdStr) {
      throw new BadRequestException(
        "Invalid or expired password reset token. Please request a new one.",
      );
    }

    const userId = parseInt(userIdStr, 10);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.save(user);

    // Invalidate the token immediately after use
    await this.redisService.client.del(redisKey);
  }
}
