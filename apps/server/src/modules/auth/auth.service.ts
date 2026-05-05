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
import { config } from "../../config/env";
import {
  UserResponse,
  SignupRequest,
  LoginRequest,
  AuthResponse,
  JwtPayload,
} from "../../types";
import { User } from "../user/user.entity";

import { InternalNotificationService } from "../system/internal-notification.service";

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private internalNotificationService: InternalNotificationService,
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
}
