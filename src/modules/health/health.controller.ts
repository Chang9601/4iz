import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private typeorm: TypeOrmHealthIndicator,
  ) {}

  @ApiOkResponse({
    description: '헬스체크 성공.',
  })
  @ApiServiceUnavailableResponse({
    description: '헬스체크 실패.',
  })
  @HealthCheck()
  @Get('')
  healthcheck() {
    return this.health.check([() => this.typeorm.pingCheck('database')]);
  }
}
