import { Result } from '../src/domain/common/result';
import { Price } from '../src/domain/value-objects/price.vo';
import { SKU } from '../src/domain/value-objects/sku.vo';
import { UserDomain, UserRole } from '../src/domain/entities/user.entity';
import { ProductDomain } from '../src/domain/entities/product.entity';
import { CategoryDomain } from '../src/domain/entities/category.entity';
import { SupplierDomain } from '../src/domain/entities/supplier.entity';
import { ClientDomain } from '../src/domain/entities/client.entity';
import { QuotationDomain } from '../src/domain/entities/quotation.entity';

function unwrap<T>(result: Result<T>): T {
  if (!result.isSuccess || !result.value) {
    throw new Error(result.error || 'Unexpected failure');
  }
  return result.value;
}

describe('Domain Unit Tests', () => {

  // ── Result Pattern ────────────────────────────────────────────────
  describe('Result', () => {
    it('success devuelve isSuccess true con valor', () => {
      const result = Result.success('test');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('test');
    });

    it('failure devuelve isFailure true con error', () => {
      const result = Result.failure<string>('Error de prueba');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Error de prueba');
    });
  });

  // ── Price Value Object ────────────────────────────────────────────
  describe('Price', () => {
    it('Price válido se crea correctamente', () => {
      const result = Price.create(99.99);
      expect(result.isSuccess).toBe(true);
      expect(result.value?.value).toBe(99.99);
    });
    // CODIGO NUEVO: Agrego tests para undefined y null
    it('Price undefined devuelve failure', () => {
  const result = Price.create(undefined as any);
  expect(result.isFailure).toBe(true);
});

it('Price null devuelve failure', () => {
  const result = Price.create(null as any);
  expect(result.isFailure).toBe(true);
});//FIN CODIGO NUEVO

    it('Price negativo devuelve failure', () => {
      const result = Price.create(-10);
      expect(result.isFailure).toBe(true);
    });

    it('Price NaN devuelve failure', () => {
      const result = Price.create(Number.NaN);
      expect(result.isFailure).toBe(true);
    });

    it('Price excede máximo devuelve failure', () => {
      const result = Price.create(1000000);
      expect(result.isFailure).toBe(true);
    });

    it('Price.toString devuelve formato correcto', () => {
      const price = unwrap(Price.create(99.9));
      expect(price.toString()).toBe('99.90');
    });

    it('Price.equals compara valores correctamente', () => {
      const p1 = unwrap(Price.create(100));
      const p2 = unwrap(Price.create(100));
      expect(p1.equals(p2)).toBe(true);
    });
  });

  // ── SKU Value Object ──────────────────────────────────────────────
  describe('SKU', () => {
    it('SKU válido se crea correctamente', () => {
      const result = SKU.create('ABC-123');
      expect(result.isSuccess).toBe(true);
      expect(result.value?.value).toBe('ABC-123');
    });

    //NUEVO ('SKU')
it('SKU undefined devuelve failure', () => {
  const result = SKU.create(undefined as any);
  expect(result.isFailure).toBe(true);
});

it('SKU null devuelve failure', () => {
  const result = SKU.create(null as any);
  expect(result.isFailure).toBe(true);
});

it('SKU muy largo devuelve failure', () => {
  const result = SKU.create('A'.repeat(51));
  expect(result.isFailure).toBe(true);
});

it('SKU con caracteres especiales devuelve failure', () => {
  const result = SKU.create('SKU@#$%');
  expect(result.isFailure).toBe(true);
});//FIN CODIGO NUEVO

    it('SKU vacío devuelve failure', () => {
      const result = SKU.create('');
      expect(result.isFailure).toBe(true);
    });

    it('SKU muy corto devuelve failure', () => {
      const result = SKU.create('AB');
      expect(result.isFailure).toBe(true);
    });

    it('SKU con caracteres inválidos devuelve failure', () => {
      const result = SKU.create('SKU@#$');
      expect(result.isFailure).toBe(true);
    });

    it('SKU.toString devuelve valor correcto', () => {
      const sku = unwrap(SKU.create('ABC-123'));
      expect(sku.toString()).toBe('ABC-123');
    });

    it('SKU.equals compara valores correctamente', () => {
      const s1 = unwrap(SKU.create('ABC-123'));
      const s2 = unwrap(SKU.create('ABC-123'));
      expect(s1.equals(s2)).toBe(true);
    });
  });

  // ── User Entity ───────────────────────────────────────────────────
  describe('UserDomain', () => {
    it('User válido se crea correctamente', () => {
      const result = UserDomain.create('Admin Test', 'admin@test.com', 'hash', UserRole.Admin);
      expect(result.isSuccess).toBe(true);
      expect(result.value?.role).toBe(UserRole.Admin);
    });

    // Agregar dentro de describe('UserDomain')
it('Nombre muy largo devuelve failure', () => {
  const result = UserDomain.create('A'.repeat(101), 'test@test.com', 'hash');
  expect(result.isFailure).toBe(true);
});

it('withFailedLogin con 5 intentos bloquea cuenta', () => {
  let user = unwrap(UserDomain.create('User', 'user@test.com', 'hash'));
  for (let i = 0; i < 5; i++) {
    user = user.withFailedLogin();
  }
  expect(user.isLocked()).toBe(true);
});//FIN CODIGO NUEVO

    it('Nombre muy corto devuelve failure', () => {
      const result = UserDomain.create('A', 'admin@test.com', 'hash');
      expect(result.isFailure).toBe(true);
    });

    it('Email inválido devuelve failure', () => {
      const result = UserDomain.create('Admin', 'emailinvalido', 'hash');
      expect(result.isFailure).toBe(true);
    });

    it('isLocked devuelve false si no está bloqueado', () => {
      const user = unwrap(UserDomain.create('Admin', 'admin@test.com', 'hash'));
      expect(user.isLocked()).toBe(false);
    });

    it('withFailedLogin incrementa intentos fallidos', () => {
      const user = unwrap(UserDomain.create('Admin', 'admin@test.com', 'hash'));
      const updated = user.withFailedLogin();
      expect(updated.failedLoginAttempts).toBe(1);
    });

    it('5 intentos fallidos bloquea la cuenta', () => {
      let user = unwrap(UserDomain.create('Admin', 'admin@test.com', 'hash'));
      for (let i = 0; i < 5; i++) user = user.withFailedLogin();
      expect(user.isLocked()).toBe(true);
    });

    it('withSuccessfulLogin resetea intentos fallidos', () => {
      let user = unwrap(UserDomain.create('Admin', 'admin@test.com', 'hash'));
      user = user.withFailedLogin().withFailedLogin();
      user = user.withSuccessfulLogin();
      expect(user.failedLoginAttempts).toBe(0);
    });
  });

  // ── Product Entity ────────────────────────────────────────────────
  describe('ProductDomain', () => {
    const validParams = {
      name: 'Producto Test',
      description: 'Descripción',
      price: 99.99,
      stock: 10,
      sku: 'SKU-001',
      imageUrl: '',
      categoryId: 'cat-id',
      supplierId: 'sup-id',
    };

    //CODIGO NUEVO: Agrego tests para producto con nombre muy largo, vacío, categoría vacía, proveedor vacío y decrementStock con cantidad 0
it('Nombre muy largo devuelve failure', () => {
  const result = ProductDomain.create({
    ...validParams,
    name: 'A'.repeat(151),
  });
  expect(result.isFailure).toBe(true);
});

it('Nombre vacío devuelve failure', () => {
  const result = ProductDomain.create({
    ...validParams,
    name: '',
  });
  expect(result.isFailure).toBe(true);
});

it('Categoría vacía devuelve failure', () => {
  const result = ProductDomain.create({
    ...validParams,
    categoryId: '',
  });
  expect(result.isFailure).toBe(true);
});

it('Proveedor vacío devuelve failure', () => {
  const result = ProductDomain.create({
    ...validParams,
    supplierId: '',
  });
  expect(result.isFailure).toBe(true);
});

it('decrementStock con cantidad 0 devuelve failure', () => {
  const product = unwrap(ProductDomain.create(validParams));
  const result = product.decrementStock(0);
  expect(result.isFailure).toBe(true);
});//FIN CODIGO NUEVO

    it('Producto válido se crea correctamente', () => {
      const result = ProductDomain.create(validParams);
      expect(result.isSuccess).toBe(true);
    });

    it('Nombre muy corto devuelve failure', () => {
      const result = ProductDomain.create({ ...validParams, name: 'A' });
      expect(result.isFailure).toBe(true);
    });

    it('Precio negativo devuelve failure', () => {
      const result = ProductDomain.create({ ...validParams, price: -1 });
      expect(result.isFailure).toBe(true);
    });

    it('Stock negativo devuelve failure', () => {
      const result = ProductDomain.create({ ...validParams, stock: -1 });
      expect(result.isFailure).toBe(true);
    });

    it('decrementStock reduce el stock correctamente', () => {
      const product = unwrap(ProductDomain.create(validParams));
      const result = product.decrementStock(3);
      expect(result.isSuccess).toBe(true);
      expect(result.value?.stock).toBe(7);
    });

    it('decrementStock con cantidad mayor al stock devuelve failure', () => {
      const product = unwrap(ProductDomain.create(validParams));
      const result = product.decrementStock(20);
      expect(result.isFailure).toBe(true);
    });

    it('decrementStock con cantidad 0 devuelve failure', () => {
      const product = unwrap(ProductDomain.create(validParams));
      const result = product.decrementStock(0);
      expect(result.isFailure).toBe(true);
    });
  });

  // ── Category Entity ───────────────────────────────────────────────
  describe('CategoryDomain', () => {
    it('Categoría válida se crea correctamente', () => {
      const result = CategoryDomain.create('Electrónicos', 'Descripción');
      expect(result.isSuccess).toBe(true);
    });

    it('Nombre muy corto devuelve failure', () => {
      const result = CategoryDomain.create('A', 'Descripción');
      expect(result.isFailure).toBe(true);
    });
  });

  // ── Supplier Entity ───────────────────────────────────────────────
  describe('SupplierDomain', () => {
    it('Proveedor válido se crea correctamente', () => {
      const result = SupplierDomain.create('Proveedor Test', '6181234567', 'prov@test.com', 'Dirección');
      expect(result.isSuccess).toBe(true);
    });

    it('Email inválido devuelve failure', () => {
      const result = SupplierDomain.create('Proveedor', '6181234567', 'emailinvalido', 'Dir');
      expect(result.isFailure).toBe(true);
    });

    it('Teléfono muy corto devuelve failure', () => {
      const result = SupplierDomain.create('Proveedor', '123', 'prov@test.com', 'Dir');
      expect(result.isFailure).toBe(true);
    });
  });

  // ── Client Entity ─────────────────────────────────────────────────
  describe('ClientDomain', () => {
    it('Cliente válido se crea correctamente', () => {
      const result = ClientDomain.create('Cliente Test', 'cliente@test.com', '6181234567', 'Dirección');
      expect(result.isSuccess).toBe(true);
    });

    it('Email inválido devuelve failure', () => {
      const result = ClientDomain.create('Cliente', 'emailinvalido', '6181234567', 'Dir');
      expect(result.isFailure).toBe(true);
    });
  });

  // ── Quotation Entity ──────────────────────────────────────────────
  describe('QuotationDomain', () => {
    const validItems = [
      { productId: 'p1', productName: 'Producto 1', quantity: 2, unitPrice: 100, subtotal: 200 },
    ];

    it('Cotización válida se crea correctamente', () => {
      const result = QuotationDomain.create('client-id', 'user-id', validItems);
      expect(result.isSuccess).toBe(true);
      expect(result.value?.total).toBe(200);
    });

    // CODIGO NUEVO: Agrego tests para cantidad negativa, precio unitario negativo, userId vacío, sin items y sin cliente
it('Cantidad negativa en item devuelve failure', () => {
  const result = QuotationDomain.create('client-id', 'user-id', [
    { productId: 'p1', productName: 'P1', quantity: -1, unitPrice: 100, subtotal: -100 }
  ]);
  expect(result.isFailure).toBe(true);
});

it('Precio unitario negativo devuelve failure', () => {
  const result = QuotationDomain.create('client-id', 'user-id', [
    { productId: 'p1', productName: 'P1', quantity: 1, unitPrice: -10, subtotal: -10 }
  ]);
  expect(result.isFailure).toBe(true);
});

it('userId vacío devuelve failure', () => {
  const result = QuotationDomain.create('client-id', '', [
    { productId: 'p1', productName: 'P1', quantity: 1, unitPrice: 100, subtotal: 100 }
  ]);
  expect(result.isFailure).toBe(true);
});//FIN CODIGO NUEVO

    it('Sin items devuelve failure', () => {
      const result = QuotationDomain.create('client-id', 'user-id', []);
      expect(result.isFailure).toBe(true);
    });

    it('Sin cliente devuelve failure', () => {
      const result = QuotationDomain.create('', 'user-id', validItems);
      expect(result.isFailure).toBe(true);
    });

    it('approve cambia estado a approved', () => {
      const quotation = unwrap(QuotationDomain.create('c', 'u', validItems));
      const result = quotation.approve();
      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('approved');
    });

    it('reject cambia estado a rejected', () => {
      const quotation = unwrap(QuotationDomain.create('c', 'u', validItems));
      const result = quotation.reject();
      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('rejected');
    });

    it('approve de cotización ya aprobada devuelve failure', () => {
      const quotation = unwrap(QuotationDomain.create('c', 'u', validItems));
      const approved = unwrap(quotation.approve());
      const result = approved.approve();
      expect(result.isFailure).toBe(true);
    });

    it('reject de cotización ya rechazada devuelve failure', () => {
      const quotation = unwrap(QuotationDomain.create('c', 'u', validItems));
      const rejected = unwrap(quotation.reject());
      const result = rejected.reject();
      expect(result.isFailure).toBe(true);
    });
  });
});