export type ApiResponse<T> = {
  data?: T;
  code: string;
  message: string;
}