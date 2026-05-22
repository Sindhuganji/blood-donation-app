const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /api/donor/profile/:user_id
router.get("/profile/:user_id", async (req, res) => {
  console.log("PROFILE ROUTE HIT:", req.params.user_id);
  try {
    const { user_id } = req.params;

    const [rows] = await pool.query(
      `SELECT donor_id, user_id, name, phone, blood_group, age, health_status, last_donation_date
       FROM Donor
       WHERE user_id = ?
       LIMIT 1`,
      [user_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donor profile not found for this user_id",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("GET donor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch donor profile",
    });
  }
});

// POST /api/donor/donate
router.post("/donate", async (req, res) => {
  console.log("DONATE ROUTE HIT");
  console.log("Request body:", req.body);

  const conn = await pool.getConnection();
  try {
    const { donor_id, blood_group, hospital_id, collection_date, units } =
      req.body;

    if (
      !donor_id ||
      !blood_group ||
      !hospital_id ||
      !collection_date ||
      !units
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (Number(units) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Units must be > 0" });
    }

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO BloodUnit (blood_group, collection_date, expiry_date, status, donor_id, hospital_id)
       VALUES (?, ?, DATE_ADD(?, INTERVAL 42 DAY), 'available', ?, ?)`,
      [blood_group, collection_date, collection_date, donor_id, hospital_id],
    );

    const [updateResult] = await conn.query(
      `UPDATE Donor SET last_donation_date = ? WHERE donor_id = ?`,
      [collection_date, donor_id],
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "Donor not found. last_donation_date not updated",
      });
    }

    await conn.commit();

    return res.json({
      success: true,
      message: "Donation successful and last donation date updated",
    });
  } catch (error) {
    await conn.rollback();
    console.error("donate error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  } finally {
    conn.release();
  }
});

module.exports = router;
