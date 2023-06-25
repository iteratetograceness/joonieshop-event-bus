import { ModuleExports } from '@medusajs/modules-sdk'
import EventBusService from './services/event-bus'

const service = EventBusService

const moduleDefinition: ModuleExports = {
  service,
}

export default moduleDefinition
