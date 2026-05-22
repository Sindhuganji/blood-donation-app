const db = require("../db");

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [[donors]] = await db.query(
      "SELECT COUNT(*) AS totalDonors FROM Donor",
    );
    const [[patients]] = await db.query(
      "SELECT COUNT(*) AS totalPatients FROM Patient",
    );
    const [[hospitals]] = await db.query(
      "SELECT COUNT(*) AS totalHospitals FROM Hospital",
    );
    const [[requests]] = await db.query(
      "SELECT COUNT(*) AS totalRequests FROM Request",
    );
    const [availableBlood] = await db.query(
      "SELECT blood_group, available_units FROM availableblood ORDER BY blood_group",
    );

    res.json({
      success: true,
      totalDonors: donors.totalDonors,
      totalPatients: patients.totalPatients,
      totalHospitals: hospitals.totalHospitals,
      totalRequests: requests.totalRequests,
      availableBlood,
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/requests
exports.getRequests = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Request ORDER BY request_id DESC",
    );
    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error("getRequests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/requests/:id/approve
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE Request SET status = 'fulfilled' WHERE request_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, message: "Request approved (fulfilled)" });
  } catch (error) {
    console.error("approveRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/requests/:id
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "DELETE FROM Request WHERE request_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    console.error("deleteRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/donors
exports.getDonors = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Donor ORDER BY donor_id DESC");
    res.json({ success: true, donors: rows });
  } catch (error) {
    console.error("getDonors error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/hospitals
exports.getHospitals = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Hospital ORDER BY hospital_id DESC",
    );
    res.json({ success: true, hospitals: rows });
  } catch (error) {
    console.error("getHospitals error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
