import BeeQueue, { Job } from 'bee-queue'
import { Logger } from '@medusajs/modules-sdk'
import { EmitData, SubscriberDescriptor } from '@medusajs/types'
import { AbstractEventBusModuleService } from '@medusajs/utils'
import { EventBusModuleOptions } from '../types'

interface InjectedDependencies {
  logger: Logger
}

const QUEUE_NAME = 'joonieshop-event-queue'

export default class EventBusService extends AbstractEventBusModuleService {
  protected readonly logger_: Logger
  protected readonly moduleOptions_: EventBusModuleOptions
  protected queue_: BeeQueue

  constructor(
    { logger }: InjectedDependencies,
    moduleOptions: EventBusModuleOptions
  ) {
    // @ts-ignore
    super(...arguments)

    this.logger_ = logger
    this.moduleOptions_ = moduleOptions

    const queueName = moduleOptions.queueName ?? QUEUE_NAME

    this.queue_ = new BeeQueue(queueName, {
      prefix: 'joonieshop',
      stallInterval: 5 * 60 * 1000,
      delayedDebounce: 5 * 60 * 1000,
      redis: {
        url: moduleOptions.redisUrl,
      },
      removeOnSuccess: true,
      ...(moduleOptions.queueOptions ?? {}),
    })

    this.queue_.on('ready', () => {
      this.logger_.info('joonieshop-event-bus: queue is ready.')
    })

    this.queue_.on('error', (err) => {
      this.logger_.warn(`joonieshop-event-bus: queue error - ${err.message}`)
    })

    this.queue_.process(this.processor_)
  }

  async emit<T>(
    eventName: string,
    data: T,
    options: Record<string, unknown>
  ): Promise<void>

  async emit<T>(data: EmitData<T>[]): Promise<void>

  async emit<T, TInput extends string | EmitData<T>[] = string>(
    eventNameOrData: unknown,
    data?: unknown,
    options?: Record<string, unknown>
  ): Promise<void> {
    const events = Array.isArray(eventNameOrData)
      ? eventNameOrData
      : [{ eventName: eventNameOrData, data }]

    const jobs = events.map((event) => {
      const job = { name: event.eventName, data: event.data }
      return this.queue_.createJob(job)
    })

    this.queue_.saveAll(jobs)
  }

  processor_ = async (job: Job<{ name: string; data: unknown }>) => {
    const { name, data } = job.data
    const eventSubscribers = this.eventToSubscribersMap.get(name) || []
    const wildcardSubscribers = this.eventToSubscribersMap.get('*') || []

    const subscribers: SubscriberDescriptor[] = [
      ...eventSubscribers,
      ...wildcardSubscribers,
    ]

    this.logger_.info(
      `Processing ${name} which has ${eventSubscribers.length} subscribers`
    )

    const subscribersResult = await Promise.all(
      subscribers.map(async ({ subscriber }) => {
        return await subscriber(data, name).catch((err) => {
          this.logger_.warn(
            `An error occurred while processing ${name}: ${err}`
          )
          return err
        })
      })
    )

    return Promise.resolve(subscribersResult)
  }
}
