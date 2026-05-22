const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /api/admin/hospitals
router.get("/hospitals", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Hospital ORDER BY hospital_id DESC",
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("hospitals error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch hospitals" });
  }
});

// GET /api/admin/availableblood
router.get("/availableblood", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM availableblood ORDER BY blood_group ASC",
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("availableblood error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch available blood" });
  }
});

// GET /api/admin/requests
router.get("/requests", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Request ORDER BY request_id DESC",
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("requests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch requests" });
  }
});

// GET /api/admin/donors
router.get("/donors", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT donor_id, user_id, name, phone, blood_group, age, health_status, last_donation_date
       FROM Donor
       ORDER BY donor_id DESC`,
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET /admin/donors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch donors",
    });
  }
});

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// POST /api/admin/add-donor
router.post("/add-donor", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { name, phone, blood_group, health_status } = req.body;

    if (!name || !phone || !blood_group) {
      return res.status(400).json({
        success: false,
        message: "name, phone, blood_group are required",
      });
    }

    if (!VALID_BLOOD_GROUPS.includes(blood_group)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    }

    await conn.beginTransaction();

    // Optional user link if same phone exists in User table
    const [users] = await conn.query(
      "SELECT user_id FROM User WHERE phone = ? LIMIT 1",
      [phone]
    );
    const linkedUserId = users.length ? users[0].user_id : null;

    // Avoid duplicate donor by user_id if linked
    if (linkedUserId) {
      const [existingDonor] = await conn.query(
        "SELECT donor_id FROM Donor WHERE user_id = ? LIMIT 1",
        [linkedUserId]
      );
      if (existingDonor.length) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: "Donor already exists for this user",
        });
      }
    }

    await conn.query(
      `INSERT INTO Donor (user_id, name, phone, blood_group, health_status, last_donation_date)
       VALUES (?, ?, ?, ?, ?, NULL)`,
      [linkedUserId, name, phone, blood_group, health_status || "Fit"]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "Donor added successfully",
    });
  } catch (error) {
    await conn.rollback();
    console.error("POST /admin/add-donor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add donor",
    });
  } finally {
    conn.release();
  }
});

module.exports = router;
