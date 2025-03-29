// Entry point for @sh3pherd/auth-core
import {RegistrationService} from "./services/registrationService";
import {passwordManager} from "@sh3pherd/password-manager";
import {generateTypedId} from "@sh3pherd/shared-utils";

export const registrationService = new RegistrationService({
    generateUserIdFunction: generateTypedId,
    hashPasswordFunction: passwordManager.hashPassword,
    createUserFunction: ()=>{},
    saveUserFunction: ()=>{},
    findUserByEmailFunction: ()=>{},
});