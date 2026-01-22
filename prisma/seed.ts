import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, MealCategory } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding ...')

  // const dummyImage = "https://res.cloudinary.com/dxfh5vzgh/image/upload/v1768908269/txly6eey6murxsomxbjz.jpg"

  // const shopData = [
  //   { name: 'Kantin Bu Joko', description: 'Masakan rumahan yang lezat' },
  //   { name: 'Warung Pojok', description: 'Snack dan minuman segar' },
  //   { name: 'Soto Seger', description: 'Minuman dan makanan berkuah' },
  //   { name: 'Bakso Pak Kumis', description: 'Bakso urat dan halus' },
  // ]

  // Seeder Shop and their menus
  // for (const shopInfo of shopData) {
  //   const shop = await prisma.shop.upsert({
  //     where: { name: shopInfo.name },
  //     update: {},
  //     create: {
  //       name: shopInfo.name,
  //       address: 'Kantin Sekolah San Jose',
  //       phone: '08123456789',
  //       description: shopInfo.description,
  //       status: 'OPEN',
  //       meals: {
  //         create: [
  //           {
  //             name: 'Nasi Goreng Spesial',
  //             description: 'Nasi goreng dengan telur dan ayam',
  //             price: 15000,
  //             category: MealCategory.MEAL,
  //             isAvailable: true,
  //             images: {
  //               create: [{ imagePath: dummyImage, isPrimary: true, order: 0 }]
  //             }
  //           },
  //           {
  //             name: 'Mie Ayam Bakso',
  //             description: 'Mie ayam dengan tambahan bakso sapi',
  //             price: 12000,
  //             category: MealCategory.MEAL,
  //             isAvailable: true,
  //             images: {
  //               create: [{ imagePath: dummyImage, isPrimary: true, order: 0 }]
  //             }
  //           },
  //           {
  //             name: 'Es Teh Manis',
  //             description: 'Teh manis dingin segar',
  //             price: 3000,
  //             category: MealCategory.DRINK,
  //             isAvailable: true,
  //             images: {
  //               create: [{ imagePath: dummyImage, isPrimary: true, order: 0 }]
  //             }
  //           },
  //           {
  //             name: 'Pisang Goreng Keju',
  //             description: 'Pisang goreng topping keju susu',
  //             price: 5000,
  //             category: MealCategory.SNACK,
  //             isAvailable: true,
  //             images: {
  //               create: [{ imagePath: dummyImage, isPrimary: true, order: 0 }]
  //             }
  //           },
  //           {
  //             name: 'Jus Jeruk',
  //             description: 'Jus jeruk peras murni',
  //             price: 8000,
  //             category: MealCategory.DRINK,
  //             isAvailable: true,
  //             images: {
  //               create: [{ imagePath: dummyImage, isPrimary: true, order: 0 }]
  //             }
  //           },
  //         ],
  //       },
  //     },
  //   })
  //   console.log(`Created shop with id: ${shop.id}`)
  // }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })

