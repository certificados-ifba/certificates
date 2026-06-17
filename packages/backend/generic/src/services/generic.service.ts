import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { IGenericFindParams } from '../interfaces/generic-find-params.interface'
import { IGenericListParams } from '../interfaces/generic-list-params.interface'
import { DataResponse } from '../interfaces/generic-list-response.interface'
import { IGeneric } from '../interfaces/generic.interface'
import { IGenericUpdateParams } from './../interfaces/generic-update-params.interface'

const DEFAULT_CERTIFICATION_TYPES = [
  { type: 'certification', name: 'evento', icon: 'FiCalendar' },
  { type: 'certification', name: 'palestra', icon: 'FiMic' },
  { type: 'certification', name: 'minicurso', icon: 'FiBookOpen' },
  { type: 'certification', name: 'curso', icon: 'FiBook' },
  { type: 'certification', name: 'treinamento', icon: 'FiTarget' },
  { type: 'certification', name: 'capacitação', icon: 'FiAward' },
  { type: 'certification', name: 'bootcamp', icon: 'FiCode' },
  { type: 'certification', name: 'congresso', icon: 'FiUsers' },
  { type: 'certification', name: 'seminário', icon: 'FiClipboard' },
  { type: 'certification', name: 'simpósio', icon: 'FiGlobe' },
  { type: 'certification', name: 'colóquio', icon: 'FiMessageCircle' },
  { type: 'certification', name: 'jornada acadêmica', icon: 'FiCompass' },
  { type: 'certification', name: 'semana acadêmica', icon: 'FiFlag' },
  { type: 'certification', name: 'mesa redonda', icon: 'FiRefreshCw' },
  { type: 'certification', name: 'painel', icon: 'FiLayout' },
  { type: 'certification', name: 'debate', icon: 'FiMessageSquare' },
  { type: 'certification', name: 'visita técnica', icon: 'FiEye' },
  { type: 'certification', name: 'monitoria', icon: 'FiUserCheck' },
  { type: 'certification', name: 'estágio', icon: 'FiBriefcase' },
  { type: 'certification', name: 'hackathon', icon: 'FiZap' },
  { type: 'certification', name: 'maratona de programação', icon: 'FiTerminal' }
]

@Injectable()
export class GenericService implements OnModuleInit {
  constructor(
    @InjectModel('Generic') private readonly GenericModel: Model<IGeneric>
  ) {}

  async onModuleInit() {
    const count = await this.GenericModel.countDocuments({ type: 'certification' })
    if (count === 0) {
      await this.GenericModel.insertMany(DEFAULT_CERTIFICATION_TYPES)
    }
  }

  public async listGenerics({
    type,
    name,
    page,
    perPage,
    sortBy = 'created_at',
    orderBy = 'ASC'
  }: IGenericListParams): Promise<DataResponse> {
    const pattern = name ? '.*' + name + '.*' : '.*'
    const sort = JSON.parse(`{"${sortBy}":"${orderBy}"}`)

    const generics = await this.GenericModel.find({
      type,
      name: new RegExp(pattern, 'i')
    })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort(sort)
      .exec()

    const count = await this.GenericModel.countDocuments({
      type,
      name: new RegExp(pattern, 'i')
    })

    return {
      generics,
      totalPages: Math.ceil(count / perPage),
      totalCount: count
    }
  }

  public async searchGenericByName(
    params: IGenericFindParams
  ): Promise<IGeneric> {
    return this.GenericModel.findOne(params).exec()
  }

  public async searchGenericById(id: string): Promise<IGeneric> {
    return this.GenericModel.findById(id).exec()
  }

  public async createGeneric(genericBody: IGeneric): Promise<IGeneric> {
    const GenericModel = new this.GenericModel(genericBody)
    return await GenericModel.save()
  }

  public async removeGenericById(id: string): Promise<IGeneric> {
    return await this.GenericModel.findOneAndDelete({ _id: id })
  }

  public async updateGenericById(
    id: string,
    params: IGenericUpdateParams
  ): Promise<IGeneric> {
    return await this.GenericModel.updateOne({ _id: id }, params)
  }
}
