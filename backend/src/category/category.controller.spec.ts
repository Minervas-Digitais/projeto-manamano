import { Test, TestingModule } from '@nestjs/testing';
import { PostType } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { createCategoryDto } from './dto/create-category.dto.factory';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException } from '@nestjs/common';


describe("CategoryController", () => {
    let controller: CategoryController;
    let service: CategoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoryController],
            providers: [
                {
                    provide: CategoryService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findCategoriesInGroup: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn()
                    }
                }
            ]
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CategoryController>(CategoryController);
        service = module.get<CategoryService>(CategoryService);
    })

    describe("Segurança", () => {
        it('deve aplicar JwtAuthGuard nos endpoints', async () => {
            const guardCreate = Reflect.getMetadata('__guards__', CategoryController.prototype.create);
            const guardFindAll = Reflect.getMetadata('__guards__', CategoryController.prototype.findAll);
            const guardfindCategoriesInGroup = Reflect.getMetadata('__guards__', CategoryController.prototype.findCategoriesInGroup);
            const guardFindOne = Reflect.getMetadata('__guards__', CategoryController.prototype.findOne);
            const guardUpdate = Reflect.getMetadata('__guards__', CategoryController.prototype.update);
            const guardRemove = Reflect.getMetadata('__guards__', CategoryController.prototype.remove);

            expect(guardCreate[0]).toBe(JwtAuthGuard);
            expect(guardFindAll[0]).toBe(JwtAuthGuard);
            expect(guardfindCategoriesInGroup[0]).toBe(JwtAuthGuard);
            expect(guardFindOne[0]).toBe(JwtAuthGuard);
            expect(guardUpdate[0]).toBe(JwtAuthGuard);
            expect(guardRemove[0]).toBe(JwtAuthGuard);
        });
    })

    describe("create()", () => {
        it("deve criar uma nova categoria", async () => {
            const dto: CreateCategoryDto = createCategoryDto();

            const expectedResult: CreateCategoryDto = {
                name: 'Grupo Padrão',
                type: PostType.NORMAL,
                groupId: 'Descrição padrão',
            }
            jest.spyOn(service, "create").mockResolvedValue(expectedResult);

            const result = await controller.create(dto)

            expect(result).toEqual(expectedResult);
            expect(service.create).toHaveBeenCalledWith(dto);
            expect(service.create).toHaveBeenCalledTimes(1);
        })

        it("deve retornar erro se falhar", async () => {
            const dto: CreateCategoryDto = createCategoryDto();

            jest.spyOn(service, 'create').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.create(dto)).rejects.toThrow('Erro no service');
        })
    })

    describe("findAll()", () => {
        it("deve retornar todas as categorias", async () => {
            const expectedResult = [
                createCategoryDto(),
                createCategoryDto(),
            ]

            jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

            const result = await controller.findAll();

            expect(result).toEqual(expectedResult);
            expect(service.findAll).toHaveBeenCalledTimes(1);
        })

        it("deve retornar erro se falhar", async () => {
            jest.spyOn(service, 'findAll').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.findAll()).rejects.toThrow('Erro no service');
        })
    })

    describe("findCategoriesInGroup()", () => {
        it("deve retornar as categorias do grupo do ID", async () => {
            const groupId = "1";
            const expectedResult = createCategoryDto();

            jest.spyOn(service, "findCategoriesInGroup").mockResolvedValue(expectedResult);

            const result = await controller.findCategoriesInGroup(groupId);

            expect(result).toEqual(expectedResult);
            expect(service.findCategoriesInGroup).toHaveBeenCalledWith(groupId);
            expect(service.findCategoriesInGroup).toHaveBeenCalledTimes(1);
        })

        it("deve retornar erro se falhar", async () => {
            const groupId = "1";
            jest.spyOn(service, 'findCategoriesInGroup').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.findCategoriesInGroup(groupId)).rejects.toThrow('Erro no service');
        })
    })

    describe("findOne()", () => {
        it("deve retornar a categorias do ID", async () => {
            const id = "1";
            const expectedResult = createCategoryDto();

            jest.spyOn(service, "findOne").mockResolvedValue(expectedResult);

            const result = await controller.findOne(id);

            expect(result).toEqual(expectedResult);
            expect(service.findOne).toHaveBeenCalledTimes(1);
            expect(service.findOne).toHaveBeenCalledWith(id);

        })

        it("deve retornar erro se falhar", async () => {
            const id = "1";
            jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.findOne(id)).rejects.toThrow('Erro no service');
        })
    })

    describe("update()", () => {
        it("deve atualizar uma categoria com os novos dados", async () => {
            const id = '1';
            const updateDto: UpdateCategoryDto = {
                name: 'Categoria Atualizada',
                type: PostType.NORMAL,
                groupId: 'grupo123',
            };

            const expectedResult = { ...updateDto, id };

            jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

            const result = await controller.update(id, updateDto);

            expect(result).toEqual(expectedResult);
            expect(service.update).toHaveBeenCalledWith(id, updateDto);
            expect(service.update).toHaveBeenCalledTimes(1);
        })

        it('deve retornar erro se falhar', async () => {
            const id = '1';
            const updateDto: UpdateCategoryDto = {
                name: 'Categoria Atualizada',
                type: PostType.NORMAL,
                groupId: 'grupo123',
            };

            const error = new Error('Erro na atualização');

            jest.spyOn(service, 'update').mockRejectedValue(error);

            await expect(controller.update(id, updateDto)).rejects.toThrowError('Erro na atualização');
        });
    })

    describe("remove()", () => {
        it("deve remover a categoria do id", async () => {
            const id = "1";
            const expectedResult = { message: 'Categoria removida com sucesso' };

            jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

            const result = await controller.remove(id);

            expect(result).toEqual(expectedResult);
            expect(service.remove).toHaveBeenCalledWith(id);
            expect(service.remove).toHaveBeenCalledTimes(1);
        })

        it('deve lançar erro se a categoria não for encontrada', async () => {
            const id = '1';
            const error = new NotFoundException('Categoria não encontrada');

            jest.spyOn(service, 'remove').mockRejectedValue(error);


            await expect(controller.remove(id)).rejects.toThrow('Categoria não encontrada');
        });

        it("deve retornar erro se falhar", async () => {
            const id = "1";
            jest.spyOn(service, 'remove').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.remove(id)).rejects.toThrow('Erro no service');
        })
    })
})