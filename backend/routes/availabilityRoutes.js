const express = require("express");
const router = express.Router();
const db = require("../db");

// Get available blood stock
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM availableblood");
    return res.json({ success: true, availability: rows });
  } catch (error) {
    console.error("GET AVAILABILITY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
