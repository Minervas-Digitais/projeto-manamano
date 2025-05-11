import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';

export async function getUserToken(app: INestApplication, prisma: PrismaService) {
  const email = 'testuser@example.com';

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await request(app.getHttpServer())
      .post('/user')
      .send({
        fullName: 'Test User',
        email,
        phone: '1234567890',
        hash: 'password123',
      })
      .expect(201);
  }

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      password: 'password123',
    })
    .expect(201);

  return loginResponse.body.accessToken;
}

export async function getAdminToken(app: INestApplication, prisma: PrismaService) {
  const email = 'admin@example.com';

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.create({
      data: {
        fullName: 'Admin User',
        email,
        phone: '1111111111',
        hash: hashedPassword,
        sysRole: RoleType.ADMIN,
      },
    });
  }

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      password: 'password123',
    })
    .expect(201);

  return loginResponse.body.accessToken;
}

export async function createTestGroup(app: INestApplication, adminToken: string) {
  const response = await request(app.getHttpServer())
    .post('/group')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Test Group',
      description: 'Descrição teste',
    })

    console.log(response.body)

  return response.body.id;
}