import express from "express";
import {loginRouter} from "./login_post.js";

export const authenticationRouter = (db) => {
    const authenticationRouter = express.Router();

    authenticationRouter.use(loginRouter(db));

    return authenticationRouter;
};