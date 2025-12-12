# BARWAAXO-AI Setup Instructions

## Prerequisites

- Node.js v18+
- Python 3.9+
- PostgreSQL + PostGIS

## Installation

1. **Backend**

   ```bash
   cd backend
   npm install
   # Configure .env
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

2. **Web Dashboard**

   ```bash
   cd web
   npm install
   npm run dev
   ```

3. **AI Engine**

   ```bash
   cd ai_engine
   pip install -r requirements.txt
   python main.py
   ```

4. **IoT Sim**
   ```bash
   cd iot_simulation
   node simulate_sensors.js
   ```

## Architecture

- **Backend**: Express + Prisma (Postgres)
- **Frontend**: Next.js + Leaflet
- **AI**: FastAPI + XGBoost
- **Mobile**: Next.js PWA
