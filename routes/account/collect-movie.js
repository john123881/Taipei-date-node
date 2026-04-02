import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getSavedMovies, deleteSavedMovie } from '../../services/index.js';
import { validate } from '../../middlewares/validate.js';
import { getCollectionSchema, deleteCollectionSchema } from '../../schemas/account.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const collectMovieRouter = express.Router();

// 收藏 - 電影列表
collectMovieRouter.get(account.collectMovie, authenticate, validate(getCollectionSchema), async (req, res) => {
    try {
        const sid = req.params.sid;
        const page = req.query.page;
        const perPage = 5;

        const { totalRows, totalPages, data } = await getSavedMovies(sid, page, perPage);

        if (totalPages > 0 && page > totalPages) {
            const newQuery = { ...req.query, page: totalPages };
            const qp = new URLSearchParams(newQuery).toString();
            return res.redirect(`${req.originalUrl.split('?')[0]}?${qp}`);
        }

        sendSuccess(res, data || [], null, {
            sid,
            totalRows,
            perPage,
            page,
            totalPages,
        });

    } catch (error) {
        console.error('[Route Error] collectMovie:', error);
        sendError(res, '獲取收藏電影列表失敗', 500, error.message);
    }
});

// 收藏 - 刪除電影
collectMovieRouter.delete(account.collectMovieDelete, authenticate, validate(deleteCollectionSchema), async (req, res) => {
    try {
        const save_id = req.params.save_id;
        const result = await deleteSavedMovie(save_id);

        if (!result) {
            return sendError(res, '沒這部電影', 404);
        }

        sendSuccess(res, { action: 'remove' }, '刪除成功');

    } catch (error) {
        console.error('[Route Error] collectMovieDelete:', error);
        sendError(res, '刪除收藏電影失敗', 500, error.message);
    }
});

export default collectMovieRouter;
