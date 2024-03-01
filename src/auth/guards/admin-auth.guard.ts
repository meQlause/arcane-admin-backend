import {
    CanActivate,
    ExecutionContext,
    Injectable,
    LoggerService,
    UnauthorizedException,
} from '@nestjs/common';
import { JWTData, UserRole } from 'src/custom';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly logger: LoggerService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const account: JWTData = context.switchToHttp().getRequest().account;
        if (!account) {
            this.logger.warn('Error on Guard : Account not found.');
            throw new UnauthorizedException('Account not found.');
        }
        if (!(account.role === UserRole.Admin)) {
            this.logger.warn('Error on Guard : Insufficient privileges.');
            throw new UnauthorizedException('Insufficient privileges.');
        }
        this.logger.log('Admin Guard passed.');
        return true;
    }
}
