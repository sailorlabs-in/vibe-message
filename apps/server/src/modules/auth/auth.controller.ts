import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  SignupDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from "./dto/auth.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthGuard } from "../../common/guards/auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";

// We import userService dynamically in routes to prevent circular dependency,
// but in Nest we should properly inject UserService later.
import { UserService } from "../user/user.service";

@ApiTags("Internal App APIs")
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post("signup")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  async signup(@Body() signupDto: SignupDto) {
    const result = await this.authService.signup(signupDto);
    return { success: true, data: result };
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "Login successful" })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return { success: true, data: result };
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@Request() req: any) {
    const user = await this.authService.getUserById(req.user.userId);
    return { success: true, data: user };
  }

  @Patch("profile")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Update user profile" })
  async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.userService.updateUserProfile(
      req.user.userId,
      updateProfileDto.name,
      updateProfileDto.email,
    );
    return {
      success: true,
      data: user,
      message: "Profile updated successfully",
    };
  }

  @Delete("account")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete user account" })
  async deleteAccount(@Request() req: any) {
    await this.userService.deleteUserAccount(req.user.userId);
    return { success: true, message: "Account deleted successfully" };
  }

  @Patch("change-password")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Change user password" })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(
      req.user.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    return { success: true, message: "Password changed successfully" };
  }
}
