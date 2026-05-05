import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class ApprovedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.role === "SUPER_ADMIN") {
      return true;
    }

    if (user.status !== "APPROVED") {
      throw new ForbiddenException(
        "Your account is pending approval or has been banned",
      );
    }

    return true;
  }
}
