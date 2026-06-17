import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCertificationTypeDto {
  @ApiProperty({ example: 'Congresso' })
  name: string

  @ApiPropertyOptional({ example: 'FiCalendar' })
  icon?: string
}
