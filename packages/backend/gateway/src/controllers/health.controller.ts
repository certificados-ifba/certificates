import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator
} from '@nestjs/terminus'

import { ConfigService } from '../services/config/config.service'

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(
    private memoryHealthIndicator: MemoryHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private configService: ConfigService
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // the process should not use more than 300MB memory
      async () =>
        this.memoryHealthIndicator.checkHeap('memory heap', 300 * 1024 * 1024),
      // The process should not have more than 300MB RSS memory allocated
      async () =>
        this.memoryHealthIndicator.checkRSS('memory RSS', 300 * 1024 * 1024),
      // the used disk storage should not exceed the 50% of the available space
      // async () =>
      //   this.diskHealthIndicator.checkStorage('disk health', {
      //     thresholdPercent: 0.5,
      //     path: '/'
      //   }),
      async () =>
        this.microservice.pingCheck(
          'certificate',
          this.configService.get('certificateService')
        ),
      async () =>
        this.microservice.pingCheck(
          'event',
          this.configService.get('tipoCertificadoService')
        ),
      async () =>
        this.microservice.pingCheck(
          'token',
          this.configService.get('tokenService')
        ),
      async () =>
        this.microservice.pingCheck(
          'activity',
          this.configService.get('activityService')
        ),
      async () =>
        this.microservice.pingCheck(
          'generic',
          this.configService.get('genericService')
        ),
      async () =>
        this.microservice.pingCheck(
          'mailer',
          this.configService.get('mailerService')
        ),
      async () =>
        this.microservice.pingCheck(
          'permission',
          this.configService.get('permissionService')
        ),
      async () =>
        this.microservice.pingCheck(
          'user',
          this.configService.get('userService')
        ),
      async () =>
        this.microservice.pingCheck(
          'storage',
          this.configService.get('storageService')
        )
    ])
  }
}
