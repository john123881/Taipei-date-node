import cors from 'cors';
import { isOriginAllowed } from '../utils/cors-config.js';

export const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};

export default cors(corsOptions);
