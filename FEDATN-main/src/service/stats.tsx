import { axiosservice } from '../config/API';
import { Stats } from '../interface/stats';

export const getStats = async (): Promise<Stats> => {
    const response = await axiosservice.get(`api/stats`);
    return response.data;
  };