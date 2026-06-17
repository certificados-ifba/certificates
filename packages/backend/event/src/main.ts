import { NestFactory } from '@nestjs/core'
import { Transport, TcpOptions } from '@nestjs/microservices'

import { TipoCertificadoModule } from './tipo-certificado.module'
import { ConfigService } from './services/config/config.service'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(TipoCertificadoModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: new ConfigService().get('port')
    }
  } as TcpOptions)
  await app.listenAsync()
}
bootstrap()
