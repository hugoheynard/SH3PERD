import type {RequestHandler} from "express";



export interface IRegisterMiddlewares {
    validateRegistrationInput: RequestHandler;
}