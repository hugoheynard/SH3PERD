import type {TUserId_shared} from "@sh3pherd/shared-types/user.types.shared";
import type {TRefreshToken} from "./models/refreshToken.types";

export type TLoginUseCase = (input: { email: string; password: string }) => Promise<{
    authToken: string;
    refreshToken: TRefreshToken;
    user_id: TUserId_shared;
}>;