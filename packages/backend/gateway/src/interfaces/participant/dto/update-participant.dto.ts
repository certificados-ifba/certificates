import { ApiProperty } from '@nestjs/swagger'

export class UpdateParticipantDto {
  @ApiProperty({
    example: 'Teste Estudante'
  })
  name: string

  @ApiProperty({
    uniqueItems: true,
    example: 'aluno@ifba.edu.br'
  })
  email: string

  @ApiProperty({
    example: '1999-01-01'
  })
  dob: Date

  @ApiProperty({
    example: '(77) 77777-7777'
  })
  phone: string

  @ApiProperty({
    example: '00000000000'
  })
  cpf: string

  @ApiProperty({
    example: true
  })
  institution: boolean
}
