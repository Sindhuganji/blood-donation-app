const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/requests
router.post("/", async (req, res) => {
  try {
    const { patient_id, blood_group, units_required, priority } = req.body;
    const [r] = await db.query(
      "INSERT INTO Request (patient_id, blood_group, units_required, priority, status) VALUES (?, ?, ?, ?, ?)",
      [patient_id, blood_group, units_required, priority, "pending"],
    );
    res.status(201).json({ success: true, request_id: r.insertId });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/requests
router.get("/", async (_, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Request ORDER BY request_id DESC",
    );
    res.json({ success: true, requests: rows });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/requests/:id (approve/reject)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body; // pending/fulfilled/rejected etc
    await db.query("UPDATE Request SET status = ? WHERE request_id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ success: true, message: "Request updated" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
