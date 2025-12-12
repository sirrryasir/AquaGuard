const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'aquaguard.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize Tables
const initDb = () => {
    // Villages
    db.prepare(`
        CREATE TABLE IF NOT EXISTS villages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            district TEXT,
            latitude REAL,
            longitude REAL,
            drought_risk_level TEXT DEFAULT 'Low' -- Low, Medium, High, Severe
        )
    `).run();

    // Boreholes
    db.prepare(`
        CREATE TABLE IF NOT EXISTS boreholes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            village_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'Working', -- Working, Broken, Low Water
            water_level REAL DEFAULT 100.0, -- Percentage
            last_maintained DATETIME,
            FOREIGN KEY (village_id) REFERENCES villages(id)
        )
    `).run();

    // Reports (from USSD or Agents)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            borehole_id INTEGER,
            village_id INTEGER,
            reporter_type TEXT, -- User (USSD), Agent (App)
            report_content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_verified INTEGER DEFAULT 0
        )
    `).run();

    // Alerts (AI Generated or Admin)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            village_id INTEGER,
            message TEXT,
            severity TEXT, -- Info, Warning, Critical
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    console.log("Database initialized.");

    // Seed Data
    const seed = () => {
        const villageCount = db.prepare("SELECT COUNT(*) as count FROM villages").get().count;
        if (villageCount === 0) {
            console.log("Seeding data...");
            // Villages
            const insertVillage = db.prepare("INSERT INTO villages (name, district, latitude, longitude, drought_risk_level) VALUES (?, ?, ?, ?, ?)");
            insertVillage.run("Wajir North", "Wajir", 1.7471, 40.0573, "High");
            insertVillage.run("Marsabit Central", "Marsabit", 2.3369, 37.9904, "Medium");
            insertVillage.run("Lodwar Town", "Turkana", 3.1191, 35.5973, "Severe");

            // Boreholes
            const v1 = db.prepare("SELECT id FROM villages WHERE name = 'Wajir North'").get().id;
            const v2 = db.prepare("SELECT id FROM villages WHERE name = 'Marsabit Central'").get().id;
            const v3 = db.prepare("SELECT id FROM villages WHERE name = 'Lodwar Town'").get().id;

            const insertBorehole = db.prepare("INSERT INTO boreholes (village_id, name, status, water_level) VALUES (?, ?, ?, ?)");
            insertBorehole.run(v1, "BH-001 Wajir A", "Working", 80.0);
            insertBorehole.run(v1, "BH-002 Wajir B", "Broken", 0.0);
            insertBorehole.run(v2, "BH-003 Marsabit A", "Working", 60.5);
            insertBorehole.run(v3, "BH-004 Lodwar Main", "Low Water", 15.0);
            
            console.log("Seeding complete.");
        }
    };
    seed();
};

initDb();

module.exports = db;
