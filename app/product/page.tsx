'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope, faPhone, faShoppingCart, faInfoCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Add custom CSS for additional animations
const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .shimmer-effect {
    position: relative;
    overflow: hidden;
  }
  
  .shimmer-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2s infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .shimmer-effect:hover::before {
    opacity: 1;
  }
  
  .pulse-glow {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
    animation: pulse-glow 2s infinite;
  }
  
  @keyframes pulse-glow {
    0% {
      box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(236, 72, 153, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
    }
  }
`;

interface Product {
  id: string;
  namaProduk: string;
  deskripsi: string | null;
  hargaUmum: number | null;
  hargaConsultant: number | null;
  hargaDirector: number | null;
  hargaManager: number | null;
  hargaSupervisor: number | null;
  gambar: string | null;
  fotoProduk: Array<{
    url: string;
    alt: string | null;
    urutan: number;
  }> | null;
  slug: string;
  bpom: string | null;
  type: 'product' | 'package';
  createdAt: string;
  updatedAt: string;
  categories: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  packageContents?: Array<{
    id: string;
    nama: string;
    jumlah: number;
    gambar: string | null;
  }> | null;
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'packages'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, activeFilter, selectedCategory]);  const filterProducts = () => {
    let filtered = products;

    // Filter by type first
    if (activeFilter !== 'all') {
      if (activeFilter === 'products') {
        filtered = filtered.filter(product => product.type === 'product');
      } else if (activeFilter === 'packages') {
        filtered = filtered.filter(product => product.type === 'package');
      }
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.categories && product.categories.name.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.namaProduk.toLowerCase().includes(query) ||
        (product.deskripsi && product.deskripsi.toLowerCase().includes(query)) ||
        (product.categories && product.categories.name.toLowerCase().includes(query)) ||
        (product.bpom && product.bpom.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery(categoryName); // Set search query to category name
    setActiveFilter('all'); // Reset type filter to show all types in the category
  };
  const fetchProducts = async () => {
    try {
      // Fetch both products and packages
      const [productsResponse, packagesResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/packages')
      ]);
      
      const productsResult = await productsResponse.json();
      const packagesResult = await packagesResponse.json();
      
      let allItems: Product[] = [];
      
      // Add products with type indicator
      if (productsResult.success) {
        const productsWithType = productsResult.data.map((product: any) => ({
          ...product,
          type: 'product' as const
        }));
        allItems = [...allItems, ...productsWithType];
      }
      
      // Add packages with type indicator
      if (packagesResult.success) {
        const packagesWithType = packagesResult.data.map((pkg: any) => ({
          ...pkg,
          type: 'package' as const
        }));
        allItems = [...allItems, ...packagesWithType];
      }
      
      // Check if both requests failed
      if (!productsResult.success && !packagesResult.success) {
        setError('Failed to fetch products and packages');
        return;
      }
      
      setProducts(allItems);
      setFilteredProducts(allItems);
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Hubungi Kami';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(price));
  };
  const handleWhatsAppOrder = (message: string) => {
    const whatsappUrl = `https://wa.me/6285852555571?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };



  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set(Array.from(prev).concat(productId)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo_drwskincare.png" 
                alt="DRW Skincare Logo" 
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </header>

        {/* Loading State */}
        <div className="flex justify-center items-center py-20">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary animate-spin" />
          <span className="ml-4 text-gray-600">Memuat produk...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo_drwskincare.png" 
                alt="DRW Skincare Logo" 
                width={300}
                height={100}
                className="h-10 w-auto"
                quality={100}
                unoptimized
              />
            </Link>
          </div>
        </header>

        {/* Error State */}
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              {error}
            </div>
            <button 
              onClick={fetchProducts}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-gray-50">
        <Header />

      {/* Page Title */}
      <section className="bg-white py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4">
            Produk DRW Skincare
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
            Temukan produk perawatan kulit terbaik untuk kebutuhan Anda
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk, kategori, atau BPOM..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-gray-700"
              />
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeFilter === 'all'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Semua ({products.length})
              </button>
              <button
                onClick={() => setActiveFilter('products')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeFilter === 'products'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Produk ({products.filter(p => p.type === 'product').length})
              </button>
              <button
                onClick={() => setActiveFilter('packages')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeFilter === 'packages'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Paket ({products.filter(p => p.type === 'package').length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Info */}
      {searchQuery && (
        <section className="py-4 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm md:text-base">
                {filteredProducts.length > 0 ? (
                  <>
                    Menampilkan <span className="font-semibold">{filteredProducts.length}</span> produk 
                    untuk pencarian &quot;<span className="font-semibold">{searchQuery}</span>&quot;
                  </>
                ) : (
                  <>
                    Tidak ditemukan produk untuk pencarian &quot;<span className="font-semibold">{searchQuery}</span>&quot;
                  </>
                )}
                <button 
                  onClick={clearSearch}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Hapus pencarian
                </button>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            // Loading state will be handled earlier, but keeping this for safety
            null
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-xl mb-4">
                <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-gray-400 mb-4 block" />
                Belum ada produk tersedia
              </div>
              <p className="text-gray-400">
                Produk akan segera ditambahkan. Silakan hubungi kami untuk informasi lebih lanjut.
              </p>
              <a 
                href="https://wa.me/6285852555571" 
                className="mt-6 inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors"
              >
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                Hubungi Kami
              </a>
            </div>
          ) : filteredProducts.length === 0 && searchQuery ? (
            // Empty search results
            <div className="text-center py-20">
              <div className="text-gray-500 text-xl mb-4">
                <svg className="mx-auto h-20 w-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Produk tidak ditemukan
              </div>
              <p className="text-gray-400 mb-6">
                Coba gunakan kata kunci yang berbeda atau hapus filter pencarian
              </p>
              <button 
                onClick={clearSearch}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Tampilkan Semua Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {filteredProducts.map((product) => (
                <Link 
                  href={`/product/${product.slug}`}
                  key={product.id} 
                  className="bg-white rounded-lg md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-primary/30 group cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 shimmer-effect"
                >
                  {/* Product Image */}
                  <div className="relative h-32 md:h-48 bg-gray-100 overflow-hidden">
                    {product.gambar && !imageErrors.has(product.id) ? (
                      <Image
                        src={product.gambar}
                        alt={product.namaProduk}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(product.id)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full group-hover:scale-110 transition-transform duration-500">
                        <div className="text-gray-400 text-center">
                          <FontAwesomeIcon icon={faShoppingCart} className="text-4xl mb-2 group-hover:text-primary transition-colors duration-300" />
                          <div className="text-sm group-hover:text-primary transition-colors duration-300">Foto Produk</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-500"></div>
                    
                    {/* BPOM Badge */}
                    {product.bpom && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 group-hover:bg-green-200 group-hover:scale-105 transition-all duration-300 shadow-sm">
                        BPOM: {product.bpom}
                      </div>
                    )}
                  </div>                  {/* Product Info */}
                  <div className="p-3 md:p-6">                    {/* Type Badge */}
                    <div 
                      className={`inline-flex items-center gap-1 text-xs px-2 md:px-3 py-1 rounded-full mb-2 md:mb-3 transition-all duration-300 group-hover:scale-105 ${
                        product.type === 'package' 
                          ? 'bg-purple-100 text-purple-800 group-hover:bg-purple-200'
                          : 'bg-primary/10 text-primary group-hover:bg-primary/20 hover:bg-primary/30 cursor-pointer'
                      }`}
                      onClick={(e) => {
                        // Only make clickable if it's a product with a category (not a package)
                        if (product.type !== 'package' && product.categories?.name) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCategoryClick(product.categories.name);
                        }
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={product.type === 'package' ? faShoppingCart : faInfoCircle} 
                        className="w-3 h-3" 
                      />
                      {product.type === 'package' ? 'PAKET' : product.categories?.name || 'PRODUK'}
                    </div>
                    
                    {/* Product Name */}
                    <h3 className="text-sm md:text-lg font-semibold text-gray-800 group-hover:text-primary mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3.5rem] transition-colors duration-300">
                      {product.namaProduk}
                    </h3>
                    
                    {/* Package Contents */}
                    {product.type === 'package' && product.packageContents && product.packageContents.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Berisi {product.packageContents.length} produk:</p>
                        <div className="text-xs text-gray-600">
                          {product.packageContents.slice(0, 2).map((item, index) => (
                            <span key={item.id}>
                              {item.nama}
                              {item.jumlah > 1 && ` (${item.jumlah}x)`}
                              {index < Math.min(product.packageContents!.length - 1, 1) && ', '}
                            </span>
                          ))}
                          {product.packageContents.length > 2 && (
                            <span className="text-primary"> +{product.packageContents.length - 2} lainnya</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Description */}
                    {product.deskripsi && (
                      <p className="text-gray-600 group-hover:text-gray-700 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 min-h-[2.5rem] md:min-h-[4rem] transition-colors duration-300">
                        {product.deskripsi}
                      </p>
                    )}
                      {/* Price */}
                    <div className="text-lg md:text-xl font-bold text-primary group-hover:text-pink-600 mb-3 md:mb-4 transition-colors duration-300 group-hover:scale-105 transform">
                      {formatPrice(product.hargaUmum)}
                      {product.type === 'package' && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-normal mt-1">
                          <FontAwesomeIcon icon={faShoppingCart} className="w-3 h-3" />
                          Hemat dengan paket bundling
                        </div>
                      )}
                    </div>
                      {/* Action Buttons */}
                    <div className="flex gap-1 md:gap-2 group-hover:translate-y-0 translate-y-1 transition-transform duration-300">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const message = product.type === 'package' 
                            ? `Halo kak, saya tertarik dengan paket ${product.namaProduk}`
                            : `Halo kak, saya mau tanya produk ${product.namaProduk}`;
                          handleWhatsAppOrder(message);
                        }}
                        className="flex-1 bg-primary text-white py-2 md:py-3 rounded-lg hover:bg-pink-600 active:bg-pink-700 transition-all duration-300 font-semibold text-xs md:text-sm transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        <FontAwesomeIcon icon={faShoppingCart} className="mr-1 group-hover:animate-pulse" />
                        {product.type === 'package' ? 'Pesan Paket' : 'Beli'}
                      </button>
                      <div className="flex-1 bg-gray-100 text-gray-700 py-2 md:py-3 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-all duration-300 font-semibold text-xs md:text-sm text-center transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1 group-hover:animate-bounce" />
                        Detail
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-pink-600 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            Butuh Konsultasi Produk?
          </h2>
          <p className="text-base md:text-xl text-pink-100 mb-6 md:mb-8">
            Tim ahli kami siap membantu Anda memilih produk yang tepat untuk kulit Anda
          </p>
          <a 
            href="https://wa.me/6285852555571" 
            className="bg-white text-primary px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Konsultasi Gratis
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      </div>
    </>
  );
};

export default ProductPage;