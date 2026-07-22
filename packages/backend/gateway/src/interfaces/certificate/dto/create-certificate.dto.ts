import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCertificateDto {
  @ApiProperty({ example: '5d987c3bfb881ec86b476bfa' })
  activity: string

  @ApiProperty({ example: '5d987c3bfb881ec86b476bfa' })
  function: string

  @ApiPropertyOptional({ example: '5d987c3bfb881ec86b476bfa' })
  participant?: string

  @ApiPropertyOptional({ example: '000.000.000-00' })
  cpf?: string

  @ApiPropertyOptional({ example: '5d987c3bfb881ec86b476bfa' })
  event?: string

  @ApiProperty({ example: 40 })
  workload: number

  @ApiProperty({ example: new Date('2019-10-01') })
  start_date: Date

  @ApiProperty({ example: new Date('2019-10-11') })
  end_date: Date

  @ApiProperty({ example: '' })
  authorship_order: string

  @ApiProperty({ example: '' })
  additional_field: string
}
