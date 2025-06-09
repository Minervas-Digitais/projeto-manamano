import { PrismaClient, PostType } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { writeFileSync } from "fs";

const prisma = new PrismaClient();

async function fetchImageBase64(url: string): Promise<string> {
  const { default: fetch } = await import('node-fetch');
  try {
    const response = await fetch(url);
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error("Resposta inválida ou não é imagem.");
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch (error) {
    console.error("Erro ao baixar imagem:", error);
    return "";
  }
}

async function main() {
  console.log("🌱 Iniciando Seed do Banco...");

  const numberOfUsers = 10;
  const numberOfGroups = 3;

  const users = await Promise.all(
    Array.from({ length: numberOfUsers }).map(() =>
      prisma.user.create({
        data: {
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          hash: faker.internet.password(),
          birthday: faker.date.past({ years: 30 }),
          bio: faker.person.bio(),
          neighborhood: faker.location.city(),
          enterprise: faker.company.name(),
          expertise: faker.person.jobTitle(),
        },
      })
    )
  );
  console.log("✅ Usuários criados");

  const groups = await Promise.all(
    Array.from({ length: numberOfGroups }).map(() =>
      prisma.group.create({
        data: {
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          inviteCode: faker.string.uuid(),
        },
      })
    )
  );
  console.log("✅ Grupos criados");

  await prisma.$transaction(
    users.map((user) =>
      prisma.participant.create({
        data: {
          userId: user.id,
          groupId: faker.helpers.arrayElement(groups).id,
          role: "MEMBER",
        },
      })
    )
  );
  console.log("✅ Participações atribuídas");

  const postTypes = [PostType.NORMAL, PostType.EVENT, PostType.CLASS];

  const categories = await Promise.all(
    groups.flatMap((group) =>
      Array.from({ length: 2 }).map(() =>
        prisma.category.create({
          data: {
            name: faker.lorem.word(),
            type: faker.helpers.arrayElement(postTypes),
            groupId: group.id,
          },
        })
      )
    )
  );
  console.log("✅ Categorias criadas");

  const posts = await Promise.all(
    categories.flatMap((category) =>
      Array.from({ length: 3 }).map(() => {
        const randomUser = faker.helpers.arrayElement(users);
        return prisma.post.create({
          data: {
            type: category.type,
            input: faker.lorem.paragraph(),
            title: faker.lorem.sentence(),
            schedule: faker.date.future(),
            urlLive: faker.internet.url(),
            urlRecorded: faker.internet.url(),
            categoryId: category.id,
            groupId: category.groupId,
            userId: randomUser.id,
            isPinned: faker.datatype.boolean(),
          },
        });
      })
    )
  );
  console.log("✅ Posts criados");

  const comments = await Promise.all(
    posts.flatMap((post) =>
      Array.from({ length: 2 }).map(() => {
        const randomUser = faker.helpers.arrayElement(users);
        return prisma.comment.create({
          data: {
            content: faker.lorem.sentence(),
            userId: randomUser.id,
            postId: post.id,
          },
        });
      })
    )
  );
  console.log("✅ Comentários criados");

  const files = await Promise.all(
    posts.flatMap((post, postIndex) =>
      Array.from({ length: faker.number.int({ min: 2, max: 4 }) }).map(async (_, fileIndex) => {
        const imageUrl = `https://picsum.photos/200?random=${postIndex * 10 + fileIndex}`;
        const base64 = await fetchImageBase64(imageUrl);

        return prisma.file.create({
          data: {
            title: faker.system.fileName(),
            type: "image/jpeg",
            content: base64,
            postId: post.id,
          },
        });
      })
    )
  );
  console.log("✅ Arquivos criados");


  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar o Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
