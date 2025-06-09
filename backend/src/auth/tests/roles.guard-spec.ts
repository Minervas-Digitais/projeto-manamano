import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';


describe('RolesGuard', () => {
    let rolesGuard: RolesGuard;

    beforeEach(() => {
        const reflector = new Reflector();
        rolesGuard = new RolesGuard(reflector);
    });

    it('should allow access if no roles required', () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ user: { sysRole: 'USER' } }),
            }),
            getHandler: () => null,
            getClass: () => null,
        } as unknown as ExecutionContext;

        const result = rolesGuard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should deny access if role is missing', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
        } as any;

        rolesGuard = new RolesGuard(reflector);

        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ user: { sysRole: 'USER' } }),
            }),
            getHandler: () => null,
            getClass: () => null,
        } as unknown as ExecutionContext;

        const result = rolesGuard.canActivate(context);
        expect(result).toBe(false);
    });

    it('should allow access if role matches', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['USER']),
        } as any;

        rolesGuard = new RolesGuard(reflector);

        const context = {
            switchToHttp: () => ({
                getRequest: () => ({ user: { sysRole: 'USER' } }),
            }),
            getHandler: () => null,
            getClass: () => null,
        } as unknown as ExecutionContext;

        const result = rolesGuard.canActivate(context);
        expect(result).toBe(true);
    });
});
