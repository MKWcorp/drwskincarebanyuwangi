import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ 
        success: false, 
        error: 'Slug parameter is required' 
      }, { status: 400 });
    }

    const product = await prisma.produk.findFirst({
      where: {
        slug: slug
      },
      include: {
        produk_kategori: {
          include: {
            kategori: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }

    // Generate metadata for the product
    const productImage = product.foto_utama || '/logo_drwskincare_square.png';
    const productPrice = product.harga_umum 
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(Number(product.harga_umum))
      : 'Hubungi Kami';

    const title = `${product.nama_produk} - ${productPrice} | DRW Skincare`;
    const description = product.deskripsi_singkat 
      ? `${product.deskripsi_singkat} - Produk skincare berkualitas dari DRW Skincare dengan harga ${productPrice}. ${product.bpom ? `BPOM: ${product.bpom}` : ''}`
      : `${product.nama_produk} - Produk skincare berkualitas dari DRW Skincare dengan harga ${productPrice}. Konsultasi gratis dengan dokter berpengalaman.`;

    const metadata = {
      title,
      description,
      image: productImage,
      url: `https://drwskincarebanyuwangi.com/product/${slug}`,
      keywords: `${product.nama_produk}, skincare, DRW Skincare, produk kecantikan, perawatan kulit, ${product.bpom ? `BPOM ${product.bpom}` : ''}`,
      price: productPrice,
      bpom: product.bpom,
      category: product.produk_kategori?.[0]?.kategori?.nama_kategori || 'Skincare'
    };

    return NextResponse.json({
      success: true,
      data: {
        product,
        metadata
      }
    });

  } catch (error) {
    console.error('Error generating product metadata:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export const dynamic = 'force-dynamic';