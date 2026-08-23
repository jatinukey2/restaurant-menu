export type Category = 'STARTER' | 'MAIN_COURSE' | 'DESSERT' | 'BEVERAGE' | 'SIDE';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: Category;
  available: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spicyLevel: number;
  prepTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemInput {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: Category;
  available?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: number;
  prepTime?: number | null;
}

export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;
