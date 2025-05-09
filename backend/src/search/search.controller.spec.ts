import { Test, TestingModule } from '@nestjs/testing';

import { SearchService } from './search.service';
import { SearchController } from './search.controller';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { createSearchDto } from './dto/create-search.dto.factory';
import { CreateSearchDto } from './dto/create-search.dto';


describe('SearchController', () => {
    let controller: SearchController;
    let service: SearchService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SearchController],
            providers: [
                {
                    provide: SearchService,
                    useValue: {
                        search: jest.fn(),
                        searchByFilter: jest.fn(),
                    }
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<SearchController>(SearchController);
        service = module.get<SearchService>(SearchService);
    });

    describe("Segurança", () => {
        it('deve aplicar JwtAuthGuard nos endpoints', async () => {
            const guardSearch = Reflect.getMetadata('__guards__', SearchController.prototype.search);
            const guardSearchByFilter = Reflect.getMetadata('__guards__', SearchController.prototype.searchByFilter);

            expect(guardSearch[0]).toBe(JwtAuthGuard);
            expect(guardSearchByFilter[0]).toBe(JwtAuthGuard);
        });
    })

    describe("search()", () => {
        it('deve charmar o service e retornar as informações', async () => {
            const dto: CreateSearchDto = createSearchDto();
            const resultadoEsperado = ['resultado 1', 'resultado 2'];

            jest.spyOn(service, 'search').mockResolvedValue(resultadoEsperado);

            const resultado = await controller.search(dto);

            expect(service.search).toHaveBeenCalledWith(dto);
            expect(resultado).toEqual(resultadoEsperado);
        });

        it('deve lidar com falha no SearchService e lançar erro', async () => {
            const dto: CreateSearchDto = createSearchDto();


            jest.spyOn(service, 'search').mockRejectedValue(new Error('Erro no service'));
            await expect(controller.search(dto)).rejects.toThrow('Erro no service');

        });
    })

    describe("searchByFilter()", () => {
        it('deve chamar searchService.searchByFilter com o DTO e o filtro e retornar o resultado', async () => {
            const dto: CreateSearchDto = createSearchDto();
            const filtro = 'books';
            const resultadoEsperado = ['resultado 1', 'resultado 2'];

            jest.spyOn(service, 'searchByFilter').mockResolvedValue(resultadoEsperado);

            const resultado = await controller.searchByFilter(dto, filtro);

            expect(service.searchByFilter).toHaveBeenCalledWith(dto, filtro);
            expect(resultado).toEqual(resultadoEsperado);
        });

        it('deve lidar com falha no SearchService e lançar erro', async () => {
            const dto: CreateSearchDto = createSearchDto();
            const filtro = 'books';

            jest.spyOn(service, 'searchByFilter').mockRejectedValue(new Error('Erro no service'));
            await expect(controller.searchByFilter(dto, filtro)).rejects.toThrow('Erro no service');

        });
    })
})