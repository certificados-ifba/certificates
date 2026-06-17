import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CertificateController } from './controllers/certificate.controller'
import { ModelController } from './controllers/model.controller'
import { ActivitySchema } from './schemas/activity.schema'
import { CertificateSchema } from './schemas/certificate.schema'
import { TipoCertificadoSchema } from './schemas/tipo-certificado.schema'
import { GenericSchema } from './schemas/generic.schema'
import { ModelSchema } from './schemas/model.schema'
import { UserSchema } from './schemas/user.schema'
import { CertificateService } from './services/certificate.service'
import { MongoConfigService } from './services/config/mongo-config.service'
import { ModelService } from './services/model.service'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService
    }),
    MongooseModule.forFeature([
      {
        name: 'Activity',
        schema: ActivitySchema
      },
      {
        name: 'Certificate',
        schema: CertificateSchema
      },
      {
        name: 'Generic',
        schema: GenericSchema
      },
      {
        name: 'Model',
        schema: ModelSchema
      },
      {
        name: 'User',
        schema: UserSchema
      },
      {
        name: 'TipoCertificado',
        schema: TipoCertificadoSchema
      }
    ])
  ],
  controllers: [CertificateController, ModelController],
  providers: [CertificateService, ModelService]
})
export class CertificateModule {}
