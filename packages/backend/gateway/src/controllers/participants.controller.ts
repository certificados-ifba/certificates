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
import { Request, Response } from 'express'
import * as requestIp from 'request-ip'
import * as parser from 'ua-parser-js'

import { Authorization } from '../decorators/authorization.decorator'
import { Permission } from '../decorators/permission.decorator'
import { IServiceCertificateListResponse } from '../interfaces/certificate/service-certificate-list-response.interface'
import { IAuthorizedRequest } from '../interfaces/common/authorized-request.interface'
import { CreateParticipantResponseDto } from '../interfaces/participant/dto/create-participant-response.dto'
import { CreateParticipantDto } from '../interfaces/participant/dto/create-participant.dto'
import { GetParticipantByIdResponseDto } from '../interfaces/participant/dto/get-participant-by-id-response.dto'
import { GetParticipantsResponseDto } from '../interfaces/participant/dto/get-participant-response.dto'
import { ListParticipantDto } from '../interfaces/participant/dto/list-participant.dto'
import { UpdateParticipantResponseDto } from '../interfaces/participant/dto/update-participant-response.dto'
import { UpdateParticipantDto } from '../interfaces/participant/dto/update-participant.dto'
import { IServiceParticipantCreateResponse } from '../interfaces/participant/service-participant-create-response.interface'
import { IServiceParticipantGetByIdResponse } from '../interfaces/participant/service-participant-get-by-id-response.interface'
import { IServiceParticipantListResponse } from '../interfaces/participant/service-participant-list-response.interface'
import { IServiceParticipantUpdateByIdResponse } from '../interfaces/participant/service-participant-update-by-id-response.interface'
import { IServiceTokenCreateResponse } from '../interfaces/token/service-token-create-response.interface'
import { AuthParticipantDto } from '../interfaces/user/dto/auth-participant.dto'
import { DeleteUserResponseDto } from '../interfaces/user/dto/delete-user-response.dto'
import { LoginUserResponseDto } from '../interfaces/user/dto/login-user-response.dto'
import { UserIdDto } from '../interfaces/user/dto/user-id.dto'
import { IServiceUserConfirmResponse } from '../interfaces/user/service-user-confirm-response.interface'
import { IServiceUserDeleteResponse } from '../interfaces/user/service-user-delete-response.interface'
import { IServiceUserSearchResponse } from '../interfaces/user/service-user-search-response.interface'
import { ParticipantIdDto } from './../interfaces/participant/dto/participant-id.dto'

