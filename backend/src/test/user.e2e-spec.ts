import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import request from 'supertest';
import { RoleType } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { USER_MESSAGES } from 'src/messages/user.messages';
import { createUser, createUserWithToken } from './test-helpers';

function makeUserDto(overrides = {}) {
  const unique = Date.now() + Math.floor(Math.random() * 1000);

  return {
    fullName: 'Test User',
    email: `test_${unique}@email.com`,
    phone: `${unique}`,
    password: 'password123',
    ...overrides,
  };
}

function createMockFile() {
  return {
    originalname: 'avatar.png',
    mimetype: 'image/png',
    buffer: Buffer.from('fake-image'),
  } as Express.Multer.File;
}

describe('User', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await prismaService.user.deleteMany({});
  });

  afterEach(async () => {
    await prismaService.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create()', () => {
    it('deve criar um novo usuario', async () => {
      const userDto = makeUserDto();

      const response = await request(app.getHttpServer()).post('/user').send(userDto);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        email: userDto.email,
        phone: userDto.phone,
        fullName: userDto.fullName,
      });
    });

    it('deve retornar erro 409 caso o email esteja em uso', async () => {
      const existingUser = await createUser(prismaService);

      const userDto = makeUserDto({
        email: existingUser.email,
        phone: existingUser.phone,
      });

      const response = await request(app.getHttpServer()).post('/user').send(userDto);

      expect(response.status).toBe(409);
    });

    it('deve retornar erro 400 se faltar campos obrigatorios', async () => {
      const response = await request(app.getHttpServer()).post('/user').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('findAll()', () => {
    it('deve retornar todos os usuarios para admin', async () => {
      const { token: adminToken } = await createUserWithToken(prismaService, authService, {
        sysRole: RoleType.ADMIN,
      });

      await createUser(prismaService);
      await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar erro 401 caso token seja invalido', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('deve retornar erro 403 caso usuario nao seja admin', async () => {
      const { token: userToken } = await createUserWithToken(prismaService, authService);

      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', 'Bearer ' + userToken);

      expect(response.status).toBe(403);
      expect(response.body.message).toEqual('Forbidden resource');
    });
  });

  describe('findOne()', () => {
    let token: string;

    beforeEach(async () => {
      const res = await createUserWithToken(prismaService, authService);
      token = res.token;
    });

    it('deve retornar o usuario do id correspondente', async () => {
      const { id } = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .get('/user/' + id)
        .set('Authorization', 'Bearer ' + token);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
    });

    it('deve retornar erro 404 caso nao seja encontrado usuario', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/id-invalido')
        .set('Authorization', 'Bearer ' + token);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(USER_MESSAGES.USER_NOT_FOUND);
    });

    it('deve retornar erro 401 caso o token for invalido', async () => {
      const { id } = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .get('/user/' + id)
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized');
    });
  });

  describe('update()', () => {
    it('deve atualizar o usuario com as informações passadas', async () => {
      const { user, token } = await createUserWithToken(prismaService, authService);

      const updateDto: UpdateUserDto = {
        fullName: 'Usuario Atualizado',
        email: 'atualizado@atualizado.com',
        phone: '000000000',
      };

      const response = await request(app.getHttpServer())
        .patch('/user')
        .set('Authorization', 'Bearer ' + token)
        .send(updateDto);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(updateDto.email);
      expect(response.body.phone).toBe(updateDto.phone);
      expect(response.body.fullName).toBe(updateDto.fullName);
    });

    it('deve retornar erro 401 caso o token for invalido', async () => {
      const updateDto: UpdateUserDto = {
        fullName: 'Usuario Atualizado',
      };

      const response = await request(app.getHttpServer())
        .patch('/user')
        .set('Authorization', 'Bearer ')
        .send(updateDto);

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized');
    });
  });

  describe('remove()', () => {
    it('deve remover o usuario caso o token seja admin', async () => {
      const { token: adminToken } = await createUserWithToken(prismaService, authService, {
        sysRole: 'ADMIN',
      });

      const user = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .delete('/user/' + user.id)
        .set('Authorization', 'Bearer ' + adminToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(USER_MESSAGES.DELETE_SUCCESS);

      const deleted = await prismaService.user.findUnique({
        where: { id: user.id },
      });
      expect(deleted).toBeNull();
    });

    it('deve retornar erro 404 caso o usuario nao exista', async () => {
      const { token: adminToken } = await createUserWithToken(prismaService, authService, {
        sysRole: 'ADMIN',
      });

      const response = await request(app.getHttpServer())
        .delete('/user/id-inexistente')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(USER_MESSAGES.USER_NOT_FOUND);
    });

    it('deve retornar erro 401 caso o token for invalido', async () => {
      const user = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .delete('/user/' + user.id)
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('deve retornar erro 403 caso o token nao for admin', async () => {
      const { token } = await createUserWithToken(prismaService, authService);

      const user = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .delete('/user/' + user.id)
        .set('Authorization', 'Bearer ' + token);

      expect(response.status).toBe(403);
      expect(response.body.message).toEqual('Forbidden resource');
    });
  });

  describe('changePassword()', () => {
    it('deve alterar a senha do usuario', async () => {
      const oldPassword = 'password123';
      const newPassword = 'newPassword123';

      const { user, token } = await createUserWithToken(prismaService, authService);

      const response = await request(app.getHttpServer())
        .patch('/user/change-password')
        .set('Authorization', 'Bearer ' + token)
        .send({
          oldPassword,
          newPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(user.id);

      const loginOld = await authService
        .login({
          email: user.email,
          password: oldPassword,
        })
        .catch(() => null);

      expect(loginOld).toBeNull();

      const loginNew = await authService.login({
        email: user.email,
        password: newPassword,
      });

      expect(loginNew.accessToken).toBeDefined();
    });

    it('deve retornar erro 401 caso a senha antiga seja invalida', async () => {
      const { token } = await createUserWithToken(prismaService, authService);

      const response = await request(app.getHttpServer())
        .patch('/user/change-password')
        .set('Authorization', 'Bearer ' + token)
        .send({
          oldPassword: 'senhaErrada',
          newPassword: 'newPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(USER_MESSAGES.INVALID_PASSWORD);
    });

    it('deve retornar erro 401 caso o token for invalido', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user/change-password')
        .set('Authorization', 'Bearer ')
        .send({
          oldPassword: 'password123',
          newPassword: 'newPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized');
    });
  });

  describe('updateRole()', () => {
    it('deve atualizar o role do usuario', async () => {
      const { token: adminToken } = await createUserWithToken(prismaService, authService, {
        sysRole: RoleType.ADMIN,
      });

      const user = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .patch(`/user/${user.id}/role`)
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ sysRole: RoleType.MODERATOR });

      expect(response.status).toBe(200);
      expect(response.body.sysRole).toEqual(RoleType.MODERATOR);
    });

    it('deve retornar erro 404 caso o usuario seja invalido', async () => {
      const { token: adminToken } = await createUserWithToken(prismaService, authService, {
        sysRole: RoleType.ADMIN,
      });

      const response = await request(app.getHttpServer())
        .patch('/user/id-invalido/role')
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ sysRole: RoleType.MODERATOR });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(USER_MESSAGES.USER_NOT_FOUND);
    });

    it('deve retornar erro 400 caso o role seja invalido', async () => {
      const { token: adminToken } = await createUserWithToken(prismaService, authService, {
        sysRole: RoleType.ADMIN,
      });

      const user = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .patch(`/user/${user.id}/role`)
        .set('Authorization', 'Bearer ' + adminToken)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual([
        'sysRole should not be empty',
        'Role must be one of ADMIN, MODERATOR, or MEMBER.',
      ]);
    });

    it('deve retornar erro 403 caso usuario nao seja admin', async () => {
      const { token } = await createUserWithToken(prismaService, authService);

      const user = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .patch(`/user/${user.id}/role`)
        .set('Authorization', 'Bearer ' + token)
        .send({ sysRole: RoleType.MODERATOR });

      expect(response.status).toBe(403);
      expect(response.body.message).toEqual('Forbidden resource');
    });

    it('deve retornar erro 401 caso o token for invalido', async () => {
      const user = await createUser(prismaService);

      const response = await request(app.getHttpServer())
        .patch(`/user/${user.id}/role`)
        .set('Authorization', 'Bearer ')
        .send({ sysRole: RoleType.MODERATOR });

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized');
    });
  });

  describe('updateProfilePicture()', () => {
    it('deve atualizar foto de perfil', async () => {
      const { user, token } = await createUserWithToken(prismaService, authService);

      const file = createMockFile();

      const response = await request(app.getHttpServer())
        .patch('/user/profile-picture')
        .set('Authorization', 'Bearer ' + token)
        .attach('file', file.buffer, file.originalname);

      expect(response.status).toBe(200);
      expect(response.body.profilePicture).toBeDefined();
    });

    it('deve retornar erro 400 se nao enviar arquivo', async () => {
      const { token } = await createUserWithToken(prismaService, authService);

      const response = await request(app.getHttpServer())
        .patch('/user/profile-picture')
        .set('Authorization', 'Bearer ' + token);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Um arquivo é necessário.');
    });
  });
  describe('getProfilePicture()', () => {
    it('deve retornar a imagem de perfil do usuario', async () => {
      const { user, token } = await createUserWithToken(prismaService, authService);

      const file = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        buffer: Buffer.from('fake-image'),
      } as Express.Multer.File;

      await request(app.getHttpServer())
        .patch('/user/profile-picture')
        .set('Authorization', 'Bearer ' + token)
        .attach('file', file.buffer, file.originalname);

      const response = await request(app.getHttpServer()).get(`/user/${user.id}/profile-picture`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['content-disposition']).toContain('inline');
      expect(response.body).toBeDefined();
    });

    it('deve retornar 404 caso usuario nao tenha imagem', async () => {
      const { user } = await createUserWithToken(prismaService, authService);

      const response = await request(app.getHttpServer()).get(`/user/${user.id}/profile-picture`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(USER_MESSAGES.PROFILE_PICTURE_NOT_FOUND);
    });

    it('deve retornar 404 caso usuario nao exista', async () => {
      const response = await request(app.getHttpServer()).get(`/user/id-invalido/profile-picture`);

      expect(response.status).toBe(404);
    });
  });
});
