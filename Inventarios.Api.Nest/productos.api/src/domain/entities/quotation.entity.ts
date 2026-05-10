import { Result } from '../common/result';

export enum QuotationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface QuotationItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export class QuotationDomain {
  private constructor(
    readonly id: string,
    readonly clientId: string,
    readonly userId: string,
    readonly items: QuotationItem[],
    readonly total: number,
    readonly status: QuotationStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    clientId: string,
    userId: string,
    items: QuotationItem[],
  ): Result<QuotationDomain> {
    if (!clientId)
      return Result.failure('El cliente es requerido.');

    if (!userId)
      return Result.failure('El usuario es requerido.');

    if (!items || items.length === 0)
      return Result.failure('La cotización debe tener al menos un producto.');

    for (const item of items) {
      if (item.quantity <= 0)
        return Result.failure('La cantidad de cada producto debe ser mayor a cero.');

      if (item.unitPrice < 0)
        return Result.failure('El precio unitario no puede ser negativo.');

      item.subtotal = item.quantity * item.unitPrice;
    }

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const now = new Date();

    return Result.success(
      new QuotationDomain(
        crypto.randomUUID(),
        clientId,
        userId,
        items,
        total,
        QuotationStatus.Pending,
        now,
        now,
      ),
    );
  }

  approve(): Result<QuotationDomain> {
    if (this.status !== QuotationStatus.Pending)
      return Result.failure('Solo se pueden aprobar cotizaciones pendientes.');

    return Result.success(
      new QuotationDomain(
        this.id, this.clientId, this.userId, this.items,
        this.total, QuotationStatus.Approved,
        this.createdAt, new Date(),
      ),
    );
  }

  reject(): Result<QuotationDomain> {
    if (this.status !== QuotationStatus.Pending)
      return Result.failure('Solo se pueden rechazar cotizaciones pendientes.');

    return Result.success(
      new QuotationDomain(
        this.id, this.clientId, this.userId, this.items,
        this.total, QuotationStatus.Rejected,
        this.createdAt, new Date(),
      ),
    );
  }
}