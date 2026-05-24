import { SetMetadata } from '@nestjs/common';

/**
 * Clave usada para almacenar los roles permitidos en los metadatos del endpoint.
 */
export const ROLES_KEY = 'roles';

/**
 * Define los roles permitidos para acceder a un endpoint.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);