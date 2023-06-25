# joonieshop-event-bus

Simple event queue using Bee-Queue + Redis.

## ENV

In your `.env` file, be sure to add `EVENT_BUS_REDIS_URL`.

## Options

| Property | Type | Default | Description |
| :----- | :--- | :------ | :---------- |
| `queueName` | `string` | `joonieshop-event-queue` | The name of your queue. |
| `queueOptions` | `QueueSettings` | `{}` | Bee-Queue options. |
| `redisUrl` | `string` | `undefined` | Redis connection URL. |

