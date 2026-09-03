import axios from "axios";
import type {
  User,
  Store,
  Rating,
  LoginResponse,
  DashboardStats,
  StoreOwnerDashboard,
  FilterParams,
  UserRole,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; address: string; password: string }) =>
    api.post<{ message: string; user: User }>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>("/auth/password", data),
};

export const adminAPI = {
  getDashboardStats: () =>
    api.get<DashboardStats>("/admin/dashboard"),

  getUsers: (params?: FilterParams) =>
    api.get<User[]>("/admin/users", { params }),

  addUser: (data: { name: string; email: string; password: string; address: string; role: UserRole }) =>
    api.post<{ message: string; user: User }>("/admin/users", data),

  getStores: (params?: FilterParams) =>
    api.get<Store[]>("/admin/stores", { params }),

  addStore: (data: { name: string; email: string; address: string; ownerId: number }) =>
    api.post<{ message: string; store: Store }>("/admin/stores", data),

  getUserDetails: (id: number | string) =>
    api.get<User>(`/admin/users/${id}`),

  updateStoreRating: (id: number | string, rating: number) =>
    api.put<{ message: string; store: Store }>(`/admin/stores/${id}/rating`, { rating }),

  deleteStore: (id: number | string) =>
    api.delete<{ message: string }>(`/admin/stores/${id}`),
};

export const userAPI = {
  getAllUsers: (params?: FilterParams) =>
    api.get<User[]>("/user/users", { params }),

  getAllStores: (params?: FilterParams) =>
    api.get<Store[]>("/user/stores", { params }),

  submitRating: (data: { storeId: number; value: number }) =>
    api.post<{ message: string; rating: Rating }>("/user/ratings", data),

  modifyRating: (data: { storeId: number; value: number }) =>
    api.put<{ message: string; rating: Rating }>("/user/ratings", data),
};

export const storeOwnerAPI = {
  getDashboard: () =>
    api.get<StoreOwnerDashboard>("/store-owner/dashboard"),

  getAverageRating: () =>
    api.get<{ storeId: number; storeName: string; averageRating: number }>("/store-owner/average-rating"),
};

export default api;
