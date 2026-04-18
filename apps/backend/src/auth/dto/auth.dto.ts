import { createZodDto } from 'nestjs-zod';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import {
  SRegisterUserRequestDTO,
  SLoginRequestDTO,
  SChangePasswordRequestDTO,
  SDeactivateAccountRequestDTO,
  SForgotPasswordRequestDTO,
  SResetPasswordRequestDTO,
} from '@sh3pherd/shared-types';

// ─── Request DTOs (Zod-derived) ───────────────────────────

@ApiModel()
export class RegisterRequestPayload extends createZodDto(SRegisterUserRequestDTO) {}

@ApiModel()
export class LoginRequestPayload extends createZodDto(SLoginRequestDTO) {}

@ApiModel()
export class ChangePasswordRequestPayload extends createZodDto(SChangePasswordRequestDTO) {}

@ApiModel()
export class DeactivateAccountRequestPayload extends createZodDto(SDeactivateAccountRequestDTO) {}

@ApiModel()
export class ForgotPasswordRequestPayload extends createZodDto(SForgotPasswordRequestDTO) {}

@ApiModel()
export class ResetPasswordRequestPayload extends createZodDto(SResetPasswordRequestDTO) {}
