'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SavedCarousel {
  id: string;
  title: string;
  niche: string;
  images: string[];
  createdAt: string;
}

export default function GalleryPage() {
  const [carousels, setCarousels] = useState<SavedCarousel[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('carousels');
    if (saved) setCarousels(JSON.parse(saved));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#4A1A8A' }}>My Carousels</h1>
          <p className="text-gray-500 text-sm mt-1">{carousels.length} carousel{carousels.length !== 1 ? 's' : ''} created</p>
        </div>
        <Link href="/create" className="px-6 py-2 rounded-lg text-sm font-medium" style={{ background: '#F5C518', color: '#1a1a2e' }}>
          + Create New
        </Link>
      </div>

      {carousels.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎠</div>
          <p className="text-gray-400 text-lg mb-6">No carousels yet</p>
          <Link href="/" className="px-6 py-3 rounded-lg font-medium" style={{ background: '#F5C518', color: '#1a1a2e' }}>
            Create Your First Carousel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {carousels.map(c => (
            <div key={c.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex h-32">
                {c.images.slice(0, 3).map((img, i) => (
                  <div key={i} className="flex-1 bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="p-4">
                <div className="font-semibold text-sm text-gray-900">{c.title}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString()} · {c.images.length} slides</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
