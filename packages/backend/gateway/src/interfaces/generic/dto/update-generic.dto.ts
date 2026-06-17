import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger'

export class UpdateGenericDto {
  @ApiProperty({ example: 'alguma coisa' })
  name: string

  @ApiPropertyOptional({ example: 'FiCalendar' })
  icon?: string
}
