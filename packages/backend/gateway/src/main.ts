import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
// import * as csurf from 'csurf'
import * as helmet from 'helmet'
import * as requestIp from 'request-ip'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const options = new DocumentBuilder()
    .addServer('/')
    .setTitle('API certificates')
    .setDescription('API for certificate system information')
    .addTag('users')
    .addTag('events')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT'
    )
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('', app, document)
  // app.use(csurf())
  app.use(helmet())
  app.use(requestIp.mw())
  app.enableCors({
    // origin: process.env.WEB_URL,

    // credentials: true,
    exposedHeaders: ['x-total-count', 'x-total-page']
  })
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3001)
}
bootstrap()
