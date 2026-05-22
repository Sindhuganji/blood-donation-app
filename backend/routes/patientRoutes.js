const express = require("express");
const router = express.Router();
const { pool } = require("../db");

/**
 * POST /api/patient/request
 * body: { user_id, blood_group, units, hospital, location, urgency }
 */
router.post("/request", async (req, res) => {
  try {
    const { user_id, blood_group, units, hospital, location, urgency } =
      req.body;

    if (
      !user_id ||
      !blood_group ||
      !units ||
      !hospital ||
      !location ||
      !urgency
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (Number(units) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Units must be greater than 0" });
    }

    const [result] = await pool.query(
      `INSERT INTO BloodRequest
      (user_id, blood_group, units, hospital, location, urgency, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
      [user_id, blood_group, Number(units), hospital, location, urgency],
    );

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      request_id: result.insertId,
    });
  } catch (err) {
    console.error("POST /patient/request error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create request" });
  }
});

/**
 * GET /api/patient/requests/:user_id
 */
router.get("/requests/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await pool.query(
      `SELECT request_id, user_id, blood_group, units, hospital, location, urgency, status, created_at
       FROM BloodRequest
       WHERE user_id = ?
       ORDER BY request_id DESC`,
      [user_id],
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /patient/requests/:user_id error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch requests" });
  }
});

/**
 * GET /api/patient/request/:request_id
 * Includes optional donor details if donor_id exists in BloodRequest
 */
router.get("/request/:request_id", async (req, res) => {
  try {
    const { request_id } = req.params;

    const [rows] = await pool.query(
      `SELECT br.request_id, br.user_id, br.blood_group, br.units, br.hospital, br.location,
              br.urgency, br.status, br.created_at,
              d.donor_id, d.name AS donor_name, d.phone AS donor_phone, d.blood_group AS donor_blood_group
       FROM BloodRequest br
       LEFT JOIN Donor d ON br.donor_id = d.donor_id
       WHERE br.request_id = ?
       LIMIT 1`,
      [request_id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GET /patient/request/:request_id error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch request details" });
  }
});

/**
 * PUT /api/patient/request/:id/status
 * body: { status }
 */
router.put("/request/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["Pending", "Accepted", "Completed"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const [result] = await pool.query(
      "UPDATE BloodRequest SET status = ? WHERE request_id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    return res.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error("PUT /patient/request/:id/status error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update status" });
  }
});

module.exports = router;
