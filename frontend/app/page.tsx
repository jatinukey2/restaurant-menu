'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem, Category, CreateMenuItemInput } from '../types/menu';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage
} from '../services/api';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'STARTER', label: 'Starters' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'DESSERT', label: 'Desserts' },
  { value: 'BEVERAGE', label: 'Beverages' },
  { value: 'SIDE', label: 'Sides' }
];

export default function Home() {
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

  // Fetch all items on mount
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
      setError('Could not connect to the backend. Make sure the server is running on port 5000.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row justify-between items-center border-b border-slate-800/60">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            Bistro Royale
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gourmet Restaurant Menu Management Dashboard</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
            Neon DB Connected
          </span>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-xl shadow-2xl border transition-all duration-300 animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        }`}>
          <div className="mr-3">
            {notification.type === 'success' ? (
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* Main Grid */}
      <main className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
        
        {/* Left Column: Input Form (Glassmorphism card) */}
        <section className="lg:col-span-5">
          <div className="sticky top-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-100 flex items-center mb-6">
              <svg className="w-5 h-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Truffle Mac & Cheese"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                />
              </div>

              {/* Price & Prep Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="12.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 15"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell guests about ingredients, aroma, and prep style..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-slate-950">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Cloudinary Image
                </label>
                
                <div className="relative border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-colors bg-slate-950/30 flex flex-col items-center justify-center text-center">
                  {image ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                      <Image
                        src={image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-medium transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <svg className="mx-auto h-8 w-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <label className="cursor-pointer text-xs font-medium text-amber-400 hover:text-amber-300">
                        <span>Upload an image file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center rounded-xl">
                      <div className="w-8 h-8 border-2 border-t-amber-400 border-r-transparent border-slate-700 rounded-full animate-spin mb-2" />
                      <span className="text-xs text-amber-300 font-medium">{uploadProgress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Spicy level */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Spiciness Level
                  </label>
                  <span className="text-sm font-medium text-amber-400">
                    {'🌶️'.repeat(spicyLevel) || 'Not Spicy'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={spicyLevel}
                  onChange={(e) => setSpicyLevel(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
              </div>

              {/* Toggles (Dietary & Available) */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2">
                <label className="flex items-center text-xs font-medium text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 mr-2 cursor-pointer bg-slate-950 border-slate-800"
                  />
                  🌿 Vegetarian
                </label>
                <label className="flex items-center text-xs font-medium text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={(e) => setIsVegan(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 mr-2 cursor-pointer bg-slate-950 border-slate-800"
                  />
                  🥬 Vegan
                </label>
                <label className="flex items-center text-xs font-medium text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGlutenFree}
                    onChange={(e) => setIsGlutenFree(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 mr-2 cursor-pointer bg-slate-950 border-slate-800"
                  />
                  🌾 Gluten Free
                </label>
                <label className="flex items-center text-xs font-medium text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 mr-2 cursor-pointer bg-slate-950 border-slate-800"
                  />
                  🟢 Available
                </label>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-lg text-sm shadow-lg shadow-amber-500/20 active:translate-y-0.5 hover:-translate-y-0.5 transition-all"
                >
                  {editingId ? 'Save Changes' : 'Create Item'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-sm transition-colors"
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
          <div className="flex flex-wrap gap-2 items-center bg-slate-900/40 p-2 rounded-xl border border-slate-800/40">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filterCategory === 'ALL'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  filterCategory === cat.value
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Loader or Error or List Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-850 rounded-2xl">
              <div className="w-10 h-10 border-4 border-t-amber-400 border-slate-800 rounded-full animate-spin mb-4" />
              <span className="text-slate-400 text-sm font-medium">Fetching menu database...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 bg-rose-950/20 border border-rose-500/20 rounded-2xl text-center">
              <svg className="w-12 h-12 text-rose-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-rose-300">Connection Failed</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-sm">{error}</p>
              <button
                onClick={fetchItems}
                className="mt-6 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-850 rounded-2xl text-center">
              <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-base font-bold text-slate-300">No items found</h3>
              <p className="text-slate-500 text-xs mt-1">There are no dishes matching this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative flex flex-col justify-between bg-slate-900/50 hover:bg-slate-900/80 border transition-all rounded-2xl overflow-hidden group hover:scale-[1.01] hover:shadow-xl ${
                    item.available ? 'border-slate-800/80' : 'border-slate-900 opacity-60'
                  }`}
                >
                  <div>
                    {/* Item Image */}
                    <div className="relative w-full h-44 bg-slate-950">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                          <svg className="w-12 h-12 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-[10px] uppercase font-bold tracking-wider">Bistro Dish</span>
                        </div>
                      )}

                      {/* Floating Category Badge */}
                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-amber-500/20">
                        {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                      </span>

                      {/* Not Available overlay */}
                      {!item.available && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3 py-1 bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-widest rounded-lg">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-100 text-lg group-hover:text-amber-300 transition-colors truncate pr-2">
                          {item.name}
                        </h3>
                        <span className="font-extrabold text-amber-400 text-lg">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Badges/Icons row */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.prepTime && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-850">
                            ⏱️ {item.prepTime} min
                          </span>
                        )}
                        {item.spicyLevel > 0 && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/10">
                            {'🌶️'.repeat(item.spicyLevel)}
                          </span>
                        )}
                        {item.isVegetarian && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                            Veg
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10">
                            Vegan
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/10">
                            GF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Only visible/active on hover/group-focus) */}
                  <div className="p-5 border-t border-slate-850/60 bg-slate-950/20 flex gap-2 justify-end">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-slate-850 hover:bg-slate-800 rounded-md transition-colors flex items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-slate-850 hover:bg-slate-800 rounded-md transition-colors flex items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
