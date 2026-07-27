import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { TipoCertificadoController } from './tipo-certificado.controller'
import { TipoCertificadoSchema } from './schemas/tipo-certificado.schema'
import { UserSchema } from './schemas/user.schema'
import { MongoConfigService } from './services/config/mongo-config.service'
import { TipoCertificadoService } from './services/tipo-certificado.service'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService
    }),
    MongooseModule.forFeature([
      {
        name: 'TipoCertificado',
        schema: TipoCertificadoSchema
      },
      {
        name: 'User',
        schema: UserSchema
      }
    ])
  ],
  controllers: [TipoCertificadoController],
  providers: [TipoCertificadoService]
})
export class TipoCertificadoModule {}
