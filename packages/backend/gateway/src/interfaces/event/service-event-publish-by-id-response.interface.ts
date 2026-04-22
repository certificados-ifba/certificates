import { IEvent } from './event.interface'

export interface IServiceEventPublishByIdResponse {
    status: number
    message: string
    event: IEvent | null
    errors: { [key: string]: any } | null
}
