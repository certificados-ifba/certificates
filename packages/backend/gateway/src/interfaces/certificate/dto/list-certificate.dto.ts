import { ApiProperty } from '@nestjs/swagger'

export class ListCertificateDto {
  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 10, required: false })
  per_page: number

  @ApiProperty({ example: '', required: false })
  event: string

  @ApiProperty({ example: '', required: false })
  search: string

  @ApiProperty({ example: '', required: false })
  activity: string | string[]

  @ApiProperty({ example: '', required: false })
  typeActivity: string

  @ApiProperty({ example: '', required: false })
  function: string

  @ApiProperty({ example: '', required: false })
  workload_min: string

  @ApiProperty({ example: '', required: false })
  workload_max: string

  @ApiProperty({ example: '', required: false })
  start_date_from: string

  @ApiProperty({ example: '', required: false })
  start_date_to: string

  @ApiProperty({ example: '', required: false })
  end_date_from: string

  @ApiProperty({ example: '', required: false })
  end_date_to: string

  @ApiProperty({ example: '', required: false })
  sort_by: string

  @ApiProperty({ example: '', required: false })
  order_by: 'ASC' | 'DESC'
}
