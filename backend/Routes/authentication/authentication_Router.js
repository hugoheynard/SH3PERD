import express from "express";
import {autoLogRouter, loginRouter} from "./login_post.js";

export const authenticationRouter = (db) => {
    const authenticationRouter = express.Router();

    authenticationRouter.use(loginRouter(db));
    authenticationRouter.use(autoLogRouter());

    return authenticationRouter;
};