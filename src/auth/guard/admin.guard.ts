import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/user.entity';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: User }>();
		const user = request.user;

		// Получаем требуемый уровень администратора с маршрута
		const requiredAdminLevel = this.reflector.get<string>('adminLevel', context.getHandler());

		// Проверяем, является ли пользователь администратором и достаточно ли его уровень
		if (!user || user.role === 'user') {
			throw new ForbiddenException('You have no rights!');
		}

		// Сравниваем роль пользователя с требуемым уровнем
		if (requiredAdminLevel && !this.hasRequiredRole(user.role, requiredAdminLevel)) {
			throw new ForbiddenException('You have no rights!');
		}

		return true;
	}

	private hasRequiredRole(userRole: string, requiredAdminLevel: string): boolean {
		const roleHierarchy = ['user', 'admin-level-one', 'admin-level-two'];

		const userRoleIndex = roleHierarchy.indexOf(userRole);
		const requiredRoleIndex = roleHierarchy.indexOf(requiredAdminLevel);

		return userRoleIndex >= requiredRoleIndex;
	}
}

