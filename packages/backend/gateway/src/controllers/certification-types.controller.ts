import {
  Controller,
  Inject,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Delete,
  Param,
  Put,
  Query,
  Res
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
  ApiTags,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse
} from '@nestjs/swagger'
import { Response } from 'express'

import { Authorization } from '../decorators/authorization.decorator'
import { Permission } from '../decorators/permission.decorator'
import { CreateCertificationTypeResponseDto } from '../interfaces/certification-type/dto/create-certification-type-response.dto'
import { CreateCertificationTypeDto } from '../interfaces/certification-type/dto/create-certification-type.dto'
import { GetCertificationTypeByIdResponseDto } from '../interfaces/certification-type/dto/get-certification-type-by-id-response.dto'
import { ListCertificationTypeResponseDto } from '../interfaces/certification-type/dto/list-certification-type-response.dto'
import { UpdateCertificationTypeResponseDto } from '../interfaces/certification-type/dto/update-certification-type-response.dto'
import { DeleteGenericResponseDto } from '../interfaces/generic/dto/delete-generic-response.dto'
import { GenericIdDto } from '../interfaces/generic/dto/generic-id.dto'
import { ListGenericDto } from '../interfaces/generic/dto/list-generic.dto'
import { UpdateGenericDto } from '../interfaces/generic/dto/update-generic.dto'
import { IServiceGenericCreateResponse } from '../interfaces/generic/service-generic-create-response.interface'
import { IServiceGenericDeleteResponse } from '../interfaces/generic/service-generic-delete-response.interface'
import { IServiceGenericGetByIdResponse } from '../interfaces/generic/service-generic-get-by-id-response.interface'
import { IServiceGenericListResponse } from '../interfaces/generic/service-generic-list-response.interface'
import { IServiceGenericUpdateByIdResponse } from '../interfaces/generic/service-generic-update-by-id-response.interface'

@Controller('certification_types')
@ApiBearerAuth('JWT')
@ApiTags('certification_types')
export class CertificationTypesController {
  constructor(
    @Inject('GENERIC_SERVICE')
    private readonly genericServiceClient: ClientProxy
  ) {}

  @Get()
  @Authorization(true)
  @Permission('generic_list')
  @ApiOkResponse({
    type: ListCertificationTypeResponseDto,
    description: 'List of certification types'
  })
  public async listCertificationTypes(
    @Res({ passthrough: true }) res: Response,
    @Query() query: ListGenericDto
  ): Promise<ListCertificationTypeResponseDto> {
    const { search, page, per_page, sort_by, order_by } = query
    const response: IServiceGenericListResponse = await this.genericServiceClient
      .send('generic_list', {
        type: 'certification',
        name: search,
        page: Number(page),
        perPage: Number(per_page),
        sortBy: sort_by,
        orderBy: order_by
      })
      .toPromise()

    res.header('x-total-count', String(response?.data.totalCount))
    res.header('x-total-page', String(response?.data.totalPages))

    return {
      message: response.message,
      data: response?.data?.generics
    }
  }

  @Post()
  @Authorization(true)
  @Permission('generic_create')
  @ApiCreatedResponse({
    type: CreateCertificationTypeResponseDto,
    description: 'Create new certification type'
  })
  public async createCertificationType(
    @Body() genericRequest: CreateCertificationTypeDto
  ): Promise<CreateCertificationTypeResponseDto> {
    const createResponse: IServiceGenericCreateResponse = await this.genericServiceClient
      .send('generic_create', {
        type: 'certification',
        name: genericRequest.name,
        icon: genericRequest.icon
      })
      .toPromise()

    if (createResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createResponse.message,
          data: null,
          errors: createResponse.errors
        },
        createResponse.status
      )
    }

    return {
      message: createResponse.message,
      data: createResponse.generic,
      errors: null
    }
  }

  @Get(':id')
  @Authorization(true)
  @Permission('generic_get_by_id')
  @ApiOkResponse({
    type: GetCertificationTypeByIdResponseDto,
    description: 'Find certification type by id'
  })
  public async getCertificationTypeById(
    @Param() params: GenericIdDto
  ): Promise<GetCertificationTypeByIdResponseDto> {
    const { id } = params

    const response: IServiceGenericGetByIdResponse = await this.genericServiceClient
      .send('generic_get_by_id', id)
      .toPromise()

    return {
      message: response.message,
      data: response.generic
    }
  }

  @Delete(':id')
  @Authorization(true)
  @Permission('generic_delete_by_id')
  @ApiOkResponse({
    type: DeleteGenericResponseDto
  })
  public async deleteCertificationType(
    @Param() params: GenericIdDto
  ): Promise<DeleteGenericResponseDto> {
    const deleteResponse: IServiceGenericDeleteResponse = await this.genericServiceClient
      .send('generic_delete_by_id', {
        id: params.id
      })
      .toPromise()

    if (deleteResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: deleteResponse.message,
          errors: deleteResponse.errors,
          data: null
        },
        deleteResponse.status
      )
    }

    return {
      message: deleteResponse.message,
      data: null,
      errors: null
    }
  }

  @Put(':id')
  @Authorization(true)
  @Permission('generic_update_by_id')
  @ApiOkResponse({
    type: UpdateCertificationTypeResponseDto
  })
  public async updateCertificationType(
    @Param() params: GenericIdDto,
    @Body() genericRequest: UpdateGenericDto
  ): Promise<UpdateCertificationTypeResponseDto> {
    const updateResponse: IServiceGenericUpdateByIdResponse = await this.genericServiceClient
      .send('generic_update_by_id', {
        id: params.id,
        generic: {
          name: genericRequest.name,
          icon: genericRequest.icon
        }
      })
      .toPromise()

    if (updateResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateResponse.message,
          errors: updateResponse.errors,
          data: null
        },
        updateResponse.status
      )
    }

    return {
      message: updateResponse.message,
      data: updateResponse.generic,
      errors: null
    }
  }
}
