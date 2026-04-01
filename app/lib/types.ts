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

export type ProductResponse = ApiResponse<
  Product[],
  { pagination: Pagination }
>;

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

export type PromotionResponse = ApiResponse<Promotion>;