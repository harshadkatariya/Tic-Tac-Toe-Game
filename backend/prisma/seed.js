const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const userData = [
  {
    email: `${process.env.SYS_EMAIL}`,
    name: `${process.env.SYS_NAME}`,
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })