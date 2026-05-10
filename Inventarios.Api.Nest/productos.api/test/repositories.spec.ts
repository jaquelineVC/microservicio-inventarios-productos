import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepository } from '../src/infrastructure/repositories/product.repository';
import { UserRepository } from '../src/infrastructure/repositories/user.repository';
import { CategoryRepository } from '../src/infrastructure/repositories/category.repository';
import { ClientRepository } from '../src/infrastructure/repositories/client.repository';
import { QuotationRepository } from '../src/infrastructure/repositories/quotation.repository';
import { SupplierRepository } from '../src/infrastructure/repositories/supplier.repository';
import { ProductOrmEntity } from '../src/infrastructure/database/product.orm-entity';
import { UserOrmEntity } from '../src/infrastructure/database/user.orm-entity';
import { CategoryOrmEntity } from '../src/infrastructure/database/category.orm-entity';
import { ClientOrmEntity } from '../src/infrastructure/database/client.orm-entity';
import { QuotationOrmEntity } from '../src/infrastructure/database/quotation.orm-entity';
import { SupplierOrmEntity } from '../src/infrastructure/database/supplier.orm-entity';
import { ProductDomain } from '../src/domain/entities/product.entity';
import { UserDomain, UserRole } from '../src/domain/entities/user.entity';
import { CategoryDomain } from '../src/domain/entities/category.entity';
import { ClientDomain } from '../src/domain/entities/client.entity';
import { QuotationDomain } from '../src/domain/entities/quotation.entity';
import { SupplierDomain } from '../src/domain/entities/supplier.entity';

describe('Repositories Unit Tests', () => {
  describe('ProductRepository', () => {
    let repository: ProductRepository;
    let ormRepo: jest.Mocked<Repository<ProductOrmEntity>>;

    const mockProductOrm = {
      id: '1',
      name: 'Test Product',
      description: 'Description',
      price: 100,
      stock: 10,
      sku: 'SKU-001',
      imageUrl: '',
      categoryId: 'cat-1',
      supplierId: 'sup-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: { id: 'cat-1', name: 'Category' },
      supplier: { id: 'sup-1', name: 'Supplier' },
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProductRepository,
          {
            provide: getRepositoryToken(ProductOrmEntity),
            useValue: {
              find: jest.fn(),
              findOne: jest.fn(),
              save: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              exists: jest.fn(),
            },
          },
        ],
      }).compile();

      repository = module.get<ProductRepository>(ProductRepository);
      ormRepo = module.get(getRepositoryToken(ProductOrmEntity));
    });

    it('findAll debería retornar lista de productos', async () => {
      ormRepo.find.mockResolvedValue([mockProductOrm as any]);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProductDomain);
      expect(ormRepo.find).toHaveBeenCalledWith({ relations: ['category', 'supplier'] });
    });

    it('findById debería retornar null si no existe', async () => {
      ormRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById('inexistente');

      expect(result).toBeNull();
    });

    

    it('findById debería retornar producto si existe', async () => {
      ormRepo.findOne.mockResolvedValue(mockProductOrm as any);

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(ProductDomain);
      expect(result?.id).toBe('1');
    });

    it('search con categoryId debería aplicar filtro correctamente', async () => {
      ormRepo.find.mockResolvedValue([mockProductOrm as any]);

      await repository.search('test', 'cat-1');

      expect(ormRepo.find).toHaveBeenCalledWith({
        where: expect.arrayContaining([
          expect.objectContaining({ categoryId: 'cat-1' }),
          expect.objectContaining({ categoryId: 'cat-1' }),
        ]),
        relations: ['category', 'supplier'],
      });
    });
  });

  // Agregar dentro del describe('UserRepository')
