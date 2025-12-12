// IoT Sensor Simulator for BARWAAXO-AI
// Sends random telemetry data to the AquaGuard Backend

const API_URL = "http://localhost:3000/api/sensors"; // Adjust port if needed
const SENSORS = [
  { water_source_id: 1, name: "Borehole A - Hargeisa" },
  { water_source_id: 2, name: "Dam B - Burao" },
  { water_source_id: 3, name: "Well C - Berbera" },
];

async function sendData(sensor) {
  // Simulate data
  const payload = {
    water_source_id: sensor.water_source_id,
    soil_moisture: (Math.random() * 50 + 10).toFixed(2), // 10-60%
    temperature: (Math.random() * 15 + 25).toFixed(2), // 25-40C
    humidity: (Math.random() * 40 + 20).toFixed(2), // 20-60%
    water_level: (Math.random() * 50 + 50).toFixed(2), // 50-100m
  };

  console.log(`[${sensor.name}] Sending data...`, payload);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[${sensor.name}] Success!`);
    } else {
      console.error(`[${sensor.name}] Failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`[${sensor.name}] Error: Connection Failed`);
  }
}

function startSimulation() {
  console.log("Starting BARWAAXO-AI IoT Simulator...");

  SENSORS.forEach((sensor) => {
    // Send data every 10 seconds
    setInterval(() => sendData(sensor), 10000);
    // Send immediate first ping
    sendData(sensor);
  });
}

startSimulation();
