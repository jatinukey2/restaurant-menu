import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { Category } from '@prisma/client';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category } = req.query;
    
    let whereClause = {};
    if (category) {
      if (Object.values(Category).includes(category as Category)) {
        whereClause = { category: category as Category };
      } else {
        res.status(400).json({ success: false, message: 'Invalid category filter' });
        return;
      }
    }

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
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
    const {
      name,
      description,
      price,
      image,
      category,
      available,
      isVegetarian,
      isVegan,
      isGlutenFree,
      spicyLevel,
      prepTime,
    } = req.body;
    
    if (!name || price === undefined || !category) {
      res.status(400).json({ success: false, message: 'Name, price, and category are required' });
      return;
    }

    if (!Object.values(Category).includes(category as Category)) {
      res.status(400).json({ success: false, message: `Invalid category. Must be one of: ${Object.values(Category).join(', ')}` });
      return;
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category: category as Category,
        available: available !== undefined ? Boolean(available) : true,
        isVegetarian: isVegetarian !== undefined ? Boolean(isVegetarian) : false,
        isVegan: isVegan !== undefined ? Boolean(isVegan) : false,
        isGlutenFree: isGlutenFree !== undefined ? Boolean(isGlutenFree) : false,
        spicyLevel: spicyLevel !== undefined ? parseInt(spicyLevel) : 0,
        prepTime: prepTime !== undefined && prepTime !== null ? parseInt(prepTime) : null,
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
    const {
      name,
      description,
      price,
      image,
      category,
      available,
      isVegetarian,
      isVegan,
      isGlutenFree,
      spicyLevel,
      prepTime,
    } = req.body;

    if (category && !Object.values(Category).includes(category as Category)) {
      res.status(400).json({ success: false, message: `Invalid category. Must be one of: ${Object.values(Category).join(', ')}` });
      return;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        image,
        category: category ? (category as Category) : undefined,
        available: available !== undefined ? Boolean(available) : undefined,
        isVegetarian: isVegetarian !== undefined ? Boolean(isVegetarian) : undefined,
        isVegan: isVegan !== undefined ? Boolean(isVegan) : undefined,
        isGlutenFree: isGlutenFree !== undefined ? Boolean(isGlutenFree) : undefined,
        spicyLevel: spicyLevel !== undefined ? parseInt(spicyLevel) : undefined,
        prepTime: prepTime !== undefined ? (prepTime !== null ? parseInt(prepTime) : null) : undefined,
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
