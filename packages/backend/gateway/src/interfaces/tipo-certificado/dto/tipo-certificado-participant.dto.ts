import { ApiProperty } from '@nestjs/swagger'

export class ParticipantTipoCertificadoIdDto {
  @ApiProperty()
  idEvent: string

  @ApiProperty()
  id: string
}
