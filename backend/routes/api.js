import express from "express";
const router = express.Router();
import prisma from "../db.js";

// Get all Villages
router.get("/villages", async (req, res) => {
  try {
    const villages = await prisma.village.findMany();
    res.json(villages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Boreholes (with Village data)
router.get("/boreholes", async (req, res) => {
  try {
    const boreholes = await prisma.borehole.findMany({
      include: {
        village: true,
      },
    });

    // Map to flat structure to match previous SQL output
    const flatBoreholes = boreholes.map((b) => ({
      ...b,
      village_name: b.village.name,
      drought_risk_level: b.village.drought_risk_level,
    }));

    res.json(flatBoreholes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit Report (Agent App)
router.post("/reports", async (req, res) => {
  const {
    borehole_id,
    village_id,
    reporter_type,
    report_content,
    latitude,
    longitude,
  } = req.body;

  try {
    const report = await prisma.report.create({
      data: {
        borehole_id,
        village_id,
        reporter_type,
        report_content,
      },
    });
    res.json({ success: true, id: report.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Alerts
router.get("/alerts", async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Alert (Admin/AI)
router.post("/alerts", async (req, res) => {
  const { village_id, message, severity } = req.body;
  try {
    await prisma.alert.create({
      data: {
        village_id,
        message,
        severity,
      },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Borehole (Dashboard)
router.post("/boreholes", async (req, res) => {
  const { village_id, name, status, water_level } = req.body;
  try {
    const borehole = await prisma.borehole.create({
      data: {
        village_id,
        name,
        status,
        water_level,
      },
    });
    res.json({ success: true, id: borehole.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send SMS Mock
router.post("/sms/send", (req, res) => {
  const { to, message } = req.body;
  console.log(`[SMS MOCK] Sending to ${to}: "${message}"`);
  res.json({ success: true, status: "sent", message: "SMS request received" });
});

// AI Simulation Endpoint (Trigger update)
router.post("/ai/update-risk", async (req, res) => {
  // Generate intelligent-looking updates

  // 1. Update Drought Risk randomly
  const riskLevels = ["Low", "Medium", "High", "Severe"];
  const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];

  let aiSummary = "";

  try {
    // Pick random village
    // Prisma doesn't support random order natively, fetching all (assuming small DB for demo)
    const allVillages = await prisma.village.findMany();

    if (allVillages.length > 0) {
      const village =
        allVillages[Math.floor(Math.random() * allVillages.length)];

      await prisma.village.update({
        where: { id: village.id },
        data: { drought_risk_level: randomRisk },
      });

      aiSummary += `Updated ${village.name} risk to ${randomRisk}. `;

      // Generate Alert if High/Severe or just random info
      if (randomRisk === "High" || randomRisk === "Severe") {
        const messages = [
          `Drought Risk escalated to ${randomRisk}. Immediate water rationing required.`,
          `AI Prediction: Water tables dropping rapidly in ${village.name}.`,
          `Urgent: ${randomRisk} drought conditions detected.`,
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];

        await prisma.alert.create({
          data: {
            village_id: village.id,
            message: msg,
            severity: "Critical",
          },
        });

        aiSummary += "Critical Alert generated. ";
      } else {
        // Generate advisory info
        if (Math.random() > 0.5) {
          const advisories = [
            `Predicted rainfall in 3 days. Prepare catchment systems.`,
            `Water usage optimization recommended.`,
            `Groundwater levels stable.`,
          ];
          const adv = advisories[Math.floor(Math.random() * advisories.length)];

          await prisma.alert.create({
            data: {
              village_id: village.id,
              message: `AI Advisory: ${adv}`,
              severity: "Info",
            },
          });

          aiSummary += "Advisory generated.";
        }
      }
    }

    // 2. Simulate Water Level Fluctuation
    const allBoreholes = await prisma.borehole.findMany();
    if (allBoreholes.length > 0) {
      const borehole =
        allBoreholes[Math.floor(Math.random() * allBoreholes.length)];

      const change = Math.random() * 10 - 5; // +/- 5%
      let newLevel = Math.max(
        0,
        Math.min(100, (borehole.water_level || 100) + change)
      );

      await prisma.borehole.update({
        where: { id: borehole.id },
        data: { water_level: newLevel },
      });

      aiSummary += ` Adjusted ${
        borehole.name
      } water level to ${newLevel.toFixed(1)}%.`;
    }

    res.json({ success: true, summary: aiSummary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Simulation failed" });
  }
});

export default router;
