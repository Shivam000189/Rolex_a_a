import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../types";

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true, address: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!store) {
      res.status(404).json({ message: "No store found for this owner" });
      return;
    }

    const averageRating = store.rating;
    const totalRatings = store.ratings.length;

    const raters = store.ratings.map((r) => ({
      userId: r.user.id,
      name: r.user.name,
      email: r.user.email,
      address: r.user.address,
      rating: r.value,
      ratedAt: r.createdAt,
    }));

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings,
      },
      raters,
    });
  } catch (error) {
    console.error("Store owner dashboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAverageRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      select: { id: true, name: true, rating: true },
    });

    if (!store) {
      res.status(404).json({ message: "No store found" });
      return;
    }

    res.json({
      storeId: store.id,
      storeName: store.name,
      averageRating: store.rating,
    });
  } catch (error) {
    console.error("Average rating error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};