import { Controller, HttpStatus, Inject } from '@nestjs/common'
import { ClientProxy, MessagePattern } from '@nestjs/microservices'

import { IParticipantRegisteredResponse } from './interfaces/participant-registered-response.interface'
import { IUserConfirmResponse } from './interfaces/user-confirm-response.interface'
import { IUserCreateResponse } from './interfaces/user-create-response.interface'
import { IUserDeleteResponse } from './interfaces/user-delete-response.interface'
import { IUserForgotPasswordResponse } from './interfaces/user-forgot-password-response.interface'
import { IUserGetByLinkResponse } from './interfaces/user-get-by-link-response.interface'
import { IUserLink } from './interfaces/user-link.interface'
import { IUserListParams } from './interfaces/user-list-params.interface'
import { IUserListResponse } from './interfaces/user-list-response.interface'
import { IUserResendResponse } from './interfaces/user-resend-response.interface'
import { IUserSearchResponse } from './interfaces/user-search-response.interface'
import { IUserUpdateByIdResponse } from './interfaces/user-update-by-id-response.interface'
import { IUserUpdateParams } from './interfaces/user-update-params.interface'
import { IUser } from './interfaces/user.interface'
import { UserService } from './services/user.service'
import { securePassword } from './utils/generators'

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('MAILER_SERVICE') private readonly mailerServiceClient: ClientProxy
  ) { }

  @MessagePattern('user_auth_participant')
  public async userAuthParticipant(searchParams: {
    cpf: string
    dob: Date
    token: string
  }): Promise<IUserSearchResponse> {
    let result: IUserSearchResponse

    if (searchParams.cpf && searchParams.dob) {
      const user = await this.userService.searchUserByCpf(
        searchParams.cpf,
        'PARTICIPANT'
      )

      if (user && user.role === 'PARTICIPANT') {
        const isValid = await this.userService.validToken(searchParams.token)

        if (!isValid) {
          result = {
            status: HttpStatus.UNAUTHORIZED,
            message: 'user_search_by_credentials_invalid',
            data: null
          }
        } else {
          const defaultDate = new Date('2017-12-23T00:00:00.000Z')
          const userDobTime = user.personal_data.dob ? new Date(user.personal_data.dob).getTime() : null
          const isDefaultDate = userDobTime === defaultDate.getTime()

          // Se o usuário não tem data de nascimento cadastrada ou tem a data padrão, atualiza com a fornecida
          if (!user.personal_data.dob || isDefaultDate) {
            const userUpdated = await this.userService.updateUserById(user.id, {
              last_login: new Date(),
              personal_data: {
                cpf: user.personal_data.cpf,
                dob: new Date(searchParams.dob),
                institution: user.personal_data.institution,
                phone: user.personal_data.phone
              }
            })

            result = {
              status: HttpStatus.OK,
              message: 'user_search_by_credentials_success',
              data: { user: userUpdated }
            }
          } else if (
            new Date(user.personal_data.dob).getTime() ===
            new Date(searchParams.dob).getTime()
          ) {
            const userUpdeted = await this.userService.updateUserById(user.id, {
              last_login: new Date()
            })

            result = {
              status: HttpStatus.OK,
              message: 'user_search_by_credentials_success',
              data: { user: userUpdeted }
            }
          } else {
            result = {
              status: HttpStatus.NOT_FOUND,
              message: 'user_search_by_credentials_not_match',
              data: null
            }
          }
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_search_by_credentials_not_found',
          data: null
        }
      }
    } else {
      result = {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_found',
        data: null
      }
    }

    return result
  }

  @MessagePattern('user_search_by_credentials')
  public async searchUserByCredentials({
    email,
    password
  }: {
    email: string
    password: string
  }): Promise<IUserSearchResponse> {
    if (!email || !password)
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_match',
        data: null
      }

    const user = await this.userService.searchUserByEmail(email)
    if (!user)
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_match',
        data: null
      }

    const auth = user.compareEncryptedPassword(password)
    if (!auth)
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_match',
        data: null
      }
    try {
      const userUpdeted = await this.userService.updateUserById(user.id, {
        last_login: new Date()
      })

      if (!userUpdeted)
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'user_search_by_credentials_not_match',
          data: null
        }
      return {
        status: HttpStatus.OK,
        message: 'user_search_by_credentials_success',
        data: { user: userUpdeted }
      }
    } catch (e) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_match',
        data: null
      }
    }
  }

  @MessagePattern('user_list')
  public async userList(params: IUserListParams): Promise<IUserListResponse> {
    const users = await this.userService.listUsers(params)

    return {
      status: HttpStatus.OK,
      message: 'user_list_success',
      data: users
    }
  }

  @MessagePattern('user_get_by_id')
  public async getUserById(id: string): Promise<IUserSearchResponse> {
    let result: IUserSearchResponse

    if (id) {
      const user = await this.userService.searchUserById(id)
      if (user) {
        result = {
          status: HttpStatus.OK,
          message: 'user_get_by_id_success',
          data: { user }
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_get_by_id_not_found',
          data: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_get_by_id_bad_request',
        data: null
      }
    }

    return result
  }

  @MessagePattern('user_get_by_cpf')
  public async getUserByCpf(cpf: string): Promise<IUserSearchResponse> {
    let result: IUserSearchResponse

    if (cpf) {
      const cleanCpf = cpf.replace(/[^\d]+/g, '')
      const user = await this.userService.searchUserByCpf(
        cleanCpf,
        'PARTICIPANT'
      )
      if (user) {
        result = {
          status: HttpStatus.OK,
          message: 'user_get_by_cpf_success',
          data: { user }
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_get_by_cpf_not_found',
          data: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_get_by_cpf_bad_request',
        data: null
      }
    }

    return result
  }

  @MessagePattern('user_get_by_link')
  public async getUserByLink(link: string): Promise<IUserGetByLinkResponse> {
    let result: IUserGetByLinkResponse

    if (link) {
      const userLink = await this.userService.getUserLink(link)
      if (userLink) {
        if (userLink.expired && userLink.expired < Date.now()) {
          result = {
            status: HttpStatus.GONE,
            message: 'user_get_by_link_expired',
            data: null
          }
        } else {
          result = {
            status: HttpStatus.OK,
            message: 'user_get_by_link_success',
            data: userLink.expired ? 'reset' : 'register'
          }
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_get_by_link_not_found',
          data: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_get_by_link_bad_request',
        data: null
      }
    }

    return result
  }

  @MessagePattern('user_confirm')
  public async confirmUser(confirmParams: {
    password: string
    link: string
  }): Promise<IUserConfirmResponse> {
    let result: IUserConfirmResponse
    if (confirmParams) {
      const userLink = await this.userService.getUserLink(confirmParams.link)

      if (userLink) {
        const user = await this.userService.updateUserById(userLink.user, {
          last_login: new Date(),
          password: confirmParams.password,
          is_confirmed: true
        })
        await this.userService.updateUserLinkById(userLink.id, {
          is_used: true
        })
        result = {
          status: HttpStatus.OK,
          message: 'user_confirm_success',
          user,
          errors: null
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_confirm_not_found',
          user: null,
          errors: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_confirm_bad_request',
        user: null,
        errors: null
      }
    }

    return result
  }

  @MessagePattern('user_forgot_password')
  public async forgotPasswordUser(forgotPasswordParams: {
    email: string
  }): Promise<IUserForgotPasswordResponse> {
    let result: IUserForgotPasswordResponse
    const user = await this.userService.searchUserByEmail(
      forgotPasswordParams.email
    )
    if (user) {
      const userLink = await this.userService.createUserLink(
        user.id,
        Date.now() + 2 * 60 * 60 * 1000
      )
      result = {
        status: HttpStatus.OK,
        message: 'user_forgot_password_success',
        errors: null
      }
      console.log({
        name: user.name,
        email: user.email,
        link: this.userService.getConfirmationLink(userLink.link),
        site: this.userService.getWebUrl()
      })

      this.mailerServiceClient
        .send('mail_send', {
          to: user.email,
          subject: 'Recuperação de senha',
          template: '/templates/forgot_password',
          context: {
            name: user.name,
            email: user.email,
            link: this.userService.getConfirmationLink(userLink.link),
            site: this.userService.getWebUrl()
          }
        })
        .toPromise()
    } else {
      result = {
        status: HttpStatus.NOT_FOUND,
        message: 'user_forgot_password_not_found',
        errors: null
      }
    }

    return result
  }

  @MessagePattern('user_resend')
  public async resendMail(id: string): Promise<IUserResendResponse> {
    let result: IUserResendResponse
    let userLink: IUserLink
    const user = await this.userService.searchUserById(id)

    if (user) {
      if (user.is_confirmed) {
        userLink = await this.userService.createUserLink(
          user.id,
          Date.now() + 2 * 60 * 60 * 1000
        )
        this.mailerServiceClient
          .send('mail_send', {
            to: user.email,
            subject: 'Recuperação de senha',
            template: '/templates/forgot_password',
            context: {
              name: user.name,
              email: user.email,
              link: this.userService.getConfirmationLink(userLink.link),
              site: this.userService.getWebUrl()
            }
          })
          .toPromise()
      } else {
        userLink = await this.userService.getUserLinkByUser(user.id)
        if (!userLink) {
          userLink = await this.userService.createUserLink(
            user.id,
            user.role === 'PARTICIPANT' ? Date.now() + 48 * 60 * 60 * 1000 : undefined
          )
        }
        const confirmLink = user.role === 'PARTICIPANT'
          ? this.userService.getParticipantConfirmationLink(userLink.link)
          : this.userService.getConfirmationLink(userLink.link)
        this.mailerServiceClient
          .send('mail_send', {
            to: user.email,
            subject: 'E-mail de Confirmação',
            template: '/templates/confirm_email',
            context: {
              name: user.name,
              email: user.email,
              link: confirmLink,
              site: this.userService.getWebUrl()
            }
          })
          .toPromise()
      }
      result = {
        status: HttpStatus.OK,
        message: 'user_resend_success'
      }
    } else {
      result = {
        status: HttpStatus.NOT_FOUND,
        message: 'user_resend_not_found'
      }
    }

    return result
  }

  @MessagePattern('user_create')
  public async createUser(userParams: IUser): Promise<IUserCreateResponse> {
    let result: IUserCreateResponse

    if (
      userParams &&
      (userParams.role !== 'PARTICIPANT' ||
        (userParams.role === 'PARTICIPANT' &&
          userParams.personal_data.cpf))
    ) {
      const usersWithEmail = await this.userService.searchUserByEmail(
        userParams.email
      )
      if (usersWithEmail && userParams.email) {
        result = {
          status: HttpStatus.CONFLICT,
          message: 'user_create_conflict',
          data: null,
          errors: {
            email: {
              message: 'E-mail already registered',
              path: 'email'
            }
          }
        }
      } else {
        try {
          if (userParams.role !== 'PARTICIPANT') {
            userParams.is_confirmed = false
            userParams.password = securePassword()
          } else {
            const usersWithCPF = await this.userService.searchUserByCpf(
              userParams.personal_data.cpf
            )
            if (usersWithCPF) {
              return {
                status: HttpStatus.CONFLICT,
                message: 'user_create_conflict',
                data: null,
                errors: {
                  cpf: {
                    message: 'CPF already registered',
                    path: 'cpf'
                  }
                }
              }
            }
            userParams.is_confirmed = false
          }

          const createdUser = await this.userService.createUser(userParams)
          delete createdUser.password
          result = {
            status: HttpStatus.CREATED,
            message: 'user_create_success',
            data: { user: createdUser },
            errors: null
          }
          if (userParams.role !== 'PARTICIPANT') {
            const userLink = await this.userService.createUserLink(
              createdUser.id
            )
            this.mailerServiceClient
              .send('mail_send', {
                to: createdUser.email,
                subject: 'E-mail de Confirmação',
                template: '/templates/confirm_email',
                context: {
                  name: createdUser.name,
                  email: createdUser.email,
                  link: this.userService.getConfirmationLink(userLink.link),
                  site: this.userService.getWebUrl()
                }
              })
              .toPromise()
          } else if (createdUser.email) {
            const userLink = await this.userService.createUserLink(
              createdUser.id,
              Date.now() + 48 * 60 * 60 * 1000
            )
            this.mailerServiceClient
              .send('mail_send', {
                to: createdUser.email,
                subject: 'E-mail de Confirmação',
                template: '/templates/confirm_email',
                context: {
                  name: createdUser.name,
                  email: createdUser.email,
                  link: this.userService.getParticipantConfirmationLink(userLink.link),
                  site: this.userService.getWebUrl()
                }
              })
              .toPromise()
          }
        } catch (e) {
          result = {
            status: HttpStatus.PRECONDITION_FAILED,
            message: 'user_create_precondition_failed',
            data: null,
            errors: e.errors
          }
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_create_bad_request',
        data: null,
        errors: null
      }
    }

    return result
  }

  @MessagePattern('user_update_by_id')
  public async userUpdateById(params: {
    user: IUserUpdateParams
    id: string
  }): Promise<IUserUpdateByIdResponse> {
    let result: IUserUpdateByIdResponse
    if (params.id) {
      try {
        const user = await this.userService.searchUserById(params.id)
        if (user) {
          const newCpf = params.user?.personal_data?.cpf
          if (newCpf && newCpf !== user.personal_data?.cpf) {
            const usersWithCPF = await this.userService.searchUserByCpf(newCpf)
            if (usersWithCPF) {
              return {
                status: HttpStatus.CONFLICT,
                message: 'user_update_by_id_conflict',
                user: null,
                errors: {
                  cpf: {
                    message: 'CPF already registered',
                    path: 'cpf'
                  }
                }
              }
            }
          }

          const updatedUser = Object.assign(user, params.user)

          if (params.user.email && params.user.email !== user.email) {
            const usersWithEmail = await this.userService.searchUserByEmail(
              params.user.email
            )
            if (params.user.email && usersWithEmail) {
              return {
                status: HttpStatus.CONFLICT,
                message: 'user_update_by_id_conflict',
                user: null,
                errors: {
                  email: {
                    message: 'E-mail already registered',
                    path: 'email'
                  }
                }
              }
            }
            if (user.role === 'PARTICIPANT') {
              updatedUser.is_confirmed = false
            }
          }
          await this.userService.updateUserById(updatedUser.id, updatedUser)
          if (
            params.user.email &&
            params.user.email !== user.email &&
            user.role === 'PARTICIPANT' &&
            updatedUser.email
          ) {
            const userLink = await this.userService.createUserLink(
              updatedUser.id,
              Date.now() + 48 * 60 * 60 * 1000
            )
            this.mailerServiceClient
              .send('mail_send', {
                to: updatedUser.email,
                subject: 'Confirme seu novo e-mail',
                template: '/templates/confirm_email',
                context: {
                  name: updatedUser.name,
                  email: updatedUser.email,
                  link: this.userService.getParticipantConfirmationLink(userLink.link),
                  site: this.userService.getWebUrl()
                }
              })
              .toPromise()
          }
          result = {
            status: HttpStatus.OK,
            message: 'user_update_by_id_success',
            user: updatedUser,
            errors: null
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'user_update_by_id_not_found',
            user: null,
            errors: null
          }
        }
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'user_update_by_id_precondition_failed',
          user: null,
          errors: e.errors
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_update_by_id_bad_request',
        user: null,
        errors: null
      }
    }

    return result
  }

  @MessagePattern('user_delete_by_id')
  public async userDeleteForUser(params: {
    id: string
    participant?: boolean
  }): Promise<IUserDeleteResponse> {
    let result: IUserDeleteResponse

    if (params && params.id) {
      try {
        const user = await this.userService.searchUserById(params.id)

        if (params.participant && user.role !== 'PARTICIPANT')
          throw new Error('Not allowed')

        if (user) {
          await this.userService.removeUserById(params.id)
          result = {
            status: HttpStatus.OK,
            message: 'user_delete_by_id_success',
            errors: null
          }
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'user_delete_by_id_not_found',
            errors: null
          }
        }
      } catch (e) {
        result = {
          status: HttpStatus.FORBIDDEN,
          message: 'user_delete_by_id_forbidden',
          errors: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_delete_by_id_bad_request',
        errors: null
      }
    }

    return result
  }

  @MessagePattern('participant_registered')
  public async getParticipantRegistered(): Promise<
    IParticipantRegisteredResponse
  > {
    const quantity = await this.userService.getParticipantRegistered()

    return {
      status: HttpStatus.OK,
      message: 'get_participant_registered_success',
      data: quantity
    }
  }

  @MessagePattern('participant_confirm')
  public async confirmParticipant(link: string): Promise<IUserConfirmResponse> {
    let result: IUserConfirmResponse

    if (link) {
      const userLink = await this.userService.getUserLink(link)
      if (userLink) {
        const user = await this.userService.updateUserById(userLink.user, {
          is_confirmed: true
        })
        await this.userService.updateUserLinkById(userLink.id, {
          is_used: true
        })
        result = {
          status: HttpStatus.OK,
          message: 'participant_confirm_success',
          user,
          errors: null
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'participant_confirm_not_found',
          user: null,
          errors: null
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'participant_confirm_bad_request',
        user: null,
        errors: null
      }
    }

    return result
  }

  @MessagePattern('user_verify_password')
  public async userVerifyPassword(params: {
    id: string
    password: string
  }): Promise<{ status: number; message: string; errors: any }> {
    if (!params?.id || !params?.password) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_verify_password_bad_request',
        errors: null
      }
    }

    try {
      const user = await this.userService.searchUserById(params.id)

      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'user_verify_password_not_found',
          errors: null
        }
      }

      const isMatch = user.compareEncryptedPassword(params.password)

      if (!isMatch) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: 'user_verify_password_invalid',
          errors: { password: { message: 'Senha incorreta', path: 'password' } }
        }
      }

      return {
        status: HttpStatus.OK,
        message: 'user_verify_password_success',
        errors: null
      }
    } catch (e) {
      return {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'user_verify_password_precondition_failed',
        errors: e.errors
      }
    }
  }
}
