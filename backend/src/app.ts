import express from "express";
import cors from "cors";
import ussdRoutes from "./routes/ussdRoutes.js";
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/ussd", ussdRoutes);
app.use("/api", apiRoutes);
app.use("/api/user", authRoutes);

app.get("/", (req, res) => {
  res.send("AquaGuard Backend Running");
});

export default app;
