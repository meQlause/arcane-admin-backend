import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JWTData, UserRole } from 'src/custom';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const account: JWTData = context.switchToHttp().getRequest().account;
        if (!account) throw new UnauthorizedException();
        if (!(account.role === UserRole.Admin))
            throw new UnauthorizedException();
        return true;
    }
}
