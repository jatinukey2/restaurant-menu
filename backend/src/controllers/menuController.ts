import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await prisma.menuItem.findMany();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, price, image, category, available } = req.body;
    
    if (!name || price === undefined || !category) {
      res.status(400).json({ success: false, message: 'Name, price, and category are required' });
      return;
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        available: available !== undefined ? available : true,
      },
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, available } = req.body;

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        image,
        category,
        available,
      },
    });

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
