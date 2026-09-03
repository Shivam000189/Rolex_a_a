export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
  STORE_OWNER: "STORE_OWNER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
  ownedStore?: {
    id: number;
    name: string;
    rating: number;
  } | null;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  rating: number;
  ownerId: number;
  owner?: {
    id?: number;
    name: string;
    email: string;
    address?: string;
  };
  _count?: {
    ratings: number;
  };
  ratings?: Rating[];
  userRating?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rating {
  id: number;
  value: number;
  userId: number;
  storeId: number;
  user?: {
    id: number;
    name: string;
    email: string;
    address: string;
  };
  store?: Store;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface StoreOwnerDashboard {
  store: {
    id: number;
    name: string;
    email: string;
    address: string;
    averageRating: number;
    totalRatings: number;
  };
  raters: Array<{
    userId: number;
    name: string;
    email: string;
    address: string;
    rating: number;
    ratedAt: string;
  }>;
}

export interface FilterParams {
  name?: string;
  email?: string;
  address?: string;
  search?: string;
  role?: UserRole;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
