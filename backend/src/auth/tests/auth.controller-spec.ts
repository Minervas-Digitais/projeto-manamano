import * as bcrypt from 'bcrypt';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthEntity } from './entity/auth.entity';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';


describe('AuthController', () => {
    let authController: AuthController;
    let prismaService: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, PrismaService, JwtService],
        }).compile();

        authController = moduleRef.get(AuthController);
        prismaService = moduleRef.get(PrismaService);

        const existing = await prismaService.user.findUnique({
            where: { email: 'testcontroller@example.com' },
        });

        if (!existing) {
            await prismaService.user.create({
                data: {
                    fullName: 'Controller Test User',
                    email: 'testcontroller@example.com',
                    phone: '1111111111',
                    hash: await bcrypt.hash('pass123', 10),
                },
            });
        }
    });

    afterAll(async () => {
        await prismaService.user.deleteMany({
            where: { email: { contains: 'testcontroller' } },
        });
        await prismaService.$disconnect();
    });

    it('should login via controller', async () => {
        const loginDto: LoginDto = {
            email: 'testcontroller@example.com',
            password: 'pass123',
        };

        const result: AuthEntity | any = await authController.login(loginDto);

        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('loggedId');
    });
});
