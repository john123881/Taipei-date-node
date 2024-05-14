import db from "../../utils/mysql2-connect.js";

export const getContentMorning = async (req, res) => {
  const { trip_plan_id } = req.params;
  try {
    const [results] = await db.query(
      "SELECT * FROM `trip_details` WHERE `block` = 1 AND `trip_plan_id`=?",
      [trip_plan_id]
    );
    // 發送回應到用戶端，而不只是返回結果
    res.json(results);
  } catch (error) {
    console.error("Error fetching data from the database", error);
    res.status(500).send("Error fetching data from the database");
  }
};
