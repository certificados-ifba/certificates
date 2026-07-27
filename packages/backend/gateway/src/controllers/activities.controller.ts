import {
  Controller,
  Inject,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Res,
  Query
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth
} from '@nestjs/swagger'
import { Response } from 'express'

import { Authorization } from '../decorators/authorization.decorator'
import { Permission } from '../decorators/permission.decorator'
import { ActivityIdDto } from '../interfaces/activity/dto/activity-id.dto'
import { CreateActivityResponseDto } from '../interfaces/activity/dto/create-activity-response.dto'
import { CreateActivityDto } from '../interfaces/activity/dto/create-activity.dto'
import { DeleteActivityResponseDto } from '../interfaces/activity/dto/delete-activity-response.dto'
import { TipoCertificadoIdDto } from '../interfaces/activity/dto/event-id.dto'
import { ListActivityResponseDto } from '../interfaces/activity/dto/list-activity-response.dto'
import { ListActivityDto } from '../interfaces/activity/dto/list-activity.dto'
import { UpdateActivityResponseDto } from '../interfaces/activity/dto/update-activity-response.dto'
import { UpdateActivityDto } from '../interfaces/activity/dto/update-activity.dto'
import { IServiceActivityCreateResponse } from '../interfaces/activity/service-activity-create-response.interface'
import { IServiceActivityDeleteResponse } from '../interfaces/activity/service-activity-delete-response.interface'
import { IServiceActivityListResponse } from '../interfaces/activity/service-activity-list-response.interface'
import { IServiceActivityUpdateByIdResponse } from '../interfaces/activity/service-activity-update-by-id-response.interface'
import { IAuthorizedRequest } from '../interfaces/common/authorized-request.interface'
import { IServiceTipoCertificadoGetByIdResponse } from '../interfaces/tipo-certificado/service-tipo-certificado-get-by-id-response.interface'
import capitalize from '../utils/capitalize'

// import { ActivityIdDto } from '../interfaces/activity/dto/activity-id.dto'
// import { DeleteActivityResponseDto } from '../interfaces/activity/dto/delete-activity-response.dto'
// import { GetActivityByIdResponseDto } from '../interfaces/activity/dto/get-activity-by-id-response.dto'
// import { UpdateActivityResponseDto } from '../interfaces/activity/dto/update-activity-response.dto'
// import { UpdateActivityDto } from '../interfaces/activity/dto/update-activity.dto'
// import { IServiceActivityDeleteResponse } from '../interfaces/activity/service-activity-delete-response.interface'
// import { IServiceActivityGetByIdResponse } from '../interfaces/activity/service-activity-get-by-id-response.interface'
// import { IServiceActivityUpdateByIdResponse } from '../interfaces/activity/service-activity-update-by-id-response.interface'
// import { IAuthorizedRequest } from '../interfaces/common/authorized-request.interface'

@Controller([
  'events/:event_id/activities',
  'tipos-certificado/:event_id/activities'
])
@ApiBearerAuth('JWT')
@ApiTags('activities')
export class ActivitiesController {
  constructor(
    @Inject('ACTIVITY_SERVICE')
    private readonly activityServiceClient: ClientProxy,
    @Inject('TIPO_CERTIFICADO_SERVICE')
    private readonly eventServiceClient: ClientProxy
  ) {}

  // @Get(':id')
  // @Authorization(true)
  // @Permission('activity_get_by_id')
  // @ApiOkResponse({
  //   type: GetActivityByIdResponseDto,
  //   description: 'Find activity by id'
  // })
  // public async getActivityById(
  //   @Req() request: IAuthorizedRequest,
  //   @Param() params: ActivityIdDto
  // ): Promise<GetActivityByIdResponseDto> {
  //   const { id } = params

  //   const activityResponse: IServiceActivityGetByIdResponse = await this.activityServiceClient
  //     .send('activity_get_by_id', { id, user: request?.user })
  //     .toPromise()

  //   return {
  //     message: activityResponse.message,
  //     data: activityResponse?.data?.activity
  //   }
  // }

