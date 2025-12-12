import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
import ussdRoutes from "./routes/ussd.js";
import apiRoutes from "./routes/api.js";

app.use("/ussd", ussdRoutes);
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("AquaGuard Backend Running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
