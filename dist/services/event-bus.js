"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bee_queue_1 = __importDefault(require("bee-queue"));
const utils_1 = require("@medusajs/utils");
const QUEUE_NAME = 'joonieshop-event-queue';
class EventBusService extends utils_1.AbstractEventBusModuleService {
    constructor({ logger }, moduleOptions) {
        // @ts-ignore
        super(...arguments);
        this.processor_ = async (job) => {
            const { name, data } = job.data;
            const eventSubscribers = this.eventToSubscribersMap.get(name) || [];
            const wildcardSubscribers = this.eventToSubscribersMap.get('*') || [];
            const subscribers = [
                ...eventSubscribers,
                ...wildcardSubscribers,
            ];
            this.logger_.info(`Processing ${name} which has ${eventSubscribers.length} subscribers`);
            const subscribersResult = await Promise.all(subscribers.map(async ({ subscriber }) => {
                return await subscriber(data, name).catch((err) => {
                    this.logger_.warn(`An error occurred while processing ${name}: ${err}`);
                    return err;
                });
            }));
            return Promise.resolve(subscribersResult);
        };
        this.logger_ = logger;
        this.moduleOptions_ = moduleOptions;
        const queueName = moduleOptions.queueName ?? QUEUE_NAME;
        this.queue_ = new bee_queue_1.default(queueName, {
            prefix: 'joonieshop',
            stallInterval: 5 * 60 * 1000,
            delayedDebounce: 5 * 60 * 1000,
            redis: {
                url: moduleOptions.redisUrl,
            },
            removeOnSuccess: true,
            ...(moduleOptions.queueOptions ?? {}),
        });
        this.queue_.on('ready', () => {
            this.logger_.info('joonieshop-event-bus: queue is ready.');
        });
        this.queue_.on('error', (err) => {
            this.logger_.warn(`joonieshop-event-bus: queue error - ${err.message}`);
        });
        this.queue_.process(this.processor_);
    }
    async emit(eventNameOrData, data, options) {
        const events = Array.isArray(eventNameOrData)
            ? eventNameOrData
            : [{ eventName: eventNameOrData, data }];
        const jobs = events.map((event) => {
            const job = { name: event.eventName, data: event.data };
            return this.queue_.createJob(job);
        });
        this.queue_.saveAll(jobs);
    }
}
exports.default = EventBusService;
//# sourceMappingURL=event-bus.js.map