  @Get()
  @Authorization(true)
  @Permission('activity_list')
  @ApiOkResponse({
    type: ListActivityResponseDto,
    description: 'List of activities'
  })
  public async getActivities(
    @Req() request: IAuthorizedRequest,
    @Param() params: TipoCertificadoIdDto,
    @Res({ passthrough: true }) res: Response,
    @Query() query: ListActivityDto
  ): Promise<ListActivityResponseDto> {
    const { search, page, per_page, sort_by, order_by } = query

    const eventResponse: IServiceTipoCertificadoGetByIdResponse = await this.eventServiceClient
      .send('tipo_certificado_get_by_id', {
        id: params.event_id,
        user: request.user
      })
      .toPromise()

    if (eventResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: eventResponse.message,
          data: null,
          errors: null
        },
        eventResponse.status
      )
    }

    const activitiesResponse: IServiceActivityListResponse = await this.activityServiceClient
      .send('activity_list', {
        name: search,
        event: eventResponse.data.event.id,
        page: Number(page),
        perPage: Number(per_page),
        sortBy: sort_by,
        orderBy: order_by
      })
      .toPromise()

    res.header('x-total-count', String(activitiesResponse?.data.totalCount))
    res.header('x-total-page', String(activitiesResponse?.data.totalPages))

    return {
      message: activitiesResponse.message,
      data: activitiesResponse?.data?.activities
    }
  }

  @Post()
  @Authorization(true)
  @Permission('activity_create')
  @ApiCreatedResponse({
    type: CreateActivityResponseDto
  })
  public async createActivity(
    @Req() request: IAuthorizedRequest,
    @Param() params: ActivityIdDto,
    @Body() activityRequest: CreateActivityDto
  ): Promise<CreateActivityResponseDto> {
    const { name, workload, start_date, end_date, type } = activityRequest
    const eventResponse: IServiceTipoCertificadoGetByIdResponse = await this.eventServiceClient
      .send('tipo_certificado_get_by_id', {
        id: params.event_id,
        user: request.user
      })
      .toPromise()

    if (eventResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: eventResponse.message,
          data: null,
          errors: null
        },
        eventResponse.status
      )
    }

    const createActivityResponse: IServiceActivityCreateResponse = await this.activityServiceClient
      .send('activity_create', {
        name: capitalize(name?.trim()),
        type,
        workload,
        start_date,
        end_date,
        event: eventResponse.data.event.id
      })
      .toPromise()

    if (createActivityResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createActivityResponse.message,
          data: null,
          errors: createActivityResponse.errors
        },
        createActivityResponse.status
      )
    }

    return {
      message: createActivityResponse.message,
      data: {
        activity: createActivityResponse.activity
      },
      errors: null
    }
  }

  @Delete(':id')
  @Authorization(true)
  @Permission('activity_delete_by_id')
  @ApiOkResponse({
    type: DeleteActivityResponseDto
  })
  public async deleteActivity(
    @Req() request: IAuthorizedRequest,
    @Param() params: ActivityIdDto
  ): Promise<DeleteActivityResponseDto> {
    const userInfo = request.user

    const eventResponse: IServiceTipoCertificadoGetByIdResponse = await this.eventServiceClient
      .send('tipo_certificado_get_by_id', {
        id: params.event_id,
        user: request.user
      })
      .toPromise()

    if (eventResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: eventResponse.message,
          data: null,
          errors: null
        },
        eventResponse.status
      )
    }

    const deleteActivityResponse: IServiceActivityDeleteResponse = await this.activityServiceClient
      .send('activity_delete_by_id', {
        id: params.id,
        permission:
          userInfo.role === 'ADMIN' ||
          userInfo.id === eventResponse.data.event.id
      })
      .toPromise()

    if (deleteActivityResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: deleteActivityResponse.message,
          errors: deleteActivityResponse.errors,
          data: null
        },
        deleteActivityResponse.status
      )
    }

    return {
      message: deleteActivityResponse.message,
      data: null,
      errors: null
    }
  }

  @Put(':id')
  @Authorization(true)
  @Permission('activity_update_by_id')
  @ApiOkResponse({
    type: UpdateActivityResponseDto
  })
  public async updateActivity(
    @Req() request: IAuthorizedRequest,
    @Param() params: ActivityIdDto,
    @Body() activityRequest: UpdateActivityDto
  ): Promise<UpdateActivityResponseDto> {
    const userInfo = request.user
    const updateActivityResponse: IServiceActivityUpdateByIdResponse = await this.activityServiceClient
      .send('activity_update_by_id', {
        id: params.id,
        user: userInfo,
        activity: activityRequest
      })
      .toPromise()

    if (updateActivityResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateActivityResponse.message,
          errors: updateActivityResponse.errors,
          data: null
        },
        updateActivityResponse.status
      )
    }

    return {
      message: updateActivityResponse.message,
      data: {
        activity: updateActivityResponse.activity
      },
      errors: null
    }
  }
}
