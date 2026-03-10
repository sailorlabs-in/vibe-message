import { Request, Response, NextFunction } from 'express';
import { UserRole, UserStatus } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

export const requireApproved = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError());
  }

  // Super admin is always approved
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (req.user.status !== 'APPROVED') {
    return next(
      new ForbiddenError(
        'Your account is pending approval or has been banned'
      )
    );
  }

  next();
};
