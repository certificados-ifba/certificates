import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { ICertificationTypeListParams } from '../interfaces/certification-type-list-params.interface'
import { CertificationTypeDataResponse } from '../interfaces/certification-type-responses.interface'
import { ICertificationType } from '../interfaces/certification-type.interface'

const DEFAULT_CERTIFICATION_TYPES = [
  { name: 'evento', icon: 'FiCalendar' },
  { name: 'palestra', icon: 'FiMic' },
  { name: 'minicurso', icon: 'FiBookOpen' },
  { name: 'curso', icon: 'FiBook' },
  { name: 'treinamento', icon: 'FiTarget' },
  { name: 'capacitação', icon: 'FiAward' },
  { name: 'bootcamp', icon: 'FiCode' },
  { name: 'congresso', icon: 'FiUsers' },
  { name: 'seminário', icon: 'FiClipboard' },
  { name: 'simpósio', icon: 'FiGlobe' },
  { name: 'colóquio', icon: 'FiMessageCircle' },
  { name: 'jornada acadêmica', icon: 'FiCompass' },
  { name: 'semana acadêmica', icon: 'FiFlag' },
  { name: 'mesa redonda', icon: 'FiRefreshCw' },
  { name: 'painel', icon: 'FiLayout' },
  { name: 'debate', icon: 'FiMessageSquare' },
  { name: 'visita técnica', icon: 'FiEye' },
  { name: 'monitoria', icon: 'FiUserCheck' },
  { name: 'estágio', icon: 'FiBriefcase' },
  { name: 'hackathon', icon: 'FiZap' },
  { name: 'maratona de programação', icon: 'FiTerminal' }
]

@Injectable()
export class CertificationTypeService implements OnModuleInit {
  constructor(
    @InjectModel('CertificationType')
    private readonly CertificationTypeModel: Model<ICertificationType>
  ) {}

  async onModuleInit() {
    const count = await this.CertificationTypeModel.countDocuments()
    if (count === 0) {
      await this.CertificationTypeModel.insertMany(DEFAULT_CERTIFICATION_TYPES)
    }
  }

  public async list({
    name,
    page,
    perPage,
    sortBy = 'created_at',
    orderBy = 'ASC'
  }: ICertificationTypeListParams): Promise<CertificationTypeDataResponse> {
    const pattern = name ? '.*' + name + '.*' : '.*'
    const sort = JSON.parse(`{"${sortBy}":"${orderBy}"}`)

    const certificationTypes = await this.CertificationTypeModel.find({
      name: new RegExp(pattern, 'i')
    })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort(sort)
      .exec()

    const count = await this.CertificationTypeModel.countDocuments({
      name: new RegExp(pattern, 'i')
    })

    return {
      certificationTypes,
      totalPages: Math.ceil(count / perPage),
      totalCount: count
    }
  }

  public async searchByName(name: string): Promise<ICertificationType> {
    return this.CertificationTypeModel.findOne({ name }).exec()
  }

  public async searchById(id: string): Promise<ICertificationType> {
    return this.CertificationTypeModel.findById(id).exec()
  }

  public async create(
    body: Partial<ICertificationType>
  ): Promise<ICertificationType> {
    const certificationType = new this.CertificationTypeModel(body)
    return await certificationType.save()
  }

  public async removeById(id: string): Promise<ICertificationType> {
    return await this.CertificationTypeModel.findOneAndDelete({ _id: id })
  }

  public async updateById(
    id: string,
    params: Partial<ICertificationType>
  ): Promise<ICertificationType> {
    return await this.CertificationTypeModel.updateOne({ _id: id }, params)
  }
}
