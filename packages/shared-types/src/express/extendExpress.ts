import 'express';
import type {TUserId} from "../user/index.js";

declare module 'express-serve-static-core' {
    interface Request {
        user?: TUserId;
    }
}