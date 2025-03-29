import {validateRegistrationInput} from "./validateRegistrationInput";
import type {IRegistrationMiddlewares} from "../types/IRegistrationMiddlewares";

export const registrationMiddlewares = {
    validManualRegisterInput: validateRegistrationInput,

    //addRegistrationMethod: (params: { registrationMethod: IRegistrationMethods }) =>
      //  addRegistrationMethod(params),

    //userAlreadyExistsManual: userAlreadyExistsManual({
        //checkUserExistByMailFunction: userService.findByEmail,
    //}),
};
