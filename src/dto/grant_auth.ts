import GrantType from "src/types/grant_type";

export interface GrantAuthRequest {
  grantType: GrantType;
  username?: string;
  password?: string;
  refreshToken?: string;
}

export interface GrantAuthResponse {
  grantType: GrantType;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  refreshTokenExpiredAt: string;
}
