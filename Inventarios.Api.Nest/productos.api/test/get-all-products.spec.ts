import { GetAllProductsUseCase } from '../src/application/use-cases/products/get-all-products.use-case';
import { ProductDomain } from '../src/domain/entities/product.entity';

describe('GetAllProductsUseCase', () => {
  let useCase: GetAllProductsUseCase;
  let productRepository: any;

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
    };
    useCase = new GetAllProductsUseCase(productRepository);
  });

  it('should handle products with null categoryName and supplierName', async () => {
    const productWithoutRelations = ProductDomain.create({
      name: 'Test',
      description: 'Test',
      price: 100,
      stock: 10,
      sku: 'SKU-001',
      imageUrl: '',
      categoryId: 'cat-1',
      supplierId: 'sup-1',
    }).value!;

    // Mock product without category/supplier names
    const mockProduct = Object.assign(productWithoutRelations, {
      categoryName: null,
      supplierName: null,
    });

    productRepository.findAll.mockResolvedValue([mockProduct]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value![0].categoryName).toBe('');
    expect(result.value![0].supplierName).toBe('');
  });
});