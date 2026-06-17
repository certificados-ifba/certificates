import { ApiProperty } from '@nestjs/swagger'

export class ActivityTipoCertificadoIdDto {
  @ApiProperty()
  idEvent: string

  @ApiProperty()
  id: string
}
