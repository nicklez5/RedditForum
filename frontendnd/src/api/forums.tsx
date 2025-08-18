import axios, {AxiosRequestConfig} from "axios";
import store  from "../interface/StoreModel";
declare module "axios" {
    export interface AxiosRequestConfig{
        allowAnonymous?: boolean;
        suppressRedirect? : boolean;
    }
}
const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL ?? (window.location.hostname === 'localhost' ? 'http://localhost:5220' : 'https://redditforum.onrender.com')
    
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if(token){
            config.headers = config.headers ?? {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
);
api.interceptors.response.use(
    (response )=> response,
    (error) => {
        const allowAnonymous = error.config?.allowAnonymous;

        const authHeader = error.response?.headers?.['www-authenticate'] || '';

        // Expired or invalid token → clear it
        if (authHeader.includes('invalid_token')) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            store.getActions().user.logout();
        }

        if (!allowAnonymous && error.response?.status === 401) {
            store.getActions().user.logout();
            if (!error.config?.suppressRedirect) {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
)
export default api;