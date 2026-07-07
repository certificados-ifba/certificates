import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { IGenericFindParams } from '../interfaces/generic-find-params.interface'
import { IGenericListParams } from '../interfaces/generic-list-params.interface'
import { DataResponse } from '../interfaces/generic-list-response.interface'
import { IGeneric } from '../interfaces/generic.interface'
import { IGenericUpdateParams } from './../interfaces/generic-update-params.interface'

@Injectable()
export class GenericService {
  constructor(
    @InjectModel('Generic') private readonly GenericModel: Model<IGeneric>
  ) {}

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
