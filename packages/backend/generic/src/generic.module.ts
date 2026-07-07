import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CertificationTypeController } from './certification-type.controller'
import { GenericController } from './generic.controller'
import { CertificationTypeSchema } from './schemas/certification-type.schema'
import { GenericSchema } from './schemas/generic.schema'
import { CertificationTypeService } from './services/certification-type.service'
import { MongoConfigService } from './services/config/mongo-config.service'
import { GenericService } from './services/generic.service'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService
    }),
    MongooseModule.forFeature([
      {
        name: 'Generic',
        schema: GenericSchema
      },
      {
        name: 'CertificationType',
        schema: CertificationTypeSchema
      }
    ])
  ],
  controllers: [GenericController, CertificationTypeController],
  providers: [GenericService, CertificationTypeService]
})
export class GenericModule {}
