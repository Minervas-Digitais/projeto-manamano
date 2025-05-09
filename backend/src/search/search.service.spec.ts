import { Test, TestingModule } from '@nestjs/testing';

import { createSearchDto } from './dto/create-search.dto.factory';
import { CreateSearchDto } from './dto/create-search.dto';

import { SearchService } from './search.service';

import { PrismaService } from '../prisma/prisma.service';
import { PostType, PrismaPromise, RoleType, UserRole } from '@prisma/client';

import { NotFoundException } from '@nestjs/common';



describe("SearchService", () => {
    let service: SearchService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findMany: jest.fn(),
                        },
                        group: {
                            findMany: jest.fn(),
                        },
                        post: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<SearchService>(SearchService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe("search()", () => {
        it("deve buscar as informações e retornar", async () => {
            const dto: CreateSearchDto = { input: 'teste' };

            const mockUsers = [
                {
                    id: '1',
                    fullName: 'Teste Usuário',
                    email: 'teste@dominio.com',
                    phone: '123456789',
                    hash: 'hash_exemplo',
                    role: UserRole.STUDENT,
                    savedPost: ['1', '2', '3'],
                    birthday: new Date('2000-01-01'),
                    ethnicity: 'Caucasian',
                    neighborhood: 'Centro',
                    expertise: 'Desenvolvimento de Software',
                    sysRole: RoleType.MEMBER,
                    enterprise: 'Empresa Exemplo',
                    bio: 'Bio do usuário',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const mockGroups = [{
                id: '1',
                name: 'Grupo Exemplo',
                createdAt: new Date('2022-01-01'),
                updatedAt: new Date('2023-01-01'),
                description: 'Descrição do grupo',
                inviteCode: 'ABC123',
            }];

            const mockPosts = [{
                id: '1',
                title: 'Post Exemplo 1',
                input: 'Conteúdo do post exemplo 1',
                createdAt: new Date('2022-01-01'),
                updatedAt: new Date('2023-01-01'),
                type: PostType.NORMAL,
                schedule: new Date('2023-12-01'),
                urlLive: 'https://link.com',
                urlRecorded: 'https://link.com',
                categoryId: '1',
                userId: '1',
                groupId: '1',
                isPinned: true,
            }];



            jest.spyOn(prismaService.user, "findMany").mockResolvedValue(mockUsers);
            jest.spyOn(prismaService.group, "findMany").mockResolvedValue(mockGroups);
            jest.spyOn(prismaService.post, "findMany").mockResolvedValue(mockPosts);

            const resultado = await service.search(dto);

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where: { fullName: { contains: dto.input, mode: 'insensitive' } },
                take: 5,
            });
            expect(prismaService.group.findMany).toHaveBeenCalledWith({
                where: { name: { contains: dto.input, mode: 'insensitive' } },
                take: 5,
            });
            expect(prismaService.post.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { title: { contains: dto.input, mode: 'insensitive' } },
                        { input: { contains: dto.input, mode: 'insensitive' } },
                    ],
                },
                take: 5,
            });

            expect(resultado).toEqual({
                users: mockUsers,
                groups: mockGroups,
                posts: mockPosts,
            });
        })

        it('deve retornar erro caso haja uma falha no serviço do user', async () => {
            const dto: CreateSearchDto = createSearchDto();

            jest
                .spyOn(prismaService.user, 'findMany')
                .mockRejectedValue(new Error('Erro no Prisma'));

            const result = await service.search(dto);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Erro no Prisma');
        });

        it('deve retornar erro caso haja uma falha no serviço do group', async () => {
            const dto: CreateSearchDto = createSearchDto();

            jest
                .spyOn(prismaService.group, 'findMany')
                .mockRejectedValue(new Error('Erro no Prisma'));

            const result = await service.search(dto);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Erro no Prisma');
        });

        it('deve retornar erro caso haja uma falha no serviço do post', async () => {
            const dto: CreateSearchDto = createSearchDto();

            jest
                .spyOn(prismaService.post, 'findMany')
                .mockRejectedValue(new Error('Erro no Prisma'));

            const result = await service.search(dto);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Erro no Prisma');
        });

        it('deve retornar estrutura vazia se nenhum resultado for encontrado', async () => {
            const dto = createSearchDto();

            jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);
            jest.spyOn(prismaService.group, 'findMany').mockResolvedValue([]);
            jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([]);

            const result = await service.search(dto);

            expect(result).toEqual({
                users: [],
                groups: [],
                posts: [],
            });
        });

    })

    describe("searchByFilter()", () => {
        it('deve retornar usuários quando o filtro for "users"', async () => {
            const mockUsers = [
                {
                    id: '1',
                    fullName: 'Teste Usuário',
                    email: 'teste@dominio.com',
                    phone: '123456789',
                    hash: 'hash_exemplo',
                    role: UserRole.STUDENT,
                    savedPost: ['1', '2', '3'],
                    birthday: new Date('2000-01-01'),
                    ethnicity: 'Caucasian',
                    neighborhood: 'Centro',
                    expertise: 'Desenvolvimento de Software',
                    sysRole: RoleType.MEMBER,
                    enterprise: 'Empresa Exemplo',
                    bio: 'Bio do usuário',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            const dto: CreateSearchDto = createSearchDto();
            jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

            const result = await service.searchByFilter(dto, 'users');

            expect(result).toEqual(mockUsers);
        });

        it('deve retornar grupos quando o filtro for "groups"', async () => {
            const mockGroups = [{
                id: '1',
                name: 'Grupo Exemplo',
                createdAt: new Date('2022-01-01'),
                updatedAt: new Date('2023-01-01'),
                description: 'Descrição do grupo',
                inviteCode: 'ABC123',
            }];
            const dto: CreateSearchDto = createSearchDto();
            jest.spyOn(prismaService.group, 'findMany').mockResolvedValue(mockGroups);

            const result = await service.searchByFilter(dto, 'groups');

            expect(result).toEqual(mockGroups);
        });

        it('deve retornar posts quando o filtro for "posts"', async () => {
            const mockPosts = [{
                id: '1',
                title: 'Post Exemplo 1',
                input: 'Conteúdo do post exemplo 1',
                createdAt: new Date('2022-01-01'),
                updatedAt: new Date('2023-01-01'),
                type: PostType.NORMAL,
                schedule: new Date('2023-12-01'),
                urlLive: 'https://link.com',
                urlRecorded: 'https://link.com',
                categoryId: '1',
                userId: '1',
                groupId: '1',
                isPinned: true,
            }];
            const dto: CreateSearchDto = createSearchDto();
            jest.spyOn(prismaService.post, 'findMany').mockResolvedValue(mockPosts);

            const result = await service.searchByFilter(dto, 'posts');

            expect(result).toEqual(mockPosts);
        });

        it('deve retornar erro quando o filtro for inválido', async () => {
            const dto: CreateSearchDto = createSearchDto();
            const result = await service.searchByFilter(dto, 'invalido');

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Invalid filter');
        });
    })
})