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

    let userIdFromParam: string | undefined;

    if (request.params.ids) {
      const parts = request.params.ids.split(',');
      userIdFromParam = parts[1];
    } else if (request.params.userId) {
      userIdFromParam = request.params.userId;
    } else if (request.params.id) {
      userIdFromParam = request.params.id;
    }

    if (!userIdFromParam) {
      throw new UnauthorizedException('UserId não informado na requisição.');
    }

    if (userIdFromParam !== userIdFromToken) {
      throw new ForbiddenException(
        'Acesso negado: token não corresponde ao usuário solicitado.',
      );
    }

    return true;
  }
}
