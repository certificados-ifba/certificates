import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { ApiTags, ApiOkResponse } from '@nestjs/swagger'

import { GetResumeResponseDto } from '../interfaces/resume/dto/get-resume-response.dto'
import { GetResumeDto } from '../interfaces/resume/dto/get-resume.dto'
import { IServiceResumeResponse } from '../interfaces/resume/service-resume-response.interface'

@Controller('resume')
@ApiTags('resume')
export class ResumeController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
    @Inject('TIPO_CERTIFICADO_SERVICE')
    private readonly eventServiceClient: ClientProxy,
    @Inject('CERTIFICATE_SERVICE')
    private readonly certificateServiceClient: ClientProxy
  ) {}

  @Get()
  @ApiOkResponse({
    type: GetResumeDto
  })
  public async getResume(): Promise<GetResumeResponseDto> {
    try {
      const participants: IServiceResumeResponse = await this.userServiceClient
        .send('participant_registered', {})
        .toPromise()

      const events: IServiceResumeResponse = await this.eventServiceClient
        .send('event_published', {})
        .toPromise()

      const certificates: IServiceResumeResponse = await this.certificateServiceClient
        .send('certificate_issued', {})
        .toPromise()

      return {
        message: 'get_resume_success',
        data: {
          events: events?.data || 0,
          participants: participants?.data || 0,
          certificates: certificates?.data || 0
        },
        errors: null
      }
    } catch (err) {
      console.error(err)
      throw new HttpException(
        {
          message: 'get_resume_error',
          data: null,
          errors: null
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
