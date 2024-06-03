import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import envConfig from 'src/config/config';
import { JWTData, UserRole } from 'src/custom';
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

        if (envConfig.mode === 'dev_stokenet') {
            this.logger.log(`Jwt Guard passed by : [dev_stokenet]`);
            const data: JWTData = {
                address: envConfig.dappsDefinitionAddress,
                role: UserRole.Admin,
            };
            request['account'] = data;
            return true;
        }

        if (!token) {
            throw new UnauthorizedException('Token not provided.');
        }

        try {
            const payload: JWTData = await this.jwtService.verifyAsync(token, {
                secret: `${envConfig.jwtSecret}`,
            });
            request['account'] = payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid token.');
        }
        this.logger.log(`Jwt Guard passed`);
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
