import { Test, TestingModule } from '@nestjs/testing';

import { CategoryService } from './category.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { createCategoryDto } from './dto/create-category.dto.factory';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { updateCategoryDto } from './dto/update-category.dto.factory';

import { PrismaService } from '../prisma/prisma.service';

import { NotFoundException } from '@nestjs/common';
import { PostType } from '@prisma/client';

describe("CategoryService", () => {
    let service: CategoryService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide: PrismaService,
                    useValue: {
                        category: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn()
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<CategoryService>(CategoryService);
        prismaService = module.get<PrismaService>(PrismaService);
    });


    describe("create()", () => {
        it("deve criar uma categoria", async () => {
            const category: CreateCategoryDto = createCategoryDto();
            const id = "1"
            const expectedResult = {
                id: id,
                ...category,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            jest.spyOn(prismaService.category, "create").mockResolvedValue(expectedResult)

            const result = await service.create(category);
            expect(result).toEqual(expectedResult)
            expect(prismaService.category.create).toHaveBeenCalledWith({ data: category });
            expect(prismaService.category.create).toHaveBeenCalledTimes(1)

        })

        it('deve retornar erro se falhar ao criar categoria', async () => {
            const dto: CreateCategoryDto = createCategoryDto();

            const error = new Error('Erro no banco de dados');

            jest.spyOn(prismaService.category, 'create').mockRejectedValue(error);


            await expect(service.create(dto)).resolves.toEqual(error);
        });
    })

    describe("findAll()", () => {
        it("deve retornar todas as categorias", async () => {

            const categories = [
                {
                    id: "1",
                    ...createCategoryDto(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: "2",
                    ...createCategoryDto(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            ]

            jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(categories);
            const result = await service.findAll();

            expect(result).toEqual(categories);
            expect(prismaService.category.findMany).toHaveBeenCalled();
        })

        it('deve lançar erro quando não houver categorias no banco', async () => {
            jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(null);

            const result = await service.findAll();

            expect(result).toBeInstanceOf(NotFoundException);
            expect(result.message).toBe('Não há categorias cadastradas.');
        })

    })

    describe("findCategoriesInGroup()", () => {

        it('deve lançar erro quando não houver categorias no banco', async () => {
            const groupId = "1";
            jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(null);

            const result = await service.findCategoriesInGroup(groupId);

            expect(result).toBeInstanceOf(NotFoundException);
            expect(result.message).toBe('Não há categorias cadastradas.');
        })

        it('deve retornar categorias quando houver categorias para o grupo', async () => {
            const categories = [
                {
                    id: "1",
                    ...createCategoryDto(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: "2",
                    ...createCategoryDto(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            ]

            jest.spyOn(prismaService.category, 'findMany').mockResolvedValue(categories);

            const groupId = 'grupo123';
            const result = await service.findCategoriesInGroup(groupId);
            expect(result).toEqual(categories);
        });
    })

    describe("findOne()", () => {
        it('deve lançar erro quando não encontrara a categoria no banco', async () => {
            const id = "1";
            jest.spyOn(prismaService.category, 'findUnique').mockResolvedValue(null);

            const result = await service.findOne(id);

            expect(result).toBeInstanceOf(NotFoundException);
            expect(result.message).toBe('Categoria não encontrada.');
        })

        it("deve retornar a categoria do id", async () => {
            const category: CreateCategoryDto = createCategoryDto();
            const id = "1";

            const expectedResult = {
                id: "1",
                ...category,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            jest.spyOn(prismaService.category, "findUnique").mockResolvedValue(expectedResult);

            const result = await service.findOne(id);

            expect(result).toEqual(expectedResult);
        })
    })

    describe("update()", () => {
        it("deve retornar a categoria atualizada quando a categoria for encontrada", async () => {
            const id = '1';
            const updateDto: UpdateCategoryDto = createCategoryDto();

            const expectedResult = {
                ...updateDto,
                id,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, "findOne").mockResolvedValue({ ...updateDto, id, })
            jest.spyOn(prismaService.category, 'update').mockResolvedValue(expectedResult as any);


            const result = await service.update(id, updateDto);

            expect(result).toEqual(expectedResult);
        })

        it('deve lançar erro quando não encontrara a categoria no banco', async () => {
            const id = '1';
            const updateDto: UpdateCategoryDto = createCategoryDto();

            jest.spyOn(service, 'findOne').mockResolvedValue(new NotFoundException('Categoria não encontrada.'));

            const result = await service.update(id, updateDto);


            expect(result).toBeInstanceOf(NotFoundException);
            expect(result.message).toBe('Categoria não encontrada.');
        })

        it('deve retornar erro inesperado se ocorrer falha na atualização', async () => {
            const id = '1';
            const updateDto: UpdateCategoryDto = createCategoryDto();

            jest.spyOn(service, 'findOne').mockResolvedValue({ id, name: 'Categoria Existente' });
            jest.spyOn(prismaService.category, 'update').mockRejectedValue(new Error('Erro inesperado na atualização'));


            const result = await service.update(id, updateDto);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Erro inesperado na atualização');
        });

    })

    describe("remove()", () => {
        it("deve remover a categoria do id especificado", async () => {
            const id = "1"
            const category: CreateCategoryDto = createCategoryDto();

            const findResponse = {
                id,
                ...category,
                createAt: new Date(),
                updatedAt: new Date(),
            }
            jest.spyOn(service, "findOne").mockResolvedValue(findResponse)
            jest.spyOn(prismaService.category, 'delete').mockResolvedValue(findResponse as any);


            const result = await service.remove(id);
            expect(result).toEqual(findResponse);

        })

        it('deve lançar NotFoundException quando a categoria não for encontrada', async () => {
            const id = '1';

            jest.spyOn(service, 'findOne').mockResolvedValue(new NotFoundException('Categoria não encontrada.'));

            const result = await service.remove(id);

            expect(result).toBeInstanceOf(NotFoundException);
            expect(result.message).toBe('Categoria não encontrada.');
        });

        it('deve retornar erro inesperado se ocorrer falha na remoção', async () => {
            const id = '1';
            jest.spyOn(service, 'findOne').mockResolvedValue({ id, name: 'Categoria Existente' });

            jest.spyOn(prismaService.category, 'delete').mockRejectedValue(new Error('Erro inesperado na remoção'));

            const result = await service.remove(id);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Erro inesperado na remoção');
        });
    })
})