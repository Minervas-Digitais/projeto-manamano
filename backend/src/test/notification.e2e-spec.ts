import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationModule } from "../notification/notification.module";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import { CreateNotificationDto } from "../notification/dto/create-notification.dto";
import { NotificationType } from "@prisma/client";
import request from "supertest";
import { UpdateNotificationDto } from "../notification/dto/update-notification.dto";
import { getAdminToken, getNotificationId, getRecipientToken, getSenderToken, getUserToken } from "src/test/test-helpers";
import { AuthService } from "src/auth/auth.service";

describe("Notification", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;
    let adminToken: string;
    let recipientToken: string;
    let senderToken: string;
    let authService: AuthService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [NotificationModule, UserModule, AuthModule],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        authService = moduleFixture.get<AuthService>(AuthService);

        await app.init();

        userToken = await getUserToken(authService, prismaService);
        adminToken = await getAdminToken(authService, prismaService);
        recipientToken = await getRecipientToken(authService, prismaService);
        senderToken = await getSenderToken(authService, prismaService);
    });

    describe("Create", () => {
        it("Deve criar uma notificacao", async () => {
            // deve criar um sender e um recipient para criar notification
            const recipientUser = await prismaService.user.findUnique({
                where: {email: "testrecipient@example.com"}
            })
            const senderUser = await prismaService.user.findUnique({
                where: {email: "testuser@example.com"},
            });

            const notificationDTO: CreateNotificationDto = {
                senderId: senderUser.id,
                body: "bodyTeste",
                recipientId: recipientUser.id,
                type: NotificationType.COMMENT,
                groupName: "groupTeste",
                senderName: "senderTeste"
            }

            const response = await request(app.getHttpServer())
                .post("/notifications")
                .set("Authorization", "Bearer " + userToken)
                .send(notificationDTO)

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('senderId');
            expect(response.body).toHaveProperty('body');
            expect(response.body).toHaveProperty('recipientId');
            expect(response.body).toHaveProperty('type');
            expect(response.body).toHaveProperty('createdAt');
        })

        it("deve retornar erro 400 caso os campos forem invalidos", async () => {
            const notificationDTO: CreateNotificationDto = {
                senderId: 123 as any,
                body: 123 as any,
                recipientId: 123 as any,
                type: 123 as any,
                groupName: 123 as any,
                senderName: 123 as any
            }

            const response = await request(app.getHttpServer())
                .post('/notifications')
                .set('Authorization', 'Bearer ' + userToken)
                .send(notificationDTO);

            expect(response.status).toBe(400)
            expect(response.body.error).toBe("Bad Request")
            expect(response.body.message).toEqual(["senderId must be a string", "recipientId must be a string", "body must be a string",
                "type must be one of the following values: COMMENT, WARNING, FIXED", "groupName must be a string", "senderName must be a string"])
        })
    })

    describe("CreateGlobal", () => {
        it("Deve criar uma notificacao global apenas se for admin", async () => {
            const recipientUser = await prismaService.user.findUnique({
                where: {email: "testrecipient@example.com"}
            })

            const admin = await prismaService.user.findUnique({
                where: {email: "admin@example.com"},
            });

            const notificationDTO = {
                senderId: admin.id,
                body: "bodyTeste",
                recipientId: recipientUser.id,
                type: NotificationType.COMMENT,
                groupName: "groupTeste",
                senderName: "senderTeste"
            }

            const response = await request(app.getHttpServer())
                .post("/notifications/global")
                .set("Authorization", "Bearer " + adminToken)
                .send(notificationDTO)
            
            expect(response.status).toBe(201);
        })

        it("Deve negar acesso a token de usuario", async () => {
            const recipientUser = await prismaService.user.findUnique({
                where: {email: "testrecipient@example.com"}
            })

            const user = await prismaService.user.findUnique({
                where: {email: "testuser@example.com"},
            });

            const notificationDTO: CreateNotificationDto = {
                senderId: user.id,
                body: "bodyTeste",
                recipientId: recipientUser.id,
                type: NotificationType.COMMENT,
                groupName: "groupTeste",
                senderName: "senderTeste"
            }

            const response = await request(app.getHttpServer())
                .post("/notifications/global")
                .set("Authorization", "Bearer " + userToken)
                .send(notificationDTO)

            expect(response.status).toBe(403)
            expect(response.body.message).toBe("Forbidden resource")
        })
    })

    describe("getNotificationsForUser", () => {
        it("Deve retornar todas as notificacoes de um usuario", async () => {
            // Criar usuario 
            const sendingUser = await prismaService.user.findUnique({
                where: {email: "testsender@example.com"}
            })

            const recipientUser = await prismaService.user.findUnique({
                where: {email: "testrecipient@example.com"},
            });
            
            // Criar uma notificacao no id do usuario
            const notificationDTO: CreateNotificationDto = {
                senderId: sendingUser.id,
                body: "bodyTeste",
                recipientId: recipientUser.id,
                type: NotificationType.COMMENT,
                groupName: "groupTeste",
                senderName: "senderTeste"
            }

            const notificationSent = await prismaService.notification.createMany({
                data: [{
                    senderId: notificationDTO.senderId,
                    recipientId: notificationDTO.recipientId,
                    body: notificationDTO.body,
                    type: notificationDTO.type,
                    groupName: notificationDTO.groupName || null,
                    senderName: notificationDTO.senderName || null,
                }, 
                {
                    senderId: notificationDTO.senderId,
                    recipientId: notificationDTO.recipientId,
                    body: notificationDTO.body,
                    type: notificationDTO.type,
                    groupName: notificationDTO.groupName || null,
                    senderName: notificationDTO.senderName || null,
                }]
            })
            // Pegar as notificacoes dele GET: user/:userId
            

            const response = await request(app.getHttpServer())
                .get(`/notifications/user/${recipientUser.id}`)
                .set("Authorization", "Bearer " + recipientToken)

            expect(response.status).toBe(200);
            expect(response.body[0].senderId).toEqual(notificationDTO.senderId)
            expect(response.body[0].recipientId).toEqual(notificationDTO.recipientId)
            expect(response.body[1].senderId).toEqual(notificationDTO.senderId)
            expect(response.body[1].recipientId).toEqual(notificationDTO.recipientId)
        })

        it("Deve retornar [] caso o id seja invalido", async () => {
            // Cria request com um id invalido
            const id = 123 

            const response = await request(app.getHttpServer())
                .get(`/notifications/user/${id}`)
                .set("Authorization", "Bearer " + recipientToken)
            
            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })
    })

    describe("markAsRead", () => {
        it("Deve marcar uma notificacao como lida", async () => {
            // Cria notificacao
            const notificationId = await getNotificationId(app, authService, prismaService);
            console.log(`NOTIFICATION ID: ${notificationId}`);
            const update: UpdateNotificationDto = {
                isRead: true,
            }
            // Marca como lida Patch: /:id
            const response = await request(app.getHttpServer())
                .patch(`/notifications/${notificationId}`)
                .set("Authorization", "Bearer " + senderToken)
                .send(update)
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty("isRead")
            expect(response.body.isRead).toBe(true)
        })

        it("Deve retornar erro caso o id seja invalido", async () => {
            // Cria request com um id invalido
            const notificationId = 123
            const update: UpdateNotificationDto = {
                isRead: true,
            }

            const response = await request(app.getHttpServer())
                .patch(`/notifications/${notificationId}`)
                .set("Authorization", "Bearer " + senderToken)
                .send(update)
            
            expect(response.status).toBe(500)
            expect(response.body.message).toBe("Internal server error")
        })
    })

    describe("deleteNotification", () => {
        it("Deve deletar uma notificacao", async () => {
            // Cria notificacao
            const notificationId = await getNotificationId(app, authService, prismaService);
            // Deleta notificacao Delete: /:id
            const response = await request(app.getHttpServer())
                .delete(`/notifications/${notificationId}`)
                .set("Authorization", "Bearer " + senderToken)
            
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty("id")
        })
        
        it("Deve retornar erro caso o id seja invalido", async () => {
            // Cria request com um id invalido
            const notificationId = 123

            const response = await request(app.getHttpServer())
                .delete(`/notifications/${notificationId}`)
                .set("Authorization", "Bearer " + senderToken)
            
            expect(response.status).toBe(500)
            expect(response.body.message).toBe("Internal server error")
        })
    })
})