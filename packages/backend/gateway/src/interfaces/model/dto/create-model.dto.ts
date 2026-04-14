import { ApiProperty } from '@nestjs/swagger'

import { ICriterion, IPage } from '../model.interface'

export class CreateModelDto {
  @ApiProperty({ example: 'Exemplo' })
  name: string

  @ApiProperty()
  pages: IPage

  @ApiProperty()
  criterions: ICriterion

  @ApiProperty({ example: false })
  is_default: boolean
}
