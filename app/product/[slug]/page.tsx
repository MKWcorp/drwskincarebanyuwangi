'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faEnvelope, 
  faPhone, 
  faShoppingCart, 
  faArrowLeft, 
  faSpinner, 
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

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

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

const ProductDetailPage = ({ params }: ProductDetailPageProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`);
        const result = await response.json();
        
        if (result.success) {
          setProduct(result.data);
        } else {
          setError(result.error || 'Product not found');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.slug]);

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
                quality={100}
                unoptimized
              />
            </Link>
          </div>
        </header>

        {/* Loading State */}
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary animate-spin mb-4" />
            <span className="ml-4 text-gray-600">Memuat produk...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
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
              {error || 'Produk tidak ditemukan'}
            </div>
            <Link 
              href="/product"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Kembali ke Daftar Produk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
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
            <nav className="hidden md:flex space-x-8">
              <Link href="/#produk" className="text-gray-700 hover:text-primary transition-colors">
                Produk
              </Link>
              <Link href="/#kontak" className="text-gray-700 hover:text-primary transition-colors">
                Kontak
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span className="mx-2">/</span>
            <Link href="/product" className="hover:text-primary transition-colors">
              Produk
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{product.namaProduk}</span>
          </div>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative bg-gray-100">
                <div className="aspect-square relative">
                  {product.gambar && !imageError ? (
                    <Image
                      src={product.gambar}
                      alt={product.namaProduk}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-gray-400 text-center">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-6xl mb-4" />
                        <div className="text-lg">Foto Produk</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* BPOM Badge */}
                {product.bpom && (
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold bg-green-500 text-white shadow-lg">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    BPOM: {product.bpom}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 md:p-8">
                {/* Category */}
                {product.categories && (
                  <div className="inline-block bg-primary/10 text-primary text-sm px-4 py-2 rounded-full mb-4">
                    {product.categories.name}
                  </div>
                )}
                
                {/* Product Name */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  {product.namaProduk}
                </h1>
                
                {/* Description */}
                {product.deskripsi && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi Produk</h2>
                    <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                      {product.deskripsi}
                    </p>
                  </div>
                )}
                
                {/* Price Section */}
                <div className="border-t border-b border-gray-200 py-6 my-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Harga Produk</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Harga Umum:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.hargaUmum)}
                      </span>
                    </div>
                    
                    {product.hargaConsultant && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Harga Consultant:</span>
                        <span className="font-semibold text-gray-800">
                          {formatPrice(product.hargaConsultant)}
                        </span>
                      </div>
                    )}
                    
                    {product.hargaSupervisor && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Harga Supervisor:</span>
                        <span className="font-semibold text-gray-800">
                          {formatPrice(product.hargaSupervisor)}
                        </span>
                      </div>
                    )}
                    
                    {product.hargaManager && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Harga Manager:</span>
                        <span className="font-semibold text-gray-800">
                          {formatPrice(product.hargaManager)}
                        </span>
                      </div>
                    )}
                    
                    {product.hargaDirector && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Harga Director:</span>
                        <span className="font-semibold text-gray-800">
                          {formatPrice(product.hargaDirector)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bundling Badge */}
                {product.isBundling && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      Produk ini merupakan paket bundling
                    </p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleWhatsAppOrder(product.namaProduk)}
                    className="w-full bg-primary text-white py-4 rounded-lg hover:bg-pink-600 transition-colors font-semibold text-lg"
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                    Beli Sekarang via WhatsApp
                  </button>
                  
                  <Link
                    href="/product"
                    className="block w-full text-center bg-gray-100 text-gray-700 py-4 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-lg"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Kembali ke Daftar Produk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-pink-600 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            Butuh Konsultasi Produk?
          </h2>
          <p className="text-base md:text-xl text-pink-100 mb-6 md:mb-8">
            Tim kami siap membantu Anda memilih produk yang tepat untuk kebutuhan kulit Anda
          </p>
          <a 
            href="https://wa.me/6285852555571" 
            className="inline-block bg-white text-primary px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-pink-50 transition-colors"
          >
            <FontAwesomeIcon icon={faPhone} className="mr-2" />
            Hubungi Kami
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Image 
            src="/logo_drwskincare.png" 
            alt="DRW Skincare Logo" 
            width={150}
            height={50}
            className="h-8 md:h-12 w-auto mx-auto mb-4 md:mb-6 brightness-0 invert"
            unoptimized
          />
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

export default ProductDetailPage;
