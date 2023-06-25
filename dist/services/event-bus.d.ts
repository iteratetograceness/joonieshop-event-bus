import { VercelKV } from '@vercel/kv';
import BeeQueue, { Job } from 'bee-queue';
import { Logger } from '@medusajs/modules-sdk';
import { EmitData } from '@medusajs/types';
import { AbstractEventBusModuleService } from '@medusajs/utils';
import { EventBusModuleOptions } from '../types';
interface InjectedDependencies {
    logger: Logger;
    redis: VercelKV;
}
export default class EventBusService extends AbstractEventBusModuleService {
    protected readonly logger_: Logger;
    protected readonly moduleOptions_: EventBusModuleOptions;
    protected queue_: BeeQueue;
    constructor({ logger, redis }: InjectedDependencies, moduleOptions?: EventBusModuleOptions);
    emit<T>(eventName: string, data: T, options: Record<string, unknown>): Promise<void>;
    emit<T>(data: EmitData<T>[]): Promise<void>;
    processor_: (job: Job<{
        name: string;
        data: unknown;
    }>) => Promise<any[]>;
}
export {};
