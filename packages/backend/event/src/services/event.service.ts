import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { IEventListParams } from '../interfaces/event-list-params.interface'
import { DataResponse } from '../interfaces/event-list-response.interface'
import { IEventUpdateParams } from '../interfaces/event-update-params.interface'
import { IEvent } from '../interfaces/event.interface'

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private readonly EventModel: Model<IEvent> // private readonly EventModel = model('', )
  ) { }

  public async getEventsByUserId(userId: string): Promise<IEvent[]> {
    return this.EventModel.find({ user: userId })
  }

  public async searchEventById(id: string): Promise<IEvent> {
    return this.EventModel.findById(id).populate('user')
  }

  public async createEvent(eventBody: IEvent): Promise<IEvent> {
    const EventModel = new this.EventModel(eventBody)
    return EventModel.save()
  }

  public async findEventById(id: string): Promise<IEvent> {
    return this.EventModel.findById(id)
  }

  public async removeEventById(id: string): Promise<IEvent> {
    return this.EventModel.findOneAndDelete({ _id: id })
  }

  public async publishEventById(id: string): Promise<IEvent> {
    return this.EventModel.findOneAndUpdate(
      { _id: id },
      { status: 'PUBLISHED' },
      { new: true }
    ).populate('user')
  }

  public async updateEventById(
    id: string,
    params: IEventUpdateParams
  ): Promise<IEvent> {
    return this.EventModel.findOneAndUpdate({ _id: id }, params, {
      new: true
    }).populate('user')
  }

  public async listEvents({
    user,
    name,
    page,
    perPage,
    sortBy = 'created_at',
    orderBy = 'ASC'
  }: IEventListParams): Promise<DataResponse> {
    const query: any = {}

    query.$or = [
      { name: new RegExp(name ? '.*' + name + '.*' : '.*', 'i') },
      { initials: new RegExp(name ? '.*' + name + '.*' : '.*', 'i') }
    ]

    if (user.role !== 'ADMIN') query.user = new Types.ObjectId(user.id)

    const sort = JSON.parse(`{"${sortBy}":"${orderBy}"}`)

    const events = await this.EventModel.find(query)
      .populate('user')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort(sort)
      .exec()

    const count = await this.EventModel.countDocuments(query)

    return {
      events,
      totalPages: Math.ceil(count / perPage),
      totalCount: count
    }
  }

  public async getEventPublished(): Promise<number> {
    return this.EventModel.countDocuments({
      status: 'PUBLISHED'
    })
  }
}
