const express = require('express');
const router = express.Router();
const db = require('../db');

// In-memory session store for demo purposes
const sessions = {};

router.post('/', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";
    let type = "CON"; // CON = Continue, END = End

    // text is a string like "1*2*1" representing the input path
    // We'll parse the last part or the full string to decide state
    
    // Simple state machine simulation
    // "text" usually accumulates like "1*1" in some gateways, 
    // or we can just assume the client sends the full string or current input.
    // For this demo, let's assume the client sends the *last input* but we might need state.
    // Actually standard USSD sends the full accumulated string.
    
    const parts = text ? text.split('*') : [];
    
    if (text === '') {
        // Main Menu
        response = `Welcome to AquaGuard
1. Check Water Availability
2. Check Drought Risk
3. Report Borehole Status
4. Get Water-Saving Tips`;
    } else if (parts[0] === '1') {
        // 1. Check Water Availability
        if (parts.length === 1) {
            // Ask for village
            response = "Enter Village Name:";
        } else if (parts.length === 2) {
            // Return status
            const villageName = parts[1];
            // Mock lookup
            const village = db.prepare("SELECT * FROM villages WHERE name LIKE ?").get(`%${villageName}%`);
            
            if (village) {
                const boreholes = db.prepare("SELECT * FROM boreholes WHERE village_id = ?").all(village.id);
                if (boreholes.length > 0) {
                    const bh = boreholes[0];
                    response = `${village.name} Water: ${bh.status}
Level: ${bh.water_level}%
Price: 5 KES/20L
Last Update: Today`;
                } else {
                    response = `No boreholes found for ${village.name}`;
                }
            } else {
                response = `Village ${villageName} not found.`;
            }
            type = "END";
        }
    } else if (parts[0] === '2') {
        // 2. Drought Risk
        if (parts.length === 1) {
             response = "Enter Village Name:";
        } else if (parts.length === 2) {
             const villageName = parts[1];
             const village = db.prepare("SELECT * FROM villages WHERE name LIKE ?").get(`%${villageName}%`);
             if (village) {
                 response = `Drought Risk for ${village.name}: ${village.drought_risk_level}
Rain Prob: 20%
Advice: Store water now.`;
             } else {
                 response = `Village not found.`;
             }
             type = "END";
        }
    } else if (parts[0] === '3') {
        // 3. Report Status
        if (parts.length === 1) {
            response = "Enter Borehole ID:";
        } else if (parts.length === 2) {
            response = `Select Status:
1. Water Finished
2. Pump Broken
3. Water Available`;
        } else if (parts.length === 3) {
            const statusMap = { '1': 'Low Water', '2': 'Broken', '3': 'Working' };
            const status = statusMap[parts[2]] || 'Unknown';
            const bhId = parts[1];

            // Update DB
            // In a real app we'd verify ID.
            const reportStmt = db.prepare("INSERT INTO reports (borehole_id, reporter_type, report_content) VALUES (?, 'USSD', ?)");
            reportStmt.run(bhId, `User reported status: ${status}`);

            // Optionally update borehole status directly for demo effect
            /*
            db.prepare("UPDATE boreholes SET status = ? WHERE id = ?").run(status, bhId);
            */
           
            response = `Report received for Borehole ${bhId}. Thank you.`;
            type = "END";
        }
    } else if (parts[0] === '4') {
        // 4. Tips
        response = `1. Use drip irrigation
2. Harvest rainwater
3. Cover water tanks`;
        type = "END";
    } else {
        response = "Invalid option.";
        type = "END";
    }

    res.json({ message: response, type });
});

module.exports = router;
