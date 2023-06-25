# joonieshop-event-bus

Uses Vercel KV under the hood. Please ensure you have `KV_REST_API_URL` and `KV_REST_API_TOKEN` in an `.env` file inside your Medusa server.

## Options

| Property | Type | Default | Description |
| :----- | :--- | :------ | :---------- |
| `queueName` | `string` | `joonieshop-event-queue` | The name of your queue. |
| `queueOptions` | `QueueOptions` | `{}` | BullMQ Queue options. |
| `workerOptions` | `WorkerOptions` | `undefined` | BullMQ Worker options. |
| `jobOptions` | `JobsOptions` | `undefined` | BullMQ Job options. |
| `setupWorkerOptions` | `{ pauseInterval: number, pauseDuration: number }` | `undefined` | Custom Worker pause options. |
