// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import request from 'supertest';

// import { ParticipantModule } from '../participant/participant.module';
// import { GroupModule } from 'src/group/group.module';
// import { UserModule } from '../user/user.module';
// import { AuthModule } from '../auth/auth.module';

// import { PrismaService } from '../prisma/prisma.service';
// import {
//   createParticipantDto,
//   createTestParticipant,
//   getUserToken,
// } from './test-helpers';
// import { AuthService } from 'src/auth/auth.service';
// import { CreateParticipantDto } from 'src/participant/dto/create-participant.dto';
// import { Group, Participant, UserRole } from '@prisma/client';

// type TestParticipantWithGroup = {
//   participant: Participant;
//   group: Group;
//   user: {
//     number: string;
//     email: string;
//   };
// };

// describe('Participant', () => {
//   let app: INestApplication;
//   let prismaService: PrismaService;
//   let userToken: string;
//   let authService: AuthService;
//   let cleanup: (userId: any, groupId: any) => Promise<void>;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [ParticipantModule, GroupModule, UserModule, AuthModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     app.useGlobalPipes(new ValidationPipe());
//     prismaService = moduleFixture.get<PrismaService>(PrismaService);
//     authService = moduleFixture.get<AuthService>(AuthService);

//     cleanup = async (userId, groupId) => {
//       await prismaService.participant.deleteMany({
//         where: {
//           userId,
//           groupId: groupId,
//         },
//       });

//       await prismaService.user.delete({
//         where: { id: userId },
//       });

//       await prismaService.group.delete({
//         where: { id: groupId },
//       });
//     };

//     await app.init();

//     userToken = await getUserToken(authService, prismaService);
//   });

//   describe('joinGroup()', () => {
//     it('deve entrar no novo grupo', async () => {
//       const dto: CreateParticipantDto =
//         await createParticipantDto(prismaService);

//       const response = await request(app.getHttpServer())
//         .post('/participant')
//         .set('Authorization', 'Bearer ' + userToken)
//         .send(dto);

//       expect(response.statusCode).toBe(201);
//       expect(response.body).toHaveProperty('userId');
//       expect(response.body).toHaveProperty('groupId');
//       expect(response.body).toHaveProperty('role');
//       expect(response.body).toHaveProperty('createdAt');
//       expect(response.body).toHaveProperty('updatedAt');
//       expect(response.body.groupId).toBe(dto.groupId);
//       expect(response.body.role).toBe(dto.role);
//     });

//     it('deve retornar erro 400 caso o role seja invalido', async () => {
//       const dto: CreateParticipantDto =
//         await createParticipantDto(prismaService);
//       dto.role = '' as any;
//       const response = await request(app.getHttpServer())
//         .post('/participant')
//         .set('Authorization', 'Bearer ' + userToken)
//         .send(dto);

//       expect(response.statusCode).toBe(400);
//       expect(response.body.message).toEqual([
//         'role must be one of the following values: STUDENT, INSTRUCTOR',
//       ]);
//       expect(response.body.error).toBe('Bad Request');
//     });

//     it('deve retornar erro 400 caso o inviteCode seja invalido', async () => {
//       const dto: CreateParticipantDto =
//         await createParticipantDto(prismaService);
//       dto.inviteCode = '' as any;
//       const response = await request(app.getHttpServer())
//         .post('/participant')
//         .set('Authorization', 'Bearer ' + userToken)
//         .send(dto);

//       expect(response.statusCode).toBe(400);
//       expect(response.body.message).toEqual(['inviteCode should not be empty']);
//       expect(response.body.error).toBe('Bad Request');
//     });

//     it('deve retornar erro 404 caso não exita grupo com o inviteCode passado', async () => {
//       const dto: CreateParticipantDto =
//         await createParticipantDto(prismaService);
//       dto.inviteCode = 'inviteCodeInexistente' as any;
//       const response = await request(app.getHttpServer())
//         .post('/participant')
//         .set('Authorization', 'Bearer ' + userToken)
//         .send(dto);

