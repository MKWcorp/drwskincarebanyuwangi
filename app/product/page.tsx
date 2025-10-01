'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope, faPhone, faShoppingCart, faInfoCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

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
  fotoProduk: string | null;
  categoryId: string | null;
  slug: string;
  bpom: string | null;
  isBundling: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  } | null;
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
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

  const handleWhatsAppOrder = (productName: string) => {
    const message = `Halo kak aku mau tanya produk ${productName}`;
    const whatsappUrl = `https://wa.me/6285852555571?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleProductDetail = (slug: string) => {
    window.location.href = `/product/${slug}`;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo_drwskincare.png" 
              alt="DRW Skincare Logo" 
              width={300}
              height={100}
              className="h-10 md:h-12 w-auto"
              priority
              quality={100}
              unoptimized
            />
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link href="/product" className="text-primary font-semibold">
              Produk
            </Link>
            <Link href="/#kontak" className="text-gray-700 hover:text-primary transition-colors">
              Kontak
            </Link>
          </nav>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Link href="/" className="text-sm text-gray-600 hover:text-primary">
              ← Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="bg-white py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4">
            Produk DRW Skincare
          </h1>
          <p className="text-base md:text-xl text-gray-600">
            Temukan produk perawatan kulit terbaik untuk kebutuhan Anda
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {products.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20"
                >
                  {/* Product Image */}
                  <div className="relative h-32 md:h-48 bg-gray-100">
                    {product.gambar && !imageErrors.has(product.id) ? (
                      <Image
                        src={product.gambar}
                        alt={product.namaProduk}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(product.id)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-center">
                          <FontAwesomeIcon icon={faShoppingCart} className="text-4xl mb-2" />
                          <div className="text-sm">Foto Produk</div>
                        </div>
                      </div>
                    )}
                    
                    {/* BPOM Badge */}
                    {product.bpom && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        BPOM: {product.bpom}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 md:p-6">
                    {/* Category */}
                    {product.categories && (
                      <div className="inline-block bg-primary/10 text-primary text-xs px-2 md:px-3 py-1 rounded-full mb-2 md:mb-3">
                        {product.categories.name}
                      </div>
                    )}
                    
                    {/* Product Name */}
                    <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3.5rem]">
                      {product.namaProduk}
                    </h3>
                    
                    {/* Description */}
                    {product.deskripsi && (
                      <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 min-h-[2.5rem] md:min-h-[4rem]">
                        {product.deskripsi}
                      </p>
                    )}
                    
                    {/* Price */}
                    <div className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">
                      <span className="text-xs md:text-sm text-gray-500 font-normal">Harga: </span>
                      {formatPrice(product.hargaUmum)}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1 md:gap-2">
                      <button
                        onClick={() => handleWhatsAppOrder(product.namaProduk)}
                        className="flex-1 bg-primary text-white py-2 md:py-3 rounded-lg hover:bg-pink-600 transition-colors font-semibold text-xs md:text-sm"
                      >
                        <FontAwesomeIcon icon={faShoppingCart} className="mr-1" />
                        Beli
                      </button>
                      <button
                        onClick={() => handleProductDetail(product.slug)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 md:py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-xs md:text-sm"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
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
      <footer className="bg-gray-800 text-white py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-3 md:mb-4 flex justify-center">
            <Image 
              src="/logo_drwskincare.png" 
              alt="DRW Skincare Logo" 
              width={300}
              height={100}
              className="h-12 md:h-16 w-auto"
              quality={100}
              unoptimized
            />
          </div>
          <div className="space-y-1 md:space-y-2 text-gray-300 text-sm md:text-base">
            <p><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> DRW Skincare Pusat Banyuwangi</p>
            <p><FontAwesomeIcon icon={faEnvelope} className="mr-2" /> info@drwskincare.com</p>
            <p><FontAwesomeIcon icon={faPhone} className="mr-2" /> 0858-5255-5571</p>
          </div>
          <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-gray-400 text-xs md:text-sm">
            <p>&copy; 2025 DRW Skincare Banyuwangi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductPage;