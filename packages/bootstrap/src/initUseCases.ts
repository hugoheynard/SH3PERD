import {passwordManager} from "@sh3pherd/password-manager";
import {createUserDomainModel} from "@sh3pherd/user";
import {generateTypedId} from "@sh3pherd/shared-utils";
import {createAuthRegisterUseCases} from "@sh3pherd/auth";


export const initUseCases = (input: { services: any; repositories: any }): any => {
    const { authTokenService } = input.services;
    const { userRepository } = input.repositories;

  try {
      return {
          auth: createAuthRegisterUseCases({
              findUserByEmailFn: userRepository.findUserByEmail,
              hashPasswordFn: passwordManager.hashPassword,
              comparePasswordFn: passwordManager.comparePassword,
              createUserFn: createUserDomainModel,
              saveUserFn: userRepository.saveUser,
              generateUserIdFn: generateTypedId('user'),
              createAuthSessionFn: authTokenService.createAuthSession
          }),
      };
  } catch (err) {
      throw new Error(`Error initializing use cases: ${err}`);
  }
};