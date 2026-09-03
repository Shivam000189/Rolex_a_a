import { Response } from "express";
import prisma from "../utils/prisma";
import { validateRating } from "../utils/validators";
import { AuthRequest } from "../types";

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, sortBy = "name", sortOrder = "asc" } = req.query;

    const where: any = {};
    if (name) where.name = { contains: name as string, mode: "insensitive" };
    if (email) where.email = { contains: email as string, mode: "insensitive" };
    if (address) where.address = { contains: address as string, mode: "insensitive" };

    const orderBy: any = {};
    if (["name", "email", "address", "createdAt"].includes(sortBy as string)) {
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
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllStores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, address, search, sortBy = "name", sortOrder = "asc" } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { address: { contains: search as string, mode: "insensitive" } },
      ];
    } else {
      if (name) where.name = { contains: name as string, mode: "insensitive" };
      if (address) where.address = { contains: address as string, mode: "insensitive" };
    }

    const orderBy: any = {};
    if (["name", "address", "rating", "createdAt"].includes(sortBy as string)) {
      orderBy[sortBy as string] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc";
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy,
      include: {
        owner: { select: { name: true, email: true } },
        ratings: userId ? { where: { userId } } : false,
      },
    });

    const formattedStores = stores.map((store: any) => {
      const userRating = store.ratings && store.ratings.length > 0 ? store.ratings[0].value : null;
      const { ratings, ...storeData } = store;
      return {
        ...storeData,
        userRating,
      };
    });

    res.json(formattedStores);
  } catch (error) {
    console.error("Get all stores error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { storeId, value, rating } = req.body;
    const ratingVal = Number(value ?? rating);

    const ratingError = validateRating(ratingVal);
    if (ratingError) {
      res.status(400).json({ message: ratingError });
      return;
    }

    const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: Number(storeId),
        },
      },
    });

    if (existingRating) {
      res.status(400).json({ message: "You have already rated this store. Please modify your existing rating instead." });
      return;
    }

    const newRating = await prisma.rating.create({
      data: {
        userId,
        storeId: Number(storeId),
        value: ratingVal,
      },
    });

    // Recalculate average rating for store
    const allRatings = await prisma.rating.findMany({ where: { storeId: Number(storeId) } });
    const average = allRatings.reduce((acc, curr) => acc + curr.value, 0) / allRatings.length;

    await prisma.store.update({
      where: { id: Number(storeId) },
      data: { rating: Number(average.toFixed(1)) },
    });

    res.status(201).json({ message: "Rating submitted successfully", rating: newRating });
  } catch (error) {
    console.error("Submit rating error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const modifyRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { storeId, value, rating } = req.body;
    const ratingVal = Number(value ?? rating);

    const ratingError = validateRating(ratingVal);
    if (ratingError) {
      res.status(400).json({ message: ratingError });
      return;
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: Number(storeId),
        },
      },
    });

    if (!existingRating) {
      res.status(404).json({ message: "Rating not found for this store" });
      return;
    }

    const updatedRating = await prisma.rating.update({
      where: { id: existingRating.id },
      data: { value: ratingVal },
    });

    // Recalculate average rating for store
    const allRatings = await prisma.rating.findMany({ where: { storeId: Number(storeId) } });
    const average = allRatings.reduce((acc, curr) => acc + curr.value, 0) / allRatings.length;

    await prisma.store.update({
      where: { id: Number(storeId) },
      data: { rating: Number(average.toFixed(1)) },
    });

    res.json({ message: "Rating updated successfully", rating: updatedRating });
  } catch (error) {
    console.error("Modify rating error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
