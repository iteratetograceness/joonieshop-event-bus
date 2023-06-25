/// <reference types="node" />
import { VercelKV } from '@vercel/kv';
import { Logger } from '@medusajs/modules-sdk';
import { EmitData } from '@medusajs/types';
import { AbstractEventBusModuleService } from '@medusajs/utils';
import { Queue, Worker } from 'bullmq';
import { BullJob, EventBusModuleOptions } from '../types';
interface InjectedDependencies {
    logger: Logger;
    redis: VercelKV;
}
export default class EventBusService extends AbstractEventBusModuleService {
    protected readonly logger_: Logger;
    protected readonly moduleOptions_: EventBusModuleOptions;
    protected queue_: Queue;
    protected worker_: Worker;
    protected pauseInterval_: NodeJS.Timeout | null;
    protected pauseTimeout_: NodeJS.Timeout | null;
    constructor({ logger, redis }: InjectedDependencies, moduleOptions?: EventBusModuleOptions);
    emit<T>(eventName: string, data: T, options: Record<string, unknown>): Promise<void>;
    emit<T>(data: EmitData<T>[]): Promise<void>;
    processor_: <T>(job: BullJob<T>) => Promise<unknown>;
    setupWorker: () => void;
}
export {};
