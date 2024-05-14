import db from "../../utils/mysql2-connect.js";

export const getMyDetail = async (req, res) => {
  const { trip_plan_id } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM `trip_calendar` WHERE `trip_plan_id`=?",
      [trip_plan_id]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res.status(500).json({ error: "Error fetching data from the database" });
  }
};
