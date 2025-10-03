'use client';

import { notFound } from "next/navigation";
import Image from "next/image";
import Head from "next/head";
import BuyButton from "@/components/BuyButton";
import SafeImage from "../../../components/SafeImage";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faArrowLeft, faTag, faFlask, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

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
  bpom?: string | null;
  type?: 'product' | 'package';
  categories: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  detail?: {
    kegunaan: string | null;
    komposisi: string | null;
    caraPakai: string | null;
    netto: string | null;
    noBpom: string | null;
  } | null;
  bahanAktif?: Array<{
    nama: string;
    fungsi: string | null;
  }> | null;
  packageContents?: Array<{
    id: string;
    nama: string;
    jumlah: number;
    gambar: string | null;
  }> | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success) {
        // Filter out current product and get 4 random products
        const filtered = result.data.filter((p: Product) => p.slug !== params.slug);
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        setRelatedProducts(shuffled.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.namaProduk,
        text: product.deskripsi || '',
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link produk telah disalin ke clipboard!');
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products?slug=${params.slug}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        const productData = result.data[0];
        setProduct(productData);
        // Set default selected image
        const mainImage = productData.gambar || (productData.fotoProduk && productData.fotoProduk[0]?.url) || '/logo_drwskincare_square.png';
        setSelectedImage(mainImage);
      } else {
        setError('Produk tidak ditemukan');
      }
    } catch (err) {
      setError('Error loading product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-300 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/product" 
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Kembali ke Produk
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productImage = product.gambar || (product.fotoProduk && product.fotoProduk[0]?.url) || '/logo_drwskincare_square.png';
  const productPrice = product.hargaUmum 
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(product.hargaUmum)
    : 'Hubungi Kami';

  const pageTitle = `${product.namaProduk} - ${productPrice} | DRW Skincare`;
  const pageDescription = product.deskripsi 
    ? `${product.deskripsi} - Produk skincare berkualitas dari DRW Skincare dengan harga ${productPrice}. ${product.bpom ? `BPOM: ${product.bpom}` : ''}`
    : `${product.namaProduk} - Produk skincare berkualitas dari DRW Skincare dengan harga ${productPrice}. Konsultasi gratis dengan dokter berpengalaman.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${product.namaProduk}, skincare, DRW Skincare, produk kecantikan, perawatan kulit, ${product.bpom ? `BPOM ${product.bpom}` : ''}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={productImage} />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
        <meta property="og:image:alt" content={`${product.namaProduk} - DRW Skincare`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DRW Skincare" />
        <meta property="og:url" content={`https://drwskincarejakarta.com/product/${params.slug}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={productImage} />
        
        <link rel="canonical" href={`https://drwskincarejakarta.com/product/${params.slug}`} />
      </Head>
      
      <div className="min-h-screen bg-white">
        <Header />

        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link 
              href="/product" 
              className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
              Kembali ke Produk
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative">
                <SafeImage 
                  src={selectedImage || '/logo_drwskincare_square.png'} 
                  alt={product.namaProduk} 
                  width={600} 
                  height={600} 
                  className="rounded-lg shadow-lg w-full object-cover h-[600px]" 
                  onError={() => setImageError(true)}
                />
              </div>
              
              {/* Thumbnail Images */}
              {product.fotoProduk && product.fotoProduk.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {/* Main image thumbnail */}
                  {product.gambar && (
                    <div 
                      className={`cursor-pointer rounded-lg overflow-hidden ${selectedImage === product.gambar ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedImage(product.gambar!)}
                    >
                      <SafeImage 
                        src={product.gambar} 
                        alt={product.namaProduk} 
                        width={150} 
                        height={150} 
                        className="w-full h-24 object-cover hover:opacity-80 transition-opacity" 
                      />
                    </div>
                  )}
                  {/* Additional photos */}
                  {product.fotoProduk.slice(0, product.gambar ? 3 : 4).map((foto, index) => (
                    <div 
                      key={index}
                      className={`cursor-pointer rounded-lg overflow-hidden ${selectedImage === foto.url ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedImage(foto.url)}
                    >
                      <SafeImage 
                        src={foto.url} 
                        alt={foto.alt || `${product.namaProduk} ${index + 1}`} 
                        width={150} 
                        height={150} 
                        className="w-full h-24 object-cover hover:opacity-80 transition-opacity" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              {product.categories && (
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                  {product.categories.name}
                </div>
              )}

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{product.namaProduk}</h1>
              
              {product.deskripsi && (
                <p className="text-lg text-gray-700 leading-relaxed">{product.deskripsi}</p>
              )}
              
              {/* Price */}
              <div className="space-y-2">
                {product.hargaUmum && (
                  <p className="text-3xl font-bold text-green-600">
                    Rp {Number(product.hargaUmum).toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {/* BPOM */}
              {product.bpom && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFlask} className="w-4 h-4" />
                    <span className="font-semibold">BPOM:</span> {product.bpom}
                  </p>
                </div>
              )}

              {/* Netto */}
              {product.detail?.netto && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Netto:</span> {product.detail.netto}
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <BuyButton 
                  productName={product.namaProduk} 
                  className="flex-1"
                />
                <button
                  onClick={handleShare}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <FontAwesomeIcon icon={faShare} className="w-4 h-4" />
                  Bagikan
                </button>
              </div>

              {/* Active Ingredients */}
              {product.bahanAktif && product.bahanAktif.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFlask} className="w-4 h-4" />
                    Bahan Aktif
                  </h3>
                  <div className="space-y-2">
                    {product.bahanAktif.map((bahan, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="font-medium text-primary">{bahan.nama}</span>
                        {bahan.fungsi && <span className="text-sm text-gray-600">{bahan.fungsi}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Tabs */}
          {(product.detail?.kegunaan || product.detail?.komposisi || product.detail?.caraPakai) && (
            <div className="mb-12">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-primary text-white px-6 py-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5" />
                    Detail Produk
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {product.detail.kegunaan && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Kegunaan</h3>
                      <p className="text-gray-700 leading-relaxed">{product.detail.kegunaan}</p>
                    </div>
                  )}
                  {product.detail.caraPakai && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Cara Pakai</h3>
                      <p className="text-gray-700 leading-relaxed">{product.detail.caraPakai}</p>
                    </div>
                  )}
                  {product.detail.komposisi && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Komposisi</h3>
                      <p className="text-gray-700 leading-relaxed">{product.detail.komposisi}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>          )}

          {/* Package Contents Section - Only for packages */}
          {product.type === 'package' && product.packageContents && product.packageContents.length > 0 && (
            <div className="mb-12">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-green-600 text-white px-6 py-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FontAwesomeIcon icon={faTag} className="w-5 h-5" />
                    Isi Paket ({product.packageContents.length} Produk)
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.packageContents.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          {item.gambar ? (
                            <SafeImage
                              src={item.gambar}
                              alt={item.nama}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FontAwesomeIcon icon={faTag} className="text-gray-400 text-2xl" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{item.nama}</h4>
                          <p className="text-green-600 font-medium text-sm">Jumlah: {item.jumlah}x</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Produk DRW Skincare Lainnya
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const relatedProductImage = relatedProduct.gambar || 
                    (relatedProduct.fotoProduk && relatedProduct.fotoProduk[0]?.url) || 
                    '/logo_drwskincare_square.png';
                  
                  return (
                    <Link 
                      key={relatedProduct.id}
                      href={`/product/${relatedProduct.slug}`}
                      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                    >
                      <div className="relative w-full h-32 md:h-40 mb-3">
                        {relatedProductImage !== '/logo_drwskincare_square.png' ? (
                          <Image 
                            src={relatedProductImage} 
                            alt={relatedProduct.namaProduk} 
                            fill
                            className="object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="bg-gray-200 rounded-t-lg w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm md:text-base font-semibold text-gray-800 group-hover:text-primary mb-2 line-clamp-2 transition-colors">
                          {relatedProduct.namaProduk}
                        </h3>
                        {relatedProduct.hargaUmum && (
                          <p className="text-primary font-bold text-sm md:text-base">
                            Rp {Number(relatedProduct.hargaUmum).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