//       expect(response.statusCode).toBe(404);
//       expect(response.body.message).toBe('Código de convite inválido.');
//       expect(response.body.error).toBe('Not Found');
//     });

//     it('deve entrar erro 409 caso já esteja no grupo', async () => {
//       const dto: CreateParticipantDto =
//         await createParticipantDto(prismaService);

//       await request(app.getHttpServer())
//         .post('/participant')
//         .set('Authorization', 'Bearer ' + userToken)
//         .send(dto);

//       const response = await request(app.getHttpServer())
//         .post('/participant')
//         .set('Authorization', 'Bearer ' + userToken)
//         .send(dto);

//       expect(response.status).toBe(409);
//       expect(response.body.message).toBe('Você já está neste grupo.');
//     });

//     it('deve retornar erro 401 caso o jwt token for invalido', async () => {
//       const dto: CreateParticipantDto =
//         await createParticipantDto(prismaService);

//       const response = await request(app.getHttpServer())
//         .post('/participant')
//         .set('Authorization', 'Bearer ')
//         .send(dto);

//       expect(response.status).toBe(401);
//       expect(response.body.message).toBe('Unauthorized');
//     });
//   });

//   describe('findAll()', () => {
//     it('deve retornar todos os participants', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/participant')
//         .set('Authorization', 'Bearer ' + userToken);

//       expect(response.statusCode).toBe(200);
//       expect(response.body.length).toBeGreaterThan(0);
//       expect(response.body[0]).toHaveProperty('userId');
//       expect(response.body[0]).toHaveProperty('groupId');
//       expect(response.body[0]).toHaveProperty('role');
//       expect(response.body[0]).toHaveProperty('createdAt');
//       expect(response.body[0]).toHaveProperty('updatedAt');
//     });

//     it('deve retornar erro 404 se nao houver participants', async () => {
//       await prismaService.participant.deleteMany();

//       const response = await request(app.getHttpServer())
//         .get('/participant')
//         .set('Authorization', 'Bearer ' + userToken);

//       expect(response.statusCode).toBe(404);
//       expect(response.body.message).toBe('Não há usuários em grupos.');
//       expect(response.body.error).toBe('Not Found');
//     });

//     it('deve retornar erro 401 caso o jwt token for invalido', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/participant')
//         .set('Authorization', 'Bearer ');

//       expect(response.statusCode).toBe(401);
//       expect(response.body.message).toBe('Unauthorized');
//     });
//   });

//   describe('findUsersInGroup()', () => {
//     it('Deve retornar os usuarios em certo grupo', async () => {
//       const res: TestParticipantWithGroup =
//         await createTestParticipant(prismaService);

//       const participantToken = await getUserToken(
//         authService,
//         prismaService,
//         res.user.email,
//         res.user.number,
//       );

//       const response = await request(app.getHttpServer())
//         .get('/participant/group/' + res.group.id)
//         .set('Authorization', 'Bearer ' + participantToken);

//       expect(response.statusCode).toBe(200);
//       expect(response.body.length).toBeGreaterThan(0);
//       expect(response.body[0].userId).toBe(res.participant.userId);
//       expect(response.body[0].role).toBe(res.participant.role);
//       expect(response.body[0].user.fullName).toBe('Teste User');

//       await cleanup(res.participant.userId, res.group.id);
//     });

//     it('Deve retornar erro 404 se o groupId for invalido', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/participant/group/' + 'invalidGroupId')
//         .set('Authorization', 'Bearer ' + userToken);

//       expect(response.statusCode).toBe(404);
//       expect(response.body.message).toBe('Não há usuários neste grupo.');
//     });

//     it('deve retornar erro 401 caso o jwt token for invalido', async () => {
//       const participant = (await createTestParticipant(prismaService))
//         .participant;

//       const response = await request(app.getHttpServer())
//         .get('/participant/group/' + participant.groupId)
//         .set('Authorization', 'Bearer ');

//       expect(response.statusCode).toBe(401);
//       expect(response.body.message).toBe('Unauthorized');
//     });
//   });

