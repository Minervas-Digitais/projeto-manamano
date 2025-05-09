import { NotificationType } from "@prisma/client"
import { CreateNotificationDto } from "../dto/create-notification.dto"
import { plainToInstance } from 'class-transformer';
import { validate } from "class-validator";

describe("CreateNotificationDTO", () => {
    it("Deve passar da validacao se os campos forem validos", async () => {
        const dto = Object.assign(new CreateNotificationDto(), {
            senderId: "idsender123",
            recipientId: "idrecipiente123",
            body: "teste123",
            type: NotificationType.COMMENT,
            groupName: "groupname123",
            senderName: "sendername123"
        })

        expect(dto).toBeDefined()
    })

    it("Deve validar um DTO válido", async () => {
        const dto = plainToInstance(CreateNotificationDto, {
            senderId: "idsender123",
            recipientId: "idrecipiente123",
            body: "teste123",
            type: NotificationType.COMMENT,
            groupName: "groupname123",
            senderName: "sendername123"
        });

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
    });

    it("Nao deve passar se os tipos dos campos forem incorretos", async () => {
        const dto = plainToInstance(CreateNotificationDto, {
            senderId: 123 as any,
            recipientId: 456 as any,
            body: 789 as any,
            type: 234 as any,
            groupName: 567 as any,
            senderName: 891 as any
        });

        const errors = await validate(dto);
    
        expect(errors.length).toBeGreaterThan(0);
        const fieldWithErrors = errors.map(e => e.property);
        expect(fieldWithErrors).toContain("senderId");
        expect(fieldWithErrors).toContain("recipientId");
        expect(fieldWithErrors).toContain("body");
        expect(fieldWithErrors).toContain("type");
        expect(fieldWithErrors).toContain("groupName");
        expect(fieldWithErrors).toContain("senderName");
    })

    it("Deve passar a validacao se os campos opcionais nao forem passados", async () => {
        const dto = plainToInstance(CreateNotificationDto, {
            senderId: "idsender123",
            recipientId: undefined,
            body: "teste123",
            type: NotificationType.COMMENT,
            groupName: undefined,
            senderName: undefined
        })

        const errors = await validate(dto);
    
        expect(errors.length).toBe(0);
    })
})