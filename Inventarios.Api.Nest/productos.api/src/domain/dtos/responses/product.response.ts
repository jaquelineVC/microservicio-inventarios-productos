export class ProductResponse {
  id!: string;
  name!: string;
  description!: string;
  price!: number;
  stock!: number;
  sku!: string;
  imageUrl!: string;
  categoryId!: string;
  categoryName!: string;
  supplierId!: string;
  supplierName!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}