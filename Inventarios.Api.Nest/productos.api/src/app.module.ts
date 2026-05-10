import {
  Module, NestModule, MiddlewareConsumer, RequestMethod
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// ORM Entities
import { UserOrmEntity } from './infrastructure/database/user.orm-entity';
import { CategoryOrmEntity } from './infrastructure/database/category.orm-entity';
import { SupplierOrmEntity } from './infrastructure/database/supplier.orm-entity';
import { ProductOrmEntity } from './infrastructure/database/product.orm-entity';
import { ClientOrmEntity } from './infrastructure/database/client.orm-entity';
import { QuotationOrmEntity } from './infrastructure/database/quotation.orm-entity';

// Repositories
import { UserRepository } from './infrastructure/repositories/user.repository';
import { CategoryRepository } from './infrastructure/repositories/category.repository';
import { SupplierRepository } from './infrastructure/repositories/supplier.repository';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { ClientRepository } from './infrastructure/repositories/client.repository';
import { QuotationRepository } from './infrastructure/repositories/quotation.repository';

// Services
import { PasswordHasherService } from './infrastructure/services/password-hasher.service';
import { JwtServiceImpl } from './infrastructure/services/jwt.service';

// Guards
import { JwtStrategy } from './infrastructure/guards/jwt.strategy';

// Use Cases — Auth
import { LoginUseCase, HASHER_TOKEN, JWT_SERVICE_TOKEN } from './application/use-cases/auth/login.use-case';

// Use Cases — Products
import { GetAllProductsUseCase } from './application/use-cases/products/get-all-products.use-case';
import { GetProductByIdUseCase } from './application/use-cases/products/get-product-by-id.use-case';
import { SearchProductsUseCase } from './application/use-cases/products/search-products.use-case';
import { CreateProductUseCase } from './application/use-cases/products/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/products/delete-product.use-case';

// Use Cases — Categories
import { GetAllCategoriesUseCase } from './application/use-cases/categories/get-all-categories.use-case';
import { CreateCategoryUseCase } from './application/use-cases/categories/create-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/categories/delete-category.use-case';

// Use Cases — Suppliers
import { GetAllSuppliersUseCase } from './application/use-cases/suppliers/get-all-suppliers.use-case';
import { CreateSupplierUseCase } from './application/use-cases/suppliers/create-supplier.use-case';
import { DeleteSupplierUseCase } from './application/use-cases/suppliers/delete-supplier.use-case';

// Use Cases — Clients
import { GetAllClientsUseCase } from './application/use-cases/clients/get-all-clients.use-case';
import { CreateClientUseCase } from './application/use-cases/clients/create-client.use-case';

// Use Cases — Quotations
import { CreateQuotationUseCase } from './application/use-cases/quotations/create-quotation.use-case';
import { GetAllQuotationsUseCase } from './application/use-cases/quotations/get-all-quotations.use-case';
import { GetMyQuotationsUseCase } from './application/use-cases/quotations/get-my-quotations.use-case';
import { ApproveQuotationUseCase } from './application/use-cases/quotations/approve-quotation.use-case';
import { RejectQuotationUseCase } from './application/use-cases/quotations/reject-quotation.use-case';
import { DeleteQuotationUseCase } from './application/use-cases/quotations/delete-quotation.use-case';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';
import { ProductsController } from './presentation/controllers/products.controller';
import { CategoriesController } from './presentation/controllers/categories.controller';
import { SuppliersController } from './presentation/controllers/suppliers.controller';
import { ClientsController } from './presentation/controllers/clients.controller';
import { QuotationsController } from './presentation/controllers/quotations.controller';

// Middleware
import { SecurityHeadersMiddleware } from './infrastructure/middleware/security-headers.middleware';
import { SanitizationMiddleware } from './infrastructure/middleware/sanitization.middleware';
// Segundo Plano
import { ScheduleModule } from '@nestjs/schedule';
import { StockMonitorService } from './infrastructure/services/stock-monitor.service';

//replica
import { ReplicaQueryService } from './infrastructure/services/replica-query.service';

@Module({
  imports: [
    // Config — lee el .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Scheduler — habilita los decoradores @Cron
    ScheduleModule.forRoot(),

    // TypeORM — conexión a MySQL
    TypeOrmModule.forRootAsync({
      name: 'master',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): object => ({
        type: 'mysql',
        name: 'master',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [
          UserOrmEntity, CategoryOrmEntity, SupplierOrmEntity,
          ProductOrmEntity, ClientOrmEntity, QuotationOrmEntity,
        ],
      synchronize: true,
      }),
    }),

    // ── TypeORM Replica (solo lectura) ────────────────────────────────
  TypeOrmModule.forRootAsync({
    name: 'replica',
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService): object => ({
      type: 'mysql',
      name: 'replica',
      host: config.get('DB_REPLICA_HOST') ?? config.get('DB_HOST'),
      port: config.get<number>('DB_REPLICA_PORT') ?? 3306,
      username: config.get('DB_USERNAME'),
      password: config.get('DB_PASSWORD'),
      database: config.get('DB_REPLICA_DATABASE') ?? config.get('DB_DATABASE'),
      entities: [
        UserOrmEntity, CategoryOrmEntity, SupplierOrmEntity,
        ProductOrmEntity, ClientOrmEntity, QuotationOrmEntity,
      ],
      synchronize: false, // Réplica NUNCA sincroniza — solo lee
    }),
  }),

    // Throttler — Rate Limiting (DDoS/Fuerza Bruta)
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 50 },
      { name: 'long', ttl: 60000, limit: 200 },
    ]),

    // TypeORM repositories
    TypeOrmModule.forFeature([
  UserOrmEntity, CategoryOrmEntity, SupplierOrmEntity,
  ProductOrmEntity, ClientOrmEntity, QuotationOrmEntity,
], 'master'),

