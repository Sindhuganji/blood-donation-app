const express = require("express");
const router = express.Router();
const db = require("../db");

// hospitals for picker
router.get("/hospitals", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT hospital_id, name FROM Hospital ORDER BY name");
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to fetch hospitals" });
  }
});

// POST /api/donor/donate
router.post("/donate", async (req, res) => {
  const conn = await db.getConnection();
  try {
    console.log("Incoming donate request:", req.body);

    const { donor_id, blood_group, hospital_id, collection_date, units } = req.body;
    if (!donor_id || !blood_group || !hospital_id || !collection_date || !units) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    await conn.beginTransaction();

    // expiry_date = collection_date + 42 days
    const [exp] = await conn.query(
      "SELECT DATE_ADD(?, INTERVAL 42 DAY) AS expiry_date",
      [collection_date]
    );
    const expiry_date = exp[0].expiry_date;

    // 1) INSERT BloodUnit (one row per unit)
    for (let i = 0; i < Number(units); i++) {
      await conn.query(
        `INSERT INTO BloodUnit
        (blood_group, collection_date, expiry_date, status, donor_id, hospital_id)
        VALUES (?, ?, ?, 'available', ?, ?)`,
        [blood_group, collection_date, expiry_date, donor_id, hospital_id]
      );
    }

    // 2) UPDATE availableblood (upsert logic)
    const [stock] = await conn.query(
      "SELECT available_units FROM availableblood WHERE blood_group = ?",
      [blood_group]
    );

    if (stock.length > 0) {
      await conn.query(
        "UPDATE availableblood SET available_units = available_units + ? WHERE blood_group = ?",
        [Number(units), blood_group]
      );
    } else {
      await conn.query(
        "INSERT INTO availableblood (blood_group, available_units) VALUES (?, ?)",
        [blood_group, Number(units)]
      );
    }

    // 3) UPDATE Donor last donation
    await conn.query(
      "UPDATE Donor SET last_donation_date = ? WHERE donor_id = ?",
      [collection_date, donor_id]
    );

    await conn.commit();
    return res.json({ success: true, message: "Donation successful" });
  } catch (e) {
    await conn.rollback();
    console.error("Donate error:", e);
    return res.status(500).json({ success: false, message: "Donation failed" });
  } finally {
    conn.release();
  }
});

module.exports = router;