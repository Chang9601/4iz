import { SetMetadata } from '@nestjs/common';

import { Role } from '../../../common/enums/common.enum';

// @SetMetadata() 데코레이터는 특정 자원에 접근하기 위한 역할이 무엇인지 지정한다.
// ROLES_KEY는 메타데이터 키, roles는 열거형 Role의 값.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
