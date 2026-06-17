import { ApiProperty } from '@nestjs/swagger'

import { IGeneric } from '../../generic/generic.interface'

export class UpdateCertificationTypeResponseDto {
  @ApiProperty({ example: 'generic_update_by_id_success' })
  message: string

  @ApiProperty({
    example: {
      type: 'certification',
      name: 'Congresso',
      created_at: new Date(),
      updated_at: new Date(),
      id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    },
    nullable: true
  })
  data: IGeneric

  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any }
}
