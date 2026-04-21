import { ApiProperty } from '@nestjs/swagger'

import { UserRole } from './create-user.dto'

export class UpdateUserDto {
  @ApiProperty({
    example: 'Teste',
    required: false
  })
  name?: string

  @ApiProperty({ enum: ['ADMIN', 'COORDINATOR'], required: false })
  role?: UserRole

  @ApiProperty({ example: 'teste@gmail.com', required: false })
  email?: string

  @ApiProperty({ example: 'senhaSegura123', required: false })
  password?: string
}
