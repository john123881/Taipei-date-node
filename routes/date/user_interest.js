import express from 'express';
import { updateUserBarType, updateUserMovieType } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

// 更改使用者喜愛的Bar類型
router.put('/user_interest/edit_bar_type/:user_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.status(401).json({ status: false, message: '沒授權' });
        }
        const { user_id } = req.params;
        const { bar_type_name } = req.body;
        
        const result = await updateUserBarType(user_id, bar_type_name);
        res.json({ status: true, message: '編輯成功', data: result });
    } catch (error) {
        console.error('updateUserBarType error:', error);
        res.status(500).json({ status: false, message: error.message || '伺服器錯誤' });
    }
});

// 更改使用者喜愛的Movie類型
router.put('/user_interest/edit_movie_type/:user_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.status(401).json({ status: false, message: '沒授權' });
        }
        const { user_id } = req.params;
        const { movie_type } = req.body;
        
        const result = await updateUserMovieType(user_id, movie_type);
        res.json({ status: true, message: '編輯成功', data: result });
    } catch (error) {
        console.error('updateUserMovieType error:', error);
        res.status(500).json({ status: false, message: error.message || '伺服器錯誤' });
    }
});

export default router;
