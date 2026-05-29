require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const requirementsRoutes = require("./routes/requirements");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/requirements", requirementsRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
