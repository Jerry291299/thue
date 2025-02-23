import axios from "axios";
export const axiosservice = axios.create ({
    baseURL:'http://localhost:28017/'
    // baseURL:'https://bedatn-production.up.railway.app/'
})