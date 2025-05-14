import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationModule } from "../notification.module";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import { getUserToken, resetDatabase } from "../../../test/test-helper.notification";
import { CreateNotificationDto } from "../dto/create-notification.dto";
import { NotificationType } from "@prisma/client";
import request from "supertest";

describe("Notification", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;

    beforeAll(async () => {
        resetDatabase();
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [NotificationModule, UserModule, AuthModule],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        userToken = await getUserToken(app, prismaService);
    });

    describe("Create", () => {
        it("Deve criar uma notificacao", async () => {
            const notificationDTO: CreateNotificationDto = {
                senderId: "1",
                body: "bodyTeste",
                recipientId: "1",
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
            expect(response.body).toHaveProperty('updatedAt');
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
                "type must be one of the following values: COMMENT, WARNING", "groupName must be a string", "senderName must be a string"])
        })
    })
})