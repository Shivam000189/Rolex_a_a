import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { validateName, validateEmail, validatePassword, validateAddress } from "../utils/validators";
import { UserRole, AuthRequest } from "../types";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;

    const nameError = validateName(name);
    if (nameError) { res.status(400).json({ message: nameError }); return; }

    const emailError = validateEmail(email);
    if (emailError) { res.status(400).json({ message: emailError }); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { res.status(400).json({ message: passwordError }); return; }

    const addressError = validateAddress(address);
    if (addressError) { res.status(400).json({ message: addressError }); return; }

    if (!role || !Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: "Invalid role. Must be ADMIN, USER, or STORE_OWNER" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, address, password: hashedPassword, role },
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Add user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address || !ownerId) {
      res.status(400).json({ message: "Name, email, address, and ownerId are required" });
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) { res.status(400).json({ message: emailError }); return; }

    const addressError = validateAddress(address);
    if (addressError) { res.status(400).json({ message: addressError }); return; }

    const owner = await prisma.user.findUnique({ where: { id: Number(ownerId) } });
    if (!owner) {
      res.status(404).json({ message: "Owner not found" });
      return;
    }
    if (owner.role !== UserRole.STORE_OWNER) {
      res.status(400).json({ message: "Selected user is not a Store Owner" });
      return;
    }

    const existingStore = await prisma.store.findUnique({ where: { ownerId: Number(ownerId) } });
    if (existingStore) {
      res.status(400).json({ message: "This owner already has a store" });
      return;
    }

    const store = await prisma.store.create({
      data: { name, email, address, ownerId: Number(ownerId) },
      include: { owner: { select: { name: true, email: true } } },
    });

    res.status(201).json({ message: "Store created successfully", store });
  } catch (error) {
    console.error("Add store error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, role, sortBy = "name", sortOrder = "asc" } = req.query;

    const where: any = {};
    if (name) where.name = { contains: name as string, mode: "insensitive" };
    if (email) where.email = { contains: email as string, mode: "insensitive" };
    if (address) where.address = { contains: address as string, mode: "insensitive" };
    if (role) where.role = role as UserRole;

    const orderBy: any = {};
    if (["name", "email", "address", "role", "createdAt"].includes(sortBy as string)) {
      orderBy[sortBy as string] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc";
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, sortBy = "name", sortOrder = "asc" } = req.query;

    const where: any = {};
    if (name) where.name = { contains: name as string, mode: "insensitive" };
    if (email) where.email = { contains: email as string, mode: "insensitive" };
    if (address) where.address = { contains: address as string, mode: "insensitive" };

    const orderBy: any = {};
    if (["name", "email", "address", "rating", "createdAt"].includes(sortBy as string)) {
      orderBy[sortBy as string] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc";
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy,
      include: {
        owner: { select: { id: true, name: true, email: true, address: true } },
        _count: { select: { ratings: true } },
      },
    });

    res.json(stores);
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStore: { select: { id: true, name: true, email: true, address: true, rating: true } },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStoreRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ message: "Rating must be a number between 1 and 5" });
      return;
    }

    const existingStore = await prisma.store.findUnique({ where: { id: Number(id) } });
    if (!existingStore) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    const updatedStore = await prisma.store.update({
      where: { id: Number(id) },
      data: { rating: Number(numericRating.toFixed(1)) },
      include: { owner: { select: { name: true, email: true } } },
    });

    res.json({ message: "Store rating updated successfully", store: updatedStore });
  } catch (error) {
    console.error("Update store rating error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingStore = await prisma.store.findUnique({ where: { id: Number(id) } });
    if (!existingStore) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    await prisma.store.delete({ where: { id: Number(id) } });

    res.json({ message: "Store removed successfully" });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};