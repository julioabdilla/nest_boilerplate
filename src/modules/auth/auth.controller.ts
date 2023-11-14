import { Controller, Post, Req, Body } from '@nestjs/common';
import { ExpressRequest as Request } from 'src/models/request';
import { AuthService } from './auth.service';
import { SuccessResponse } from 'src/models/response';
import { GrantAuthRequest, GrantAuthResponse} from 'src/dto/grant_auth';
import GrantType from 'src/types/grant_type';
import { UnauthorizedException, GeneralErrorException } from 'src/exceptions/response_exception';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post()
  public async login(@Req() req: Request, @Body() body: GrantAuthRequest) {
    let httpResponse: SuccessResponse<GrantAuthResponse>;
    const { grantType: grant_type, username, password, refreshToken: refresh_token } = body;
    let loginResult: any;
    let response: GrantAuthResponse;

    if (grant_type === GrantType.CLIENT_CREDENTIALS) {
      if (!await this.authService.checkCredential(username, password)) {
        throw new UnauthorizedException();
      }
      loginResult = await this.authService.login(username, password);
    } else if (grant_type === GrantType.REFRESH_TOKEN) {
      loginResult = await this.authService.refreshToken(req.user.key, refresh_token);
    }
    if (loginResult) {
      response = {
        grantType: grant_type,
        accessToken: loginResult.accessToken,
        accessTokenExpiry: loginResult.accessTokenExpiry,
        refreshToken: loginResult.refreshToken,
        refreshTokenExpiredAt: loginResult.refreshTokenExpiredAt,
      };
      httpResponse = SuccessResponse.SUCCESS(response);
    } else {
      throw new GeneralErrorException();
    }
    return httpResponse;
  }
}
