import { ApiProperty } from '@nestjs/swagger'

import { IGeneric } from '../../generic/generic.interface'

export class ListCertificationTypeResponseDto {
  @ApiProperty({ example: 'generic_search_success' })
  message: string

  @ApiProperty({
    example: [
      {
        name: 'Congresso',
        created_at: new Date(),
        updated_at: new Date(),
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
      }
    ],
    nullable: true
  })
  data: IGeneric[]
}
