import { Test, TestingModule } from "@nestjs/testing"
import { NotificationController } from "../notification.controller"
import { NotificationService } from "../notification.service"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { ROLES_KEY } from "src/auth/roles.decorator"
import { CreateNotificationDto } from "../dto/create-notification.dto"
import { Notification, NotificationType } from "@prisma/client"
import { ForbiddenException } from "@nestjs/common"
import { UpdateNotificationDto } from "../dto/update-notification.dto"

describe("Notification Controller", () => {
    let controller: NotificationController
    let service: NotificationService

    beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                controllers: [NotificationController],
                providers: [
                    {
                        provide: NotificationService,
                        useValue: {
                            createNotification: jest.fn(),
                            createGlobalNotification: jest.fn(),
                            getNotificationsForUser: jest.fn(),
                            markAsRead: jest.fn(),
                            deleteNotification: jest.fn(),
                        }
                    },
                ],
            })
                .overrideGuard(JwtAuthGuard)
                .useValue({ canActivate: () => true })
                .compile();
    
            controller = module.get<NotificationController>(NotificationController);
            service = module.get<NotificationService>(NotificationService);
        });
    
    describe("Segurança", () => {
        it("Deve aplicar JwtAuthGuard nos endpoints", async () => {
            const guardCreate = Reflect.getMetadata('__guards__', NotificationController.prototype.create);
            const guardCreateGlobal = Reflect.getMetadata('__guards__', NotificationController.prototype.createGlobal);
            const guardgetUserNotifications = Reflect.getMetadata('__guards__', NotificationController.prototype.getUserNotifications);
            const guardMarkAsRead = Reflect.getMetadata('__guards__', NotificationController.prototype.markAsRead);
            const guardDeleteNotification = Reflect.getMetadata('__guards__', NotificationController.prototype.deleteNotification);

            expect(guardCreate[0]).toBe(JwtAuthGuard);
            expect(guardCreateGlobal[0]).toBe(JwtAuthGuard);
            expect(guardgetUserNotifications[0]).toBe(JwtAuthGuard);
            expect(guardMarkAsRead[0]).toBe(JwtAuthGuard);
            expect(guardDeleteNotification[0]).toBe(JwtAuthGuard);
        })

        it("Deve exigir a role ADMIN no createGlobal", async () => {
            const createGlobal = Reflect.getMetadata(ROLES_KEY, NotificationController.prototype.createGlobal);

            expect(createGlobal).toEqual(["ADMIN"]);
        })
    })

    describe("Create", () => {
        it("Deve criar uma nova notificacao do tipo COMMENT como MEMBER", async () => {
            const dto: CreateNotificationDto = {
                senderId: "idsender123",
                recipientId: undefined,
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: undefined,
                senderName: undefined
            };
            
            const member: String = "MEMBER";

            const expectedResult: Notification = { 
                id: "1", 
                senderId: "idsender123",
                recipientId: undefined,
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: undefined,
                senderName: undefined,
                isRead: false,
                createdAt: new Date()
            };

            jest.spyOn(service, "createNotification").mockResolvedValue(expectedResult);

            const result = await controller.create(dto);

            expect(result).toEqual(expectedResult);
            expect(service.createNotification).toHaveBeenCalledWith(dto, member);
            expect(service.createNotification).toHaveBeenCalledTimes(1);
        })

        it("Deve retornar erro se falhar", async () => {
            const dto: CreateNotificationDto = {
                senderId: "idsender123",
                recipientId: undefined,
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: undefined,
                senderName: undefined
            }

            jest.spyOn(service, "createNotification").mockRejectedValue(new Error("Erro no service"));

            await expect(controller.create(dto)).rejects.toThrow("Erro no service");
        })
    })

    describe("createGlobal", () => {
        it("Deve criar uma notificacao global", async () => {
            const dto: CreateNotificationDto = {
                senderId: "idsender123",
                recipientId: undefined,
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: undefined,
                senderName: undefined
            }

            const expectedResult = { 
                id: "1", 
                senderId: "idsender123",
                recipientId: undefined,
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: undefined,
                senderName: undefined,
                isRead: false,
                createdAt: new Date(),
                count: 1
            };

            const request = { user: { id: "idsender123" }}

            jest.spyOn(service, "createGlobalNotification").mockResolvedValue(expectedResult);

            const result = await controller.createGlobal(dto, request);

            expect(result).toEqual(expectedResult);
            expect(service.createGlobalNotification).toHaveBeenCalledWith(dto);
            expect(service.createGlobalNotification).toHaveBeenCalledTimes(1);
        });

        it("Deve retornar erro se falhar", async () => {
            const dto: CreateNotificationDto = {
                senderId: "idsender123",
                recipientId: undefined,
                body: "teste123",
                type: NotificationType.COMMENT,
                groupName: undefined,
                senderName: undefined
            }
            
            const request = { user: { id: "idsender123" }}

            jest.spyOn(service, "createGlobalNotification").mockRejectedValue(new Error("Erro no service"));

            await expect(controller.createGlobal(dto, request)).rejects.toThrow("Erro no service");
        });
    })

    describe("getUserNotifications", () => {
        it("Deve retornar todas as notificacoes do usuario", async () => {
            const userId: string = "1"

            const expectedResult: Notification[] = [
                {
                    id: "1", 
                    senderId: "idsender1",
                    recipientId: undefined,
                    body: "teste1",
                    type: NotificationType.COMMENT,
                    groupName: undefined,
                    senderName: undefined,
                    isRead: false,
                    createdAt: new Date()
                },
                {
                    id: "2", 
                    senderId: "idsender2",
                    recipientId: undefined,
                    body: "teste2",
                    type: NotificationType.COMMENT,
                    groupName: undefined,
                    senderName: undefined,
                    isRead: false,
                    createdAt: new Date()
                }
            ]

            jest.spyOn(service, "getNotificationsForUser").mockResolvedValue(expectedResult);

            const result = await controller.getUserNotifications(userId);
            expect(result).toEqual(expectedResult);
            expect(service.getNotificationsForUser).toHaveBeenCalledTimes(1);
        });

        it("Deve retornar erro se falhar", async () => {
            const userId: string = "1"

            jest.spyOn(service, "getNotificationsForUser").mockRejectedValue(new Error("Erro no service"));

            await expect(controller.getUserNotifications(userId)).rejects.toThrow("Erro no service");
        });
    })

    describe("markAsRead", () => {
        it("Deve marcar a notificacao como lida", async () => {
            const notificationId: string = "1";
            const isRead: UpdateNotificationDto = {
                isRead: true
            };
            
            const expectedResult: Notification = {
                id: "1", 
                senderId: "idsender1",
                recipientId: undefined,
                body: "teste1",
                type: NotificationType.COMMENT,
                groupName: undefined,
                senderName: undefined,
                isRead: true,
                createdAt: new Date()
            }

            jest.spyOn(service, "markAsRead").mockResolvedValue(expectedResult);
            const result = await controller.markAsRead(notificationId, isRead);

            expect(result).toEqual(expectedResult);
            expect(service.markAsRead).toHaveBeenCalledTimes(1);
            expect(service.markAsRead).toHaveBeenCalledWith(notificationId);
        });

        it("Deve retornar erro se falhar", async () => {
            const notificationId: string = "1"
            const isRead: UpdateNotificationDto = {
                isRead: true
            };

            jest.spyOn(service, "markAsRead").mockRejectedValue(new Error("Erro no service"));
            await expect(controller.markAsRead(notificationId, isRead)).rejects.toThrow("Erro no service");
        });

        it("Deve retornar erro se notificationId não for invalido", async () => {
            const notificationId: string = "-1"
            const isRead: UpdateNotificationDto = {
                isRead: true
            };

            jest.spyOn(service, "markAsRead").mockRejectedValue(new Error("Id invalido"));

            await expect(controller.markAsRead(notificationId, isRead)).rejects.toThrow("Id invalido");
        });

        it('deve retornar erro se as informações de update não forem invalidas', async () => {
            const notificationId: string = "-1"
            const isRead: UpdateNotificationDto = {
                isRead: 123 as any
            };

            jest.spyOn(service, "markAsRead").mockRejectedValue(new Error("Infos invalidas"));

            await expect(controller.markAsRead(notificationId, isRead)).rejects.toThrow("Infos invalidas");
        });
    })

    describe("deleteNotification", () => {
        it("Deve deletar a notificacao", async () => {
            const notificationId: string = "1";

            const expectedResult: Notification = {
                id: "1", 
                senderId: "idsender1",
                recipientId: undefined,
                body: "teste1",
                type: NotificationType.COMMENT,
                groupName: undefined,
                senderName: undefined,
                isRead: true,
                createdAt: new Date()
            }

            jest.spyOn(service, "deleteNotification").mockResolvedValue(expectedResult);
            const result = await controller.deleteNotification(notificationId);

            expect(result).toEqual(expectedResult);
            expect(service.deleteNotification).toHaveBeenCalledTimes(1);
            expect(service.deleteNotification).toHaveBeenCalledWith(notificationId);
        });

        it("Deve retornar erro se falhar", async () => {
            const notificationId: string = "1"

            jest.spyOn(service, "deleteNotification").mockRejectedValue(new Error("Erro no service"));
            await expect(controller.deleteNotification(notificationId)).rejects.toThrow("Erro no service");
        });

        it("Deve retornar erro se notificationId não for invalido", async () => {
            const notificationId: string = "-1"

            jest.spyOn(service, "deleteNotification").mockRejectedValue(new Error("Id invalido"));

            await expect(controller.deleteNotification(notificationId)).rejects.toThrow("Id invalido");
        });
    })
})