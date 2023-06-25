import { LoaderOptions } from '@medusajs/modules-sdk'
import { asValue } from 'awilix'
import { kv } from '@vercel/kv'


export default async ({ container }: LoaderOptions) => {
  container.register({
    redis: asValue(kv),
  })
}
