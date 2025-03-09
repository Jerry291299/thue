import { Icategory } from "./category";

export interface IVariant {
  size: string;
  color: string;
  quantity: number;
  basePrice: number;
  discount?: number;
  
}

export interface Iproduct {
  _id: string;
  masp: string;
  name: string;
  img: string[];
  moTa: string;
  brand: string;
  category: Icategory;
  status: boolean;
  variants: IVariant[]; // Không nên để tùy chọn (?)
  discountCode?: string; // Nếu không dùng thì bỏ luôn khỏi interface
  createdAt: string;
  updatedAt: string;
}

export type IProductLite = Pick<
  Iproduct,
  | "_id"
  | "masp"
  | "name"
  | "img"
  | "category"
  | "status"
  | "moTa"
  | "brand"
  | "variants"
  | "discountCode"
  | "createdAt"
  | "updatedAt"
> & {
  price?: number;
  soLuong?: number;
};
