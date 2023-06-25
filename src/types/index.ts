import { QueueSettings } from 'bee-queue'

// export interface JobData<T> {
//   eventName: string
//   data: T
//   completedSubscriberIds?: string[] | undefined
// }

// export type BullJob<T> = {
//   data: JobData<T>
// } & Job

export interface EventBusModuleOptions {
  queueName?: string
  queueOptions?: QueueSettings
}
