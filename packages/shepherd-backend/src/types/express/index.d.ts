import 'express';
import type {TUserId} from "../../user/types/user.domain.types.js";



declare module 'express' {
    interface Request {
        user_id?: TUserId;
    }
}