import { Test, TestingModule } from '@nestjs/testing';

import { CreateGroupDto } from './dto/create-group.dto';
import { createGroupDto } from './dto/create-group.dto.factory';
import { UpdateGroupDto } from './dto/update-group.dto';
import { updateGroupDto } from './dto/update-group.dto.factory';

import { GroupService } from './group.service';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaPromise } from '@prisma/client';

import { NotFoundException } from '@nestjs/common';


describe("GroupService", () => {
    let service: GroupService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GroupService,
                {
                    provide: PrismaService,
                    useValue: {
                        group: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<GroupService>(GroupService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('Funções Auxiliares', () => {
        describe('isInviteCodeUnique()', () => {
            it('deve retornar verdadeiro se o inviteCode for único', async () => {
                const inviteCode = 'inviteCode';

                jest.spyOn(prismaService.group, 'findUnique').mockResolvedValue(null);

                const result = await (service as any).isInviteCodeUnique(inviteCode);

                expect(result).toBe(true);
                expect(prismaService.group.findUnique).toHaveBeenCalledWith({
                    where: { inviteCode },
                });
            });

            it('deve retornar falso se o inviteCode já existir', async () => {
                const inviteCode = 'inviteCode';
                const group: CreateGroupDto = createGroupDto();

                jest.spyOn(prismaService.group, 'findUnique').mockResolvedValue({ 
                    id: '1', ...group, createdAt: new Date(), updatedAt: new Date() 
                });

                const result = await (service as any).isInviteCodeUnique(inviteCode);

                expect(result).toBe(false);
            });

            it('deve retornar erro se o prisma falhar', async () => {
                const inviteCode = 'inviteCode';

                jest.spyOn(prismaService.group, 'findUnique').mockRejectedValue(new Error('Erro no banco'));

                const result = await (service as any).isInviteCodeUnique(inviteCode);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe('Erro no banco');
            });
        });

        describe("generateInviteCode()", () => {
            it("deve gerar e retornar um inviteCode de 8 caracteres", () => {
                const result = (service as any).generateInviteCode();

                expect(result).toHaveLength(8);
                expect(typeof result).toBe('string');
            })

            it("deve gerar e retornar um inviteCode com tamanho customizado", () => {
                const length = 55;
                const result = (service as any).generateInviteCode(length);

                expect(result).toHaveLength(length);
                expect(typeof result).toBe('string');
            })

            it('deve conter apenas caracteres válidos (A-Z, a-z, 0-9) no inviteCode gerado', () => {
                const result = (service as any).generateInviteCode(20);
                const regex = /^[A-Za-z0-9]+$/;

                expect(typeof result).toBe('string');
                expect(regex.test(result)).toBe(true);
            });
        });

        describe("generateUniqueInviteCode()", () => {
            it("deve retonar um inviteCode único válido", async () => {
                const mockCode = "MOCK"

                jest.spyOn(service as any, 'generateInviteCode').mockReturnValue(mockCode);

                jest.spyOn(service as any, 'isInviteCodeUnique').mockResolvedValue(true);

                const result = await (service as any).generateUniqueInviteCode();

                expect(result).toBe(mockCode);
                expect(typeof result).toBe('string');
                expect((service as any).generateInviteCode).toHaveBeenCalled();
                expect((service as any).isInviteCodeUnique).toHaveBeenCalledWith(mockCode);
            })

            it('deve repetir até encontrar um código único', async () => {
                const firstTry = 'DUPLICADO';
                const secondTry = 'UNICO';

                const generateSpy = jest
                    .spyOn(service as any, 'generateInviteCode')
                    .mockReturnValueOnce(firstTry)
                    .mockReturnValueOnce(secondTry);

                const uniqueCheckSpy = jest
                    .spyOn(service as any, 'isInviteCodeUnique')
                    .mockResolvedValueOnce(false)
                    .mockResolvedValueOnce(true);

                const result = await (service as any).generateUniqueInviteCode();

                expect(result).toBe(secondTry);
                expect(typeof result).toBe('string');
                expect(generateSpy).toHaveBeenCalledTimes(2);
                expect(uniqueCheckSpy).toHaveBeenCalledTimes(2);
            });

            it('deve retornar erro se falhar', async () => {
                jest.spyOn(service as any, 'generateInviteCode').mockImplementation(() => {
                    throw new Error('Erro ao gerar código');
                });

                const result = await (service as any).generateUniqueInviteCode();

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe('Erro ao gerar código');
            });
        });
    })

    describe("create()", () => {
        it("deve criar um novo grupo", async () => {
            const group: CreateGroupDto = createGroupDto();
            const id: string = "1";

            const expectedResult = { id, ...group, createdAt: new Date(), updatedAt: new Date() }

            jest.spyOn(prismaService.group, "create").mockResolvedValue(
                { id, ...group, createdAt: new Date(), updatedAt: new Date() })

            const result = await (service as any).create(group)
            expect(result).toEqual(expectedResult)
            expect(prismaService.group.create).toHaveBeenCalledTimes(1)
        });

        it("deve retornar erro se a criação falhar", async () => {
            const group: CreateGroupDto = createGroupDto();

            jest
                .spyOn(prismaService.group, "create")
                .mockRejectedValue(new Error("Erro no banco"));

            const result = await (service as any).create(group);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Erro no banco");
        });
    })

    describe("findAll()", () => {
        it("deve retornar todos os grupos", async () => {
            const group: CreateGroupDto = createGroupDto();
            const id: string = "1"


            const expectedResult = [{ id, ...group, createdAt: new Date(), updatedAt: new Date() }]

            jest.spyOn(prismaService.group, "findMany")
                .mockImplementation(() => Promise.resolve(expectedResult) as unknown as PrismaPromise<typeof expectedResult>);

            const result = await (service as any).findAll()

            expect(result).toEqual(expectedResult)
            expect(prismaService.group.findMany).toHaveBeenCalledTimes(1)
        });

        it("deve retornar erro quando nenhum grupo cadastrado", async () => {
            jest.spyOn(prismaService.group, "findMany").mockResolvedValue([]);

            const result = await service.findAll();

            expect(prismaService.group.findMany).toHaveBeenCalled();
            expect(result).toBeInstanceOf(NotFoundException);
            expect(result.message).toBe('Não há grupos cadastrados.');
        });

        it("deve retornar erro quando falhar na busca dos grupos", async () => {
            jest.spyOn(prismaService.group, "findMany").mockRejectedValue(new Error("Erro ao buscar grupos"));

            const result = await service.findAll();

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Erro ao buscar grupos");
        });
    })

    describe("findOne()", () => {
        it("deve retornar o grupo correspondente ao 'id'", async () => {
            const id: string = "1";
            const group: CreateGroupDto = createGroupDto();

            const expectedResult = { id, ...group, createdAt: Date(), updatedAt: Date() }

            jest.spyOn(prismaService.group, "findUnique").mockReturnValue(expectedResult as any)

            const result = await service.findOne(id)

            expect(result).toEqual(expectedResult)
            expect(prismaService.group.findUnique).toHaveBeenCalledTimes(1)
        });

        it("deve retornar erro se o grupo não for encontrado", async () => {
            const id: string = "1";
            jest.spyOn(prismaService.group, "findUnique").mockResolvedValue(false as any);

            const result = await service.findOne(id);

            expect(prismaService.group.findUnique).toHaveBeenCalled();
            expect(result).toBeInstanceOf(NotFoundException);
            expect(result.message).toBe('Grupo não encontrado.');
        });

    })

    describe("update()", () => {
        it("deve atualizar um grupo", async () => {
            const id: string = "1";
            const groupUp: UpdateGroupDto = updateGroupDto({ description: "nova descrição" });
            const group: CreateGroupDto = createGroupDto();

            const expectedValue = {
                id,
                ...groupUp,
                createdAt: Date(),
                updatedAt: Date()
            }

            jest.spyOn(service, "findOne").mockResolvedValue(group);
            jest.spyOn(prismaService.group, "update").mockReturnValue(expectedValue as any);

            const result = await service.update(id, groupUp);

            expect(result).toEqual(expectedValue)
            expect(prismaService.group.update).toHaveBeenCalledWith({
                where: { id },
                data: groupUp,
            });
        });

        it("deve retornar erro se não encontrar um grupo", async () => {
            const id: string = "1";
            const groupUp: UpdateGroupDto = updateGroupDto({ description: "nova descrição" });

            const mockError = new Error('');

            jest.spyOn(service, "findOne").mockResolvedValue(mockError);

            const updateSpy = jest.spyOn(prismaService.group, 'update');

            const result = await service.update(id, groupUp)

            expect(result).toBe(mockError);
            expect(result).toBeInstanceOf(Error);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it("deve retornar erro quando falhar ao atualizar o grupo", async () => {
            const id = '1';
            const updateGroupDto: UpdateGroupDto = { description: "Nova descrição" };

            jest.spyOn(service, "findOne").mockResolvedValue(new Error("Grupo não encontrado"));
            
            const updateSpy = jest.spyOn(prismaService.group, "update");
          
            const result = await service.update(id, updateGroupDto);
          
            expect(result).toBeInstanceOf(Error); 
            expect(result.message).toBe("Grupo não encontrado"); 
            expect(updateSpy).not.toHaveBeenCalled(); 
        });
    })

    describe("remove()", () => {
        it("deve remover o grupo do banco de dados", async () => {
            const id: string = "1";
            const group: CreateGroupDto = createGroupDto()

            jest.spyOn(service, "findOne").mockResolvedValue(group);

            const result = await service.remove(id)

            expect(result).toEqual('Grupo deletado com sucesso.')
            expect(service.findOne).toHaveBeenCalledTimes(1)
            expect(service.findOne).toHaveBeenCalledWith(id)
            expect(prismaService.group.delete).toHaveBeenCalledTimes(1)
        });

        it("deve retornar erro se não encontrar um grupo", async () => {
            const id: string = "1";
            const mockError = new Error('');

            jest.spyOn(service, "findOne").mockResolvedValue(mockError);

            const updateSpy = jest.spyOn(prismaService.group, 'delete');

            const result = await service.remove(id)

            expect(result).toBe(mockError);
            expect(result).toBeInstanceOf(Error);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    })
})