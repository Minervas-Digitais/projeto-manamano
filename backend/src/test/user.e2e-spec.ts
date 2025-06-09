import { Body, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import {
    createTestUser,
    createUserDto,
    getAdminToken,
    getUserToken,
} from 'src/test/test-helpers';
import { RoleType } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

describe('User', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;
    let adminToken: string;
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

        await prismaService.file.deleteMany({});
        await prismaService.post.deleteMany({});
        await prismaService.user.deleteMany({});

        userToken = await getUserToken(authService, prismaService);
        adminToken = await getAdminToken(authService, prismaService);
    });

    describe("create()", () => {
        it('deve criar um novo usuario', async () => {
            const userDto: CreateUserDto = await createUserDto({ phone: '92847281', email: 'novoUsuarioEmail@email.com' })

            const response = await request(app.getHttpServer())
                .post('/user')
                .set('Authorization', 'Bearer ' + userToken)
                .send(userDto);

            await prismaService.user.delete({
                where: {
                    id: response.body.id,
                },
            });
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("id")
            expect(response.body.email).toBe(userDto.email)
            expect(response.body.phone).toBe(userDto.phone)
            expect(response.body.fullName).toBe(userDto.fullName)


        })

        it("deve retornar erro 409 caso o email esteja em uso", async () => {
            const phone = '123456789'
            const email = 'email@email.com'
            const userDto = await createUserDto({ phone: phone, email: email })
            const userId = await createTestUser(prismaService, phone, email);

            const response = await request(app.getHttpServer())
                .post('/user')
                .set('Authorization', 'Bearer ' + userToken)
                .send(userDto);

            await prismaService.user.delete({
                where: {
                    id: userId,
                },
            });

            expect(response.status).toBe(409)
            expect(response.body.message).toEqual('Email ou telefone já está em uso.')
        })
    })

    describe("findAll()", () => {
        it('deve retornar todos os usuarios para alguem com token admin', async () => {
            const respose = await request(app.getHttpServer())
                .get('/user')
                .set('Authorization', 'Bearer ' + adminToken)

            expect(respose.statusCode).toBe(200)
            expect(respose.body.length).toBeGreaterThan(0)
        })

        it("deve retornar erro 401 caso o token for invalido", async () => {
            const response = await request(app.getHttpServer())
                .get('/user')
                .set('Authorization', 'Bearer ')

            expect(response.status).toBe(401)
            expect(response.body.message).toEqual('Unauthorized')
        })

        it("deve retornar erro 403 caso o token nao for admin", async () => {
            const response = await request(app.getHttpServer())
                .get('/user')
                .set('Authorization', 'Bearer ' + userToken)

            expect(response.status).toBe(403)
            expect(response.body.message).toEqual('Forbidden resource')
        })
    })

    describe("findOne()", () => {
        it("deve retornar o usuario do id correspondente", async () => {
            const userId = await createTestUser(prismaService);

            const response = await request(app.getHttpServer())
                .get('/user/' + userId)
                .set('Authorization', 'Bearer ' + userToken)

            expect(response.status).toBe(200)
            expect(response.body.id).toBe(userId)
        })

        it("deve retornar erro 404 caso nao seja encontrado usuario", async () => {
            const userId = 'grupoNaoCriado'

            const response = await request(app.getHttpServer())
                .get('/user/' + userId)
                .set('Authorization', 'Bearer ' + userToken)

            expect(response.status).toBe(404)
            expect(response.body.message).toBe('Usuário não encontrado.')
        })

        it("deve retornar erro 401 caso o token for invalido", async () => {
            const userId = await createTestUser(prismaService);
            const response = await request(app.getHttpServer())
                .get('/user/' + userId)
                .set('Authorization', 'Bearer ')

            expect(response.status).toBe(401)
            expect(response.body.message).toEqual('Unauthorized')
        })
    })

    describe("update()", () => {
        it("deve atualizar o usuario com as informações passadas", async () => {
            const userId = await createTestUser(prismaService);
            const updateDto: UpdateUserDto = {
                fullName: 'Usuario Atualizado',
                email: "atualizado@atualizado.com",
                phone: "000000000",
            }

            const response = await request(app.getHttpServer())
                .patch('/user/' + userId)
                .set('Authorization', 'Bearer ' + userToken)
                .send(updateDto)

            expect(response.status).toBe(201)
            expect(response.body.id).toBe(userId)
            expect(response.body.email).toBe(updateDto.email)
            expect(response.body.phone).toBe(updateDto.phone)
            expect(response.body.fullName).toBe(updateDto.fullName)
        })

        it('deve retornar erro 404 ao tentar atualizar um usuário inexistente', async () => {
            const userId = 'usuarioInexistente';
            const updateDto: UpdateUserDto = {
                fullName: 'Usuario Atualizado',
                email: "atualizado@atualizado.com",
                phone: "000000000",
            }

            const response = await request(app.getHttpServer())
                .patch('/user/' + userId)
                .set('Authorization', 'Bearer ' + userToken)
                .send(updateDto)

            expect(response.status).toBe(404)
            expect(response.body.message).toEqual('Usuário não encontrado.')
        })

        it("deve retornar erro 401 caso o token for invalido", async () => {
            const userId = await createTestUser(prismaService);
            const updateDto: UpdateUserDto = {
                fullName: 'Usuario Atualizado'
            }

            const response = await request(app.getHttpServer())
                .patch('/user/' + userId)
                .set('Authorization', 'Bearer ')
                .send(updateDto)

            expect(response.status).toBe(401)
            expect(response.body.message).toEqual('Unauthorized')
        })
    })

    describe("remove()", () => {
        it("deve remover o usuario caso o token seja adm", async () => {
            const userId = await createTestUser(prismaService);

            const response = await request(app.getHttpServer())
                .delete('/user/' + userId)
                .set('Authorization', 'Bearer ' + adminToken)

            expect(response.statusCode).toBe(200)
            expect(response.body).toEqual({})
            expect(response.text).toBe('Usuário deletado com sucesso.')

        })

        it("deve retornar erro 404 caso o usuario nao exista", async () => {
            const userId = 'idInexistente';

            const response = await request(app.getHttpServer())
                .delete('/user/' + userId)
                .set('Authorization', 'Bearer ' + adminToken)

            expect(response.statusCode).toBe(404)
            expect(response.body.message).toBe('Usuário não encontrado.')
        })

        it("deve retornar erro 401 caso o token for invalido", async () => {
            const userId = await createTestUser(prismaService);

            const response = await request(app.getHttpServer())
                .delete('/user/' + userId)
                .set('Authorization', 'Bearer ')

            expect(response.status).toBe(401)
            expect(response.body.message).toEqual('Unauthorized')
        })

        it("deve retornar erro 403 caso o token nao for admin", async () => {
            const userId = await createTestUser(prismaService);
            const response = await request(app.getHttpServer())
                .delete('/user/' + userId)
                .set('Authorization', 'Bearer ' + userToken)

            expect(response.status).toBe(403)
            expect(response.body.message).toEqual('Forbidden resource')
        })
    })

    describe("changePassword()", () => {
        it("deve alterar a senha do usuario", async () => {
            const oldPassword = 'password123'
            const newPassword = 'newPassword123'

            const hashedPassword = await bcrypt.hash(oldPassword, 10);
            const user = await prismaService.user.create({
                data: {
                    fullName: 'Test User',
                    email: 'emailTesteChange@email.com',
                    phone: '123231241',
                    hash: hashedPassword,
                },
            });
            const userId = user.id

            const tokenResponse = await authService.login({
                email: 'emailTesteChange@email.com',
                password: oldPassword,
            });

            const token = tokenResponse.accessToken

            const response = await request(app.getHttpServer())
                .patch(`/user/${userId}/change-password`)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                });

            expect(response.status).toBe(201)
            expect(response.body.id).toBe(userId)

            await prismaService.user.delete({
                where: {
                    id: userId,
                },
            })
        })

        it("deve retorn erro 404 caso o usuario seja invalido", async () => {
            const oldPassword = 'password123'
            const newPassword = 'newPassword123'

            const hashedPassword = await bcrypt.hash(oldPassword, 10);
            const user = await prismaService.user.create({
                data: {
                    fullName: 'Test User',
                    email: 'emailTesteChange@email.com',
                    phone: '123231241',
                    hash: hashedPassword,
                },
            });
            const userId = user.id

            const tokenResponse = await authService.login({
                email: 'emailTesteChange@email.com',
                password: oldPassword,
            });

            const token = tokenResponse.accessToken

            const response = await request(app.getHttpServer())
                .patch(`/user/${'idInvalido'}/change-password`)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                });

            expect(response.status).toBe(404)
            expect(response.body.message).toBe('Usuário não encontrado.')

            await prismaService.user.delete({
                where: {
                    id: userId,
                },
            })
        })

        it("deve retorn erro 401 caso a senha antiga seja invalido", async () => {
            const oldPassword = 'password123'
            const newPassword = 'newPassword123'

            const hashedPassword = await bcrypt.hash(oldPassword, 10);
            const user = await prismaService.user.create({
                data: {
                    fullName: 'Test User',
                    email: 'emailTesteChange@email.com',
                    phone: '123231241',
                    hash: hashedPassword,
                },
            });
            const userId = user.id

            const tokenResponse = await authService.login({
                email: 'emailTesteChange@email.com',
                password: oldPassword,
            });

            const token = tokenResponse.accessToken

            const response = await request(app.getHttpServer())
                .patch(`/user/${userId}/change-password`)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    oldPassword: 'senhaErrada',
                    newPassword: newPassword,
                });

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Senha inválida.')

            await prismaService.user.delete({
                where: {
                    id: userId,
                },
            })
        })

        it("deve retornar erro 401 caso o token for invalido", async () => {
            const userId = await createTestUser(prismaService);
            const oldPassword = 'password123'
            const newPassword = 'newPassword123'

            const response = await request(app.getHttpServer())
                .patch('/user/' + userId + '/change-password')
                .set('Authorization', 'Bearer ')
                .send({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                });

            expect(response.status).toBe(401)
            expect(response.body.message).toEqual('Unauthorized')
        })
    })

    describe("updateRole()", () => {
        it("Atualiza o role do usuario", async () => {
            const userId = await createTestUser(prismaService);

            const response = await request(app.getHttpServer())
                .patch('/user/' + userId + '/role')
                .set('Authorization', 'Bearer ' + userToken)
                .send({ role: RoleType.MODERATOR });

            expect(response.status).toBe(200)
            expect(response.body.sysRole).toEqual(RoleType.MODERATOR)
        })

        it("deve retornar erro 404 caso o usuario seja invalido", async () => {
            const userId = await createTestUser(prismaService);

            const response = await request(app.getHttpServer())
                .patch('/user/' + 'usuarioInvalido' + '/role')
                .set('Authorization', 'Bearer ' + userToken)
                .send({ role: RoleType.MODERATOR });

            expect(response.status).toBe(404)
            expect(response.body.message).toBe('User not found')
        })

        it("deve retornar erro 400 caso o role seja invalido", async () => {
            const userId = await createTestUser(prismaService);

            const response = await request(app.getHttpServer())
                .patch('/user/' + userId + '/role')
                .set('Authorization', 'Bearer ' + userToken)
             

            expect(response.status).toBe(400)
            expect(response.body.message).toEqual(["role should not be empty", "Role must be one of ADMIN, MODERATOR, or MEMBER."])
        })
    })

    afterAll(async () => {
        await app.close();
    });
});
