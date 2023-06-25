import { Job, JobsOptions, QueueOptions, WorkerOptions } from 'bullmq';
export interface JobData<T> {
    eventName: string;
    data: T;
    completedSubscriberIds?: string[] | undefined;
}
export type BullJob<T> = {
    data: JobData<T>;
} & Job;
export interface EventBusModuleOptions {
    queueName?: string;
    queueOptions?: QueueOptions;
    workerOptions?: WorkerOptions;
    jobOptions?: JobsOptions;
    setupWorkerOptions?: {
        pauseInterval: number;
        pauseDuration: number;
    };
}
