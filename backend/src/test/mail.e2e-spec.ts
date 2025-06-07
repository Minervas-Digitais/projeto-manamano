import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MailModule } from "src/mail/mail.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";
import { createTestUser } from "./test-helpers";

describe("Mail", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MailModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  describe("POST /mail", () => {
    it("deve enviar um email com sucesso", async () => {
      const userId = await createTestUser(prismaService);

      const response = await request(app.getHttpServer())
        .post("/mail")
        .send({
          subject: "Teste de envio",
          text: "Este é um teste automatizado de envio de e-mail",
          userId: userId,
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain("Enviado com sucesso");
    });

    it("deve retornar erro 400 se campos forem inválidos", async () => {
      const response = await request(app.getHttpServer())
        .post("/mail")
        .send({
          subject: 123,
          text: false,
          userId: null,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Bad Request");
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
