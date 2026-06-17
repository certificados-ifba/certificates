import { ApiProperty } from '@nestjs/swagger'

export class UpdateTipoCertificadoDto {
  @ApiProperty({ example: 'Evento', enum: ['Evento','Palestra','Minicurso','Curso','Treinamento','Capacitação','Bootcamp','Congresso','Seminário','Simpósio','Colóquio','Jornada Acadêmica','Semana Acadêmica','Mesa Redonda','Painel','Debate','Visita Técnica','Monitoria','Estágio','Hackathon','Maratona de Programação'] })
  tipo: string

  @ApiProperty({ example: 'V Week-IT' })
  name: string

  @ApiProperty({
    example: 'Vitória da Conquista'
  })
  local: string

  @ApiProperty({ example: 'Week-IT' })
  initials: string

  @ApiProperty({ example: '2019' })
  year: string

  @ApiProperty({ example: '5º' })
  edition: string

  @ApiProperty({ example: new Date('2019-10-01') })
  start_date: Date

  @ApiProperty({ example: new Date('2019-10-11') })
  end_date: Date
}