TypeOrmModule.forFeature([
  UserOrmEntity, CategoryOrmEntity, SupplierOrmEntity,
  ProductOrmEntity, ClientOrmEntity, QuotationOrmEntity,
], 'replica'),

    // Passport + JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService): object => ({
    secret: config.get<string>('JWT_SECRET') ?? 'secret',
    signOptions: {
      expiresIn: 28800,
    },
  }),
}),
  ],

  controllers: [
    AuthController,
    ProductsController,
    CategoriesController,
    SuppliersController,
    ClientsController,
    QuotationsController,
  ],

  providers: [
    // Repositories — DIP: interfaz → implementación
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IProductRepository', useClass: ProductRepository },
    { provide: 'ICategoryRepository', useClass: CategoryRepository },
    { provide: 'ISupplierRepository', useClass: SupplierRepository },
    { provide: 'IClientRepository', useClass: ClientRepository },
    { provide: 'IQuotationRepository', useClass: QuotationRepository },

    // Services
    { provide: HASHER_TOKEN, useClass: PasswordHasherService },
    { provide: JWT_SERVICE_TOKEN, useClass: JwtServiceImpl },

    // Guards & Strategy
    JwtStrategy,

    // Segundo Plano
    StockMonitorService,
    //Replica
    ReplicaQueryService,
    // Use Cases
    LoginUseCase,
    GetAllProductsUseCase, GetProductByIdUseCase, SearchProductsUseCase,
    CreateProductUseCase, UpdateProductUseCase, DeleteProductUseCase,
    GetAllCategoriesUseCase, CreateCategoryUseCase, DeleteCategoryUseCase,
    GetAllSuppliersUseCase, CreateSupplierUseCase, DeleteSupplierUseCase,
    GetAllClientsUseCase, CreateClientUseCase,
    CreateQuotationUseCase, GetAllQuotationsUseCase, GetMyQuotationsUseCase,
    ApproveQuotationUseCase, RejectQuotationUseCase, DeleteQuotationUseCase,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityHeadersMiddleware, SanitizationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}