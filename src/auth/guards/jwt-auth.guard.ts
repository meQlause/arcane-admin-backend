import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import envConfig from 'src/config/env.config';
import { JWTData } from 'src/custom';

@Injectable()
export class JWTGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token not provided.');
        }

        try {
            const payload: JWTData = await this.jwtService.verifyAsync(token, {
                secret: `${envConfig().jwtSecret}`,
            });
            request['account'] = payload;
        } catch {
            throw new UnauthorizedException('Invalid token.');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
