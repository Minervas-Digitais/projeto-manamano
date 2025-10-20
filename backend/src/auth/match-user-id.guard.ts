import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class MatchUserIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userIdFromToken = request.user?.id;

    if (!userIdFromToken) {
      throw new UnauthorizedException(
        'Token de autenticação ausente ou inválido.',
      );
    }

    let userIdFromRequest: string | undefined =
      request.body?.userId ||
      request.params?.userId ||
      (request.params?.id?.includes(',') ? undefined : request.params?.id);


    if (!userIdFromRequest && request.params?.id?.includes(',')) {
      const parts = request.params.id.split(',');
      const matchingPart = parts.find((part) => part === userIdFromToken);
      if (matchingPart) {
        userIdFromRequest = matchingPart;
      }
    }

    if (!userIdFromRequest) {
      throw new UnauthorizedException('userId não informado na requisição.');
    }

    if (userIdFromRequest !== userIdFromToken) {
      throw new ForbiddenException(
        'Acesso negado: token não corresponde ao usuário solicitado.',
      );
    }

    return true;
  }
}
