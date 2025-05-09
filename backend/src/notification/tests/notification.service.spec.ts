import { PrismaService } from "src/prisma/prisma.service";
import { NotificationService } from "../notification.service";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateNotificationDto } from "../dto/create-notification.dto";
import { Notification, NotificationType } from "@prisma/client";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

describe("Notification Service", () => {
    let service: NotificationService;
    let prismaService: PrismaService;
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: PrismaService,
                    useValue: {
                        notification: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            createMany: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe("createNotification", () => {
        it("Deve criar uma nova notificacao", async () => {
            const dto: CreateNotificationDto = {
                senderId: "idsender123",
                recipientId: "idrecipiente123",
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: "groupname123",
                senderName: "sendername123"
            };
            const id: string = "1"

            const expectedResult = { 
                id,
                ...dto,
                isRead: false,
                createdAt: new Date()
            };

            jest.spyOn(prismaService.notification, "create").mockResolvedValue(expectedResult as Notification);

            const result = await service.createNotification(dto, "MEMBER");
            expect(result).toEqual(expectedResult)
            expect(prismaService.notification.create).toHaveBeenCalledTimes(1)
            expect(prismaService.notification.create).toHaveBeenCalledWith({ data: dto })
        });

        it("Deve retornar erro se a criação falhar", async () => {
            const dto: CreateNotificationDto = {
                senderId: "idsender123",
                recipientId: "idrecipiente123",
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: "groupname123",
                senderName: "sendername123"
            };

            const error = new Error("Erro no banco de dados");
            jest.spyOn(prismaService.notification, "create").mockRejectedValue(error);

            await expect(service.createNotification(dto, "MEMBER")).rejects.toEqual(error);
        });

        it("Deve retornar uma exception se usuario MEMBER tentar criar uma notificacao WARNING", async () => {
            const dto: CreateNotificationDto = {
                senderId: "idsender123",
                recipientId: "idrecipiente123",
                body: "teste123",
                type: NotificationType.WARNING,
                groupName: "groupname123",
                senderName: "sendername123"
            };

            await expect(service.createNotification(dto, "MEMBER")).rejects.toThrow(ForbiddenException);  
        })
    })

    describe("getNotificationsForUser", () => {
        it("Deve retornar todas as notificacoes de um usuario", async () => {
            const dto: CreateNotificationDto = {
                senderId: "idsender123",
                recipientId: "idrecipiente123",
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: "groupname123",
                senderName: "sendername123"
            };

            const id: string = "1"

            const expectedResult = [{ 
                id,
                ...dto,
                isRead: false,
                createdAt: new Date()
            }];

            jest.spyOn(prismaService.notification, "findMany").mockResolvedValue(expectedResult as Notification[]);

            const userId: string = "1";
            const result = await service.getNotificationsForUser(userId);
            expect(result).toEqual(expectedResult);
            expect(prismaService.notification.findMany).toHaveBeenCalledTimes(1);
        });
    
        // TODO:
        it("Deve retornar erro quando falhar na busca das Notificacoes", async () => {
            jest.spyOn(prismaService.notification, "findMany").mockRejectedValue(new Error("Erro ao buscar Notificacao"));

            const result = await (service as any).getNotificationsForUser("1");

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Erro ao buscar Notificacao");
        });
    })
})