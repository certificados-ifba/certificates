import { Controller, HttpStatus } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

import { ICertificationTypeListParams } from './interfaces/certification-type-list-params.interface'
import {
  ICertificationTypeByIdResponse,
  ICertificationTypeCreateResponse,
  ICertificationTypeDeleteResponse,
  ICertificationTypeListResponse,
  ICertificationTypeUpdateResponse
} from './interfaces/certification-type-responses.interface'
import { ICertificationType } from './interfaces/certification-type.interface'
import { CertificationTypeService } from './services/certification-type.service'

@Controller()
export class CertificationTypeController {
  constructor(
    private readonly certificationTypeService: CertificationTypeService
  ) {}

  @MessagePattern('certification_type_list')
  public async list(
    params: ICertificationTypeListParams
  ): Promise<ICertificationTypeListResponse> {
    const data = await this.certificationTypeService.list(params)

    return {
      status: HttpStatus.OK,
      message: 'certification_type_list_success',
      data
    }
  }

  @MessagePattern('certification_type_get_by_id')
  public async getById(id: string): Promise<ICertificationTypeByIdResponse> {
    if (!id) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'certification_type_get_by_id_bad_request',
        certificationType: null
      }
    }

    const certificationType = await this.certificationTypeService.searchById(id)

    if (certificationType) {
      return {
        status: HttpStatus.OK,
        message: 'certification_type_get_by_id_success',
        certificationType
      }
    }

    return {
      status: HttpStatus.NOT_FOUND,
      message: 'certification_type_get_by_id_not_found',
      certificationType: null
    }
  }

  @MessagePattern('certification_type_create')
  public async create(
    body: Partial<ICertificationType>
  ): Promise<ICertificationTypeCreateResponse> {
    if (!body || !body.name) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'certification_type_create_bad_request',
        certificationType: null,
        errors: null
      }
    }

    try {
      const exists = await this.certificationTypeService.searchByName(body.name)
      if (exists) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'certification_type_create_conflict_name',
          certificationType: null,
          errors: null
        }
      }

      const certificationType = await this.certificationTypeService.create(body)
      return {
        status: HttpStatus.CREATED,
        message: 'certification_type_create_success',
        certificationType,
        errors: null
      }
    } catch (e) {
      return {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'certification_type_create_precondition_failed',
        certificationType: null,
        errors: e.errors
      }
    }
  }

  @MessagePattern('certification_type_delete_by_id')
  public async deleteById(params: {
    id: string
  }): Promise<ICertificationTypeDeleteResponse> {
    if (!params || !params.id) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'certification_type_delete_by_id_bad_request',
        errors: null
      }
    }

    try {
      const certificationType = await this.certificationTypeService.searchById(
        params.id
      )

      if (!certificationType) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'certification_type_delete_by_id_not_found',
          errors: null
        }
      }

      await this.certificationTypeService.removeById(params.id)
      return {
        status: HttpStatus.OK,
        message: 'certification_type_delete_by_id_success',
        errors: null
      }
    } catch (e) {
      return {
        status: HttpStatus.FORBIDDEN,
        message: 'certification_type_delete_by_id_forbidden',
        errors: e.errors
      }
    }
  }

  @MessagePattern('certification_type_update_by_id')
  public async updateById(params: {
    certificationType: Partial<ICertificationType>
    id: string
  }): Promise<ICertificationTypeUpdateResponse> {
    if (!params.id) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'certification_type_update_by_id_bad_request',
        certificationType: null,
        errors: null
      }
    }

    try {
      const certificationType = await this.certificationTypeService.searchById(
        params.id
      )

      if (!certificationType) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'certification_type_update_by_id_not_found',
          certificationType: null,
          errors: null
        }
      }

      if (params.certificationType.name) {
        const exists = await this.certificationTypeService.searchByName(
          params.certificationType.name
        )
        if (exists && exists.id !== params.id) {
          return {
            status: HttpStatus.CONFLICT,
            message: 'certification_type_update_by_id_conflict_name',
            certificationType: null,
            errors: null
          }
        }
      }

      const updated = Object.assign(certificationType, params.certificationType)
      this.certificationTypeService.updateById(params.id, updated)
      return {
        status: HttpStatus.OK,
        message: 'certification_type_update_by_id_success',
        certificationType: updated,
        errors: null
      }
    } catch (e) {
      return {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'certification_type_update_by_id_precondition_failed',
        certificationType: null,
        errors: e.errors
      }
    }
  }
}
