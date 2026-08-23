'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem, Category } from '../types/menu';
import { getMenuItems } from '../services/api';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all items on mount/filter category change
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
      setError('Could not connect to the backend database. Please check if the server is active.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side search filtering
  const filteredItems = menuItems.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-850 font-sans pb-20">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-[450px] bg-gradient-to-b from-amber-100/40 via-stone-50/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-amber-50 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative max-w-7xl mx-auto px-6 pt-12 pb-8 border-b border-stone-200/80 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-700">Gourmet Selection</span>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-stone-900 tracking-tight mt-1">
            Bistro Royale
          </h1>
          <p className="text-stone-500 text-sm mt-1 max-w-md">Experience culinary excellence crafted by our master chefs with freshly sourced local ingredients.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/manage"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold shadow-md active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Manage Menu</span>
            <span>👨‍🍳</span>
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-250">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
            Kitchen Active
          </span>
        </div>
      </header>

      {/* Filtering & Search Bar */}
      <main className="max-w-7xl mx-auto px-6 mt-10">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 items-center bg-white p-1.5 rounded-2xl border border-stone-200 shadow-2xs">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterCategory === 'ALL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              All Dishes
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterCategory === cat.value
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-stone-850 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all shadow-2xs"
            />
          </div>
        </section>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-stone-200 rounded-3xl">
            <div className="w-9 h-9 border-3 border-t-amber-600 border-stone-200 rounded-full animate-spin mb-4" />
            <span className="text-stone-400 text-sm font-semibold">Preparing Bistro menu...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-rose-50/50 border border-rose-200 rounded-3xl text-center">
            <span className="text-3xl mb-3">📡</span>
            <h3 className="text-lg font-bold text-rose-800">Connection Offline</h3>
            <p className="text-stone-500 text-sm mt-1.5 max-w-sm">{error}</p>
            <button
              onClick={fetchItems}
              className="mt-6 py-2.5 px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-3xl text-center shadow-2xs">
            <span className="text-3xl mb-3">🔍</span>
            <h3 className="text-base font-bold text-stone-700">No dishes match your request</h3>
            <p className="text-stone-400 text-xs mt-1">Try selecting a different category or clearing your search term.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between bg-white border border-stone-200/80 transition-all duration-350 rounded-2xl overflow-hidden group shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
                  item.available ? 'opacity-100' : 'opacity-70'
                }`}
              >
                <div>
                  {/* Item Image */}
                  <div className="relative w-full h-52 bg-stone-100 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-450 bg-stone-50">
                        <span className="text-3xl mb-1">🍴</span>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400">Bistro Royale Special</span>
                      </div>
                    )}

                    {/* Category Floating Badge */}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-amber-800 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-600/10 shadow-2xs">
                      {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                    </span>

                    {/* Availability Overlay */}
                    {!item.available && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-4 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-xl shadow-2xs">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-stone-900 text-lg group-hover:text-amber-700 transition-colors leading-tight">
                        {item.name}
                      </h3>
                      <span className="font-extrabold text-amber-700 text-lg whitespace-nowrap">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-stone-550 text-xs leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Badges & Metadata */}
                <div className="px-6 pb-6 pt-2 flex flex-wrap gap-2 items-center">
                  {item.prepTime && (
                    <span className="inline-flex items-center text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/50">
                      ⏱️ {item.prepTime} min
                    </span>
                  )}
                  {item.spicyLevel > 0 && (
                    <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50">
                      {'🌶️'.repeat(item.spicyLevel)}
                    </span>
                  )}
                  {item.isVegetarian && (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-250/50">
                      🌿 Veg
                    </span>
                  )}
                  {item.isVegan && (
                    <span className="inline-flex items-center text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-250/50">
                      🥬 Vegan
                    </span>
                  )}
                  {item.isGlutenFree && (
                    <span className="inline-flex items-center text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/50">
                      🌾 Gluten Free
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
