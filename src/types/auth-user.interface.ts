// 로그인 후 받아올 유저 정보
export interface AuthUser {
  user_cus_id: string;
  user_id: number;
  user_refreshtoken?: string | null;
  user_nick: string;
  user_like_staId?: number;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}
