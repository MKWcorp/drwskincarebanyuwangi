import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await prisma.produk.findMany({
      include: {
        produk_kategori: {
          include: {
            kategori: true
          }
        },
        foto_produk: {
          orderBy: {
            urutan: 'asc'
          }
        }
      },
      orderBy: {
        nama_produk: 'asc'
      },
      take: 8
    })
    
    // Transform data to match frontend expectations
    const transformedProducts = products.map((product: any) => ({
      id: product.id_produk.toString(),
      namaProduk: product.nama_produk,
      deskripsi: product.deskripsi_singkat,
      hargaUmum: product.harga_umum,
      hargaConsultant: product.harga_consultant,
      hargaDirector: product.harga_director,
      hargaManager: product.harga_manager,
      hargaSupervisor: product.harga_supervisor,
      gambar: product.foto_utama || (product.foto_produk?.[0]?.url_foto),
      slug: product.slug,
      categories: product.produk_kategori?.[0] ? {
        id: product.produk_kategori[0].kategori.id.toString(),
        name: product.produk_kategori[0].kategori.nama_kategori,
        description: product.produk_kategori[0].kategori.deskripsi
      } : null,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }))
    
    return NextResponse.json({
      success: true,
      data: transformedProducts
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch featured products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}