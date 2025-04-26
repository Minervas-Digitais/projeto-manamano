import { Test, TestingModule } from '@nestjs/testing';

import { GroupService } from './group.service';
import { GroupController } from './group.controller';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ROLES_KEY } from '../auth/roles.decorator';

import { CreateGroupDto } from './dto/create-group.dto';
import { createGroupDto } from './dto/create-group.dto.factory';
import { UpdateGroupDto } from './dto/update-group.dto';
import { updateGroupDto } from './dto/update-group.dto.factory';


describe('GroupController', () => {
    let controller: GroupController;
    let service: GroupService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GroupController],
            providers: [
                {
                    provide: GroupService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    }
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<GroupController>(GroupController);
        service = module.get<GroupService>(GroupService);
    });

    describe("Segurança", () => {
        it('deve aplicar JwtAuthGuard nos endpoints', async () => {
            const guardCreate = Reflect.getMetadata('__guards__', GroupController.prototype.create);
            const guardFindAll = Reflect.getMetadata('__guards__', GroupController.prototype.findAll);
            const guardFindOne = Reflect.getMetadata('__guards__', GroupController.prototype.findOne);

            expect(guardCreate[0]).toBe(JwtAuthGuard);
            expect(guardFindAll[0]).toBe(JwtAuthGuard);
            expect(guardFindOne[0]).toBe(JwtAuthGuard);
        });

        it('deve aplicar RolesGuard nos endpoints findAll, update e remove', async () => {
            const guardFindAll = Reflect.getMetadata('__guards__', GroupController.prototype.findAll);
            const guardUpdate = Reflect.getMetadata('__guards__', GroupController.prototype.update);
            const guardRemove = Reflect.getMetadata('__guards__', GroupController.prototype.remove);

            expect(guardFindAll[1]).toBe(RolesGuard);
            expect(guardUpdate[1]).toBe(RolesGuard);
            expect(guardRemove[1]).toBe(RolesGuard);
        });

        it('deve exigir role ADMIN no findAll, update e remove', () => {
            const findAllRoles = Reflect.getMetadata(ROLES_KEY, GroupController.prototype.findAll);
            const updateRoles = Reflect.getMetadata(ROLES_KEY, GroupController.prototype.update);
            const removeRoles = Reflect.getMetadata(ROLES_KEY, GroupController.prototype.remove);

            expect(findAllRoles).toEqual(['ADMIN']);
            expect(updateRoles).toEqual(['ADMIN']);
            expect(removeRoles).toEqual(['ADMIN']);
        });
    })

    describe("create()", () => {
        it('deve criar um novo grupo', async () => {
            const dto: CreateGroupDto = createGroupDto({
                name: 'Grupo teste',
                inviteCode: 'Codigo teste',
                description: 'Grupo gerado para teste',
            });

            const expectedResult = { id: 1, name: 'Grupo Teste' };

            jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

            const result = await controller.create(dto);

            expect(result).toEqual(expectedResult);
            expect(service.create).toHaveBeenCalledWith(dto);
            expect(service.create).toHaveBeenCalledTimes(1);
        });

        it("deve retornar erro se falhar", async () => {
            const dto: CreateGroupDto = createGroupDto()
            jest.spyOn(service, 'create').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.create(dto)).rejects.toThrow('Erro no service');
        })
    })

    describe("findAll()", () => {
        it("deve retornar todos os grupos", async () => {
            const expectedResult: CreateGroupDto[] = [
                createGroupDto(),
                createGroupDto()
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

    describe("findOne()", () => {
        it("deve retornar o grupo do id", async () => {
            const id: string = '1';
            const expectedResult = { id: 1, name: 'Grupo Teste' };

            jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

            const result = await service.findOne(id)

            expect(result).toEqual(expectedResult)
            expect(service.findOne).toHaveBeenCalledTimes(1)
            expect(service.findOne).toHaveBeenCalledWith(id);
        })

        it("deve retornar erro se falhar", async () => {
            const id: string = "1";
            jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.findOne(id)).rejects.toThrow('Erro no service');
        })
    })

    describe("update()", () => {
        it("deve atualizar o grupo do id", async () => {
            const id: string = '1';

            const dto: UpdateGroupDto = updateGroupDto({ description: "nova descrição" })
            const newGroup: CreateGroupDto = createGroupDto({description: "nova descrição"})
            const expectedResult = { id: 1, ...newGroup};

            jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

            const result = await controller.update(id, dto);

            expect(result).toEqual(expectedResult);
            expect(service.update).toHaveBeenCalledTimes(1);
            expect(service.update).toHaveBeenCalledWith(id, dto);
        })

        it("deve retornar erro se falhar", async () => {
            const dto: UpdateGroupDto = updateGroupDto();
            const id: string = "1";
            jest.spyOn(service, 'update').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.update(id, dto)).rejects.toThrow('Erro no service');
        })

        it('deve retornar erro se "id" não for invalido', async () => {
            const dto: UpdateGroupDto = updateGroupDto()
            const id: string = "-1"

            jest.spyOn(service, 'update').mockRejectedValue(new Error('id invalido'));

            await expect(controller.update(id, dto)).rejects.toThrow('id invalido');
        });

        it('deve retornar erro se as informações de update não forem invalidas', async () => {
            const dto: UpdateGroupDto = {}
            const id: string = "-1"

            jest.spyOn(service, 'update').mockRejectedValue(new Error('infos invalidas'));

            await expect(controller.update(id, dto)).rejects.toThrow('infos invalidas');
        });
    })

    describe("remove()", () => { 
        it("deve remover o grupo do id", async () => {
            const id: string = '1';

            const expectedResult = 'Grupo deletado com sucesso.';

            jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

            const result = await controller.remove(id);

            expect(result).toEqual(expectedResult);
            expect(service.remove).toHaveBeenCalledTimes(1);
            expect(service.remove).toHaveBeenCalledWith(id);
        })

        it("deve retornar erro se falhar", async () => {
            const id: string = "1";
            jest.spyOn(service, 'remove').mockRejectedValue(new Error('Erro no service'));

            await expect(controller.remove(id)).rejects.toThrow('Erro no service');
        })

        it('deve retornar erro se "id" for invalido', async () => {
            const id: string = "-1"

            jest.spyOn(service, 'remove').mockRejectedValue(new Error('id invalido'));

            await expect(controller.remove(id)).rejects.toThrow('id invalido');
        });
    })

})