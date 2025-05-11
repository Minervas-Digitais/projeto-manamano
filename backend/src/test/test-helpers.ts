import request from 'supertest';
import { INestApplication } from '@nestjs/common';

// Função para criar um usuário e retornar o token
export async function createUserAndLogin(app: INestApplication, email: string, password: string, roles: string[] = []): Promise<string> {
  // Criar usuário
  const createUserResponse = await request(app.getHttpServer())
    .post('/user')
    .send({
      fullName: 'Test User',
      email: email,
      phone: '1234567890',
      hash: password,
      roles: roles, // Se roles estiver vazio, o usuário será criado com o role padrão
    })
    .expect(201);

  // Fazer login e pegar o token
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: email,
      password: password,
    })
    .expect(201);

  // Retornar o token do login
  return loginResponse.body.accessToken;
}
