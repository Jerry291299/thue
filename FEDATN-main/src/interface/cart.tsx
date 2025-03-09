import { IUserCart } from "./user";

export interface Icart {
    userId: string;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
        img: string;
        color?: string;
        subVariant?: {
            specification: string; 
            value: string;        
        };
    }[];
}

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    img: string;
    color?: string;
    subVariant?: {
        specification: string; // e.g., "Storage"
        value: string;        // e.g., "128GB"
    };
}

// export type ICartLite = Pick<Icart, 'userId' | 'items'>