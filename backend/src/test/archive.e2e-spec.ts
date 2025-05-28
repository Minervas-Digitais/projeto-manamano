import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ArchiveModule } from "src/archive/archive.module";
import { CreateArchiveDto } from "src/archive/dto/archive.dto";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";
import { createTestGroup, createTestUser } from "./test-helpers";
import { resetDatabase } from "../../test/test-helper.notification";

describe("Archive", () => {
    let app: INestApplication
    let prismaService: PrismaService
    beforeAll(async () => {
        resetDatabase();
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ArchiveModule]
        })
            .compile();
        
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();
    });

    describe("uploadArquivo", () => {
        it("deve fazer o upload do arquivo", async () => {
            const user_id = await createTestUser(prismaService);
            const group_id = await createTestGroup(prismaService);

            const archiveDTO: CreateArchiveDto = {
                name: "teste",
                mimeType: "text",
                contentBase64: "stringembase64aaa",
                type: "text/plain",
                userId: user_id,
                groupId: group_id
            }

            const response = await request(app.getHttpServer())
                .post("/archives")
                .send(archiveDTO);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('mimeType');
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('groupId');
        })

        it("deve retornar erro 400 caso os campos forem invalidos", async () => {
            const archiveDTO: CreateArchiveDto = {
                name: 123 as any,
                mimeType: 123 as any,
                contentBase64: 123 as any,
                type: 123 as any,
                userId: 123 as any,
                groupId: 123 as any,
            }
            const response = await request(app.getHttpServer())
                .post("/archives")
                .send(archiveDTO);
            
            expect(response.status).toBe(400)
            expect(response.body.error).toBe("Bad Request")
        })
    });

    describe("getArchive", () => {
        
    });

    describe("getArchivesByPostId", () => {

    });

    describe("getArchivesByGroupId", () => {

    });
})