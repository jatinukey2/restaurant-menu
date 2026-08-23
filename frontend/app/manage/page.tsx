'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem, Category, CreateMenuItemInput } from '../../types/menu';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage
} from '../../services/api';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'STARTER', label: 'Starters' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'DESSERT', label: 'Desserts' },
  { value: 'BEVERAGE', label: 'Beverages' },
  { value: 'SIDE', label: 'Sides' }
];

export default function ManageMenu() {
  // State variables
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<Category>('STARTER');
  const [image, setImage] = useState<string>('');
  const [available, setAvailable] = useState<boolean>(true);
  const [isVegetarian, setIsVegetarian] = useState<boolean>(false);
  const [isVegan, setIsVegan] = useState<boolean>(false);
  const [isGlutenFree, setIsGlutenFree] = useState<boolean>(false);
  const [spicyLevel, setSpicyLevel] = useState<number>(0);
  const [prepTime, setPrepTime] = useState<string>('');

  // Image Uploading State
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch all items on mount and category filter change
  useEffect(() => {
    fetchItems();
  }, [filterCategory]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const categoryFilter = filterCategory === 'ALL' ? undefined : filterCategory;
      const data = await getMenuItems(categoryFilter);
      setMenuItems(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to the backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Toast helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle image upload to Cloudinary
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress('Uploading to Cloudinary...');
      const url = await uploadImage(file);
      setImage(url);
      showNotification('success', 'Image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      showNotification('error', err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('STARTER');
    setImage('');
    setAvailable(true);
    setIsVegetarian(false);
    setIsVegan(false);
    setIsGlutenFree(false);
    setSpicyLevel(0);
    setPrepTime('');
  };

  // Set form fields for editing
  const handleEditClick = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setCategory(item.category);
    setImage(item.image || '');
    setAvailable(item.available);
    setIsVegetarian(item.isVegetarian);
    setIsVegan(item.isVegan);
    setIsGlutenFree(item.isGlutenFree);
    setSpicyLevel(item.spicyLevel);
    setPrepTime(item.prepTime ? item.prepTime.toString() : '');
    
    // Scroll form into view on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle create/update submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !category) {
      showNotification('error', 'Please fill in all required fields.');
      return;
    }

    const payload: CreateMenuItemInput = {
      name,
      description: description || undefined,
      price: parseFloat(price),
      category,
      image: image || undefined,
      available,
      isVegetarian,
      isVegan,
      isGlutenFree,
      spicyLevel,
      prepTime: prepTime ? parseInt(prepTime) : null,
    };

    try {
      if (editingId) {
        await updateMenuItem(editingId, payload);
        showNotification('success', 'Menu item updated successfully!');
      } else {
        await createMenuItem(payload);
        showNotification('success', 'Menu item created successfully!');
      }
      resetForm();
      fetchItems();
    } catch (err: any) {
      console.error(err);
      showNotification('error', err.message || 'Operation failed');
    }
  };

  // Handle delete
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await deleteMenuItem(id);
      showNotification('success', 'Menu item deleted successfully');
      fetchItems();
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'Failed to delete menu item');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-16">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-amber-100/40 via-stone-50/20 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative max-w-7xl mx-auto px-6 pt-10 pb-6 flex flex-col sm:flex-row justify-between items-center border-b border-stone-200">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍🍳</span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Bistro Royale Dashboard
            </h1>
          </div>
          <p className="text-stone-500 text-sm mt-0.5">Manage your menu dishes, prices, and dietary settings</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-stone-200 text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            ← View Customer Menu
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-250">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
            Connected
          </span>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-xl shadow-lg border transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-55 border-emerald-200 text-emerald-850' 
            : 'bg-rose-55 border-rose-200 text-rose-850'
        }`}>
          <div className="mr-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Main Grid */}
      <main className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
        
        {/* Left Column: Input Form */}
        <section className="lg:col-span-5">
          <div className="sticky top-6 bg-white border border-stone-200 shadow-xs rounded-2xl p-6">
            <h2 className="text-lg font-bold text-stone-900 flex items-center mb-5 pb-3 border-b border-stone-100">
              <span className="mr-2 text-amber-600">✍️</span>
              {editingId ? 'Edit Dish Details' : 'Add New Dish'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honey Glazed Salmon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-sm"
                />
              </div>

              {/* Price & Prep Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="19.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 20"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the dish ingredients, allergens, or culinary style..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-sm resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Dish Image
                </label>
                
                <div className="relative border-2 border-dashed border-stone-200 hover:border-amber-500/50 rounded-xl p-4 transition-colors bg-stone-50/50 flex flex-col items-center justify-center text-center">
                  {image ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                      <Image
                        src={image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-stone-905/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <svg className="mx-auto h-8 w-8 text-stone-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <label className="cursor-pointer text-xs font-semibold text-amber-700 hover:text-amber-850">
                        <span>Upload an image file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-stone-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl">
                      <div className="w-7 h-7 border-2 border-t-amber-600 border-r-transparent border-stone-200 rounded-full animate-spin mb-2" />
                      <span className="text-xs text-amber-850 font-semibold">{uploadProgress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Spicy level */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Spiciness Level
                  </label>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    {spicyLevel === 0 ? 'Not Spicy' : '🌶️'.repeat(spicyLevel)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={spicyLevel}
                  onChange={(e) => setSpicyLevel(parseInt(e.target.value))}
                  className="w-full accent-amber-650 bg-stone-200 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
              </div>

              {/* Toggles (Dietary & Available) */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1">
                <label className="flex items-center text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-600 mr-2 cursor-pointer bg-white border-stone-300"
                  />
                  🌿 Vegetarian
                </label>
                <label className="flex items-center text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={(e) => setIsVegan(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-600 mr-2 cursor-pointer bg-white border-stone-300"
                  />
                  🥬 Vegan
                </label>
                <label className="flex items-center text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGlutenFree}
                    onChange={(e) => setIsGlutenFree(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-600 mr-2 cursor-pointer bg-white border-stone-300"
                  />
                  🌾 Gluten Free
                </label>
                <label className="flex items-center text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-600 mr-2 cursor-pointer bg-white border-stone-300"
                  />
                  🟢 Available
                </label>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-xs active:translate-y-0.5 transition-all cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Create Dish'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Right Column: Menu Items View & Filter */}
        <section className="lg:col-span-7 space-y-6">
          {/* Filtering Categories Bar */}
          <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterCategory === 'ALL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterCategory === cat.value
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Loader or Error or List Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl">
              <div className="w-8 h-8 border-3 border-t-amber-600 border-stone-200 rounded-full animate-spin mb-3" />
              <span className="text-stone-400 text-xs font-semibold">Loading menu items...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
              <svg className="w-10 h-10 text-rose-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-md font-bold text-rose-800">Connection Failed</h3>
              <p className="text-stone-500 text-xs mt-1.5 max-w-sm">{error}</p>
              <button
                onClick={fetchItems}
                className="mt-4 py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl text-center">
              <span className="text-2xl mb-2">🍽️</span>
              <h3 className="text-sm font-bold text-stone-600">No dishes found</h3>
              <p className="text-stone-400 text-xs mt-0.5">There are no dishes matching this category.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 shadow-2xs rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-150">
                  <thead className="bg-stone-50">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider">Dish</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-150">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 relative flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-400">🍽️</div>
                              )}
                            </div>
                            <div className="ml-3.5">
                              <div className="text-sm font-semibold text-stone-900">{item.name}</div>
                              <div className="flex gap-1.5 mt-0.5">
                                {item.isVegetarian && <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded border border-emerald-250">Veg</span>}
                                {item.isVegan && <span className="text-[9px] font-semibold bg-teal-50 text-teal-700 px-1 py-0.2 rounded border border-teal-250">Vegan</span>}
                                {item.isGlutenFree && <span className="text-[9px] font-semibold bg-sky-50 text-sky-700 px-1 py-0.2 rounded border border-sky-200">GF</span>}
                                {item.spicyLevel > 0 && <span className="text-[9px] font-semibold bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-200">🌶️{item.spicyLevel}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded bg-stone-100 text-stone-600 border border-stone-200 uppercase tracking-wider">
                            {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-900">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 inline-flex text-[9px] leading-4 font-bold rounded-full border ${
                            item.available
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {item.available ? 'In Stock' : 'Sold Out'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-amber-700 hover:text-amber-800 mr-4 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