describe('UserRepository - Additional Branches', () => {
  let repository: UserRepository;
  let ormRepo: jest.Mocked<Repository<UserOrmEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    ormRepo = module.get(getRepositoryToken(UserOrmEntity));
  });

  it('findById debería retornar null si no existe', async () => {
    ormRepo.findOne.mockResolvedValue(null);

    const result = await repository.findById('inexistente');

    expect(result).toBeNull();
    expect(ormRepo.findOne).toHaveBeenCalledWith({ where: { id: 'inexistente' } });
  });

  it('findById debería retornar usuario si existe', async () => {
    const mockUser = {
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      passwordHash: 'hash',
      role: 'Admin',
      isActive: true,
      createdAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
    };
    ormRepo.findOne.mockResolvedValue(mockUser as any);

    const result = await repository.findById('1');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('1');
  });

  it('existsByEmail debería retornar true si existe', async () => {
    ormRepo.exists.mockResolvedValue(true);

    const result = await repository.existsByEmail('test@test.com');

    expect(result).toBe(true);
    expect(ormRepo.exists).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
  });

  it('existsByEmail debería retornar false si no existe', async () => {
    ormRepo.exists.mockResolvedValue(false);

    const result = await repository.existsByEmail('noexiste@test.com');

    expect(result).toBe(false);
  });

  it('save debería guardar usuario correctamente', async () => {
    const userResult = UserDomain.create('Test User', 'test@test.com', 'hash123', UserRole.Admin);
    const user = userResult.value!;
    const mockOrm = {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
    };
    ormRepo.save.mockResolvedValue(mockOrm as any);

    await repository.save(user);

    expect(ormRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  });

  it('update debería actualizar cuando lockedUntil es null', async () => {
    const userResult = UserDomain.create('Test', 'test@test.com', 'hash', UserRole.Admin);
    const user = userResult.value!;
    ormRepo.update.mockResolvedValue({ affected: 1 } as any);

    await repository.update(user);

    expect(ormRepo.update).toHaveBeenCalledWith(user.id, {
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
    });
  });
});
  describe('CategoryRepository', () => {
    let repository: CategoryRepository;
    let ormRepo: jest.Mocked<Repository<CategoryOrmEntity>>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CategoryRepository,
          {
            provide: getRepositoryToken(CategoryOrmEntity),
            useValue: {
              find: jest.fn(),
              findOne: jest.fn(),
              save: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              exists: jest.fn(),
            },
          },
        ],
      }).compile();

      repository = module.get<CategoryRepository>(CategoryRepository);
      ormRepo = module.get(getRepositoryToken(CategoryOrmEntity));
    });

    it('update debería actualizar categoría correctamente', async () => {
      const categoryResult = CategoryDomain.create('Test', 'Description');
      const categoryDomain = categoryResult.value!;
      ormRepo.update.mockResolvedValue({ affected: 1 } as any);

      await repository.update(categoryDomain);

      expect(ormRepo.update).toHaveBeenCalledWith(categoryDomain.id, {
        name: categoryDomain.name,
        description: categoryDomain.description,
      });
    });
  });

  describe('ClientRepository', () => {
    let repository: ClientRepository;
    let ormRepo: jest.Mocked<Repository<ClientOrmEntity>>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ClientRepository,
          {
            provide: getRepositoryToken(ClientOrmEntity),
            useValue: {
              find: jest.fn(),
              findOne: jest.fn(),
              save: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              exists: jest.fn(),
            },
          },
        ],
      }).compile();

      repository = module.get<ClientRepository>(ClientRepository);
      ormRepo = module.get(getRepositoryToken(ClientOrmEntity));
    });

    it('update debería actualizar todos los campos del cliente', async () => {
      const clientResult = ClientDomain.create('Client', 'client@test.com', '1234567890', 'Address');
      const clientDomain = clientResult.value!;
      ormRepo.update.mockResolvedValue({ affected: 1 } as any);

      await repository.update(clientDomain);

      expect(ormRepo.update).toHaveBeenCalledWith(clientDomain.id, expect.objectContaining({
        name: clientDomain.name,
        email: clientDomain.email,
        phone: clientDomain.phone,
        address: clientDomain.address,
      }));
    });
  });

  describe('QuotationRepository', () => {
    let repository: QuotationRepository;
    let ormRepo: jest.Mocked<Repository<QuotationOrmEntity>>;

    const mockQuotationOrm = {
      id: '1',
      clientId: 'client-1',
      userId: 'user-1',
      items: [{ productId: 'p1', productName: 'P1', quantity: 1, unitPrice: 100, subtotal: 100 }],
      total: 100,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      client: { id: 'client-1', name: 'Client' },
      user: { id: 'user-1', name: 'User' },
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          QuotationRepository,
          {
            provide: getRepositoryToken(QuotationOrmEntity),
            useValue: {
              find: jest.fn(),
              findOne: jest.fn(),
              save: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              exists: jest.fn(),
            },
          },
        ],
      }).compile();

      repository = module.get<QuotationRepository>(QuotationRepository);
      ormRepo = module.get(getRepositoryToken(QuotationOrmEntity));
    });

    it('findAll debería cargar relaciones client y user', async () => {
      ormRepo.find.mockResolvedValue([mockQuotationOrm as any]);

      await repository.findAll();

      expect(ormRepo.find).toHaveBeenCalledWith({
        relations: ['client', 'user'],
      });
    });

    it('findById debería retornar null si no existe', async () => {
  ormRepo.findOne.mockResolvedValue(null);

  const result = await repository.findById('inexistente');

  expect(result).toBeNull();
});

