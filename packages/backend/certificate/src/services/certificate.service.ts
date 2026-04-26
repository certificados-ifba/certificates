import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { ICertificateListParams } from '../interfaces/certificate-list-params.interface'
import { DataResponse } from '../interfaces/certificate-list-response.interface'
import { ICertificate } from '../interfaces/certificate.interface'
import { IGeneric } from '../interfaces/generic.interface'
import { IParticipant } from '../interfaces/participant.interface'

@Injectable()
export class CertificateService {
  constructor(
    @InjectModel('Certificate')
    private readonly CertificateModel: Model<ICertificate>,
    @InjectModel('Generic')
    private readonly GenericModel: Model<IGeneric>,
    @InjectModel('User')
    private readonly UserModel: Model<IParticipant>
  ) {}

  public async createCertificate(
    certificateBody: ICertificate
  ): Promise<ICertificate> {
    const duplicateCertificate = await this.CertificateModel.findOne({
      participant: certificateBody.participant,
      event: certificateBody.event,
      activity: certificateBody.activity,
      function: certificateBody.function
    })

    if (duplicateCertificate) {
      throw new Error(
        'Já existe um certificado para este participante nesta atividade com esta função'
      )
    }
    const existingCertificateInActivity = await this.CertificateModel.findOne({
      participant: certificateBody.participant,
      event: certificateBody.event,
      activity: certificateBody.activity,
      function: { $ne: certificateBody.function }
    })

    if (existingCertificateInActivity) {
      throw new Error(
        'O participante já possui outra função cadastrada nesta atividade'
      )
    }

    const CertificateModel = new this.CertificateModel(certificateBody)
    return await CertificateModel.save()
  }

  public async findCertificateById(id: string): Promise<ICertificate> {
    return await this.CertificateModel.findById(id)
  }

  public async findCertificateByKey(key: string): Promise<ICertificate> {
    return await this.CertificateModel.findOne({ key })
      .populate('function')
      .populate('activity')
      .populate('participant')
      .populate('event')
  }

  public async removeCertificateById(id: string): Promise<ICertificate> {
    return await this.CertificateModel.findOneAndDelete({ _id: id })
  }

  public async listCertificates({
    user,
    event,
    name,
    page = 1,
    perPage = 10,
    sortBy = 'created_at',
    orderBy = 'ASC'
  }: ICertificateListParams): Promise<DataResponse> {
    const matchStage: any = {}

    if (event) matchStage.event = new Types.ObjectId(event)
    if (user) matchStage.participant = new Types.ObjectId(user)
    if (name) {
      const formattedSearch = String(name).trim()
      const cpfSearch = formattedSearch.replace(/\D/g, '')
      const participants = await this.UserModel.find({
        $or: [
          { name: { $regex: formattedSearch, $options: 'i' } },
          ...(cpfSearch
            ? [{ 'personal_data.cpf': { $regex: cpfSearch, $options: 'i' } }]
            : [])
        ]
      })
        .select('_id')
        .lean()
      const participantIds = participants.map(({ _id }) => new Types.ObjectId(_id))

      if (matchStage.participant) {
        const fixedParticipant = matchStage.participant
        matchStage.participant = {
          $in: participantIds.filter(
            participantId => String(participantId) === String(fixedParticipant)
          )
        }
      } else {
        matchStage.participant = {
          $in: participantIds
        }
      }
    }

    const sort = JSON.parse(`{"${sortBy}":"${orderBy}"}`)

    const certificates = await this.CertificateModel.find(matchStage)
      .populate('function')
      .populate('activity')
      .populate(user ? 'event' : 'participant')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort(sort)
      .exec()

    const count = await this.CertificateModel.countDocuments(matchStage)

    return {
      certificates,
      totalPages: Math.ceil(count / perPage),
      totalCount: count
    }
  }

  public async findGenericById(id: string): Promise<IGeneric> {
    return this.GenericModel.findById(id).exec()
  }

  public async getCertificateIssued(): Promise<number> {
    const certificates = await this.CertificateModel.aggregate()
      .lookup({
        from: 'events',
        localField: 'event',
        foreignField: '_id',
        as: 'event'
      })
      .match({ 'event.status': 'PUBLISHED' })
    return certificates?.length
  }
}
