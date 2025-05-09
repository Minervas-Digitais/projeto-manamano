import { plainToInstance } from "class-transformer"
import { UpdateNotificationDto } from "../dto/update-notification.dto"
import { validate } from "class-validator"

describe("UpdateNotificationDTO", () => {
    it("Deve passar da validacao se os campos forem validos", async () => {
        const dto = Object.assign(new UpdateNotificationDto(), {
            isRead: true
        })

        expect(dto).toBeDefined()
    })

    it("Deve validar um DTO válido", async () => {
        const dto = plainToInstance(UpdateNotificationDto, {
            isRead: true
        })

        const errors = await validate(dto)

        expect(errors.length).toBe(0)
    })

    it("Deve falhar caso isRead nao for booleano", async () => {
        const dto = plainToInstance(UpdateNotificationDto, {
            isRead: 123 as any
        })

        const errors = await validate(dto)

        expect(errors.length).toBeGreaterThan(0)
        expect(errors[0].property).toContain("isRead")
    })
})