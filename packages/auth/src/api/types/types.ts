import type {IRegisterController} from "../controllers/IRegisterController";
import type {IRegisterMiddlewares} from "../middlewares/IRegisterMiddlewares";

export interface IRegisterRouterInput {
    registerController: IRegisterController;
    registerMiddlewares: IRegisterMiddlewares;
}