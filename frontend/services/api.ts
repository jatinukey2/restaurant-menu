import { MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from '../types/menu';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getMenuItems = async (category?: string): Promise<MenuItem[]> => {
  const url = category
    ? `${API_BASE_URL}/menu?category=${category}`
    : `${API_BASE_URL}/menu`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch menu items');
  }
  const json = await res.json();
  return json.data;
};

export const getMenuItemById = async (id: string): Promise<MenuItem> => {
  const res = await fetch(`${API_BASE_URL}/menu/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch menu item');
  }
  const json = await res.json();
  return json.data;
};

export const createMenuItem = async (data: CreateMenuItemInput): Promise<MenuItem> => {
  const res = await fetch(`${API_BASE_URL}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || 'Failed to create menu item');
  }
  const json = await res.json();
  return json.data;
};

export const updateMenuItem = async (id: string, data: UpdateMenuItemInput): Promise<MenuItem> => {
  const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || 'Failed to update menu item');
  }
  const json = await res.json();
  return json.data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete menu item');
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || 'Failed to upload image');
  }

  const json = await res.json();
  return json.url;
};
