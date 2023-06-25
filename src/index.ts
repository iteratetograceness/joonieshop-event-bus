import { ModuleExports } from '@medusajs/modules-sdk'
import Loader from './loaders'
import EventBusService from './services/event-bus'

const service = EventBusService
const loaders = [Loader]

const moduleDefinition: ModuleExports = {
  service,
  loaders,
}

export default moduleDefinition
