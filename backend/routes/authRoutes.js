const express = require("express");
const router = express.Router();
const { pool } = require("../db");

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { name, phone, password, role, blood_group } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "name, phone, password, role are required",
      });
    }

    if (role === "donor" && !blood_group) {
      return res.status(400).json({
        success: false,
        message: "blood_group is required for donor registration",
      });
    }

    if (blood_group && !VALID_BLOOD_GROUPS.includes(blood_group)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    }

    await conn.beginTransaction();

    const [exists] = await conn.query(
      "SELECT user_id FROM User WHERE phone = ? LIMIT 1",
      [phone]
    );
    if (exists.length) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: "Phone already registered",
      });
    }

    const [userResult] = await conn.query(
      "INSERT INTO User (name, phone, password, role) VALUES (?, ?, ?, ?)",
      [name, phone, password, role]
    );
    const user_id = userResult.insertId;

    if (role === "donor") {
      // extra safeguard
      const [donorExists] = await conn.query(
        "SELECT donor_id FROM Donor WHERE user_id = ? LIMIT 1",
        [user_id]
      );
      if (!donorExists.length) {
        await conn.query(
          `INSERT INTO Donor (user_id, name, phone, blood_group, health_status, last_donation_date)
           VALUES (?, ?, ?, ?, 'Fit', NULL)`,
          [user_id, name, phone, blood_group]
        );
      }
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user_id,
    });
  } catch (error) {
    await conn.rollback();
    console.error("POST /auth/register error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  } finally {
    conn.release();
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "phone and password are required",
      });
    }

    const [users] = await pool.query(
      "SELECT * FROM User WHERE phone = ? AND password = ? LIMIT 1",
      [phone, password]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: users[0],
    });
  } catch (error) {
    console.error("POST /auth/login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

module.exports = router;