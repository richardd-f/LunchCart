export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string[] | string;
  message?: string;
}