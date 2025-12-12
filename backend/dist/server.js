import express from "express";
import cors from "cors";
import "dotenv/config";
import ussdRoutes from "./routes/ussd.js";
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/authRoutes.js";
const app = express();
const port = process.env.PORT || 3001;
// Middleware
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
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
export default app;
//# sourceMappingURL=server.js.map