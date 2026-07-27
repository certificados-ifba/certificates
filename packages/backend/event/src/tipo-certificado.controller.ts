import { Controller, HttpStatus } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import { ITipoCertificadoByIdResponse } from './interfaces/tipo-certificado-by-id-response.interface'
import { ITipoCertificadoCreateResponse } from './interfaces/tipo-certificado-create-response.interface'
import { ITipoCertificadoDeleteResponse } from './interfaces/tipo-certificado-delete-response.interface'
import { ITipoCertificadoListParams } from './interfaces/tipo-certificado-list-params.interface'
import { ITipoCertificadoListResponse } from './interfaces/tipo-certificado-list-response.interface'
import { ITipoCertificadoPublishedResponse } from './interfaces/tipo-certificado-published-response.interface'
import { ITipoCertificadoSearchByUserResponse } from './interfaces/tipo-certificado-search-by-user-response.interface'
import { ITipoCertificadoUpdateByIdResponse } from './interfaces/tipo-certificado-update-by-id-response.interface'
import { ITipoCertificadoUpdateParams } from './interfaces/tipo-certificado-update-params.interface'
import { ITipoCertificado } from './interfaces/tipo-certificado.interface'
import { IUser } from './interfaces/user.interface'
import { TipoCertificadoService } from './services/tipo-certificado.service'

@Controller()
export class TipoCertificadoController {
  constructor(private readonly eventService: TipoCertificadoService) { }

  @MessagePattern('tipo_certificado_list')
  public async eventList(
    params: ITipoCertificadoListParams
  ): Promise<ITipoCertificadoListResponse> {
    const events = await this.eventService.listEvents(params)

    return {
      status: HttpStatus.OK,
      message: 'tipo_certificado_list_success',
      data: events
    }
  }

  @MessagePattern('tipo_certificado_get_by_id')
  public async getEventById(params: {
    id: string
    user: IUser
  }): Promise<ITipoCertificadoByIdResponse> {
    let result: ITipoCertificadoByIdResponse

    if (params?.id && params?.user) {
      const event = await this.eventService.searchEventById(params.id)
      if (event) {
        if (params.user.role !== 'ADMIN' && event.user?.id !== params.user.id) {
          result = {
            status: HttpStatus.FORBIDDEN,
            message: 'tipo_certificado_get_by_id_forbidden',
            data: null
          }
        } else {
          result = {
            status: HttpStatus.OK,
            message: 'tipo_certificado_get_by_id_success',
            data: { event }
          }
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'tipo_certificado_get_by_id_not_found',
          data: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'tipo_certificado_get_by_id_bad_request',
        data: null
      }
    }

    return result
  }

  @MessagePattern('tipo_certificado_search_by_user_id')
  public async eventSearchByUserId(
    userId: string
  ): Promise<ITipoCertificadoSearchByUserResponse> {
    let result: ITipoCertificadoSearchByUserResponse

    if (userId) {
      const events = await this.eventService.getEventsByUserId(userId)
      result = {
        status: HttpStatus.OK,
        message: 'tipo_certificado_search_by_user_id_success',
        events
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'tipo_certificado_search_by_user_id_bad_request',
        events: null
      }
    }

    return result
  }

  @MessagePattern('tipo_certificado_update_by_id')
  public async eventUpdateById(params: {
    event: ITipoCertificadoUpdateParams
    id: string
    user: IUser
  }): Promise<ITipoCertificadoUpdateByIdResponse> {
    let result: ITipoCertificadoUpdateByIdResponse
    if (params.id) {
      try {
        const event = await this.eventService.findEventById(params.id)
        if (event) {
          if (event.user === params.user.id || params.user.role === 'ADMIN') {
            const updatedEvent = await this.eventService.updateEventById(
              params.id,
              params.event
            )
            result = {
              status: HttpStatus.OK,
              message: 'tipo_certificado_update_by_id_success',
              event: updatedEvent,
              errors: null
            }
          } else {
            result = {
              status: HttpStatus.FORBIDDEN,
              message: 'tipo_certificado_update_by_id_forbidden',
              event: null,
              errors: null
            }
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'tipo_certificado_update_by_id_not_found',
            event: null,
            errors: null
          }
        }
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'tipo_certificado_update_by_id_precondition_failed',
          event: null,
          errors: e.errors
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'tipo_certificado_update_by_id_bad_request',
        event: null,
        errors: null
      }
    }

    return result
  }

  @MessagePattern('tipo_certificado_create')
  public async eventCreate(eventBody: ITipoCertificado): Promise<ITipoCertificadoCreateResponse> {
    let result: ITipoCertificadoCreateResponse
    if (eventBody) {
      try {
        const event = await this.eventService.createEvent(eventBody)
        result = {
          status: HttpStatus.CREATED,
          message: 'tipo_certificado_create_success',
          event,
          errors: null
        }
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'tipo_certificado_create_precondition_failed',
          event: null,
          errors: e.errors
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'tipo_certificado_create_bad_request',
        event: null,
        errors: null
      }
    }

    return result
  }

  @MessagePattern('tipo_certificado_delete_by_id')
  public async eventDeleteForUser(params: {
    user: IUser
    id: string
  }): Promise<ITipoCertificadoDeleteResponse> {
    let result: ITipoCertificadoDeleteResponse

    if (params && params.user.id && params.id) {
      try {
        const event = await this.eventService.findEventById(params.id)

        if (event) {
          if (event.user === params.user.id || params.user.role === 'ADMIN') {
            await this.eventService.removeEventById(params.id)
            result = {
              status: HttpStatus.OK,
              message: 'tipo_certificado_delete_by_id_success',
              errors: null
            }
          } else {
            result = {
              status: HttpStatus.FORBIDDEN,
              message: 'tipo_certificado_delete_by_id_forbidden',
              errors: null
            }
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'tipo_certificado_delete_by_id_not_found',
            errors: null
          }
        }
      } catch (e) {
        result = {
          status: HttpStatus.FORBIDDEN,
          message: 'tipo_certificado_delete_by_id_forbidden',
          errors: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'tipo_certificado_delete_by_id_bad_request',
        errors: null
      }
    }

    return result
  }

  @MessagePattern('event_published')
  public async getEventPublished(): Promise<ITipoCertificadoPublishedResponse> {
    const quantity = await this.eventService.getEventPublished()

    return {
      status: HttpStatus.OK,
      message: 'get_event_published_success',
      data: quantity
    }
  }

  @MessagePattern('tipo_certificado_publish_by_id')
  public async publishEventById(params: {
    id: string
    user: IUser
  }): Promise<ITipoCertificadoUpdateByIdResponse> {
    let result: ITipoCertificadoUpdateByIdResponse

    if (params?.id && params?.user) {
      const event = await this.eventService.findEventById(params.id)
      if (event) {
        if (event.user === params.user.id || params.user.role === 'ADMIN') {
          const updatedEvent = await this.eventService.publishEventById(params.id)
          result = {
            status: HttpStatus.OK,
            message: 'tipo_certificado_publish_by_id_success',
            event: updatedEvent,
            errors: null
          }
        } else {
          result = {
            status: HttpStatus.FORBIDDEN,
            message: 'tipo_certificado_publish_by_id_forbidden',
            event: null,
            errors: null
          }
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'tipo_certificado_publish_by_id_not_found',
          event: null,
          errors: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'tipo_certificado_publish_by_id_bad_request',
        event: null,
        errors: null
      }
    }

    return result
  }
}
