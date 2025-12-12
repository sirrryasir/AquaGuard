const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all Villages
router.get("/villages", (req, res) => {
  const villages = db.prepare("SELECT * FROM villages").all();
  res.json(villages);
});

// Get all Boreholes (with Village data)
router.get("/boreholes", (req, res) => {
  const boreholes = db
    .prepare(
      `
        SELECT b.*, v.name as village_name, v.drought_risk_level 
        FROM boreholes b 
        JOIN villages v ON b.village_id = v.id
    `
    )
    .all();
  res.json(boreholes);
});

// Submit Report (Agent App)
router.post("/reports", (req, res) => {
  const {
    borehole_id,
    village_id,
    reporter_type,
    report_content,
    latitude,
    longitude,
  } = req.body;

  // Insert report
  const stmt = db.prepare(`
        INSERT INTO reports (borehole_id, village_id, reporter_type, report_content) 
        VALUES (?, ?, ?, ?)
    `);
  const info = stmt.run(borehole_id, village_id, reporter_type, report_content);

  res.json({ success: true, id: info.lastInsertRowid });
});

// Get Reports
router.get("/reports", (req, res) => {
  const reports = db
    .prepare("SELECT * FROM reports ORDER BY timestamp DESC")
    .all();
  res.json(reports);
});

// Get Alerts
router.get("/alerts", (req, res) => {
  const alerts = db
    .prepare("SELECT * FROM alerts ORDER BY created_at DESC")
    .all();
  res.json(alerts);
});

// Create Alert (Admin/AI)
router.post("/alerts", (req, res) => {
  const { village_id, message, severity } = req.body;
  const stmt = db.prepare(
    "INSERT INTO alerts (village_id, message, severity) VALUES (?, ?, ?)"
  );
  stmt.run(village_id, message, severity);
  res.json({ success: true });
});

// Add Borehole (Dashboard)
router.post("/boreholes", (req, res) => {
  const { village_id, name, status, water_level } = req.body;
  const stmt = db.prepare(
    "INSERT INTO boreholes (village_id, name, status, water_level) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(village_id, name, status, water_level);
  res.json({ success: true, id: info.lastInsertRowid });
});

// Send SMS Mock
router.post("/sms/send", (req, res) => {
  const { to, message } = req.body;
  console.log(`[SMS MOCK] Sending to ${to}: "${message}"`);
  res.json({ success: true, status: "sent", message: "SMS request received" });
});

// AI Simulation Endpoint (Trigger update)
router.post("/ai/update-risk", (req, res) => {
  // Generate intelligent-looking updates

  // 1. Update Drought Risk randomly
  const riskLevels = ["Low", "Medium", "High", "Severe"];
  const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];

  const village = db
    .prepare("SELECT * FROM villages ORDER BY RANDOM() LIMIT 1")
    .get();

  let aiSummary = "";

  if (village) {
    db.prepare("UPDATE villages SET drought_risk_level = ? WHERE id = ?").run(
      randomRisk,
      village.id
    );
    aiSummary += `Updated ${village.name} risk to ${randomRisk}. `;

    // Generate Alert if High/Severe or just random info
    if (randomRisk === "High" || randomRisk === "Severe") {
      const messages = [
        `Drought Risk escalated to ${randomRisk}. Immediate water rationing required.`,
        `AI Prediction: Water tables dropping rapidly in ${village.name}.`,
        `Urgent: ${randomRisk} drought conditions detected.`,
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];

      db.prepare(
        "INSERT INTO alerts (village_id, message, severity) VALUES (?, ?, 'Critical')"
      ).run(village.id, msg);

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
        db.prepare(
          "INSERT INTO alerts (village_id, message, severity) VALUES (?, ?, 'Info')"
        ).run(village.id, `AI Advisory: ${adv}`);
        aiSummary += "Advisory generated.";
      }
    }
  }

  // 2. Simulate Water Level Fluctuation
  const borehole = db
    .prepare("SELECT * FROM boreholes ORDER BY RANDOM() LIMIT 1")
    .get();
  if (borehole) {
    const change = Math.random() * 10 - 5; // +/- 5%
    let newLevel = Math.max(0, Math.min(100, borehole.water_level + change));

    db.prepare("UPDATE boreholes SET water_level = ? WHERE id = ?").run(
      newLevel,
      borehole.id
    );
    aiSummary += ` Adjusted ${borehole.name} water level to ${newLevel.toFixed(
      1
    )}%.`;
  }

  res.json({ success: true, summary: aiSummary });
});

module.exports = router;
