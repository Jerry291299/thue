import { axiosservice } from "../config/API";
import { IProductLite } from "../interface/products";

export const upload = async(file:any) => {
    try {
        const { data } = await axiosservice.post('/upload', file)
        return data
} catch (error) {
    console.log(error);
    
}
}