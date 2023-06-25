"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/utils");
const bullmq_1 = require("bullmq");
const QUEUE_NAME = 'joonieshop-event-queue';
class EventBusService extends utils_1.AbstractEventBusModuleService {
    constructor({ logger, redis }, moduleOptions = {}) {
        super();
        this.pauseInterval_ = null;
        this.pauseTimeout_ = null;
        this.processor_ = async (job) => {
            const { eventName, data } = job.data;
            const eventSubscribers = this.eventToSubscribersMap.get(eventName) || [];
            const wildcardSubscribers = this.eventToSubscribersMap.get('*') || [];
            const subscribers = [...eventSubscribers, ...wildcardSubscribers];
            const completedSubscribers = job.data.completedSubscriberIds || [];
            const subscribersInCurrentAttempt = subscribers.filter((subscriber) => subscriber.id && !completedSubscribers.includes(subscriber.id));
            const currentAttempt = job.attemptsMade;
            const isRetry = currentAttempt > 1;
            const configuredAttempts = job.opts.attempts;
            const isFinalAttempt = currentAttempt === configuredAttempts;
            if (isRetry) {
                if (isFinalAttempt) {
                    this.logger_.info(`Final retry attempt for ${eventName}`);
                }
                this.logger_.info(`Retrying ${eventName} which has ${eventSubscribers.length} subscribers (${subscribersInCurrentAttempt.length} of them failed)`);
            }
            else {
                this.logger_.info(`Processing ${eventName} which has ${eventSubscribers.length} subscribers`);
            }
            const completedSubscribersInCurrentAttempt = [];
            const subscribersResult = await Promise.all(subscribersInCurrentAttempt.map(async ({ id, subscriber }) => {
                return await subscriber(data, eventName)
                    .then((data) => {
                    completedSubscribersInCurrentAttempt.push(id);
                    return data;
                })
                    .catch((err) => {
                    this.logger_.warn(`An error occurred while processing ${eventName}: ${err}`);
                    return err;
                });
            }));
            const didSubscribersFail = completedSubscribersInCurrentAttempt.length !==
                subscribersInCurrentAttempt.length;
            const isRetriesConfigured = configuredAttempts > 1;
            const shouldRetry = didSubscribersFail && isRetriesConfigured && !isFinalAttempt;
            if (shouldRetry) {
                const updatedCompletedSubscribers = [
                    ...completedSubscribers,
                    ...completedSubscribersInCurrentAttempt,
                ];
                job.data.completedSubscriberIds = updatedCompletedSubscribers;
                await job.updateData(job.data);
                const errorMessage = `One or more subscribers of ${eventName} failed. Retrying...`;
                this.logger_.warn(errorMessage);
                return Promise.reject(Error(errorMessage));
            }
            if (didSubscribersFail && !isFinalAttempt) {
                this.logger_.warn(`One or more subscribers of ${eventName} failed. Retrying is not configured. Use 'attempts' option when emitting events.`);
            }
            return Promise.resolve(subscribersResult);
        };
        this.setupWorker = () => {
            if (!this.moduleOptions_.setupWorkerOptions)
                return;
            if (this.moduleOptions_.setupWorkerOptions.pauseInterval <
                this.moduleOptions_.setupWorkerOptions.pauseDuration) {
                throw new Error('The Worker pause interval must be greater than or equal to the Worker pause duration');
            }
            if (this.pauseInterval_)
                clearInterval(this.pauseInterval_);
            if (this.pauseTimeout_)
                clearTimeout(this.pauseTimeout_);
            if (this.moduleOptions_.setupWorkerOptions.pauseInterval ===
                this.moduleOptions_.setupWorkerOptions.pauseDuration) {
                this.pauseInterval_ = setInterval(() => {
                    const isPaused = this.worker_.isPaused();
                    if (isPaused)
                        this.worker_.resume();
                    else
                        this.worker_.pause();
                }, this.moduleOptions_.setupWorkerOptions.pauseInterval ?? 60 * 60 * 1000);
            }
            else {
                this.pauseInterval_ = setInterval(() => {
                    this.worker_.pause();
                    if (!this.pauseTimeout_) {
                        this.pauseTimeout_ = setTimeout(() => this.worker_.resume(), this.moduleOptions_.setupWorkerOptions?.pauseDuration ??
                            30 * 60 * 1000);
                    }
                    else {
                        this.pauseTimeout_.refresh();
                    }
                }, this.moduleOptions_.setupWorkerOptions?.pauseInterval ?? 15 * 60 * 1000);
            }
        };
        this.logger_ = logger;
        this.moduleOptions_ = moduleOptions;
        this.queue_ = new bullmq_1.Queue(moduleOptions.queueName ?? QUEUE_NAME, {
            ...(moduleOptions.queueOptions ?? {}),
            // @ts-ignore -- Vercel KV types do not match IORedis types (used under the hood by bullmq)
            connection: redis,
        });
        this.worker_ = new bullmq_1.Worker(moduleOptions.queueName ?? QUEUE_NAME, this.processor_, {
            ...(moduleOptions.workerOptions ?? {}),
            // @ts-ignore -- Vercel KV types do not match IORedis types (used under the hood by bullmq)
            connection: redis,
        });
        this.setupWorker();
    }
    async emit(eventNameOrData, data, options = {}) {
        const globalJobOptions = this.moduleOptions_.jobOptions ?? {};
        const isBulkEmit = Array.isArray(eventNameOrData);
        const opts = {
            removeOnComplete: true,
            attempts: 1,
            ...globalJobOptions,
        };
        const events = isBulkEmit
            ? eventNameOrData.map((event) => ({
                name: event.eventName,
                data: { eventName: event.eventName, data: event.data },
                opts: { ...opts, ...event.options },
            }))
            : [
                {
                    name: eventNameOrData,
                    data: { eventName: eventNameOrData, data },
                    opts: { ...opts, ...options },
                },
            ];
        await this.queue_.addBulk(events);
    }
}
exports.default = EventBusService;
//# sourceMappingURL=event-bus.js.map