export interface Icategory{
    _id: string,
    name: string,
    status: 'active' | 'deactive'; 
}
export type IcategoryLite = Pick<Icategory, 'name' >