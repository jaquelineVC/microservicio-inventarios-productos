export class QuotationItemResponse {
  productId!: string;
  productName!: string;
  quantity!: number;
  unitPrice!: number;
  subtotal!: number;
}

export class QuotationResponse {
  id!: string;
  clientId!: string;
  clientName!: string;
  userId!: string;
  userName!: string;
  items!: QuotationItemResponse[];
  total!: number;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}