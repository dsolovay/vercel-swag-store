export type ApiResponse<TData, TMeta=undefined> = {
  success: boolean;
  statusCode: number;
  data?: TData;
  meta?: TMeta;
  error?: {
    code: string;
    message: string;
    details: unknown; /* Included in the API docs, but no type info provided. */
  };
};


export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  featured: boolean;
  tags: string[];
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  code: string;
  validFrom: string;
  validUntil: string;
  active: boolean;
};

export type AvailabilityInfo = {
  productId: string;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
}

type DateInfo = {
  createdAt: string;
  updatedAt: string;
}
type AmountInfo = {
  amount: number;
  currency: string;
}

export type Cart = {
  token: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  currency: string;
 } & DateInfo;

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: string;
  product: Product;
  lineTotal: number; 
} & DateInfo & AmountInfo;
