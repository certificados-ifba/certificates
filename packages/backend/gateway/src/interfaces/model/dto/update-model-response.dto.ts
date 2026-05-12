import { ApiProperty } from '@nestjs/swagger'

import { IModel } from '../model.interface'

export class UpdateModelResponseDto {
  @ApiProperty({ example: 'model_update_success' })
  message: string

  @ApiProperty()
  data: { model: IModel }

  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any }
}
