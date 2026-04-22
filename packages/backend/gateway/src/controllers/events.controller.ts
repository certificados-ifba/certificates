import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { Response } from 'express'

import { Authorization } from '../decorators/authorization.decorator'
import { Permission } from '../decorators/permission.decorator'
import { IAuthorizedRequest } from '../interfaces/common/authorized-request.interface'
import { CreateEventResponseDto } from '../interfaces/event/dto/create-event-response.dto'
import { CreateEventDto } from '../interfaces/event/dto/create-event.dto'
import { DeleteEventResponseDto } from '../interfaces/event/dto/delete-event-response.dto'
import { EventIdDto } from '../interfaces/event/dto/event-id.dto'
import { GetEventByIdResponseDto } from '../interfaces/event/dto/get-event-by-id-response.dto'
import { GetEventsResponseDto } from '../interfaces/event/dto/get-events-response.dto'
import { ListEventDto } from '../interfaces/event/dto/list-event.dto'
import { UpdateEventResponseDto } from '../interfaces/event/dto/update-event-response.dto'
import { UpdateEventDto } from '../interfaces/event/dto/update-event.dto'
import { IServiceEventCreateResponse } from '../interfaces/event/service-event-create-response.interface'
import { IServiceEventDeleteResponse } from '../interfaces/event/service-event-delete-response.interface'
import { IServiceEventGetByIdResponse } from '../interfaces/event/service-event-get-by-id-response.interface'
import { IServiceEventListResponse } from '../interfaces/event/service-event-list-response.interface'
import { IServiceEventUpdateByIdResponse } from '../interfaces/event/service-event-update-by-id-response.interface'

@Controller('events')
@ApiBearerAuth('JWT')
@ApiTags('events')
export class EventsController {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy
  ) {}

  @Get(':id')
  @Authorization(true)
  @Permission('event_get_by_id')
  @ApiOkResponse({
    type: GetEventByIdResponseDto,
    description: 'Find event by id'
  })
  public async getEventById(
    @Req() request: IAuthorizedRequest,
    @Param() params: EventIdDto
  ): Promise<GetEventByIdResponseDto> {
    const { id } = params

    const eventResponse: IServiceEventGetByIdResponse = await this.eventServiceClient
      .send('event_get_by_id', { id, user: request?.user })
      .toPromise()

    return {
      message: eventResponse.message,
      data: eventResponse?.data?.event
    }
  }

  @Get()
  @Authorization(true)
  @Permission('event_list')
  @ApiOkResponse({
    type: GetEventsResponseDto,
    description: 'List of events'
  })
  public async getEvents(
    @Req() request: IAuthorizedRequest,
    @Res({ passthrough: true }) res: Response,
    @Query() query: ListEventDto
  ): Promise<GetEventsResponseDto> {
    const { search, page, per_page, sort_by, order_by } = query
    const eventsResponse: IServiceEventListResponse = await this.eventServiceClient
      .send('event_list', {
        name: search,
        user: request.user,
        page: Number(page),
        perPage: Number(per_page),
        sortBy: sort_by,
        orderBy: order_by
      })
      .toPromise()

    res.header('x-total-count', String(eventsResponse?.data.totalCount))
    res.header('x-total-page', String(eventsResponse?.data.totalPages))

    return {
      message: eventsResponse.message,
      data: eventsResponse?.data?.events
    }
  }

  @Post()
  @Authorization(true)
  @Permission('event_create')
  @ApiCreatedResponse({
    type: CreateEventResponseDto
  })
  public async createEvent(
    @Body() eventRequest: CreateEventDto
  ): Promise<CreateEventResponseDto> {
    const createEventResponse: IServiceEventCreateResponse = await this.eventServiceClient
      .send(
        'event_create',
        Object.assign(eventRequest, {
          year: new Date(eventRequest.start_date).getFullYear()
        })
      )
      .toPromise()

    if (createEventResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createEventResponse.message,
          data: null,
          errors: createEventResponse.errors
        },
        createEventResponse.status
      )
    }

    return {
      message: createEventResponse.message,
      data: {
        event: createEventResponse.event
      },
      errors: null
    }
  }

  @Delete(':id')
  @Authorization(true)
  @Permission('event_delete_by_id')
  @ApiOkResponse({
    type: DeleteEventResponseDto
  })
  public async deleteEvent(
    @Req() request: IAuthorizedRequest,
    @Param() params: EventIdDto
  ): Promise<DeleteEventResponseDto> {
    const userInfo = request.user

    const deleteEventResponse: IServiceEventDeleteResponse = await this.eventServiceClient
      .send('event_delete_by_id', {
        id: params.id,
        user: userInfo
      })
      .toPromise()

    if (deleteEventResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: deleteEventResponse.message,
          errors: deleteEventResponse.errors,
          data: null
        },
        deleteEventResponse.status
      )
    }

    return {
      message: deleteEventResponse.message,
      data: null,
      errors: null
    }
  }

  @Put(':id')
  @Authorization(true)
  @Permission('event_update_by_id')
  @ApiOkResponse({
    type: UpdateEventResponseDto
  })
  public async updateEvent(
    @Req() request: IAuthorizedRequest,
    @Param() params: EventIdDto,
    @Body() eventRequest: UpdateEventDto
  ): Promise<UpdateEventResponseDto> {
    const userInfo = request.user
    const updateEventResponse: IServiceEventUpdateByIdResponse = await this.eventServiceClient
      .send('event_update_by_id', {
        id: params.id,
        user: userInfo,
        event: eventRequest
      })
      .toPromise()

    if (updateEventResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateEventResponse.message,
          errors: updateEventResponse.errors,
          data: null
        },
        updateEventResponse.status
      )
    }

    return {
      message: updateEventResponse.message,
      data: {
        event: updateEventResponse.event
      },
      errors: null
    }
  }
}
