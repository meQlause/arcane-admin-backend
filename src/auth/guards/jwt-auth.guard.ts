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
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class JWTGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly logger: LoggerService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            this.logger.warn('Error on Guard : Token not provided.');
            throw new UnauthorizedException('Token not provided.');
        }

        try {
            const payload: JWTData = await this.jwtService.verifyAsync(token, {
                secret: `${envConfig().jwtSecret}`,
            });
            request['account'] = payload;
        } catch (error) {
            this.logger.warn(`Error on Guard : Invalid token: ${error}`);
            throw new UnauthorizedException('Invalid token.');
        }
        this.logger.warn(`Jwt Guard passed`);
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
