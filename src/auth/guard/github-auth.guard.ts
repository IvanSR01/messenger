import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Выполнение базового метода canActivate для проверки аутентификации
    const result = await super.canActivate(context);
		// const result = true
    
    if (typeof result !== 'boolean') {
      throw new UnauthorizedException('Authorization failed');
    }

    if (result) {
      const request = context.switchToHttp().getRequest();
      // Вход пользователя после успешной проверки аутентификации
      // await super.logIn(request);
    }

    return result;
  }

  handleRequest(err, user, info) {
    // Обработка ошибки аутентификации
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
