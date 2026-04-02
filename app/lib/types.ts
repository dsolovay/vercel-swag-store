export type ApiResponse<TData, TMeta = undefined> = TMeta extends undefined
  ? {
      success: boolean;
      data: TData;
    }
  : {
      success: boolean;
      data: TData;
      meta: TMeta;
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

export type ProductsResponse = ApiResponse<
  Product[],
  { pagination: Pagination }
>;

export type ProductDetailsResponse = ApiResponse<Product>;

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
  toeken: string;
  items: CartItem[];
 } & DateInfo & AmountInfo;

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: string;
  product: Product;
  totalItems: number; 
} & DateInfo & AmountInfo;

export type PromotionResponse = ApiResponse<Promotion>;