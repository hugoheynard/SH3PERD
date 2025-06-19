export type TUserId = `user_${string}`;

export type TUserDomainModel = {
  user_id: TUserId;
  email: string;
  password: string;
  active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
};