@Controller('participants')
@ApiBearerAuth('JWT')
@ApiTags('participants')
export class ParticipantsController {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('CERTIFICATE_SERVICE') private readonly certificateServiceClient: ClientProxy
  ) { }

  @Get()
  @Authorization(true)
  @Permission('participant_list')
  @ApiOkResponse({
    type: GetParticipantsResponseDto,
    description: 'List of participant'
  })
  public async getParticipants(
    @Req() request: IAuthorizedRequest,
    @Res({ passthrough: true }) res: Response,
    @Query() query: ListParticipantDto
  ): Promise<GetParticipantsResponseDto> {
    const { search, page, per_page, sort_by, order_by } = query
    const participantsResponse: IServiceParticipantListResponse = await this.userServiceClient
      .send('user_list', {
        participant: true,
        name: search,
        page: Number(page),
        perPage: Number(per_page),
        sortBy: sort_by,
        orderBy: order_by
      })
      .toPromise()

    res.header('x-total-count', String(participantsResponse?.data.totalCount))
    res.header('x-total-page', String(participantsResponse?.data.totalPages))

    const data = participantsResponse?.data?.users

    if (request?.user?.role !== 'ADMIN') {
      data.map(user => {
        user.personal_data.cpf = `***.${user.personal_data.cpf.substr(4, 7)}-**`
        user.personal_data.dob = user.personal_data.dob.substr(0, 6) + '****'
        return user
      })
    }

    return {
      message: participantsResponse.message,
      data
    }
  }

  @Post()
  @Authorization(true)
  @Permission('participant_create')
  @ApiCreatedResponse({
    type: CreateParticipantResponseDto,
    description: 'Create new participant'
  })
  public async createParticipant(
    @Body() participantRequest: CreateParticipantDto
  ): Promise<CreateParticipantResponseDto> {
    const { name, email, cpf, dob, phone, institution } = participantRequest

    const createParticipantResponse: IServiceParticipantCreateResponse = await this.userServiceClient
      .send('user_create', {
        name,
        email,
        role: 'PARTICIPANT',
        personal_data: {
          cpf: cpf.replace(/[^\d]+/g, ''),
          dob: dob,
          phone: phone,
          institution: institution
        }
      })
      .toPromise()
    if (createParticipantResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createParticipantResponse.message,
          data: null,
          errors: createParticipantResponse.errors
        },
        createParticipantResponse.status
      )
    }

    return {
      message: createParticipantResponse.message,
      data: {
        user: createParticipantResponse.data.user
      },
      errors: null
    }
  }

  @Get('confirm/:token')
  @ApiOkResponse({
    description: 'Confirm participant email address'
  })
  public async confirmParticipantEmail(
    @Param('token') token: string
  ): Promise<{ message: string; data: null; errors: null }> {
    const confirmResponse: IServiceUserConfirmResponse = await this.userServiceClient
      .send('participant_confirm', token)
      .toPromise()

    if (confirmResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confirmResponse.message,
          data: null,
          errors: null
        },
        confirmResponse.status
      )
    }

    return {
      message: confirmResponse.message,
      data: null,
      errors: null
    }
  }

  @Get(':id')
  @Authorization(true)
  @Permission('participant_get_by_id')
  @ApiOkResponse({
    type: GetParticipantByIdResponseDto,
    description: 'Find participant by id'
  })
  public async getParticipantById(
    @Param() params: ParticipantIdDto
  ): Promise<GetParticipantByIdResponseDto> {
    const { id } = params

    const userResponse: IServiceParticipantGetByIdResponse = await this.userServiceClient
      .send('user_get_by_id', id)
      .toPromise()

    return {
      message: userResponse.message,
      data: userResponse?.data?.user
    }
  }

  @Put(':id')
  @Authorization(true)
  @Permission('participant_update_by_id')
  @ApiOkResponse({
    type: UpdateParticipantResponseDto
  })
  public async updateParticipant(
    @Param() params: ParticipantIdDto,
    @Body() participantRequest: UpdateParticipantDto
  ): Promise<UpdateParticipantResponseDto> {
    const { name, email, dob, phone, institution, cpf } = participantRequest
    const updateParticipantResponse: IServiceParticipantUpdateByIdResponse = await this.userServiceClient
      .send('user_update_by_id', {
        user: {
          name,
          email,
          personal_data: {
            dob: dob,
            phone: phone,
            institution: institution,
            cpf: cpf
          }
        },
        id: params.id
      })
      .toPromise()

    if (updateParticipantResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateParticipantResponse.message,
          errors: updateParticipantResponse.errors,
          data: null
        },
        updateParticipantResponse.status
      )
    }

    return {
      message: updateParticipantResponse.message,
      data: updateParticipantResponse.user,
      errors: null
    }
  }

  @Delete(':id')
  @Authorization(true)
  @Permission('participant_delete_by_id')
  @ApiOkResponse({
    type: DeleteUserResponseDto
  })
  public async deleteUser(
    @Param() params: UserIdDto
  ): Promise<DeleteUserResponseDto> {
    const certificateListResponse: IServiceCertificateListResponse = await this.certificateServiceClient
      .send('certificate_list', {
        user: params.id,
        page: 1,
        perPage: 1
      })
      .toPromise()

    if (certificateListResponse?.data?.totalCount > 0) {
      throw new HttpException(
        {
          message: 'participant_delete_conflict',
          errors: null,
          data: null
        },
        HttpStatus.CONFLICT
      )
    }

    const deleteUserResponse: IServiceUserDeleteResponse = await this.userServiceClient
      .send('user_delete_by_id', {
        id: params.id,
        participant: true
      })
      .toPromise()

    if (deleteUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: deleteUserResponse.message,
          errors: deleteUserResponse.errors,
          data: null
        },
        deleteUserResponse.status
      )
    }

    return {
      message: deleteUserResponse.message,
      data: null,
      errors: null
    }
  }

  @Post('sessions')
  @ApiCreatedResponse({
    type: LoginUserResponseDto,
    description: 'Performs authentication on the platform'
  })
  public async loginUser(
    @Req() req: Request,
    @Body() loginRequest: AuthParticipantDto
  ): Promise<LoginUserResponseDto> {
    const getUserResponse: IServiceUserSearchResponse = await this.userServiceClient
      .send('user_auth_participant', loginRequest)
      .toPromise()

    if (getUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: getUserResponse.message,
          data: null,
          errors: null
        },
        HttpStatus.UNAUTHORIZED
      )
    }
    const agent = parser(req.headers['user-agent'])

    const createTokenResponse: IServiceTokenCreateResponse = await this.tokenServiceClient
      .send('token_create', {
        user: getUserResponse.data.user,
        ip: requestIp.getClientIp(req).split(':').pop(),
        device: `${agent.device.model ? agent.device.model + ' - ' : ''}${agent.os.name
          } ${agent.os.version} - ${agent.browser.name}`,
        where: req.headers.location
      })
      .toPromise()

    if (createTokenResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createTokenResponse.message,
          errors: createTokenResponse.errors,
          data: null
        },
        createTokenResponse.status
      )
    }

    return {
      message: createTokenResponse.message,
      data: {
        token: createTokenResponse.token
      },
      errors: null
    }
  }
}
