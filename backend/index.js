import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.js";
import "./services/worker.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/auth", authRoutes);

app.listen(7777, () => {
  console.log("Server running on port 7777");
});
