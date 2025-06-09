import * as bcrypt from 'bcrypt';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthEntity } from './entity/auth.entity';
import { PrismaService } from '../prisma/prisma.service';


describe('AuthService', () => {
    let authService: AuthService;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [AuthService, PrismaService, JwtService],
        }).compile();

        authService = moduleRef.get(AuthService);
        prismaService = moduleRef.get(PrismaService);
        jwtService = moduleRef.get(JwtService);

        // Create a test user
        const existing = await prismaService.user.findUnique({
            where: { email: 'testuser@example.com' },
        });

        if (!existing) {
            await prismaService.user.create({
                data: {
                    fullName: 'Test User',
                    email: 'testuser@example.com',
                    phone: '0000000000',
                    hash: await bcrypt.hash('password123', 10),
                },
            });
        }
    });

    afterAll(async () => {
        await prismaService.user.deleteMany({
            where: { email: { contains: 'testuser' } },
        });
        await prismaService.$disconnect();
    });

    it('should login successfully with correct credentials', async () => {
        const loginDto: LoginDto = {
            email: 'testuser@example.com',
            password: 'password123',
        };

        const result: AuthEntity | any = await authService.login(loginDto);

        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('loggedId');
    });

    it('should return NotFoundException for non-existing user', async () => {
        const loginDto: LoginDto = {
            email: 'nonexistent@example.com',
            password: 'password123',
        };

        const result: any = await authService.login(loginDto);

        expect(result.status).toBe(404);
        expect(result.message).toBe('Usuário não encontrado.');
    });

    it('should return UnauthorizedException for invalid password', async () => {
        const loginDto: LoginDto = {
            email: 'testuser@example.com',
            password: 'wrongpassword',
        };

        const result: any = await authService.login(loginDto);

        expect(result.status).toBe(401);
        expect(result.message).toBe('Senha incorreta.');
    });
});
