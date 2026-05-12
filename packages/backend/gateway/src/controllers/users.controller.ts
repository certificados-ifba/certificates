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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { Response } from 'express'

import { Authorization } from '../decorators/authorization.decorator'
import { Permission } from '../decorators/permission.decorator'
import { IAuthorizedRequest } from '../interfaces/common/authorized-request.interface'
import { CreateUserResponseDto } from '../interfaces/user/dto/create-user-response.dto'
import { CreateUserDto } from '../interfaces/user/dto/create-user.dto'
import { DeleteUserResponseDto } from '../interfaces/user/dto/delete-user-response.dto'
import { GetUserByIdResponseDto } from '../interfaces/user/dto/get-user-by-id-response.dto'
import { GetUserByTokenResponseDto } from '../interfaces/user/dto/get-user-by-token-response.dto'
import { GetUsersResponseDto } from '../interfaces/user/dto/get-user-response.dto'
import { ListUserDto } from '../interfaces/user/dto/list-user.dto'
import { ResendMailResponseDto } from '../interfaces/user/dto/resend-mail-response.dto'
import { UpdateUserResponseDto } from '../interfaces/user/dto/update-user-response.dto'
import { UpdateUserDto } from '../interfaces/user/dto/update-user.dto'
import { UserIdDto } from '../interfaces/user/dto/user-id.dto'
import { IServiceUserCreateResponse } from '../interfaces/user/service-user-create-response.interface'
import { IServiceUserDeleteResponse } from '../interfaces/user/service-user-delete-response.interface'
import { IServiceUserGetByIdResponse } from '../interfaces/user/service-user-get-by-id-response.interface'
import { IServiceUserListResponse } from '../interfaces/user/service-user-list-response.interface'
import { IServiceUserResendResponse } from '../interfaces/user/service-user-resend-response.interface'
import { IServiceUserUpdateByIdResponse } from '../interfaces/user/service-user-update-by-id-response.interface'

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy
  ) { }

  @Get()
  @Authorization(true)
  @Permission('user_list')
  @ApiOkResponse({
    type: GetUsersResponseDto,
    description: 'List of user'
  })
  public async getUsers(
    @Res({ passthrough: true }) res: Response,
    @Query() query: ListUserDto
  ): Promise<GetUsersResponseDto> {
    const { search, page, per_page, sort_by, order_by } = query
    const usersResponse: IServiceUserListResponse = await this.userServiceClient
      .send('user_list', {
        type: 'user',
        name: search,
        page: Number(page),
        perPage: Number(per_page),
        sortBy: sort_by,
        orderBy: order_by
      })
      .toPromise()

    res.header('x-total-count', String(usersResponse?.data.totalCount))
    res.header('x-total-page', String(usersResponse?.data.totalPages))

    return {
      message: usersResponse.message,
      data: usersResponse?.data?.users
    }
  }

  @Get()
  @Authorization(true)
  @Permission('user_get_by_id')
  @ApiOkResponse({
    type: GetUserByTokenResponseDto
  })
  public async getUserByToken(
    @Req() request: IAuthorizedRequest
  ): Promise<GetUserByTokenResponseDto> {
    const userInfo = request.user

    const userResponse: IServiceUserGetByIdResponse = await this.userServiceClient
      .send('user_get_by_id', userInfo.id)
      .toPromise()

    return {
      message: userResponse.message,
      data: {
        user: userResponse.data.user
      },
      errors: null
    }
  }

  @Post()
  @ApiCreatedResponse({
    type: CreateUserResponseDto
  })
  public async createUser(
    @Body() userRequest: CreateUserDto
  ): Promise<CreateUserResponseDto> {
    const createUserResponse: IServiceUserCreateResponse = await this.userServiceClient
      .send('user_create', userRequest)
      .toPromise()
    if (createUserResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createUserResponse.message,
          data: null,
          errors: createUserResponse.errors
        },
        createUserResponse.status
      )
    }

    return {
      message: createUserResponse.message,
      data: {
        user: createUserResponse.data.user
      },
      errors: null
    }
  }

  @Get(':id')
  @Authorization(true)
  @Permission('user_get_by_id')
  @ApiOkResponse({
    type: GetUserByIdResponseDto,
    description: 'Find user by id'
  })
  public async getUserById(
    @Param() params: UserIdDto
  ): Promise<GetUserByIdResponseDto> {
    const { id } = params

    const userResponse: IServiceUserGetByIdResponse = await this.userServiceClient
      .send('user_get_by_id', id)
      .toPromise()

    return {
      message: userResponse.message,
      data: userResponse?.data?.user
    }
  }

  @Put(':id')
  @Authorization(true)
  @Permission('user_update_by_id')
  @ApiOkResponse({
    type: UpdateUserResponseDto
  })
  public async updateUser(
    @Param() params: UserIdDto,
    @Body() userRequest: UpdateUserDto
  ): Promise<UpdateUserResponseDto> {
    const updateUserResponse: IServiceUserUpdateByIdResponse = await this.userServiceClient
      .send('user_update_by_id', {
        user: userRequest,
        id: params.id
      })
      .toPromise()

    if (updateUserResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateUserResponse.message,
          errors: updateUserResponse.errors,
          data: null
        },
        updateUserResponse.status
      )
    }

    return {
      message: updateUserResponse.message,
      data: updateUserResponse.user,
      errors: null
    }
  }

  @Post(':id/verify-password')
  @Authorization(true)
  @Permission('user_update_by_id')
  public async verifyUserPassword(
    @Param() params: UserIdDto,
    @Body() body: { password: string }
  ): Promise<{ message: string; errors: any }> {
    const response = await this.userServiceClient
      .send('user_verify_password', { id: params.id, password: body.password })
      .toPromise()

    if (response.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: response.message,
          errors: response.errors,
          data: null
        },
        response.status
      )
    }

    return { message: response.message, errors: null }
  }

  @Delete(':id')
  @Authorization(true)
  @Permission('user_delete_by_id')
  @ApiOkResponse({
    type: DeleteUserResponseDto
  })
  public async deleteUser(
    @Param() params: UserIdDto
  ): Promise<DeleteUserResponseDto> {
    const deleteUserResponse: IServiceUserDeleteResponse = await this.userServiceClient
      .send('user_delete_by_id', {
        id: params.id
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

  @Get(':id/resend')
  @Authorization(true)
  @Permission('user_resend')
  @ApiOkResponse({
    type: ResendMailResponseDto,
    description: 'Resend confirmation email'
  })
  public async getUserResendMail(
    @Param() params: UserIdDto
  ): Promise<ResendMailResponseDto> {
    const { id } = params

    const userResponse: IServiceUserResendResponse = await this.userServiceClient
      .send('user_resend', id)
      .toPromise()

    return {
      message: userResponse.message
    }
  }
}
