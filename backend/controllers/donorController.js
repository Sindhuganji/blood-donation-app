const db = require("../db");

exports.donateBlood = async (req, res) => {
  let conn;

  try {
    const { donor_id, blood_group, hospital_id, collection_date, units } =
      req.body;

    // ✅ validation
    if (!donor_id || !blood_group || !hospital_id || !collection_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const numericUnits = Number(units);

    if (!Number.isInteger(numericUnits) || numericUnits <= 0) {
      return res.status(400).json({
        success: false,
        message: "Units must be greater than 0",
      });
    }

    conn = await db.getConnection();

    // ✅ donor check + eligibility
    const [donorRows] = await conn.query(
      "SELECT donor_id, last_donation_date FROM Donor WHERE donor_id = ?",
      [donor_id],
    );

    if (donorRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    const lastDonationDate = donorRows[0].last_donation_date;

    if (lastDonationDate) {
      const d1 = new Date(lastDonationDate);
      const d2 = new Date(collection_date);

      const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));

      if (diffDays < 90) {
        return res.status(400).json({
          success: false,
          message: "You are not eligible yet",
        });
      }
    }

    // ✅ START TRANSACTION
    await conn.beginTransaction();

    // expiry date (42 days)
    const [expiryRows] = await conn.query(
      "SELECT DATE_ADD(?, INTERVAL 42 DAY) AS expiry_date",
      [collection_date],
    );

    const expiry_date = expiryRows[0].expiry_date;

    // ✅ INSERT BloodUnit (loop)
    for (let i = 0; i < numericUnits; i++) {
      await conn.query(
        `INSERT INTO BloodUnit
        (blood_group, collection_date, expiry_date, status, donor_id, hospital_id)
        VALUES (?, ?, ?, 'available', ?, ?)`,
        [blood_group, collection_date, expiry_date, donor_id, hospital_id],
      );
    }

    // ✅ UPDATE / INSERT availableblood
    const [stockRows] = await conn.query(
      "SELECT * FROM availableblood WHERE blood_group = ?",
      [blood_group],
    );

    if (stockRows.length > 0) {
      await conn.query(
        "UPDATE availableblood SET available_units = available_units + ? WHERE blood_group = ?",
        [numericUnits, blood_group],
      );
    } else {
      await conn.query(
        "INSERT INTO availableblood (blood_group, available_units) VALUES (?, ?)",
        [blood_group, numericUnits],
      );
    }

    // ✅ UPDATE donor
    await conn.query(
      "UPDATE Donor SET last_donation_date = ? WHERE donor_id = ?",
      [collection_date, donor_id],
    );

    // ✅ COMMIT
    await conn.commit();

    return res.json({
      success: true,
      message: "Donation successful ❤️",
    });
  } catch (error) {
    if (conn) await conn.rollback();

    console.error("donate error:", error);

    return res.status(500).json({
      success: false,
      message: "Donation failed",
    });
  } finally {
    if (conn) conn.release();
  }
};
