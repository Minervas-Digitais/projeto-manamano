const { PrismaClient, Prisma } = require('@prisma/client'); // Incluindo Prisma diretamente

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Verificando geração do Prisma Client...');
    
    // Verifica se o modelo Archive foi gerado
    if (prisma.archive) {
      console.log('Modelo Archive gerado com sucesso!');
    } else {
      console.error('Erro: Modelo Archive não foi gerado!');
    }

    // Verifica se o enum ArchiveType foi gerado
    if (Prisma.ArchiveType) {
      console.log('Enum ArchiveType gerado com sucesso!');
      console.log('Valores do ArchiveType:', Object.values(Prisma.ArchiveType));
    } else {
      console.error('Erro: Enum ArchiveType não foi gerado!');
    }
    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar Prisma Client:', error);
    process.exit(1);
  }

  
})();
