import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { ApprovedGuard } from './approved.guard';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles, ROLES_KEY } from '../decorators/roles.decorator';
import { config } from '../../config/env';

describe('Common Guards & Decorators', () => {
  const createMockContext = (request: any, handler?: any, targetClass?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
      getHandler: () => handler || (() => {}),
      getClass: () => targetClass || class {},
      getArgs: () => [],
      getArgByIndex: () => ({}),
      switchToRpc: () => ({}) as any,
      switchToWs: () => ({}) as any,
      getType: () => 'http',
    } as unknown as ExecutionContext;
  };

  describe('Roles Decorator', () => {
    it('should set roles metadata', () => {
      class TestController {
        @Roles('ADMIN', 'SUPER_ADMIN')
        testMethod() {}
      }
      const roles = Reflect.getMetadata(ROLES_KEY, TestController.prototype.testMethod);
      expect(roles).toEqual(['ADMIN', 'SUPER_ADMIN']);
    });
  });

  describe('ApprovedGuard', () => {
    let guard: ApprovedGuard;

    beforeEach(() => {
      guard = new ApprovedGuard();
    });

    it('should throw UnauthorizedException if no user on request', () => {
      const ctx = createMockContext({});
      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('should allow SUPER_ADMIN regardless of status', () => {
      const ctx = createMockContext({ user: { role: 'SUPER_ADMIN', status: 'PENDING' } });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow APPROVED user', () => {
      const ctx = createMockContext({ user: { role: 'ADMIN', status: 'APPROVED' } });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw ForbiddenException if user is PENDING or BANNED', () => {
      const ctxPending = createMockContext({ user: { role: 'ADMIN', status: 'PENDING' } });
      expect(() => guard.canActivate(ctxPending)).toThrow(ForbiddenException);

      const ctxBanned = createMockContext({ user: { role: 'ADMIN', status: 'BANNED' } });
      expect(() => guard.canActivate(ctxBanned)).toThrow(ForbiddenException);
    });
  });

  describe('AuthGuard', () => {
    let guard: AuthGuard;

    beforeEach(() => {
      guard = new AuthGuard();
    });

    it('should throw UnauthorizedException if authorization header is missing or malformed', () => {
      expect(() => guard.canActivate(createMockContext({ headers: {} }))).toThrow(
        UnauthorizedException
      );
      expect(() =>
        guard.canActivate(createMockContext({ headers: { authorization: 'Basic 123' } }))
      ).toThrow(UnauthorizedException);
    });

    it('should verify token and attach user to request', () => {
      const payload = { userId: 1, email: 'user@test.com', role: 'ADMIN', status: 'APPROVED' };
      const token = jwt.sign(payload, config.jwt.secret);
      const req: any = { headers: { authorization: `Bearer ${token}` } };
      const ctx = createMockContext(req);

      expect(guard.canActivate(ctx)).toBe(true);
      expect(req.user.userId).toBe(1);
      expect(req.user.email).toBe('user@test.com');
    });

    it('should throw UnauthorizedException on invalid jwt signature', () => {
      const token = jwt.sign({ userId: 1 }, 'wrong-secret');
      const req: any = { headers: { authorization: `Bearer ${token}` } };
      const ctx = createMockContext(req);

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on general error', () => {
      const req: any = { headers: { authorization: 'Bearer malformed.token.string' } };
      const ctx = createMockContext(req);

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });
  });

  describe('RolesGuard', () => {
    let reflector: Reflector;
    let guard: RolesGuard;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    it('should allow access if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const ctx = createMockContext({});
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw UnauthorizedException if user is missing', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const ctx = createMockContext({});
      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if user role is insufficient', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPER_ADMIN']);
      const ctx = createMockContext({ user: { role: 'ADMIN' } });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should allow access if user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPER_ADMIN', 'ADMIN']);
      const ctx = createMockContext({ user: { role: 'ADMIN' } });
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });
});