//   describe('findUserGroups()', () => {
//     it('deve retornar os grupos em que o usuario participa', async () => {
//       const res: TestParticipantWithGroup =
//         await createTestParticipant(prismaService);

//       const participantToken = await getUserToken(
//         authService,
//         prismaService,
//         res.user.email,
//         res.user.number,
//       );

//       const response = await request(app.getHttpServer())
//         .get('/participant/groups/')
//         .set('Authorization', 'Bearer ' + participantToken);

//       expect(response.statusCode).toBe(200);
//       expect(response.body.length).toBeGreaterThan(0);
//       expect(response.body[0].role).toBe(UserRole.STUDENT);
//       expect(response.body[0].groupId).toBe(res.group.id);
//       expect(response.body[0].participantCount).toBeGreaterThan(0);
//       expect(response.body[0]).toHaveProperty('group');

//       await cleanup(res.participant.userId, res.group.id);
//     });

//     it('deve retornar erro 401 caso o jwt token for invalido', async () => {
//       await createTestParticipant(prismaService);

//       const response = await request(app.getHttpServer())
//         .get('/participant/groups/')
//         .set('Authorization', 'Bearer ');

//       expect(response.statusCode).toBe(401);
//       expect(response.body.message).toBe('Unauthorized');
//     });
//   });

//   //   describe('findOne()', () => {
//   //     it('deve retornar o participant a partir do id', async () => {
//   //       const res: TestParticipantWithGroup =
//   //         await createTestParticipant(prismaService);

//   //       const participantToken = await getUserToken(
//   //         authService,
//   //         prismaService,
//   //         res.user.email,
//   //         res.user.number,
//   //       );

//   //       const response = await request(app.getHttpServer())
//   //         .get('/participant/group/' + res.group.id)
//   //         .set('Authorization', 'Bearer ' + participantToken);

//   //       console.log(response.body);
//   //       expect(response.statusCode).toBe(200);
//   //       expect(response.body).toHaveProperty('userId');
//   //       expect(response.body).toHaveProperty('groupId');
//   //       expect(response.body).toHaveProperty('role');
//   //       expect(response.body).toHaveProperty('createdAt');
//   //       expect(response.body).toHaveProperty('updatedAt');

//   //       await cleanup(res.participant.userId, res.group.id);
//   //     });

//   //     it('deve retornar erro 404 se o id for invalido', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .get('/participant/' + 'invalidId,invalidId')
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem userId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .get('/participant/' + ',invalidId')
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem groupId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .get('/participant/' + 'invalidId,')
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem groupId e sem userId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .get('/participant/' + ',')
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 401 caso o jwt token for invalido', async () => {
//   //       const participant = (await createTestParticipant(prismaService))
//   //         .participant;
//   //       const id = `${participant.userId},${participant.groupId}`;
//   //       const response = await request(app.getHttpServer())
//   //         .get('/participant/' + id)
//   //         .set('Authorization', 'Bearer ');

//   //       expect(response.statusCode).toBe(401);
//   //       expect(response.body.message).toBe('Unauthorized');
//   //     });
//   //   });

//   //   describe('update()', () => {
//   //     it('Deve atualizar o role de um participant', async () => {
//   //       const res: TestParticipantWithGroup =
//   //         await createTestParticipant(prismaService);

//   //       const participantToken = await getUserToken(
//   //         authService,
//   //         prismaService,
//   //         res.user.email,
//   //         res.user.number,
//   //       );

//   //       const response = await request(app.getHttpServer())
//   //         .patch(`/participant/group/${res.group.id}`)
//   //         .set('Authorization', 'Bearer ' + participantToken)
//   //         .send({ role: UserRole.INSTRUCTOR })
//   //         .expect(201);

//   //       console.log(response.body);
//   //       expect(response.body.role).toBe(UserRole.INSTRUCTOR);
//   //     });

//   //     it('Deve retornar 400 ao tentar atualizar com role inválido', async () => {
//   //       const { userId, groupId } = (await createTestParticipant(prismaService))
//   //         .participant;
//   //       const id = `${userId},${groupId}`;

