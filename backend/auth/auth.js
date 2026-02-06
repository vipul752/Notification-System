import express from "express";
import { sendToQueue } from "../services/sqs.js";

const router = express.Router();

// SIGNUP

router.get("/test", (req, res) => {
  console.log("🔥 TEST ROUTE HIT 🔥");
  res.send("API working");
});

router.post("/signup", async (req, res) => {
  try {
    console.log(req.body);

    const { email } = req.body;
    console.log(req.body);

    await sendToQueue({
      type: "SIGNUP",
      email,
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    await sendToQueue({
      type: "LOGIN",
      email,
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
