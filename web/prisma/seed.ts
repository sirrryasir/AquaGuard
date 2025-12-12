import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const waterSources = [
    {
      name: "Central Borehole",
      lat: 9.562,
      lng: 44.065,
      village: "Hargeisa",
      status: "working",
      last_updated: new Date(),
    },
    {
      name: "Village Well North",
      lat: 9.55,
      lng: 44.05,
      village: "Hargeisa",
      status: "low",
      last_updated: new Date(),
    },
    {
      name: "Community Pump",
      lat: 9.57,
      lng: 44.08,
      village: "Hargeisa",
      status: "broken",
      last_updated: new Date(),
    },
    {
      name: "River Access Point",
      lat: 9.54,
      lng: 44.04,
      village: "Hargeisa",
      status: "no_water",
      last_updated: new Date(),
    },
  ];

  console.log(`Start seeding ...`);
  for (const ws of waterSources) {
    const source = await prisma.waterSource.create({
      data: ws,
    });
    console.log(`Created water source with id: ${source.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
