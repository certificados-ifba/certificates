import { Controller, Inject, Get, Res, Post, Query, Body } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { ApiTags, ApiOkResponse } from '@nestjs/swagger'
import { Response } from 'express'

import { GetTiposCertificadoResponseDto } from '../interfaces/tipo-certificado/dto/get-tipos-certificado-response.dto'

@Controller('test')
@ApiTags('test')
export class TestTiposCertificadoController {
  constructor(
    @Inject('TIPO_CERTIFICADO_SERVICE') private readonly eventServiceClient: ClientProxy
  ) {}

  @Post('import')
  public async import(@Body() body: any): Promise<any> {
    return {
      message: 'Atividade importada com sucesso',
      data: null,
      errors: null
    }
  }

  @Get('events/participants/activities')
  public async getActivitiesOfParticipants(
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    res.header('x-total-count', String(1))
    res.header('x-total-page', String(1))

    return {
      message: 'Lista de Participantes',
      data: [
        {
          id: 1,
          name: 'Competição Baiana de Veículos Autônomos em Escala',
          activitieType: 'Competição',
          workload: 10,
          start_date: '2021-08-14T02:58:03.079Z',
          end_date: '2021-08-14T02:58:03.079Z',
          participants: 0,
          function: 'Ouvinte'
        },
        {
          id: 2,
          name: 'Competição Baiana de Veículos Autônomos em Escala',
          activitieType: 'Palestra',
          workload: 10,
          start_date: '2021-08-14T02:58:03.079Z',
          end_date: '2021-08-14T02:58:03.079Z',
          participants: 20,
          function: 'Ouvinte'
        },
        {
          id: 3,
          name: 'Competição Baiana de Veículos Autônomos em Escala',
          activitieType: 'Palestra',
          workload: 10,
          start_date: '2021-08-14T02:58:03.079Z',
          end_date: '2021-08-14T02:58:03.079Z',
          participants: 50,
          function: 'Ouvinte'
        }
      ],
      errors: null
    }
  }

  @Get('events/participants')
  public async getEventsOfParticipants(
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    res.header('x-total-count', String(1))
    res.header('x-total-page', String(1))

    return {
      message: 'Lista de Participantes',
      data: [
        {
          name: 'Evento',
          initials: 'EV',
          edition: '01',
          local: 'Vitória da Conquista',
          start_date: '2021-07-01T00:00:00.000Z',
          end_date: '2021-07-01T00:00:00.000Z'
        }
      ],
      errors: null
    }
  }

  @Get('participants')
  @ApiOkResponse({
    type: GetTiposCertificadoResponseDto,
    description: 'List of participants'
  })
  public async getParticipants(): Promise<any> {
    return {
      message: 'Lista de Participantes',
      data: {
        participants: [
          {
            cpf: '000.000.000-00',
            name: 'Lucas Nascimento Bertoldi',
            birth_date: new Date('1990-09-09'),
            email: 'lucasn.bertoldi@gmail.com',
            institution: true,
            last_event: 'Evento Conqusita'
          },
          {
            cpf: '111.111.111-11',
            name: 'Danilo Gentilli',
            birth_date: new Date('1991-01-01'),
            email: 'danilo@gmail.com',
            institution: false,
            last_event: 'Evento São Paulo'
          },
          {
            cpf: '222.222.222-22',
            name: 'Murilo Couto',
            birth_date: new Date('1992-02-02'),
            email: 'murilo@gmail.com',
            institution: false,
            last_event: 'Evento Salvador'
          }
        ]
      },
      errors: null
    }
  }

  @Get('users')
  @ApiOkResponse({
    type: GetTiposCertificadoResponseDto,
    description: 'List of participants'
  })
  public async getUsers(): Promise<any> {
    return {
      message: 'Lista de Usuários',
      data: {
        users: [
          {
            name: 'Lucas Nascimento Bertoldi',
            email: 'lucasn.bertoldi@gmail.com',
            type: 'Administrador'
          },
          {
            name: 'Danilo Gentilli',
            email: 'danilo@gmail.com',
            type: 'Administrador'
          },
          {
            name: 'Murilo Couto',
            email: 'murilo@gmail.com',
            type: 'Coordenador'
          }
        ]
      },
      errors: null
    }
  }

  @Get('functions')
  @ApiOkResponse({
    type: GetTiposCertificadoResponseDto,
    description: 'List of functions'
  })
  public async getFunctions(): Promise<any> {
    return {
      message: 'Lista de Funções',
      data: {
        functions: [
          {
            name: 'Palestrante'
          },
          {
            name: 'Monitor'
          },
          {
            name: 'Organizador'
          }
        ]
      },
      errors: null
    }
  }
}