//   //       const response = await request(app.getHttpServer())
//   //         .patch(`/participant/${id}`)
//   //         .set('Authorization', 'Bearer ' + userToken)
//   //         .send({ role: 'invalidRole' });

//   //       expect(response.statusCode).toBe(400);
//   //       expect(response.body.message).toEqual([
//   //         'role must be one of the following values: ADMIN, MODERATOR, MEMBER',
//   //       ]);
//   //     });

//   //     it('Deve retornar 404 ao tentar atualizar com id inválido', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .patch(`/participant/invalidId,invalidId`)
//   //         .set('Authorization', 'Bearer ' + userToken)
//   //         .send({ role: RoleType.ADMIN });

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem userId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .patch('/participant/' + ',invalidId')
//   //         .set('Authorization', 'Bearer ' + userToken)
//   //         .send({});

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem groupId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .patch('/participant/' + 'invalidId,')
//   //         .set('Authorization', 'Bearer ' + userToken)
//   //         .send({});

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem groupId e sem userId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .patch('/participant/' + ',')
//   //         .set('Authorization', 'Bearer ' + userToken)
//   //         .send({});

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('Deve permitir requisição sem nenhum campo e não alterar nada', async () => {
//   //       const participant = (await createTestParticipant(prismaService))
//   //         .participant;
//   //       const id = `${participant.userId},${participant.groupId}`;

//   //       const response = await request(app.getHttpServer())
//   //         .patch(`/participant/${id}`)
//   //         .set('Authorization', 'Bearer ' + userToken)
//   //         .send({})
//   //         .expect(201);

//   //       expect(response.body.role).toBe('MEMBER');
//   //     });

//   //     it('deve retornar erro 401 caso o jwt token for invalido', async () => {
//   //       const participant = (await createTestParticipant(prismaService))
//   //         .participant;
//   //       const id = `${participant.userId},${participant.groupId}`;
//   //       const response = await request(app.getHttpServer())
//   //         .patch('/participant/' + id)
//   //         .set('Authorization', 'Bearer ')
//   //         .send({});

//   //       expect(response.statusCode).toBe(401);
//   //       expect(response.body.message).toBe('Unauthorized');
//   //     });
//   //   });

//   //   describe('remove()', () => {
//   //     it('deve deletar o participant do id', async () => {
//   //       const participant = (await createTestParticipant(prismaService))
//   //         .participant;
//   //       const id = `${participant.userId},${participant.groupId}`;
//   //       const response = await request(app.getHttpServer())
//   //         .delete('/participant/' + id)
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(200);
//   //       expect(response.body).toHaveProperty('userId');
//   //       expect(response.body).toHaveProperty('groupId');
//   //       expect(response.body).toHaveProperty('role');
//   //       expect(response.body).toHaveProperty('createdAt');
//   //       expect(response.body).toHaveProperty('updatedAt');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja invalido', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .delete('/participant/' + 'invalidId,invalidId')
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem userId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .delete('/participant/' + ',invalidId')
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem groupId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .delete('/participant/' + 'invalidId,')
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 404 caso o id esteja sem groupId e sem userId', async () => {
//   //       const response = await request(app.getHttpServer())
//   //         .delete('/participant/' + ',')
//   //         .set('Authorization', 'Bearer ' + userToken);

//   //       expect(response.statusCode).toBe(404);
//   //       expect(response.body.message).toBe('Participante não encontrado.');
//   //     });

//   //     it('deve retornar erro 401 caso o jwt token for invalido', async () => {
//   //       const participant = (await createTestParticipant(prismaService))
//   //         .participant;
//   //       const id = `${participant.userId},${participant.groupId}`;
//   //       const response = await request(app.getHttpServer())
//   //         .delete('/participant/' + id)
//   //         .set('Authorization', 'Bearer ');

//   //       expect(response.statusCode).toBe(401);
//   //       expect(response.body.message).toBe('Unauthorized');
//   //     });
//   //   });
// });
