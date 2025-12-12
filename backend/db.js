import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Prisma 7
import pkg from "pg"; // pg is CJS
const { Pool } = pkg;
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Initialize/Seed Data
const initDb = async () => {
  try {
    const villageCount = await prisma.village.count();

    if (villageCount === 0) {
      console.log("Seeding data...");

      // Villages
      const v1 = await prisma.village.create({
        data: {
          name: "Wajir North",
          district: "Wajir",
          latitude: 1.7471,
          longitude: 40.0573,
          drought_risk_level: "High",
        },
      });

      const v2 = await prisma.village.create({
        data: {
          name: "Marsabit Central",
          district: "Marsabit",
          latitude: 2.3369,
          longitude: 37.9904,
          drought_risk_level: "Medium",
        },
      });

      const v3 = await prisma.village.create({
        data: {
          name: "Lodwar Town",
          district: "Turkana",
          latitude: 3.1191,
          longitude: 35.5973,
          drought_risk_level: "Severe",
        },
      });

      // Boreholes
      await prisma.borehole.createMany({
        data: [
          {
            village_id: v1.id,
            name: "BH-001 Wajir A",
            status: "Working",
            water_level: 80.0,
          },
          {
            village_id: v1.id,
            name: "BH-002 Wajir B",
            status: "Broken",
            water_level: 0.0,
          },
          {
            village_id: v2.id,
            name: "BH-003 Marsabit A",
            status: "Working",
            water_level: 60.5,
          },
          {
            village_id: v3.id,
            name: "BH-004 Lodwar Main",
            status: "Low Water",
            water_level: 15.0,
          },
        ],
      });

      console.log("Seeding complete.");
    }
  } catch (error) {
    console.error("Seeding error:", error);
  }
};

initDb();

export default prisma;
