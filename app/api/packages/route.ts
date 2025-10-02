import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const slug = searchParams.get('slug')
    
    let packages
    
    if (slug) {
      // Get specific package by slug
      packages = await prisma.paket_produk.findMany({
        where: { slug: slug },
        include: {
          paket_kategori: {
            include: {
              kategori: true
            }
          },
          foto_produk: {
            orderBy: {
              urutan: 'asc'
            }
          },
          paket_isi: {
            include: {
              produk: {
                include: {
                  foto_produk: {
                    orderBy: {
                      urutan: 'asc'
                    },
                    take: 1
                  }
                }
              }
            }
          }
        }
      })
    } else {
      // Get all packages
      packages = await prisma.paket_produk.findMany({
        include: {
          paket_kategori: {
            include: {
              kategori: true
            }
          },
          foto_produk: {
            orderBy: {
              urutan: 'asc'
            }
          },
          paket_isi: {
            include: {
              produk: {
                select: {
                  id_produk: true,
                  nama_produk: true,
                  foto_utama: true
                }
              }
            }
          }
        },
        orderBy: {
          nama_paket: 'asc'
        }
      })
    }
    
    // Transform data to match frontend expectations
    const transformedPackages = packages.map((pkg: any) => ({
      id: pkg.id_paket.toString(),
      namaProduk: pkg.nama_paket,
      deskripsi: pkg.deskripsi,
      hargaUmum: pkg.harga_umum,
      hargaConsultant: pkg.harga_consultant,
      hargaDirector: pkg.harga_director,
      hargaManager: pkg.harga_manager,
      hargaSupervisor: pkg.harga_supervisor,
      gambar: pkg.foto_utama || (pkg.foto_produk?.[0]?.url_foto),
      fotoProduk: pkg.foto_produk?.map((foto: any) => ({
        url: foto.url_foto,
        alt: foto.alt_text,
        urutan: foto.urutan
      })),
      slug: pkg.slug,
      isPackage: true,
      categories: pkg.paket_kategori?.[0] ? {
        id: pkg.paket_kategori[0].kategori.id.toString(),
        name: pkg.paket_kategori[0].kategori.nama_kategori,
        description: pkg.paket_kategori[0].kategori.deskripsi
      } : null,
      packageContents: pkg.paket_isi?.map((isi: any) => ({
        id: isi.produk.id_produk.toString(),
        nama: isi.produk.nama_produk,
        jumlah: isi.jumlah,
        gambar: isi.produk.foto_utama
      })),
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at
    }))
    
    return NextResponse.json({
      success: true,
      data: transformedPackages
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch packages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
