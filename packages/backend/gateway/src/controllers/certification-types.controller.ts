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
import {
  IServiceCertificationTypeCreateResponse,
  IServiceCertificationTypeDeleteResponse,
  IServiceCertificationTypeGetByIdResponse,
  IServiceCertificationTypeListResponse,
  IServiceCertificationTypeUpdateResponse
} from '../interfaces/certification-type/service-certification-type-responses.interface'
import { DeleteGenericResponseDto } from '../interfaces/generic/dto/delete-generic-response.dto'
import { GenericIdDto } from '../interfaces/generic/dto/generic-id.dto'
import { ListGenericDto } from '../interfaces/generic/dto/list-generic.dto'
import { UpdateGenericDto } from '../interfaces/generic/dto/update-generic.dto'

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
    const response: IServiceCertificationTypeListResponse = await this.genericServiceClient
      .send('certification_type_list', {
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
      data: response?.data?.certificationTypes
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
    const createResponse: IServiceCertificationTypeCreateResponse = await this.genericServiceClient
      .send('certification_type_create', {
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
      data: createResponse.certificationType,
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

    const response: IServiceCertificationTypeGetByIdResponse = await this.genericServiceClient
      .send('certification_type_get_by_id', id)
      .toPromise()

    return {
      message: response.message,
      data: response.certificationType
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
    const deleteResponse: IServiceCertificationTypeDeleteResponse = await this.genericServiceClient
      .send('certification_type_delete_by_id', {
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
    const updateResponse: IServiceCertificationTypeUpdateResponse = await this.genericServiceClient
      .send('certification_type_update_by_id', {
        id: params.id,
        certificationType: {
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
      data: updateResponse.certificationType,
      errors: null
    }
  }
}
