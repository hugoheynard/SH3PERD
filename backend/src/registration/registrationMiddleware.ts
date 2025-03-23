import type {IRegistrationMethods} from "./interfaces/IRegistrationMethod";
import {addRegistrationMethod} from "./middlewares/addRegistrationMethod";
import {userAlreadyExistsManual} from "./middlewares/userAlreadyExistsManual";
import {validManualRegisterInput} from "./middlewares/validManualRegisterInput";
import type {IRegistrationMiddlewares} from "./interfaces/IRegistrationMiddlewares";


export const registrationMiddlewares = (input: IRegistrationMiddlewares['input']): IRegistrationMiddlewares['output'] => {
    const { checkUserExistByMailFunction } = input;

    return {
        validManualRegisterInput: validManualRegisterInput,
        addRegistrationMethod: (input: { registrationMethod: IRegistrationMethods }) => addRegistrationMethod(input),
        userAlreadyExistsManual: userAlreadyExistsManual({
            checkUserExistByMailFunction: (input: { email : string }) => checkUserExistByMailFunction(input)
        }),
    };

}