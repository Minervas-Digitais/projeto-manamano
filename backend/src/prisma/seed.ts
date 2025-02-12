import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function fetchImageBase64(url: string): Promise<string> {
    const { default: fetch } = await import('node-fetch'); // Importação dinâmica correta
    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
    } catch (error) {
        console.error("Erro ao baixar imagem:", error);
        return ""; // Retorna string vazia se falhar
    }
}

async function main() {
    console.log("🌱 Iniciando Seed do Banco...");

    const numberOfUsers = 10;
    const numberOfGroups = 3;

    // Criando usuários fictícios
    const users = await Promise.all(
        Array.from({ length: numberOfUsers }, async () => {
            return prisma.user.create({
                data: {
                    fullName: faker.person.fullName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number(),
                    hash: faker.internet.password(), // Campo correto do Prisma
                    birthday: faker.date.past({ years: 30 }),
                    bio: faker.person.bio(),
                    neighborhood: faker.location.city(),
                    enterprise: faker.company.name(),
                    expertise: faker.person.jobTitle(),
                },
            });
        })
    );

    // Criando grupos fictícios
    const groups = await Promise.all(
        Array.from({ length: numberOfGroups }, async () => {
            return prisma.group.create({
                data: {
                    name: faker.company.name(),
                    description: faker.lorem.sentence(),
                    inviteCode: faker.string.uuid(), // Adiciona um código único para cada grupo
                },
            });
        })
    );

    // Relacionando usuários e grupos (cada usuário entra em um grupo aleatório)
    await prisma.$transaction(
        users.map(user =>
            prisma.participant.create({
                data: {
                    userId: user.id,
                    groupId: faker.helpers.arrayElement(groups).id,
                    role: "MEMBER", // Define todos como membros inicialmente
                },
            })
        )
    );

    console.log("✅ Seed finalizado com sucesso!");
}

main()
    .catch((e) => {
        console.error("❌ Erro ao rodar o Seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
