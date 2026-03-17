import express from 'express';
import { account } from '../apiConfig.js';
import { addMockData } from '../../services/index.js';

const addDataRouter = express.Router();

addDataRouter.post(account.addData, async (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ success: false, msg: '資料必須是陣列' });
  }

  try {
    const results = await addMockData(data);
    res.json({ success: true, count: results.length, details: results });
  } catch (error) {
    console.error('Add Mock Data Error:', error);
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(400).json({ success: false, msg: 'Email 已存在' });
    }
    if (error.message === 'USER_ID_ALREADY_EXISTS') {
        return res.status(400).json({ success: false, msg: 'User ID 已存在' });
    }
    res.status(500).json({ success: false, msg: '伺服器錯誤', error: error.message });
  }
});

export default addDataRouter;
