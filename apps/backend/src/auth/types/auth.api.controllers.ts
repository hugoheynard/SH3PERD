import type {
  TLoginUseCase,
  TRefreshSessionUseCase,
  TRegisterUserUseCase,
} from './auth.core.useCase.js';
import type { NextFunction, Request, Response } from 'express';

/**
 * Auth Controller Types
 */
export type TAuthControllerDeps = {
  loginUseCase: TLoginUseCase;
  logoutUseCase: any;
  refreshSessionUseCase: TRefreshSessionUseCase;
};

export type IAuthController = {
  login: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
  logout: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
  refreshSession: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
};

/**
 * Register Controller Types
 */
export type IRegisterController = {
  registerUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};

export type TRegisterControllerDeps = {
  registerUserUseCase: TRegisterUserUseCase;
};
