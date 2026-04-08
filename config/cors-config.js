import cors from 'cors';
import { isOriginAllowed } from '../utils/cors-config.js';

export const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        // 暫時直接允許所有來源以進行除錯，確認伺服器連線正常
        callback(null, true);
    },
};

export default cors(corsOptions);
