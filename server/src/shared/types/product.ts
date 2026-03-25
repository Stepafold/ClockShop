export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    stock: number;
    imageUrl?: string;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  inStock?: boolean;
  sort?: 'asc' | 'desc';
}