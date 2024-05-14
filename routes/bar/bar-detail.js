import express from "express";
import { bar } from "../apiConfig.js";
import { getBarDetail, getBarDetailById } from "../../services/index.js";
// import { getBarDetailById } from "../../services/bar/getBarDetailById.js";


const barDetailRouter = express.Router();

barDetailRouter.get(bar.getBarDetail, async (req, res) => {
  const { bar_id } = req.params;
//   const results = await getBarDetail();
  const results = await getBarDetailById(bar_id);
  res.json(results);
});

barDetailRouter.get("/bar-detail", async (req, res) => {
  try {
    const results = await getBarDetail();
    res.json(results);
  } catch (error) {
    console.error("Error fetching all bars:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default barDetailRouter;
