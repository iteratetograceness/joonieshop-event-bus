import { QueueSettings } from 'bee-queue';
export interface EventBusModuleOptions {
    queueName?: string;
    queueOptions?: QueueSettings;
}
