export interface LoginInfo {
  userEmail: string;
  userPassWord: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string | null;
  newPassword?: string | null;
}
