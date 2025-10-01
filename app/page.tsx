'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faMapMarkerAlt, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: string;
  namaProduk: string;
  deskripsi: string | null;
  hargaUmum: number | null;
  gambar: string | null;
  slug: string;
  categories?: {
    name: string;
  } | null;
}

interface StaticProduct {
  id: string;
  namaProduk: string;
  category: string;
  hargaUmum: number;
  gambar: string | null;
  bgColor?: string;
}

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products/featured');
      const result = await response.json();
      
      if (result.success) {
        setFeaturedProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
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

  // Static products to fill remaining slots (melanjutkan dari produk API)
  const staticProducts: StaticProduct[] = [
    { id: 'static-1', namaProduk: 'DNA Salmon Serum', category: 'Anti Aging', hargaUmum: 450000, gambar: '/images/produk1.svg' },
    { id: 'static-2', namaProduk: 'Vitamin C Brightening Serum', category: 'Brightening', hargaUmum: 320000, gambar: '/images/produk2.svg' },
    { id: 'static-3', namaProduk: 'Acne Treatment Serum', category: 'Acne Care', hargaUmum: 280000, gambar: '/images/produk3.svg' },
    { id: 'static-4', namaProduk: 'Hyaluronic Acid Moisturizer', category: 'Moisturizer', hargaUmum: 250000, gambar: null, bgColor: 'from-pink-100 to-pink-200' },
    { id: 'static-5', namaProduk: 'SPF 50+ Sunscreen', category: 'Sunscreen', hargaUmum: 180000, gambar: null, bgColor: 'from-blue-100 to-blue-200' },
    { id: 'static-6', namaProduk: 'Gentle Foam Cleanser', category: 'Cleanser', hargaUmum: 150000, gambar: null, bgColor: 'from-green-100 to-green-200' },
    { id: 'static-7', namaProduk: 'Hydrating Toner', category: 'Toner', hargaUmum: 120000, gambar: null, bgColor: 'from-purple-100 to-purple-200' },
    { id: 'static-8', namaProduk: 'Eye Cream Anti Aging', category: 'Eye Care', hargaUmum: 380000, gambar: null, bgColor: 'from-yellow-100 to-yellow-200' }
  ];

  // Menampilkan 8 produk total: Produk API dulu, lalu produk static untuk slot yang tersisa
  const getDisplayProducts = (): (Product | StaticProduct)[] => {
    const allProducts: (Product | StaticProduct)[] = [...featuredProducts];
    const remainingSlots = 8 - allProducts.length;
    
    if (remainingSlots > 0) {
      allProducts.push(...staticProducts.slice(0, remainingSlots));
    }
    
    return allProducts.slice(0, 8);
  };

  const renderProduct = (product: Product | StaticProduct, index: number) => {
    const isStatic = !('deskripsi' in product);
    const staticProduct = product as StaticProduct;
    const realProduct = product as Product;
    
    const productCard = (
      <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 text-center hover:shadow-xl transition-shadow">
        <div className="relative w-full h-32 md:h-48 mb-3 md:mb-4">
          {product.gambar ? (
            <Image 
              src={product.gambar} 
              alt={product.namaProduk} 
              fill
              className="object-cover rounded-xl"
            />          ) : (            <div className={`flex items-center justify-center h-full rounded-xl ${
              isStatic && staticProduct.bgColor 
                ? `bg-gradient-to-br ${staticProduct.bgColor}` 
                : 'bg-gray-100'
            }`}>
              <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-primary" />
            </div>
          )}
        </div>
        
        {/* Category */}
        <div className="inline-block bg-primary/10 text-primary text-xs px-2 md:px-3 py-1 rounded-full mb-2 md:mb-3">
          {isStatic ? staticProduct.category : realProduct.categories?.name || 'Skincare'}
        </div>
        
        <h3 className="text-sm md:text-xl font-semibold text-gray-800 mb-2 md:mb-3 line-clamp-2">
          {product.namaProduk}
        </h3>
        
        {/* Price */}
        <div className="text-sm md:text-lg font-bold text-primary mb-3 md:mb-4">
          {formatPrice(product.hargaUmum)}
        </div>
        
        {!isStatic && realProduct.slug ? (
          <Link 
            href={`/product/${realProduct.slug}`}
            className="bg-primary text-white px-4 md:px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors inline-block text-xs md:text-sm"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
            Lihat Detail
          </Link>
        ) : (
          <a 
            href={`https://wa.me/6285852555571?text=Halo%20kak%20aku%20mau%20tanya%20produk%20${encodeURIComponent(product.namaProduk)}`}
            className="bg-primary text-white px-4 md:px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors inline-block text-xs md:text-sm"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
            Beli Sekarang
          </a>
        )}
      </div>
    );
    
    return <div key={product.id}>{productCard}</div>;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
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
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link href="/product" className="text-gray-700 hover:text-primary transition-colors">Produk</Link>
          <a href="#kontak" className="text-gray-700 hover:text-primary transition-colors">Kontak</a>
        </nav>
        <a 
          href="https://wa.me/6285852555571" 
          className="bg-primary text-white px-3 md:px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm md:text-base"
        >
          <span className="hidden md:inline">Konsultasi Gratis</span>
          <span className="md:hidden">Konsultasi</span>
        </a>
      </header>

      {/* Hero Section */}
      <section className="hero bg-gradient-to-r from-pink-50 to-white py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-800 mb-4 md:mb-6">
              Kulit Sehat dan Cantik Dimulai dari Sini!
            </h1>
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
              Solusi perawatan kulit terbaik dengan produk berkualitas dan konsultasi profesional.
            </p>
            <a 
              href="https://wa.me/6285852555571" 
              className="bg-primary text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg hover:bg-pink-600 transition-colors inline-block"
            >
              Konsultasi Sekarang
            </a>
          </div>
          <div className="lg:w-1/2 flex justify-center mt-8 lg:mt-0">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <Image 
                src="/images/hero.svg" 
                alt="Hero Image" 
                fill
                className="object-cover rounded-2xl shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Produk Section - Sekarang menampilkan 8 produk */}
      <section id="produk" className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-16">
            Produk Pilihan DRW Skincare
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              // Loading skeleton - 8 produk
              [...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 text-center animate-pulse">
                  <div className="w-full h-32 md:h-48 mb-3 md:mb-4 bg-gray-300 rounded-xl"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-2/3 mx-auto"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))
            ) : (
              // Menampilkan 8 produk: API + static sebagai fallback
              getDisplayProducts().map((product, index) => renderProduct(product, index))
            )}
          </div>
          
          {/* View All Products Button */}
          <div className="text-center mt-8 md:mt-12">
            <Link 
              href="/product" 
              className="bg-primary text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg hover:bg-pink-600 transition-colors inline-block"
            >
              Lihat Semua Produk
            </Link>
          </div>
        </div>
      </section>

      {/* Konsultasi Section */}
      <section id="konsultasi" className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-r from-primary to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
            Konsultasi Gratis dengan Ahli Kulit
          </h2>
          <p className="text-base md:text-xl mb-6 md:mb-8">
            Tanya ahli kami seputar perawatan kulit yang tepat untukmu!
          </p>
          <a 
            href="https://wa.me/6285852555571" 
            className="bg-white text-primary px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Konsultasi Sekarang
          </a>
        </div>
      </section>

      {/* Testimoni Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-16">
            Apa Kata Mereka?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-8">
              <p className="text-gray-600 mb-3 md:mb-4 italic text-sm md:text-base">
                &ldquo;Produk DRW Skincare membuat kulit saya lebih cerah dan sehat! Pelayanannya sangat memuaskan.&rdquo;
              </p>
              <p className="font-semibold text-primary text-sm md:text-base">- Sarah M.</p>
            </div>
            
            <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-8">
              <p className="text-gray-600 mb-3 md:mb-4 italic text-sm md:text-base">
                &ldquo;Konsultasi gratis yang sangat membantu. Sekarang kulit wajah saya bebas jerawat!&rdquo;
              </p>
              <p className="font-semibold text-primary text-sm md:text-base">- Rina K.</p>
            </div>
            
            <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-8">
              <p className="text-gray-600 mb-3 md:mb-4 italic text-sm md:text-base">
                &ldquo;DNA Salmon Serum benar-benar ampuh untuk anti aging. Highly recommended!&rdquo;
              </p>
              <p className="font-semibold text-primary text-sm md:text-base">- Maya L.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-gray-800 text-white py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="mb-4">
                <Image 
                  src="/logo_drwskincare.png" 
                  alt="DRW Skincare Logo" 
                  width={300}
                  height={100}
                  className="h-16 w-auto"
                  quality={100}
                  unoptimized
                />
              </div>
              <p className="text-gray-300 mb-4">
                Solusi perawatan kulit terbaik dengan produk berkualitas dan konsultasi profesional.
              </p>
            </div>
            
            <div>              <h4 className="text-xl font-semibold mb-4">Kontak Info</h4>              <div className="space-y-2 text-gray-300">
                <p><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> DRW Skincare Pusat Banyuwangi</p>
                <p><FontAwesomeIcon icon={faEnvelope} className="mr-2" /> info@drwskincare.com</p>
                <p><FontAwesomeIcon icon={faPhone} className="mr-2" /> 0858-5255-5571</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-4">Lokasi Kami</h4>
              <div className="rounded-lg overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d246.68483422657434!2d114.27215168518775!3d-8.40585001876544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd3fd69d910bc81%3A0xdc7f68fe1babbfd6!2sRumah%20Cantik%20Drw%20Skincare%20YK%20Beautycare%20%26%20D'kriuk%20Fried%20Chicken!5e0!3m2!1sid!2sid!4v1759233026595!5m2!1sid!2sid" 
                  width="100%" 
                  height="200" 
                  style={{border: 0}} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-48 md:h-56"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 DRW Skincare Banyuwangi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;