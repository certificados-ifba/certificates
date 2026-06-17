import { Transport } from '@nestjs/microservices'

export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null

  constructor() {
    this.envConfig = {}
    this.envConfig.port = process.env.API_GATEWAY_PORT
    this.envConfig.tokenService = {
      options: {
        port: process.env.TOKEN_SERVICE_PORT,
        host: process.env.TOKEN_SERVICE_HOST
      },
      transport: Transport.TCP
    }
    this.envConfig.userService = {
      options: {
        port: process.env.USER_SERVICE_PORT,
        host: process.env.USER_SERVICE_HOST
      },
      transport: Transport.TCP
    }
    this.envConfig.tipoCertificadoService = {
      options: {
        port: process.env.EVENT_SERVICE_PORT,
        host: process.env.EVENT_SERVICE_HOST
      },
      transport: Transport.TCP
    }
    this.envConfig.permissionService = {
      options: {
        port: process.env.PERMISSION_SERVICE_PORT,
        host: process.env.PERMISSION_SERVICE_HOST
      },
      transport: Transport.TCP
    }
    this.envConfig.genericService = {
      options: {
        port: process.env.GENERIC_SERVICE_PORT,
        host: process.env.GENERIC_SERVICE_HOST
      },
      transport: Transport.TCP
    }
    this.envConfig.activityService = {
      options: {
        port: process.env.ACTIVITY_SERVICE_PORT,
        host: process.env.ACTIVITY_SERVICE_HOST
      },
      transport: Transport.TCP
    }
    this.envConfig.certificateService = {
      options: {
        port: process.env.CERTIFICATE_SERVICE_PORT,
        host: process.env.CERTIFICATE_SERVICE_HOST
      },
      transport: Transport.TCP
    }
    this.envConfig.storageService = {
      options: {
        port: process.env.STORAGE_SERVICE_PORT,
        host: process.env.STORAGE_SERVICE_HOST
      },
      transport: Transport.TCP
    }
    this.envConfig.mailerService = {
      options: {
        port: process.env.MAILER_SERVICE_PORT,
        host: process.env.MAILER_SERVICE_HOST
      },
      transport: Transport.TCP
    }
  }

  get(key: string): any {
    return this.envConfig[key]
  }
}