it('findById debería retornar cotización con relaciones', async () => {
  ormRepo.findOne.mockResolvedValue(mockQuotationOrm as any);

  const result = await repository.findById('1');

  expect(result).toBeDefined();
  expect(ormRepo.findOne).toHaveBeenCalledWith({
    where: { id: '1' },
    relations: ['client', 'user'],
  });
});

it('findByUserId debería retornar cotizaciones del usuario', async () => {
  ormRepo.find.mockResolvedValue([mockQuotationOrm as any]);

  const result = await repository.findByUserId('user-1');

  expect(result).toHaveLength(1);
  expect(ormRepo.find).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
    relations: ['client', 'user'],
  });
});

it('delete debería eliminar cotización', async () => {
  ormRepo.delete.mockResolvedValue({ affected: 1 } as any);

  await repository.delete('1');

  expect(ormRepo.delete).toHaveBeenCalledWith('1');
});

    it('update debería actualizar solo status y updatedAt', async () => {
      const quotationResult = QuotationDomain.create('client-1', 'user-1', [
        { productId: 'p1', productName: 'P1', quantity: 1, unitPrice: 100, subtotal: 100 }
      ]);
      const quotationDomain = quotationResult.value!;
      ormRepo.update.mockResolvedValue({ affected: 1 } as any);

      await repository.update(quotationDomain);

      expect(ormRepo.update).toHaveBeenCalledWith(quotationDomain.id, {
        status: quotationDomain.status,
        updatedAt: quotationDomain.updatedAt,
      });
    });
  });

  describe('SupplierRepository', () => {
    let repository: SupplierRepository;
    let ormRepo: jest.Mocked<Repository<SupplierOrmEntity>>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SupplierRepository,
          {
            provide: getRepositoryToken(SupplierOrmEntity),
            useValue: {
              find: jest.fn(),
              findOne: jest.fn(),
              save: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              exists: jest.fn(),
            },
          },
        ],
      }).compile();

      repository = module.get<SupplierRepository>(SupplierRepository);
      ormRepo = module.get(getRepositoryToken(SupplierOrmEntity));
    });

    it('update debería actualizar proveedor correctamente', async () => {
      const supplierResult = SupplierDomain.create('Supplier', '1234567890', 'supplier@test.com', 'Address');
      const supplierDomain = supplierResult.value!;
      ormRepo.update.mockResolvedValue({ affected: 1 } as any);

      await repository.update(supplierDomain);

      expect(ormRepo.update).toHaveBeenCalledWith(supplierDomain.id, expect.objectContaining({
        name: supplierDomain.name,
        phone: supplierDomain.phone,
        email: supplierDomain.email,
        address: supplierDomain.address,
        isActive: supplierDomain.isActive,
      }));
    });
  });
});