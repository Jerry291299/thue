import { Icategory } from "./category";

export interface ISubVariant {
  specification: string;
  value: string;
  additionalPrice: number;
  quantity: number;
}

export interface IVariant {
  color: string;
  basePrice: number;
  discount?: number;
  subVariants: ISubVariant[];
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
  variants: IVariant[];
  discountCode?: string;
  createdAt: string;
  updatedAt: string;
}

export type IProductLite = Pick<
  Iproduct,
  "_id" | "masp" | "name" | "img" | "category" | "status" | "moTa" | "brand" | "variants" | "discountCode" | "createdAt" | "updatedAt"
> & {
  price?: number;
  soLuong?: number;
};