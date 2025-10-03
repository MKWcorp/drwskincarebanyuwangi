import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Helper function to serialize BigInt values
function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const slug = searchParams.get('slug')
    const type = searchParams.get('type') // 'products', 'packages', or 'all'
    
    let products: any[] = []
    let packages: any[] = []
      if (slug) {
      // Get specific product by slug - check both produk and paket_produk tables
      products = await (prisma as any).produk.findMany({
        where: { slug: slug },
        include: {
          produk_kategori: {
            include: {
              kategori: true
            }
          },
          produk_detail: true,
          foto_produk: {
            orderBy: {
              urutan: 'asc'
            }
          },
          produk_bahan_aktif: {
            include: {
              bahan_aktif: true
            }
          }
        }
      })

      // If no product found, check paket_produk table
      if (products.length === 0) {
        packages = await (prisma as any).paket_produk.findMany({
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
                    produk_detail: true
                  }
                }
              }
            }
          }
        })
      }
    } else {
      // Get products and packages based on type parameter
      if (!type || type === 'products' || type === 'all') {
        products = await (prisma as any).produk.findMany({
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
          }
        })
      }

      if (!type || type === 'packages' || type === 'all') {
        packages = await (prisma as any).paket_produk.findMany({
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
    }

    // Transform products data
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
      fotoProduk: product.foto_produk?.map((foto: any) => ({
        url: foto.url_foto,
        alt: foto.alt_text,
        urutan: foto.urutan
      })),
      slug: product.slug,
      bpom: product.bpom,
      type: 'product',
      categories: product.produk_kategori?.[0] ? {
        id: product.produk_kategori[0].kategori.id.toString(),
        name: product.produk_kategori[0].kategori.nama_kategori,
        description: product.produk_kategori[0].kategori.deskripsi
      } : null,
      detail: product.produk_detail ? {
        kegunaan: product.produk_detail.kegunaan,
        komposisi: product.produk_detail.komposisi,
        caraPakai: product.produk_detail.cara_pakai,
        netto: product.produk_detail.netto,
        noBpom: product.produk_detail.no_bpom
      } : null,
      bahanAktif: product.produk_bahan_aktif?.map((bahan: any) => ({
        nama: bahan.bahan_aktif.nama_bahan,
        fungsi: bahan.fungsi
      })),
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }))

    // Transform packages data
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
      type: 'package',
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
    
    // Combine products and packages
    const allItems = [...transformedProducts, ...transformedPackages]
    
    return NextResponse.json({
      success: true,
      data: allItems,
      meta: {
        totalProducts: transformedProducts.length,
        totalPackages: transformedPackages.length,
        total: allItems.length
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}