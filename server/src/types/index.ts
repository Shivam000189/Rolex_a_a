import { Request } from "express";
import { UserRole } from "@prisma/client";

export { UserRole };

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
    name: string;
  };
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterQuery {
  name?: string;
  email?: string;
  address?: string;
  role?: UserRole;
}